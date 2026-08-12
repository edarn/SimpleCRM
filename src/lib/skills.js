// Canonical skill vocabulary + the local (no-AI) prefilter.
//
// Why this exists: matching used to send EVERY candidate with a CV to the AI on
// every run, so cost and wall-clock grew linearly with the roster (~375k input
// tokens at 300 candidates, ~1.25M at 1000). The fix is the standard one —
// filter locally, let the AI rank only the survivors — which makes the cost of
// a match roughly independent of how big the CV library gets.
//
// The hard part is that the AI rubric matches SEMANTICALLY ("S3 counts as AWS",
// "Angular 17 matches Angular 14+"). A naive keyword filter would throw away
// exactly the candidates the semantic rubric was there to catch. So the filter
// canonicalizes both sides into the same tag space before comparing: version
// numbers are stripped, aliases are folded together, and ecosystem members pull
// in their parent (s3 -> aws).
//
// SAFETY: this filter decides who the AI never sees, so a false negative is
// invisible — the candidate simply doesn't appear. Three rules keep that from
// happening (see prefilterCandidates): unknown profiles are always kept,
// already-matched candidates are always kept, and an unrecognizable request
// disables the filter entirely rather than matching nobody.

// ---------------------------------------------------------------------------
// Aliases: normalized token -> SPECIFIC canonical tag(s).
//
// Keep these specific. Broad umbrella tags (frontend, cloud, devops, ...) live
// in BROADEN below and are applied to the candidate side only — see
// canonicalizeSkills for why that asymmetry matters.
//
// A token may still map to several specific tags (eks really is both kubernetes
// and aws).
// ---------------------------------------------------------------------------
const ALIASES = {
  // --- languages ---
  'c#': ['csharp'], 'c sharp': ['csharp'], '.net': ['dotnet'], 'dotnet core': ['dotnet'],
  'asp.net': ['dotnet'], 'aspnet': ['dotnet'], 'net core': ['dotnet'],
  'c++': ['cpp'], 'cplusplus': ['cpp'],
  'js': ['javascript'], 'ecmascript': ['javascript'], 'node': ['nodejs'], 'node.js': ['nodejs'],
  'ts': ['typescript'],
  'py': ['python'],
  'golang': ['go'],
  'objective c': ['objectivec'],

  // --- frontend ---
  'angularjs': ['angular'], 'angular': ['angular'], 'angular2': ['angular'],
  'react.js': ['react'], 'reactjs': ['react'], 'react': ['react'],
  'vue.js': ['vue'], 'vuejs': ['vue'], 'vue': ['vue'], 'vue3': ['vue'],
  'svelte': ['svelte'], 'next.js': ['react'], 'nextjs': ['react'],
  'html': ['frontend'], 'html5': ['frontend'], 'css': ['frontend'], 'css3': ['frontend'],
  'sass': ['frontend'], 'scss': ['frontend'], 'tailwind': ['frontend'], 'redux': ['react'],
  'es6': ['javascript'], 'jquery': ['javascript'],

  // --- backend / frameworks ---
  'spring': ['spring'], 'spring boot': ['spring'], 'springboot': ['spring'],
  'django': ['django'], 'flask': ['flask'], 'fastapi': ['python'],
  'express': ['nodejs'], 'nestjs': ['nodejs'],
  'rails': ['ruby'], 'ruby on rails': ['ruby'],
  'laravel': ['php'], 'symfony': ['php'],

  // --- AWS ecosystem ---
  's3': ['aws'], 'ec2': ['aws'], 'lambda': ['aws'],
  'dynamodb': ['aws', 'nosql'], 'cloudwatch': ['aws'], 'cloudformation': ['aws', 'iac'],
  'rds': ['aws', 'sql'], 'ecs': ['aws', 'containers'],
  'eks': ['aws', 'kubernetes'], 'ecr': ['aws', 'containers'],
  'sqs': ['aws'], 'sns': ['aws'], 'kms': ['aws'],
  'route53': ['aws'], 'api gateway': ['aws'], 'cdk': ['aws', 'iac'],
  'iam': ['aws'], 'amazon web services': ['aws'], 'aws': ['aws'],

  // --- Azure ecosystem ---
  'azure': ['azure'], 'azure devops': ['azure', 'cicd'],
  'azure functions': ['azure'], 'blob storage': ['azure'],
  'aks': ['azure', 'kubernetes'], 'app service': ['azure'],
  'entra': ['azure'], 'active directory': ['azure'],

  // --- GCP ecosystem ---
  'gcp': ['gcp'], 'google cloud': ['gcp'], 'bigquery': ['gcp', 'sql'],
  'cloud run': ['gcp'], 'gke': ['gcp', 'kubernetes'],
  'pub/sub': ['gcp'], 'pubsub': ['gcp'], 'cloud functions': ['gcp'],

  // --- containers / orchestration ---
  'k8s': ['kubernetes'], 'kubernetes': ['kubernetes'],
  'helm': ['kubernetes'], 'kubectl': ['kubernetes'],
  'docker': ['docker'], 'containerization': ['containers'],
  'openshift': ['kubernetes'], 'podman': ['containers'],

  // --- CI/CD + IaC ---
  'jenkins': ['cicd'], 'github actions': ['cicd'], 'gitlab ci': ['cicd'],
  'circleci': ['cicd'], 'argocd': ['cicd'], 'teamcity': ['cicd'],
  'bamboo': ['cicd'], 'ci/cd': ['cicd'], 'cicd': ['cicd'],
  'terraform': ['iac'], 'ansible': ['iac'], 'pulumi': ['iac'],
  'puppet': ['iac'], 'chef': ['iac'],
  'infrastructure as code': ['iac'], 'devops': ['devops'],

  // --- databases ---
  'postgresql': ['postgres'], 'postgres': ['postgres'], 'psql': ['postgres'],
  'mysql': ['mysql'], 'mariadb': ['mysql'], 'mssql': ['mssql'],
  'sql server': ['mssql'], 'oracle db': ['oracle'], 'oracle': ['oracle'],
  'sqlite': ['sql'], 'plsql': ['sql'], 'pl/sql': ['sql'], 'tsql': ['sql'], 't-sql': ['sql'],
  'sql': ['sql'], 'databases': ['sql'], 'relational databases': ['sql'],
  'mongodb': ['mongodb'], 'mongo': ['mongodb'], 'cassandra': ['nosql'],
  'redis': ['redis'], 'elasticsearch': ['elasticsearch'], 'elastic': ['elasticsearch'],
  'opensearch': ['elasticsearch'], 'nosql': ['nosql'], 'neo4j': ['nosql'],

  // --- messaging / streaming ---
  'kafka': ['kafka'], 'rabbitmq': ['messaging'], 'activemq': ['messaging'],
  'mqtt': ['messaging'], 'message queue': ['messaging'],

  // --- testing ---
  'jest': ['testing'], 'mocha': ['testing'], 'pytest': ['testing'], 'junit': ['testing'],
  'cypress': ['testing'], 'selenium': ['testing'], 'playwright': ['testing'],
  'testng': ['testing'], 'unit testing': ['testing'], 'integration testing': ['testing'],
  'test automation': ['testing'], 'testautomation': ['testing'], 'qa': ['testing'],
  'testing': ['testing'],

  // --- mobile ---
  'android': ['android'], 'ios': ['ios'], 'swift': ['swift'],
  'kotlin': ['kotlin'], 'flutter': ['mobile'], 'react native': ['react', 'mobile'],
  'xamarin': ['mobile', 'dotnet'],

  // --- embedded ---
  'embedded': ['embedded'], 'embedded c': ['embedded', 'c'], 'rtos': ['embedded'],
  'freertos': ['embedded'], 'yocto': ['embedded'], 'autosar': ['embedded', 'automotive'],
  'can bus': ['embedded', 'automotive'], 'canbus': ['embedded', 'automotive'],
  'firmware': ['embedded'], 'bare metal': ['embedded'],

  // --- data / ML ---
  'machine learning': ['ml'], 'ml': ['ml'], 'deep learning': ['ml'],
  'tensorflow': ['ml'], 'pytorch': ['ml'],
  'scikit-learn': ['ml'], 'sklearn': ['ml'],
  'pandas': ['python', 'data'], 'numpy': ['python', 'data'], 'spark': ['data'],
  'databricks': ['data'], 'airflow': ['data'], 'etl': ['data'], 'data engineering': ['data'],
  'power bi': ['data'], 'powerbi': ['data'], 'tableau': ['data'],

  // --- ways of working ---
  'scrum': ['agile'], 'kanban': ['agile'], 'safe': ['agile'], 'agile': ['agile'],
  'agila metoder': ['agile'], 'lean': ['agile'],

  // --- misc ---
  'git': ['git'], 'linux': ['linux'], 'unix': ['linux'], 'bash': ['linux'], 'shell': ['linux'],
  'rest': ['api'], 'rest api': ['api'], 'restful': ['api'], 'graphql': ['api'],
  'grpc': ['api'], 'soap': ['api'], 'openapi': ['api'], 'oauth2': ['security'],
  'microservices': ['microservices'],
  'security': ['security'], 'cybersecurity': ['security'], 'penetration testing': ['security'],
  'cloud': ['cloud'], 'frontend': ['frontend'], 'backend': ['backend'],
  'fullstack': ['frontend', 'backend'], 'full stack': ['frontend', 'backend'],
  'full-stack': ['frontend', 'backend'],
};

