// Distill a CV into a compact structured profile — ONCE, when the CV is attached.
//
// Why: matching used to ship 4000 chars of raw CV text per candidate (~1300
// tokens) to the AI on EVERY run. Most of that is boilerplate (headers,
// addresses, course lists, references), so we were paying for noise and the
// model had to re-derive the same facts every time. Distilling once into ~400
// tokens of structure makes a match roughly 3x cheaper and — because the noise
// is gone — more accurate. The distilled skill names also feed the local
// prefilter (src/lib/skills.js), which decides who is worth sending at all.
//
// PRIVACY (GDPR, see docs/DPIA-cv-import.md section 8.2):
// The profile is a NEW artefact that gets sent to Anthropic (third country,
// processor) on every match. If an identifier leaked into it, we would have
// silently widened what leaves the EU — and unlike the raw CV path, nothing
// downstream would scrub it again. Two independent safeguards, in this order:
//
//   1. The CV text is pseudonymized with scrubPII BEFORE the AI ever sees it
//      (except in the bulk-import path, where the same call must also extract
//      name/email/phone — see cv-parser.js).
//   2. The prompt forbids emitting identifiers, and the parsed result is run
//      through scrubPII again before storage, so a model that ignores the
//      instruction still cannot persist an identifier.
//
// Pseudonymization is risk-reducing, not anonymizing (DPIA 8.2): the profile is
// still personal data. That is why it stays local-scoped and only the
// skills/experience carrying fields exist at all.

const { createMessage } = require('./ai-client');
const { scrubPII } = require('./pseudonymize');
const { candidateTagsFromFields } = require('./skills');
const { yieldToEventLoop } = require('./resume-parser');

// Same truncation as cv-parser.js — enough to reach the experience sections
// without risking token overflow on a 40-page consultant CV.
const MAX_INPUT_CHARS = 15000;
const MODEL = 'claude-sonnet-4-6';
const MAX_TOKENS = 1200;

// Shared with cv-parser.js so the bulk-import prompt and the standalone
// distillation prompt describe EXACTLY the same object. Two drifting shapes
// would mean two kinds of profile in the same column.
const PROFILE_SHAPE = `{
  "seniority": "one of: junior | mid | senior | lead | principal (empty string if unclear)",
  "yearsExperience": number of years of professional experience, or null if unclear,
  "primaryRole": "short role label, e.g. 'Backend developer' or 'DevOps engineer'",
  "domains": ["industry/domain experience, e.g. 'automotive', 'fintech', 'public sector'. Max 5."],
  "languages": ["spoken languages, e.g. 'Swedish', 'English'. Max 5. NOT programming languages."],
  "skills": [{"name": "technology/tool/method", "level": "expert|advanced|intermediate|basic or empty string", "lastUsed": "year as string, or empty string"}],
  "highlights": ["3-5 short factual sentences about the most relevant experience. Max 140 chars each."]
}`;

const PROFILE_RULES = `Rules for the profile object:
- Keep it compact. It replaces the CV for matching purposes: skills, experience and domains only.
- "skills": max 20 entries, most relevant first. Prefer concrete technologies over generic terms.
- "highlights": what a recruiter needs to judge fit — scope, seniority, technologies, results.
- Never invent facts. Use "" / null / [] when the CV does not say.

ABSOLUTELY FORBIDDEN inside the profile object (privacy/GDPR requirement):
- The candidate's name, initials, or any other personal name.
- E-mail addresses, phone numbers, personal numbers (personnummer), dates of birth,
  postal addresses, URLs, LinkedIn/GitHub handles, photos or references to them.
- Contact details of employers or referees (phone, e-mail, address). Naming the
  employer or the client as context is fine; contact details are not.
- Placeholders such as [KANDIDAT] or [EMAIL] — leave the information out entirely.
Write about the person only as "the candidate".`;

// The instruction block that goes into a prompt which ALSO extracts contact
// details (bulk import). Exported so cv-parser.js cannot drift from it.
function profilePromptSection() {
  return `"profile": ${PROFILE_SHAPE}

${PROFILE_RULES}`;
}

const SYSTEM_PROMPT = `You condense a CV/resume into a compact structured profile used for matching candidates against consultant requests.

The CV text has already been pseudonymized: direct identifiers are replaced with markers such as [KANDIDAT], [EMAIL], [TELEFON], [PERSONNUMMER] and [URL]. Ignore those markers, never reproduce them, and never try to reconstruct what they hid.

Respond with a JSON object (no markdown, just raw JSON):
${PROFILE_SHAPE}

${PROFILE_RULES}
- Keep the CV's own language for role/domain wording (Swedish CV -> Swedish wording is fine).
- Always return valid JSON, nothing else.`;

