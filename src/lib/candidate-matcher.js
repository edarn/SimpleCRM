const crypto = require('crypto');
const { createMessage } = require('./ai-client');
const { scrubPII } = require('./pseudonymize');
const { prefilterCandidates } = require('./skills');

// How many candidates go into a single AI call.
//
// Why chunk at all: the prompt carries up to 4000 chars of CV per candidate, so
// one call over the whole pool grows linearly with the roster. At ~100
// candidates that is already ~100k input tokens; at 500 it is ~500k, which
// exceeds the model's context window outright — the feature would simply stop
// working as the CV library grows.
//
// Chunking is safe here because the scoring rubric is ABSOLUTE (points against
// the request's skills/role), not relative to the other candidates in the call.
// A candidate therefore scores the same whichever chunk it lands in, so merging
// chunk results is just concatenate-and-sort. As a bonus the chunks run
// concurrently through the shared gate, so matching gets faster, not slower.
const CHUNK_SIZE = Math.max(1, Number(process.env.AI_MATCH_CHUNK_SIZE || 40));

// Chars of raw CV per candidate on the fallback/full path.
const RESUME_CHARS = 4000;

// Lazy require: data.js opens the SQLite file at require time, and the matcher
// is usable (and unit-testable) without a database whenever requestId is null.
function getData() {
  return require('../data');
}

function sha256(text) {
  return crypto.createHash('sha256').update(String(text), 'utf8').digest('hex');
}

// The scoring rubric. Tuned text — change it only deliberately, and note that
// changing it does NOT invalidate the pair cache (fingerprints hash the request
// and the candidate, not the rubric). Bump nothing here casually.
const RUBRIC = `You are an AI recruiter assistant. You will receive a consultant/resource request and a list of candidates. Each candidate has a number in brackets like [1], [2], [3] etc.

Rank the candidates by how well they match the request.

SKILL VERSION NUMBERS:
Skills may include version requirements like "Angular 14+", "Java11+", "C++17", "React 18+", ".NET 6+".
These mean the TECHNOLOGY itself with a minimum version preference — NOT an exact string to match.
- "Angular14+" or "Angular 14+" → the candidate knows Angular (any recent version matches)
- "Java 11+" → the candidate knows Java (version 11 or later, but any Java experience is relevant)
- "C++17" → the candidate knows C++ (modern standards preferred)
- "Python 3.x" → the candidate knows Python 3
A candidate listing "Angular" or "Angular 17" matches "Angular 14+". Focus on the core technology.

PRIORITIZED SKILLS:
Skills wrapped in **double asterisks** (e.g. **C++**, **Kubernetes**) are critical/must-have.
These do NOT change the base skills scoring. Instead they unlock a separate BONUS (see scoring below).

TECHNOLOGY ECOSYSTEMS — MATCH SEMANTICALLY, NOT LITERALLY:
When a skill is requested, match ANY evidence of experience within that technology ecosystem. Do NOT require the exact keyword. Examples:

- "AWS" or "Cloud": matches if candidate mentions ANY AWS service (S3, EC2, Lambda, CloudWatch, DynamoDB, RDS, ECS, EKS, ECR, KMS, SQS, SNS, CloudFormation, CDK, IAM, Route53, API Gateway, etc.) or general cloud experience
- "Azure": matches Azure Portal, Azure DevOps, Azure Functions, Blob Storage, AKS, App Service, etc.
- "GCP": matches BigQuery, Cloud Run, GKE, Pub/Sub, Cloud Functions, etc.
- "Kubernetes": matches K8s, EKS, AKS, GKE, Helm, kubectl, Docker orchestration, container orchestration
- "CI/CD": matches Jenkins, GitHub Actions, GitLab CI, Azure DevOps pipelines, CircleCI, ArgoCD, Terraform, etc.
- "SQL" or "databases": matches PostgreSQL, MySQL, MSSQL, MariaDB, SQLite, Oracle DB, etc.
- "NoSQL": matches MongoDB, DynamoDB, Cassandra, Redis, Elasticsearch, etc.
- "Frontend": matches React, Angular, Vue, Svelte, HTML/CSS/JS, etc.
- "Backend": matches Node.js, .NET, Java/Spring, Python/Django/Flask, Go, etc.
- "DevOps": matches Docker, Kubernetes, CI/CD, infrastructure as code, monitoring, etc.
- "Testing": matches unit testing, integration testing, Jest, Mocha, pytest, JUnit, Cypress, Selenium, etc.

Apply this same reasoning to ANY technology — think about what the recruiter actually means, not just the literal keyword.

SCORING CRITERIA (apply consistently):
- Required skills match: up to 50 points
  - ALL skills (bold or not) are treated equally in this pool
  - Each matching skill = 50 / number of required skills
  - Ecosystem match (e.g. S3 experience counts for "AWS") = full points, not partial
- Priority bonus: up to 15 points (SEPARATE from the 50 above)
  - Only awarded based on **bold** prioritized skills
  - If there are N prioritized skills, each one matched = 15/N bonus points
  - Matching ALL prioritized skills = full 15 points
  - No prioritized skills in the request = skip this category, redistribute 15 points to skills (making it 65 points for skills)
  - CRITICAL: marking a skill as prioritized must NEVER lower the score of a candidate who HAS that skill
- Role/seniority match: up to 20 points
  - Exact role match = 20, similar role = 10-15, different role = 0-5
- Overall profile fit (language, experience level, location, soft skills): up to 15 points

RULES:
- Be consistent: the same candidate with the same request must always get approximately the same score.
- Round scores to nearest 5 (e.g. 75, 80, 85).
- A candidate missing most required skills should score below 40.
- A candidate matching all required skills and role should score 80+.
- Only include candidates scoring >= 30.
- IMPORTANT: Use the candidate NUMBER (1, 2, 3...) as the "id" field. Do NOT invent or modify the number.

Respond with a JSON array (no markdown, just raw JSON) ordered best to worst:
[{"id": 1, "score": 85, "strengths": "What matches well — specific skills, experience, and qualities that fit the request.", "gaps": "What is missing or weak — specific skills or experience not found in the profile. Empty string if nothing is missing."}]

Empty array [] if no candidates match.`;

