const Anthropic = require('@anthropic-ai/sdk');

let client = null;

function getClient() {
  if (!client) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error('ANTHROPIC_API_KEY environment variable is not set');
    client = new Anthropic({ apiKey });
  }
  return client;
}

async function parseCV(resumeText) {
  const anthropic = getClient();

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1500,
    system: `You are an AI assistant that extracts structured candidate information from a CV/resume.

Extract the following fields from the resume text. If a field is not found, use an empty string.

Respond with a JSON object (no markdown, just raw JSON):
{
  "name": "Full name of the candidate",
  "email": "Email address",
  "phone": "Phone number",
  "role": "Current or most recent job title / professional role",
  "skills": "Comma-separated list of key technical skills, programming languages, frameworks, and tools mentioned in the CV. Focus on the most important and relevant ones, max 15 items."
}

Rules:
- For the name, use the full name as written on the CV. If the CV is in a language other than English, keep the original name.
- For the role, pick the most recent or most prominent title. If multiple roles, pick the current one.
- For skills, extract technical skills, programming languages, tools, frameworks, and methodologies. Prefer specific technologies over generic terms. Separate with commas.
- For phone, normalize to include country code if visible, otherwise keep as-is.
- Always return valid JSON, nothing else.`,
    messages: [{
      role: 'user',
      content: resumeText.substring(0, 15000) // Limit to avoid token overflow
    }]
  });

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

module.exports = { parseCV };