// Umbrella tags. Applied to the CANDIDATE side only: someone who lists S3 does
// have cloud experience, so they should surface for a request that says
// "Cloud". Applied to the request side these would dilute the requirement set
// (an "Angular" request would start accepting any 'frontend' candidate), so
// canonicalizeSkills only expands when broaden is true.
const BROADEN = {
  react: ['frontend'], angular: ['frontend'], vue: ['frontend'], svelte: ['frontend'],
  spring: ['backend'], django: ['backend'], flask: ['backend'], nodejs: ['backend'],
  dotnet: ['backend'],
  aws: ['cloud'], azure: ['cloud'], gcp: ['cloud'],
  kubernetes: ['containers', 'devops'], docker: ['containers', 'devops'],
  containers: ['devops'], cicd: ['devops'], iac: ['devops'],
  postgres: ['sql'], mysql: ['sql'], mssql: ['sql'], oracle: ['sql'],
  mongodb: ['nosql'], redis: ['nosql'], elasticsearch: ['nosql'],
  kafka: ['messaging'],
  android: ['mobile'], ios: ['mobile'], swift: ['mobile'], kotlin: ['mobile'],
  ml: ['data'],
};

// Language implications, also candidate-side only: a CV that names only the
// framework still evidences the language underneath it.
const IMPLIES = {
  spring: ['java'],
  django: ['python'],
  flask: ['python'],
  react: ['javascript'],
  angular: ['typescript', 'javascript'],
  vue: ['javascript'],
  nodejs: ['javascript'],
  typescript: ['javascript'],
  dotnet: ['csharp'],
  kotlin: ['java'],
  swift: ['ios'],
  ml: ['python'],
};

