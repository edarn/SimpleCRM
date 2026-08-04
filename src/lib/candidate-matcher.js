const { createMessage } = require('./ai-client');
const { scrubPII } = require('./pseudonymize');

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

// Score one chunk. Returns the raw matches for that chunk (real UUIDs), or
// throws so the caller can record the chunk as unevaluated.
async function matchChunk(request, candidates) {
  // Use simple numeric IDs (1, 2, 3...) that the AI can reliably return
  // Then map back to real UUIDs after. The AI never needs the name — we
  // re-identify locally — so we pseudonymize before sending (see pseudonymize.js).
  const idToUuid = {};
  const candidateSummaries = candidates.map((c, i) => {
    const simpleId = i + 1;
    idToUuid[simpleId] = c.id;

    let summary = `[${simpleId}] Kandidat ${simpleId}\nRole: ${c.role || 'Not specified'}\nSkills: ${c.skills || 'Not specified'}`;
    if (c.resumeText) {
      // Use up to 4000 chars per candidate to capture experience sections, not just the header
      const scrubbed = scrubPII(c.resumeText, { name: c.name, email: c.email, phone: c.phone });
      summary += `\nResume:\n${scrubbed.substring(0, 4000)}`;
    }
    return summary;
  }).join('\n\n---\n\n');

  const response = await createMessage({
    model: 'claude-sonnet-4-6',
    max_tokens: 8000,
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

// Match a whole candidate pool against a request.
//
// Returns { matches, evaluatedIds } — `evaluatedIds` lists only the candidates
// that were actually scored. If a chunk fails (API error, unparseable reply),
// its candidates are left OUT of evaluatedIds so the caller's reconcile step
// preserves their existing entries rather than treating "not returned" as "no
// longer a match".
async function matchCandidates(request, candidates) {
  if (!candidates || candidates.length === 0) return { matches: [], evaluatedIds: [] };

  const chunks = [];
  for (let i = 0; i < candidates.length; i += CHUNK_SIZE) {
    chunks.push(candidates.slice(i, i + CHUNK_SIZE));
  }

  // Concurrency is capped by the shared gate in ai-client.js, so firing all
  // chunks at once is safe — they queue rather than stampede the API.
  const results = await Promise.allSettled(
    chunks.map(chunk => matchChunk(request, chunk))
  );

  const matches = [];
  const evaluatedIds = [];
  let failedChunks = 0;

  results.forEach((result, i) => {
    if (result.status === 'fulfilled') {
      matches.push(...result.value);
      evaluatedIds.push(...chunks[i].map(c => c.id));
    } else {
      failedChunks++;
      console.error(
        `Candidate matching chunk ${i + 1}/${chunks.length} failed (${chunks[i].length} candidates not scored):`,
        result.reason?.message || result.reason
      );
    }
  });

  if (failedChunks > 0) {
    console.warn(`Matching completed with ${failedChunks}/${chunks.length} chunk(s) failed — those candidates keep their previous entries.`);
  }

  matches.sort((a, b) => (b.score || 0) - (a.score || 0));
  return { matches, evaluatedIds };
}

module.exports = { matchCandidates };