// ---------------------------------------------------------------------------
// Parsing / normalization
// ---------------------------------------------------------------------------

function parseJsonObject(text) {
  const trimmed = String(text || '').trim();
  try {
    return JSON.parse(trimmed);
  } catch (_) {
    const match = trimmed.match(/\{[\s\S]*\}/);
    if (!match) return null;
    try { return JSON.parse(match[0]); } catch (_2) { return null; }
  }
}

function cleanString(value, maxLength) {
  if (value === null || value === undefined) return '';
  if (typeof value === 'number') return String(value);
  if (typeof value !== 'string') return '';
  const trimmed = value.replace(/\s+/g, ' ').trim();
  return maxLength ? trimmed.substring(0, maxLength) : trimmed;
}

function cleanStringArray(value, { max, maxLength }) {
  if (!Array.isArray(value)) return [];
  const out = [];
  for (const item of value) {
    const clean = cleanString(item, maxLength);
    if (clean) out.push(clean);
    if (out.length >= max) break;
  }
  return out;
}

const SENIORITY = new Set(['junior', 'mid', 'senior', 'lead', 'principal']);
const LEVELS = new Set(['expert', 'advanced', 'intermediate', 'basic']);

function cleanSkills(value) {
  if (!Array.isArray(value)) return [];
  const out = [];
  const seen = new Set();
  for (const raw of value) {
    // Tolerate a bare string where the shape asks for an object — the field is
    // only ever read as {name, level, lastUsed}, so normalize rather than drop.
    const item = typeof raw === 'string' ? { name: raw } : raw;
    if (!item || typeof item !== 'object') continue;
    const name = cleanString(item.name, 60);
    if (!name) continue;
    const key = name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);

    const level = cleanString(item.level, 20).toLowerCase();
    const lastUsed = cleanString(item.lastUsed ?? item.last_used, 10);
    out.push({
      name,
      level: LEVELS.has(level) ? level : '',
      lastUsed: /^(19|20)\d{2}$/.test(lastUsed) ? lastUsed : '',
    });
    if (out.length >= 20) break;
  }
  return out;
}

function cleanYears(value) {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0 || n > 60) return null;
  return Math.round(n);
}

/**
 * Coerce whatever the model returned into the stored profile shape.
 * Returns null when nothing usable came back — the caller then records the
 * candidate as 'empty' instead of storing an empty husk.
 */
function normalizeProfile(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;

  const seniority = cleanString(raw.seniority, 20).toLowerCase();
  const profile = {
    seniority: SENIORITY.has(seniority) ? seniority : '',
    yearsExperience: cleanYears(raw.yearsExperience ?? raw.years_experience),
    primaryRole: cleanString(raw.primaryRole ?? raw.primary_role, 80),
    domains: cleanStringArray(raw.domains, { max: 5, maxLength: 40 }),
    languages: cleanStringArray(raw.languages, { max: 5, maxLength: 30 }),
    skills: cleanSkills(raw.skills),
    highlights: cleanStringArray(raw.highlights, { max: 5, maxLength: 140 }),
  };

  // A profile with no skills AND no highlights carries no matching signal —
  // treat it as "nothing usable" so it doesn't dilute the prefilter.
  if (profile.skills.length === 0 && profile.highlights.length === 0) return null;
  return profile;
}

/**
 * Second privacy pass: scrub identifiers out of the MODEL'S OUTPUT before it is
 * stored. Safeguard (2) from the header comment — the input scrub can only
 * remove what was in the CV, this removes what the model wrote anyway.
 * Field names are structural and never scrubbed; only free text values are.
 */
function scrubProfile(profile, known = {}) {
  const scrub = (s) => (s ? scrubPII(s, known) : s);
  return {
    seniority: profile.seniority,
    yearsExperience: profile.yearsExperience,
    primaryRole: scrub(profile.primaryRole),
    domains: profile.domains.map(scrub),
    languages: profile.languages.map(scrub),
    // Skill names are technology tokens; scrubbing them would mangle things
    // like "C# 12" into "[TELEFON]"-ish noise only if they looked like an
    // identifier, which they cannot. Only the name is free-ish text.
    skills: profile.skills.map(s => ({ ...s, name: scrub(s.name) })),
    highlights: profile.highlights.map(scrub),
  };
}

/** Comma-joined skill names — the input `candidateTagsFromFields` expects. */
function skillsCsvFromProfile(profile) {
  return profile.skills.map(s => s.name).filter(Boolean).join(', ');
}