// ---------------------------------------------------------------------------
// Candidate rendering
// ---------------------------------------------------------------------------

// Keys rendered first, so the distilled block reads consistently whatever order
// the distiller happened to emit. Unlisted keys follow in their own order.
const PROFILE_KEY_ORDER = [
  'role', 'title', 'seniority', 'level',
  'years', 'yearsExperience', 'years_experience', 'experienceYears',
  'summary', 'profile', 'headline',
  'skills', 'technologies', 'tools', 'frameworks', 'domains', 'industries',
  'experience', 'highlights', 'projects', 'assignments',
  'certifications', 'education', 'languages', 'location', 'availability',
];

// Direct identifiers never belong in the prompt. scrubPII is still run over the
// rendered block afterwards — this is the cheap first pass, not the only one.
const PROFILE_PII_KEYS = new Set([
  'name', 'fullname', 'firstname', 'lastname', 'email', 'mail', 'phone',
  'mobile', 'contact', 'address', 'linkedin', 'github', 'url', 'website',
  'personalnumber', 'personnummer', 'ssn', 'dateofbirth', 'birthdate',
]);

function humanizeKey(key) {
  return String(key)
    .replace(/_/g, ' ')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/^./, ch => ch.toUpperCase());
}

function renderScalar(value) {
  if (value === null || value === undefined) return '';
  if (typeof value === 'object') {
    return Object.entries(value)
      .filter(([k, v]) => !PROFILE_PII_KEYS.has(String(k).toLowerCase()) && v !== null && v !== undefined && v !== '')
      .map(([k, v]) => `${humanizeKey(k)}: ${renderScalar(v)}`)
      .filter(Boolean)
      .join(', ');
  }
  return String(value).trim();
}

function renderProfileValue(key, value) {
  if (value === null || value === undefined || value === '') return '';
  if (Array.isArray(value)) {
    const items = value.map(renderScalar).map(s => s.trim()).filter(Boolean);
    if (items.length === 0) return '';
    // Multi-part entries (experience, projects) read better as a list.
    if (items.some(s => s.length > 60)) {
      return `${humanizeKey(key)}:\n` + items.map(s => `- ${s}`).join('\n');
    }
    return `${humanizeKey(key)}: ${items.join(', ')}`;
  }
  const rendered = renderScalar(value);
  if (!rendered) return '';
  return rendered.includes('\n')
    ? `${humanizeKey(key)}:\n${rendered}`
    : `${humanizeKey(key)}: ${rendered}`;
}

