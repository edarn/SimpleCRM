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

  // Use simple numeric IDs (1, 2, 3...) that the AI can reliably return
  // Then map back to real UUIDs after
  const idToUuid = {};
  const candidateSummaries = candidates.map((c, i) => {
    const simpleId = i + 1;
    idToUuid[simpleId] = c.id;

    let summary = `[${simpleId}] ${c.name}\nRole: ${c.role || 'Not specified'}\nSkills: ${c.skills || 'Not specified'}`;
    if (c.resumeText) {
      // Use up to 4000 chars per candidate to capture experience sections, not just the header
      summary += `\nResume:\n${c.resumeText.substring(0, 4000)}`;
    }
    return summary;
  }).join('\n\n---\n\n');

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4000,
    temperature: 0,
    system: `You are an AI recruiter assistant. You will receive a consultant/resource request and a list of candidates. Each candidate has a number in brackets like [1], [2], [3] etc.

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
These weigh MORE in scoring. Missing a prioritized skill is a bigger penalty than missing a normal one.

SCORING CRITERIA (apply consistently):
- Required skills match: up to 50 points
  - Prioritized skills (**bold**): worth double the points of normal skills
  - Each matching skill = points proportional to 50 / weighted total
  - Partial match (related but not exact technology) = half points
- Role/seniority match: up to 20 points
  - Exact role match = 20, similar role = 10-15, different role = 0-5
- Experience level: up to 15 points
  - Matches requested seniority = 15, one level off = 8, far off = 0-3
- Overall profile fit (language, location, availability, soft skills): up to 15 points

RULES:
- Be consistent: the same candidate with the same request must always get approximately the same score.
- Round scores to nearest 5 (e.g. 75, 80, 85).
- A candidate missing most required skills should score below 40.
- A candidate matching all required skills and role should score 80+.
- Only include candidates scoring >= 30.
- IMPORTANT: Use the candidate NUMBER (1, 2, 3...) as the "id" field. Do NOT invent or modify the number.

Respond with a JSON array (no markdown, just raw JSON) ordered best to worst:
[{"id": 1, "score": 85, "reasoning": "Strong match because..."}]

Empty array [] if no candidates match.`,
    messages: [{
      role: 'user',
      content: `## Request
Title: ${request.title}
Description: ${request.description}
Required Skills: ${request.requiredSkills}
Role: ${request.role}

## Candidates

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
        reasoning: m.reasoning
      };
    })
    .filter(Boolean);
}

module.exports = { matchCandidates };