/**
 * Build the stored {profile, skillsCsv} pair from a raw model response.
 * Shared with cv-parser.js, which gets the profile out of the import call.
 */
function buildProfileResult(rawProfile, known = {}) {
  const normalized = normalizeProfile(rawProfile);
  if (!normalized) return null;
  const profile = scrubProfile(normalized, known);
  return { profile, skillsCsv: skillsCsvFromProfile(profile) };
}

// ---------------------------------------------------------------------------
// Distillation
// ---------------------------------------------------------------------------

/**
 * Distill one CV. Returns { profile, skillsCsv } or null when there is nothing
 * usable (empty text, unparseable answer, no skills and no highlights).
 *
 * The text is pseudonymized BEFORE the API call — see the header comment.
 */
async function distillProfile(resumeText, known = {}) {
  const text = String(resumeText || '').trim();
  if (!text) return null;

  const { name, email, phone } = known;
  const scrubbed = scrubPII(text, { name, email, phone });
  if (!scrubbed || !scrubbed.trim()) return null;

  const response = await createMessage({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    temperature: 0,
    system: SYSTEM_PROMPT,
    messages: [{
      role: 'user',
      content: scrubbed.substring(0, MAX_INPUT_CHARS),
    }],
  });

  const raw = parseJsonObject(response?.content?.[0]?.text);
  if (!raw) return null;
  // The stored profile is scrubbed with the same known identifiers, so a name
  // the model reintroduced from context still cannot reach the database.
  return buildProfileResult(raw.profile || raw, { name, email, phone });
}

/**
 * Canonical skill tags for a candidate: their own skills field plus whatever
 * the profile surfaced. Always goes through candidateTagsFromFields so the
 * stored tags stay in the same vocabulary the prefilter compares against.
 */
function tagsFor(candidate, skillsCsv) {
  return candidateTagsFromFields({
    skills: candidate.skills,
    role: candidate.role,
    profileSkills: skillsCsv || '',
  });
}

/**
 * Distill up to `limit` candidates that have CV text but no profile yet.
 *
 * BOUNDED and yielding, for the same reason backfillResumeText in inbox.js is:
 * a serial loop that never hands the thread back stalls Express for EVERY user,
 * not just the caller. Each candidate is one AI call (routed through the shared
 * gate), so the caller polls this endpoint until `remaining` hits 0 instead of
 * distilling the whole library in one request.
 *
 * Failures are recorded as 'empty' rather than left NULL: a CV that cannot be
 * distilled would otherwise be re-selected on every single call and the UI's
 * "loop until done" would never terminate. Attaching a new CV distills inline
 * and sets the status back to 'ok', so this is not a permanent write-off.
 *
 * Returns { distilled, empty, remaining }.
 */
async function backfillProfiles(userId, limit) {
  const data = require('../data'); // lazy: keeps this module DB-free for tests
  const max = Math.max(0, Number(limit) || 0);
  if (!max) return { distilled: 0, empty: 0, remaining: data.countCandidatesNeedingProfile(userId) };

  // Without a key EVERY candidate would fail and get marked 'empty', quietly
  // writing off the whole library. Do nothing instead.
  if (!process.env.ANTHROPIC_API_KEY) {
    return { distilled: 0, empty: 0, remaining: data.countCandidatesNeedingProfile(userId) };
  }

  const candidates = data.getCandidatesNeedingProfile(userId, max);
  let distilled = 0;
  let empty = 0;

  for (const c of candidates) {
    // Fall back to the skills field so a candidate whose file yielded nothing
    // still gets tags — same fallback backfillResumeText uses.
    const source = c.resumeText || (c.skills ? `Skills: ${c.skills}` : '');
    try {
      const result = await distillProfile(source, {
        name: c.name, email: c.email, phone: c.phone, role: c.role, skills: c.skills,
      });
      if (result) {
        data.updateCandidateProfile(c.id, result.profile, tagsFor(c, result.skillsCsv));
        distilled++;
      } else {
        data.markCandidateProfileEmpty(c.id);
        empty++;
      }
    } catch (err) {
      console.error(`Profile distillation failed for candidate ${c.id}:`, err.message);
      try { data.markCandidateProfileEmpty(c.id); } catch (_) {}
      empty++;
    }

    // Hand the thread back to Express between candidates.
    await yieldToEventLoop();
  }

  const remaining = data.countCandidatesNeedingProfile(userId);
  return { distilled, empty, remaining };
}

module.exports = {
  distillProfile,
  backfillProfiles,
  // Shared with cv-parser.js / the routes:
  buildProfileResult,
  profilePromptSection,
  skillsCsvFromProfile,
  tagsFor,
};