// Render candidates.profile_json (a JSON string) into the compact block the
// fast path sends instead of 4000 chars of raw CV. Returns '' when the profile
// is missing/unparseable/empty so the caller can fall back to the raw CV — a
// candidate must never end up with an empty prompt just because distillation
// produced junk.
function renderDistilledProfile(profileJson) {
  if (!profileJson) return '';
  let profile;
  try {
    profile = typeof profileJson === 'string' ? JSON.parse(profileJson) : profileJson;
  } catch (err) {
    return '';
  }
  if (!profile || typeof profile !== 'object' || Array.isArray(profile)) return '';

  const keys = Object.keys(profile);
  const ordered = PROFILE_KEY_ORDER.filter(k => keys.includes(k))
    .concat(keys.filter(k => !PROFILE_KEY_ORDER.includes(k)));

  const lines = [];
  for (const key of ordered) {
    if (PROFILE_PII_KEYS.has(key.toLowerCase())) continue;
    const line = renderProfileValue(key, profile[key]);
    if (line) lines.push(line);
  }
  return lines.join('\n');
}

/**
 * The per-candidate text sent to the model, WITHOUT the positional "[n]" header.
 *
 * fast: the distilled profile when we have one, otherwise the same role/skills/
 *       raw-CV text the full path uses. That fallback is what keeps candidates
 *       whose CV has not been distilled yet scoring correctly.
 * full: always role/skills + raw CV, byte-for-byte what this file sent before
 *       the distillation work — that is what makes "full" a genuine control
 *       measurement rather than a re-run of the optimized path.
 */
function renderCandidateBody(candidate, mode) {
  let body = `Role: ${candidate.role || 'Not specified'}\nSkills: ${candidate.skills || 'Not specified'}`;

  if (mode === 'fast' && candidate.profileStatus === 'ok') {
    const profile = renderDistilledProfile(candidate.profileJson);
    if (profile) {
      const scrubbed = scrubPII(profile, {
        name: candidate.name, email: candidate.email, phone: candidate.phone,
      });
      return `${body}\nProfile:\n${scrubbed}`;
    }
  }

  if (candidate.resumeText) {
    // Use up to 4000 chars per candidate to capture experience sections, not just the header
    const scrubbed = scrubPII(candidate.resumeText, {
      name: candidate.name, email: candidate.email, phone: candidate.phone,
    });
    body += `\nResume:\n${scrubbed.substring(0, RESUME_CHARS)}`;
  }
  return body;
}

function renderRequestBlock(request) {
  return `## Request
Title: ${request.title}
Description: ${request.description}
Required Skills: ${request.requiredSkills}
Role: ${request.role}`;
}

// ---------------------------------------------------------------------------
// One AI call
// ---------------------------------------------------------------------------

// Score one chunk. `items` are { candidate, body } in chunk order. Returns the
// raw matches for that chunk (real UUIDs), or throws so the caller can record
// the chunk as unevaluated.
async function matchChunk(request, items) {
  // Use simple numeric IDs (1, 2, 3...) that the AI can reliably return
  // Then map back to real UUIDs after. The AI never needs the name — we
  // re-identify locally — so the bodies were pseudonymized when rendered
  // (see pseudonymize.js).
  const idToUuid = {};
  const candidateSummaries = items.map((item, i) => {
    const simpleId = i + 1;
    idToUuid[simpleId] = item.candidate.id;
    return `[${simpleId}] Kandidat ${simpleId}\n${item.body}`;
  }).join('\n\n---\n\n');

  const response = await createMessage({
    model: 'claude-sonnet-4-6',
    max_tokens: 8000,
    temperature: 0,
    system: [{ type: 'text', text: RUBRIC }],
    // BLOCK ORDER IS LOAD-BEARING — do not "tidy" it back to request-first.
    //
    // Anthropic's prompt cache matches on a PREFIX (tools -> system -> messages,
    // in that order), so everything before the cache_control breakpoint is what
    // gets reused. The candidate block is the big, stable part: identical
    // candidates in an identical chunk produce identical bytes run after run.
    // The request is the small, varying part, so it must come LAST — with the
    // old request-first layout the very first token differed whenever the
    // description was edited and the cache could never hit at all.
    messages: [{
      role: 'user',
      content: [
        { type: 'text', text: `## Candidates\n\n${candidateSummaries}`, cache_control: { type: 'ephemeral' } },
        { type: 'text', text: renderRequestBlock(request) },
      ],
    }],
  });

  const text = response.content[0].text.trim();
  let matches;
  try {
    matches = JSON.parse(text);
  } catch (err) {
    // Fallback: pull the first JSON array out of the response (e.g. the model
    // wrapped it in prose or a markdown fence).
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    try {
      matches = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
    } catch (err2) {
      matches = null;
    }
  }

  // An unparseable response means we do NOT know how these candidates scored.
  // Throw rather than returning [] — the caller records the chunk as
  // unevaluated so reconcileRequestMatches preserves their existing entries
  // instead of silently dropping them from the request.
  if (!Array.isArray(matches)) {
    throw new Error(`Unparseable matching response: ${text.substring(0, 160)}`);
  }

  // Map simple numeric IDs back to real UUIDs
  return matches
    .map(m => {
      const numId = Number(m.id || m.candidateId);
      const realId = idToUuid[numId];
      if (!realId) {
        console.warn('Candidate match returned unknown id:', m.id || m.candidateId);
        return null;
      }
      return {
        candidateId: realId,
        score: m.score,
        strengths: m.strengths || '',
        gaps: m.gaps || '',
        reasoning: m.reasoning || [m.strengths, m.gaps].filter(Boolean).join(' ')
      };
    })
    .filter(Boolean);
}

