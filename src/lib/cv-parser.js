const { createMessage } = require('./ai-client');

const FIELD_RULES = `Rules:
- For the name, use the full name as written on the CV. If the CV is in a language other than English, keep the original name.
- For the role, pick the most recent or most prominent title. If multiple roles, pick the current one.
- For skills, extract technical skills, programming languages, tools, frameworks, and methodologies. Prefer specific technologies over generic terms. Separate with commas.
- For phone, normalize to include country code if visible, otherwise keep as-is.
- Always return valid JSON, nothing else.`;

const FIELDS_SHAPE = `  "name": "Full name of the candidate",
  "email": "Email address",
  "phone": "Phone number",
  "role": "Current or most recent job title / professional role",
  "skills": "Comma-separated list of key technical skills, programming languages, frameworks, and tools mentioned in the CV. Focus on the most important and relevant ones, max 15 items."`;

function parseResponse(response) {
  const text = response.content[0].text.trim();
  try {
    return JSON.parse(text);
  } catch (err) {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error('Failed to parse CV extraction response');
  }
}

async function parseCV(resumeText) {
  const response = await createMessage({
    model: 'claude-sonnet-4-6',
    max_tokens: 1500,
    system: `You are an AI assistant that extracts structured candidate information from a CV/resume.

Extract the following fields from the resume text. If a field is not found, use an empty string.

Respond with a JSON object (no markdown, just raw JSON):
{
${FIELDS_SHAPE}
}

${FIELD_RULES}`,
    messages: [{
      role: 'user',
      content: resumeText.substring(0, 15000) // Limit to avoid token overflow
    }]
  });

  return parseResponse(response);
}

/**
 * Bulk-import variant: the SAME single AI call returns both the contact fields
 * and the distilled matching profile.
 *
 * Why one call: the importer already pays one round-trip per CV, and a second
 * one just to distill would double the cost and the wall-clock of an import of
 * 50 files for information the model has already read.
 *
 * PRIVACY: unlike src/lib/profile-distiller.js, this call receives UNSCRUBBED
 * text — it has to, because extracting name/email/phone is the whole point of
 * the contact fields. The profile half must still be identifier-free, so the
 * prompt forbids identifiers inside `profile` (profilePromptSection) and the
 * parsed profile is scrubbed with the identifiers this very call extracted
 * before it is stored (buildProfileResult). See docs/DPIA-cv-import.md 8.2.
 *
 * Returns { ...fields, profile, skillsCsv } — `profile` is null when nothing
 * usable came back, so the caller can still create the candidate.
 */
async function parseCVWithProfile(resumeText, known = {}) {
  // Required late so cv-parser stays usable without the data layer loaded.
  const { buildProfileResult, profilePromptSection } = require('./profile-distiller');

  const response = await createMessage({
    model: 'claude-sonnet-4-6',
    max_tokens: 2500,
    temperature: 0,
    system: `You are an AI assistant that extracts structured candidate information from a CV/resume.

Extract the following from the resume text. If a field is not found, use an empty string.

Respond with a JSON object (no markdown, just raw JSON):
{
${FIELDS_SHAPE},
  ${profilePromptSection()}
}

${FIELD_RULES}
- The contact fields (name, email, phone) are the ONLY place personal identifiers may appear. The "profile" object must never contain them.`,
    messages: [{
      role: 'user',
      content: resumeText.substring(0, 15000) // Limit to avoid token overflow
    }]
  });

  const parsed = parseResponse(response);
  const known2 = {
    name: known.name || parsed.name,
    email: known.email || parsed.email,
    phone: known.phone || parsed.phone,
  };

  let result = null;
  try {
    result = buildProfileResult(parsed.profile, known2);
  } catch (err) {
    // A malformed profile must never cost us the candidate record.
    console.error('CV profile normalization failed:', err.message);
  }

  return {
    ...parsed,
    profile: result ? result.profile : null,
    skillsCsv: result ? result.skillsCsv : '',
  };
}

module.exports = { parseCV, parseCVWithProfile };
