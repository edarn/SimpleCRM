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

async function matchCandidates(request, candidates) {
  if (!candidates || candidates.length === 0) return [];

  const anthropic = getClient();

  // Build candidate summaries for the prompt
  const candidateSummaries = candidates.map((c, i) => {
    let summary = `[Candidate ${i + 1}] ID: ${c.id}\nName: ${c.name}\nRole: ${c.role || 'Not specified'}\nSkills: ${c.skills || 'Not specified'}`;
    if (c.resumeText) {
      const trimmedResume = c.resumeText.substring(0, 2000);
      summary += `\nResume excerpt:\n${trimmedResume}`;
    }
    return summary;
  }).join('\n\n---\n\n');

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4000,
    temperature: 0,
    system: `You are an AI recruiter assistant. You will receive a consultant/resource request and a list of candidates with their profiles and resume text.

Rank the candidates by how well they match the request using this scoring system:

SCORING CRITERIA (apply consistently):
- Required skills match: up to 50 points
  - Each required skill found in candidate profile = points proportional to 50 / number of required skills
  - Partial match (related but not exact skill) = half points
- Role/seniority match: up to 20 points
  - Exact role match = 20, similar role = 10-15, different role = 0-5
- Experience level: up to 15 points
  - Matches requested seniority = 15, one level off = 8, far off = 0-3
- Overall profile fit (language, location, availability, soft skills): up to 15 points

RULES:
- Be consistent: the same candidate with the same request must always get approximately the same score.
- Round scores to nearest 5 (e.g. 75, 80, 85, not 77 or 82).
- A candidate missing most required skills should score below 40.
- A candidate matching all required skills and role should score 80+.
- Only include candidates scoring >= 30.

Respond with a JSON array (no markdown, just raw JSON) ordered from best to worst match:
[
  {
    "candidateId": "the ID",
    "score": 0-100,
    "reasoning": "2-3 sentence explanation referencing specific skills matched/missing"
  }
]

If no candidates match well, return an empty array [].`,
    messages: [{
      role: 'user',
      content: `## Consultant Request
Title: ${request.title}
Description: ${request.description}
Required Skills: ${request.requiredSkills}
Role: ${request.role}

## Available Candidates

${candidateSummaries}`
    }]
  });

  const text = response.content[0].text.trim();
  try {
    return JSON.parse(text);
  } catch (err) {
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    console.error('Failed to parse candidate matching response:', text.substring(0, 200));
    return [];
  }
}

module.exports = { matchCandidates };