// ---------------------------------------------------------------------------
// Public entry point
// ---------------------------------------------------------------------------

function emptyStats(mode, pool) {
  return {
    mode, pool, selected: 0, dropped: pool, cacheHits: 0, scored: 0,
    chunks: 0, failedChunks: 0, unknownProfiles: 0, pinned: 0,
  };
}

/**
 * Match a candidate pool against a request.
 *
 * options:
 *   mode          'fast' (default) — local prefilter + distilled profiles + pair cache
 *                 'full'           — whole pool, raw CV text, cache bypassed for
 *                                    reads AND writes. This is the user's
 *                                    "did anything disappear?" control run, so it
 *                                    must never be shortcut by a cached answer.
 *   requestId     enables the per-pair cache (fast mode only); null disables it
 *   alwaysInclude candidate ids the prefilter must never drop
 *   onProgress    ({ stage, done, total }) as chunks complete
 *
 * Returns { matches, evaluatedIds, stats }.
 *
 * `evaluatedIds` lists every candidate whose score is known after this run —
 * freshly scored AND served from cache. If a chunk fails (API error,
 * unparseable reply) its candidates are left OUT, so the caller's reconcile step
 * preserves their existing entries rather than treating "not returned" as "no
 * longer a match". Prefiltered-away candidates are likewise never "evaluated".
 */