// Tokens that carry no matching signal — dropping them keeps the tag space
// meaningful and stops "erfarenhet" from being treated as a skill.
const STOPWORDS = new Set([
  'erfarenhet', 'kunskap', 'experience', 'knowledge', 'good', 'god', 'stark', 'strong',
  'meriterande', 'krav', 'other', 'övrigt', 'ovrigt', 'etc', 'med', 'och', 'and', 'or',
  'eller', 'samt', 'm.m', 'mm', 'plus', 'goda', 'kunskaper', 'flytande', 'fluent',
  'utveckling', 'development', 'developer', 'utvecklare', 'system', 'arbete',
]);

/**
 * Normalize one raw skill token into its comparable form.
 * Strips priority markers, version suffixes and surrounding punctuation.
 * "**Angular 14+**" -> "angular", "Java11+" -> "java", "C++17" -> "c++"
 *
 * Version stripping is deliberately conservative: it only fires when there is a
 * separator ("angular 14"), an explicit "+" ("java11+"), or a dotted version
 * ("python 3.x"). A bare trailing digit is part of the NAME far more often than
 * it is a version — stripping it unconditionally turned "s3" into "s", "log4j"
 * into "log", and "html5" into "html", which silently deleted the AWS ecosystem
 * from the tag space.
 */
