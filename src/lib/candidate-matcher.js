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
  let matches;
  try {
    matches = JSON.parse(text);
  } catch (err) {
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      matches = JSON.parse(jsonMatch[0]);
    } else {
      console.error('Failed to parse candidate matching response:', text.substring(0, 200));
      return [];
    }
  }

  // Build lookup maps to resolve AI-returned IDs back to real candidates
  const idMap = new Map();
  const nameMap = new Map();
  candidates.forEach((c, i) => {
    idMap.set(c.id, c.id);
    idMap.set(String(i + 1), c.id); // AI might return index "1", "2" etc.
    nameMap.set(c.name.toLowerCase(), c.id);
  });

  // Validate and fix candidateId in each match
  return matches
    .map(m => {
      let resolvedId = idMap.get(m.candidateId) || idMap.get(String(m.candidateId));
      if (!resolvedId && m.candidateId) {
        // Try partial UUID match or name match
        const candidate = candidates.find(c =>
          c.id.startsWith(m.candidateId) || c.id === m.candidateId
        );
        if (candidate) resolvedId = candidate.id;
      }
      if (!resolvedId && m.candidateName) {
        resolvedId = nameMap.get(m.candidateName.toLowerCase());
      }
      if (!resolvedId) {
        console.warn('Could not resolve candidateId:', m.candidateId);
        return null;
      }
      return { ...m, candidateId: resolvedId };
    })
    .filter(Boolean);
}

module.exports = { matchCandidates };
