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
      // Limit resume text to avoid token overflow
      const trimmedResume = c.resumeText.substring(0, 2000);
      summary += `\nResume excerpt:\n${trimmedResume}`;
    }
    return summary;
  }).join('\n\n---\n\n');

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2000,
    system: `You are an AI recruiter assistant. You will receive a consultant/resource request and a list of candidates with their profiles and resume text.

Rank the candidates by how well they match the request. Consider:
- Skills match (most important)
- Role/experience relevance
- Overall profile fit

Respond with a JSON array (no markdown, just raw JSON) of matched candidates, ordered from best to worst match. Only include candidates with a reasonable match (score >= 30). Each entry should have:
{
  "candidateId": "the ID",
  "score": 0-100,
  "reasoning": "2-3 sentence explanation of why this candidate matches or doesn't"
}

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