async function matchCandidates(request, candidates, options = {}) {
  const mode = options.mode === 'full' ? 'full' : 'fast';
  const pool = Array.isArray(candidates) ? candidates.length : 0;
  if (!candidates || candidates.length === 0) {
    return { matches: [], evaluatedIds: [], stats: emptyStats(mode, 0) };
  }

  const onProgress = typeof options.onProgress === 'function' ? options.onProgress : null;
  const report = (payload) => {
    if (!onProgress) return;
    try { onProgress(payload); } catch (err) { /* progress must never break matching */ }
  };

  // ---- 1. Pool selection -------------------------------------------------
  let selected = candidates;
  let unknownProfiles = 0;
  let pinned = 0;

  if (mode === 'fast') {
    const pf = prefilterCandidates(request, candidates, {
      limit: options.limit,
      alwaysInclude: options.alwaysInclude || [],
    });
    unknownProfiles = pf.stats.unknownProfiles || 0;
    pinned = pf.stats.pinned || 0;

    // prefilterCandidates returns forced-then-scored order. Re-project onto the
    // caller's (id-sorted) order instead of using it directly: chunk boundaries
    // must depend only on WHICH candidates are selected, never on their
    // prefilter scores. Otherwise editing the description reshuffles the
    // candidate blocks and throws away the prompt cache — the single biggest
    // cost item here — even though not one CV changed.
    const keep = new Set(pf.selected.map(c => c.id));
    selected = candidates.filter(c => keep.has(c.id));
  }

  // ---- 2. Fingerprints + cache lookup ------------------------------------
  // Both fingerprints hash the literal text that goes to the model, so any
  // change — new CV, edited description, fast<->full — misses the cache by
  // construction. There is deliberately no bespoke invalidation logic.
  const requestFingerprint = sha256(
    `${request.title}\n${request.description}\n${request.requiredSkills}\n${request.role}\nmode:${mode}`
  );

  const items = selected.map(candidate => {
    const body = renderCandidateBody(candidate, mode);
    return { candidate, body, candidateFingerprint: sha256(body) };
  });

  // full mode bypasses the cache on BOTH sides — see the doc comment.
  const useCache = mode === 'fast' && !!options.requestId;
  let cache = new Map();
  if (useCache) {
    try {
      cache = getData().getRequestMatchCache(options.requestId) || new Map();
    } catch (err) {
      // A cache read failure must degrade to a full (correct) run, not an error.
      console.error('Match cache unavailable, scoring everything:', err.message);
      cache = new Map();
    }
  }

  for (const item of items) {
    const hit = cache.get(item.candidate.id);
    item.cached = (hit
      && hit.requestFingerprint === requestFingerprint
      && hit.candidateFingerprint === item.candidateFingerprint)
      ? hit
      : null;
  }

  // ---- 3. Chunking -------------------------------------------------------
  // Chunk the selected set in its existing order and keep every chunk whole.
  // Re-packing chunks out of only the stale candidates would shift the
  // boundaries and destroy the prompt cache for everyone else in the chunk, so
  // a chunk is either skipped entirely (all cached) or sent entirely.
  const chunks = [];
  for (let i = 0; i < items.length; i += CHUNK_SIZE) {
    chunks.push(items.slice(i, i + CHUNK_SIZE));
  }

  const matches = [];
  const evaluatedIds = [];
  const cacheWrites = [];
  let cacheHits = 0;
  let scored = 0;
  let failedChunks = 0;

  const pending = [];
  for (const chunk of chunks) {
    if (chunk.every(item => item.cached)) {
      for (const item of chunk) {
        cacheHits++;
        evaluatedIds.push(item.candidate.id);
        // A null score is a cached "evaluated, scored below the threshold" —
        // known, just not a match. Without those rows a single non-matching
        // candidate would keep its whole chunk billable forever.
        if (item.cached.score !== null && item.cached.score !== undefined) {
          matches.push({
            candidateId: item.candidate.id,
            score: item.cached.score,
            strengths: item.cached.strengths || '',
            gaps: item.cached.gaps || '',
            reasoning: item.cached.reasoning || '',
          });
        }
      }
      continue;
    }
    scored += chunk.length;
    pending.push(chunk);
  }

  let done = chunks.length - pending.length;
  report({ stage: 'scoring', done, total: chunks.length });

  // Concurrency is capped by the shared gate in ai-client.js, so firing all
  // chunks at once is safe — they queue rather than stampede the API.
  const results = await Promise.allSettled(
    pending.map(chunk => matchChunk(request, chunk).finally(() => {
      done++;
      report({ stage: 'scoring', done, total: chunks.length });
    }))
  );

  results.forEach((result, i) => {
    const chunk = pending[i];
    if (result.status === 'fulfilled') {
      matches.push(...result.value);
      evaluatedIds.push(...chunk.map(item => item.candidate.id));

      if (useCache) {
        const byId = new Map(result.value.map(m => [m.candidateId, m]));
        for (const item of chunk) {
          const m = byId.get(item.candidate.id);
          cacheWrites.push({
            candidateId: item.candidate.id,
            requestFingerprint,
            candidateFingerprint: item.candidateFingerprint,
            // Not returned by the model = scored below the rubric's threshold.
            // Recording that (score null) is what lets a future run skip the
            // whole chunk instead of re-paying for the known non-matches.
            score: m ? m.score : null,
            strengths: m ? m.strengths : '',
            gaps: m ? m.gaps : '',
            reasoning: m ? m.reasoning : '',
          });
        }
      }
    } else {
      failedChunks++;
      console.error(
        `Candidate matching chunk ${i + 1}/${pending.length} failed (${chunk.length} candidates not scored):`,
        result.reason?.message || result.reason
      );
    }
  });

  if (failedChunks > 0) {
    console.warn(`Matching completed with ${failedChunks}/${pending.length} sent chunk(s) failed — those candidates keep their previous entries.`);
  }

  if (useCache && cacheWrites.length > 0) {
    try {
      getData().saveRequestMatchCache(options.requestId, cacheWrites);
    } catch (err) {
      // Losing the cache write only costs money next run; never fail the match.
      console.error('Could not persist match cache:', err.message);
    }
  }

  matches.sort((a, b) => (b.score || 0) - (a.score || 0));

  return {
    matches,
    evaluatedIds,
    stats: {
      mode,
      pool,
      selected: selected.length,
      dropped: pool - selected.length,
      // cacheHits counts candidates answered WITHOUT an AI call (i.e. in chunks
      // that were skipped whole); `scored` counts those sent to the model.
      // The two never overlap and together cover the selected set.
      cacheHits,
      scored,
      chunks: chunks.length,
      failedChunks,
      unknownProfiles,
      pinned,
    },
  };
}

module.exports = { matchCandidates };