function normalizeToken(raw) {
  let t = String(raw || '').toLowerCase().trim();
  t = t.replace(/\*\*/g, '');                       // priority markers
  t = t.replace(/[()[\]{}"']/g, ' ');
  t = t.replace(/\s+/g, ' ').trim();

  // "c++17" / "c++ 17" -> "c++" (handle before the generic rules)
  t = t.replace(/^(c\+\+)\s*\d+$/, '$1');

  const stripped = t
    .replace(/[\s-]+v?\d+(\.\d+)*(\.x)?\s*\+?$/, '')  // "angular 14+", "python 3.x"
    .replace(/\d+(\.\d+)*\+$/, '')                    // "java11+", "net6+"
    .trim()
    .replace(/[.,;:\s-]+$/, '')
    .trim();

  // Never let stripping produce a stub — if it did, the digits were part of the name.
  if (stripped.length >= 2) t = stripped;

  return t.replace(/[.,;:]+$/, '').trim();
}

/**
 * Turn free text into a Set of canonical tags.
 *
 * `broaden` controls the asymmetry that makes the filter work:
 *
 *   - CANDIDATE side (broaden: true) — credit the candidate with everything
 *     their skills imply. Someone who lists S3 has AWS and cloud experience;
 *     someone who lists Spring knows Java.
 *
 *   - REQUEST side (broaden: false) — take the requirements literally. If a
 *     request asks for Angular it requires Angular, not "some frontend
 *     framework". Broadening here would dilute the requirement set until a
 *     React developer scored 50% on an Angular request purely through the
 *     shared 'frontend'/'javascript' tags, which is exactly the false positive
 *     the prefilter is supposed to avoid.
 *
 * Unknown tokens are kept in normalized form so niche skills still match each
 * other exactly.
 */
function canonicalizeSkills(text, options = {}) {
  const broaden = options.broaden !== false;
  const tags = new Set();
  if (!text) return tags;

  const parts = String(text)
    .split(/[,;|\n\r\t]+|\s\/\s|(?<=\w)\/(?=\w)/)
    .map(normalizeToken)
    .filter(Boolean);

  for (const part of parts) {
    if (!part || part.length < 2 || STOPWORDS.has(part)) continue;

    const mapped = ALIASES[part];
    if (mapped) {
      for (const tag of mapped) tags.add(tag);
    } else if (part.split(' ').length <= 3) {
      // Unknown token: keep as its own tag, but only if it looks like a skill
      // rather than a sentence fragment.
      tags.add(part);
    }
  }

  if (broaden) {
    // Fixpoint, because broadening chains: kubernetes -> containers -> devops.
    // Bounded so a future cycle in the tables can't hang the request.
    for (let pass = 0; pass < 4; pass++) {
      let grew = false;
      for (const tag of Array.from(tags)) {
        for (const wider of (BROADEN[tag] || []).concat(IMPLIES[tag] || [])) {
          if (!tags.has(wider)) { tags.add(wider); grew = true; }
        }
      }
      if (!grew) break;
    }
  }

  return tags;
}

/** Stable, comma-joined tag string for storage in candidates.skill_tags. */
function tagsToString(tags) {
  return Array.from(tags).sort().join(',');
}

/** Inverse of tagsToString. */
function stringToTags(str) {
  const tags = new Set();
  for (const t of String(str || '').split(',')) {
    const trimmed = t.trim();
    if (trimmed) tags.add(trimmed);
  }
  return tags;
}

/**
 * Skill tags for a request: required skills carry the weight, the role and
 * description are folded in as weaker signal so a request that says
 * "Backend developer, microservices" still filters usefully even when the
 * requiredSkills field is thin.
 */
function requestTags(request) {
  // broaden: false — requirements are taken literally. See canonicalizeSkills.
  const primary = canonicalizeSkills(request.requiredSkills || request.required_skills || '', { broaden: false });
  const secondary = canonicalizeSkills(request.role || '', { broaden: false });
  return { primary, secondary };
}

/**
 * Canonical tag string to store on a candidate. Built from the candidate's
 * skills field plus anything the distilled profile surfaced, broadened.
 */
function candidateTagsFromFields({ skills, role, profileSkills }) {
  const tags = canonicalizeSkills(
    [skills, profileSkills, role].filter(Boolean).join(', '),
    { broaden: true }
  );
  return tagsToString(tags);
}

/** Skill tags for a candidate, from stored tags or (as a fallback) raw fields. */
function candidateTags(candidate) {
  if (candidate.skillTags || candidate.skill_tags) {
    return stringToTags(candidate.skillTags || candidate.skill_tags);
  }
  return null; // unknown — caller must treat this as "cannot be excluded"
}

/**
 * Cheap role similarity in [0,1]: fraction of the request's role words that
 * appear in the candidate's role.
 */
function roleSimilarity(requestRole, candidateRole) {
  const a = String(requestRole || '').toLowerCase().match(/[a-zåäö+#.]{3,}/g) || [];
  const b = new Set(String(candidateRole || '').toLowerCase().match(/[a-zåäö+#.]{3,}/g) || []);
  if (!a.length || !b.size) return 0;
  const hits = a.filter(w => b.has(w) && !STOPWORDS.has(w)).length;
  return hits / a.length;
}

/**
 * Score one candidate against a request's tags, in [0,1].
 * Skill overlap dominates; role is a tiebreaker.
 */
function prefilterScore(request, candidate, tags) {
  const cTags = candidateTags(candidate);
  if (!cTags || cTags.size === 0) return null; // unknown — not scoreable

  let skill = 0;
  if (tags.primary.size > 0) {
    let hits = 0;
    for (const t of tags.primary) if (cTags.has(t)) hits++;
    skill = hits / tags.primary.size;
  }

  let secondary = 0;
  if (tags.secondary.size > 0) {
    let hits = 0;
    for (const t of tags.secondary) if (cTags.has(t)) hits++;
    secondary = hits / tags.secondary.size;
  }

  const role = roleSimilarity(request.role, candidate.role);
  return skill * 0.7 + secondary * 0.15 + role * 0.15;
}

const DEFAULT_LIMIT = Math.max(1, Number(process.env.AI_MATCH_PREFILTER_LIMIT || 80));

/**
 * Pick the candidates worth sending to the AI for this request.
 *
 * Returns { selected, stats }. `stats` is for logging/telemetry so a silent
 * truncation is never invisible — see the "no silent caps" rule.
 *
 * Three safety rules, in order of importance:
 *   1. A candidate with NO skill tags (CV never distilled, or distillation
 *      yielded nothing) is ALWAYS selected. We cannot prove they don't match,
 *      so excluding them would be a silent false negative. As the backfill
 *      completes this set shrinks toward zero.
 *   2. A candidate already on the request's match list is ALWAYS selected, so
 *      turning the prefilter on can never make an existing match disappear.
 *   3. If the request has no recognizable skill tags at all, the filter is
 *      DISABLED (everyone is selected) rather than matching nobody.
 */
function prefilterCandidates(request, candidates, options = {}) {
  const limit = Math.max(1, Number(options.limit || DEFAULT_LIMIT));
  const keepIds = new Set(options.alwaysInclude || []);
  const tags = requestTags(request);

  if (tags.primary.size === 0 && tags.secondary.size === 0) {
    return {
      selected: candidates,
      stats: {
        mode: 'disabled-no-request-tags',
        total: candidates.length,
        selected: candidates.length,
        dropped: 0,
        unknownProfiles: 0,
        pinned: 0,
      },
    };
  }

  const forced = [];
  const scored = [];
  let unknownProfiles = 0;
  let pinned = 0;

  for (const c of candidates) {
    const score = prefilterScore(request, c, tags);
    if (score === null) {
      unknownProfiles++;
      forced.push(c);
      continue;
    }
    if (keepIds.has(c.id)) {
      pinned++;
      forced.push(c);
      continue;
    }
    if (score > 0) scored.push({ candidate: c, score });
  }

  scored.sort((a, b) => b.score - a.score || String(a.candidate.id).localeCompare(String(b.candidate.id)));

  // The forced set is never counted against the limit — it is the safety net,
  // not a budget item.
  const room = Math.max(0, limit);
  const picked = scored.slice(0, room).map(s => s.candidate);

  const selected = forced.concat(picked);
  return {
    selected,
    stats: {
      mode: 'active',
      total: candidates.length,
      selected: selected.length,
      dropped: candidates.length - selected.length,
      unknownProfiles,
      pinned,
      belowLimit: Math.max(0, scored.length - room),
      requestTags: Array.from(tags.primary).sort().join(','),
    },
  };
}

module.exports = {
  canonicalizeSkills,
  normalizeToken,
  tagsToString,
  stringToTags,
  requestTags,
  candidateTags,
  candidateTagsFromFields,
  roleSimilarity,
  prefilterScore,
  prefilterCandidates,
  DEFAULT_LIMIT,
};
