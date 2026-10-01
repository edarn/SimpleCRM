// Client screening pipeline — the domain logic behind the "Apple" tab.
//
// A pipeline row is one candidate being taken through one client's process.
// Nothing about where someone stands is stored: the outcome, the progress, the
// next action and the sort order are all derived from the steps, so a row can
// never disagree with itself.
//
// Steps live as JSON on the row (same house style as checklist_items_state and
// calculation_json). Adding a step is a change here plus a label — old rows
// simply have no entry for it and read as "not started".

// The client is a column on the row so a second customer is configuration
// rather than a migration. Apple is the first one.
const CLIENTS = {
  apple: { key: 'apple', label: 'Apple' },
};
const DEFAULT_CLIENT = 'apple';

// Two phases: getting picked, and getting signed.
const STEPS = [
  { key: 'code_test', phase: 'urval', label: 'Kodprov' },
  { key: 'screening', phase: 'urval', label: 'Screening' },
  { key: 'presented', phase: 'urval', label: 'Presenterad' },
  { key: 'client_interview', phase: 'urval', label: '{client}-intervju' },
  // The only step whose meaning depends on the engagement form.
  { key: 'offer', phase: 'avtal', label: 'Erbjudande', labelSub: 'Pris' },
  { key: 'signed', phase: 'avtal', label: 'Signerat avtal' },
  { key: 'confirmed', phase: 'avtal', label: 'Till {client}' },
];
const STEP_KEYS = STEPS.map((s) => s.key);

// 'active' covers every "sent / booked, now waiting" state — the ones worth
// chasing. 'skipped' is deliberately not the same as 'pending': plenty of
// people never do the code test, and their row should not look unfinished.
const STATUSES = ['pending', 'active', 'passed', 'failed', 'skipped'];

const TEAMS = [
  'Java Backend',
  'TypeScript Frontend',
  'iOS',
  'Java/Scala',
  'Machine Learning',
];

// Per-step wording. Generic "not started / in progress" reads badly on a
// screen full of different steps, so each one gets its own verbs.
const STEP_STATUS_LABELS = {
  code_test: { pending: 'Kodprov ej skickat', active: 'Kodprov skickat', passed: 'Kodprov ok' },
  screening: { pending: 'Ej bokad', active: 'Bokad', passed: 'Screening ok' },
  presented: { pending: 'Ej presenterad', active: 'Skickad, väntar på besked', passed: 'Presenterad' },
  client_interview: { pending: 'Ej bokad', active: 'Väntar på tider', passed: 'Genomförd' },
  offer: { pending: 'Erbjudande ej skickat', active: 'Erbjudande skickat', passed: 'Erbjudande accepterat' },
  signed: { pending: 'Ej signerat', active: 'Skickat för signering', passed: 'Signerat' },
  confirmed: { pending: 'Ej skickat', active: 'Skickat', passed: 'Skickat' },
};
const SUB_STEP_STATUS_LABELS = {
  offer: { pending: 'Pris ej förhandlat', active: 'Förhandling pågår', passed: 'Pris överenskommet' },
};

// 'failed' and 'skipped' read the same everywhere, so they are not repeated
// per step. This also covers any step whose own map is incomplete.
const GENERIC_STATUS_LABELS = {
  pending: 'Inte påbörjat',
  active: 'Pågår / väntar',
  passed: 'Klart',
  failed: 'Nej \u2014 går inte vidare',
  skipped: 'Hoppa över',
};

/** The wording for one step's status, resolved for the engagement form. */
function statusLabel(stepKey, status, isSubcontractor) {
  const sub = isSubcontractor ? SUB_STEP_STATUS_LABELS[stepKey] : null;
  return (sub && sub[status]) || (STEP_STATUS_LABELS[stepKey] || {})[status] || GENERIC_STATUS_LABELS[status] || status;
}

// What to do next, per step. `mine` is your move, `waiting` is somebody else's.
const STEP_ACTIONS = {
  code_test: { mine: 'Skicka provlänk', waiting: 'Väntar på provresultat' },
  screening: { mine: 'Boka screening', waiting: 'Screening {date}' },
  presented: { mine: 'Presentera för {client}', waiting: 'Väntar på besked från {client}' },
  client_interview: { mine: 'Boka intervju hos {client}', waiting: 'Påminn {client} om intervjutider', waitingDated: 'Intervju hos {client} {date}' },
  offer: { mine: 'Skicka erbjudande', waiting: 'Väntar på svar på erbjudandet' },
  signed: { mine: 'Skicka avtal för signering', waiting: 'Väntar på signatur' },
  confirmed: { mine: 'Skicka kontraktsmail till {client}', waiting: 'Kontraktsmail skickat' },
};
const SUB_STEP_ACTIONS = {
  offer: { mine: 'Förhandla pris', waiting: 'Väntar på prissvar' },
};

function clientLabel(client) {
  return (CLIENTS[client] || CLIENTS[DEFAULT_CLIENT]).label;
}

function normalizeClient(client) {
  return CLIENTS[client] ? client : DEFAULT_CLIENT;
}

function normalizeTeam(team) {
  const t = String(team || '').trim();
  return TEAMS.includes(t) ? t : '';
}

function fill(template, vars) {
  return String(template || '').replace(/\{(\w+)\}/g, (m, k) => (vars[k] != null ? vars[k] : m));
}

/** Step labels for one row, already resolved for client and engagement form. */
function stepsFor(client, isSubcontractor) {
  const label = clientLabel(client);
  return STEPS.map((s) => ({
    key: s.key,
    phase: s.phase,
    label: fill(isSubcontractor && s.labelSub ? s.labelSub : s.label, { client: label }),
  }));
}

/** Every step present, every field a string, nothing unexpected stored. */
function normalizeSteps(raw) {
  const source = raw && typeof raw === 'object' ? raw : {};
  const out = {};
  for (const key of STEP_KEYS) {
    const s = source[key] && typeof source[key] === 'object' ? source[key] : {};
    out[key] = {
      status: STATUSES.includes(s.status) ? s.status : 'pending',
      date: typeof s.date === 'string' ? s.date.slice(0, 10) : '',
      note: typeof s.note === 'string' ? s.note.slice(0, 2000) : '',
    };
  }
  return out;
}

/**
 * Recording an outcome on a step says something about the ones before it, so
 * typing in a profile that is already through the process should not mean
 * seven clicks.
 *
 * A green tick fills earlier `pending` and `active` steps. `skipped` already
 * counts as cleared and saying "no test needed" is a deliberate statement;
 * `failed` is a deliberate negative, and silently reversing a nej would be
 * worse than leaving the row visibly contradictory.
 *
 * A red cross fills them too — someone rejected at the last step plainly got
 * past the earlier ones — but only on an otherwise untouched row. Once any
 * other step has been set, the row is a record someone has been keeping, and
 * a late nej must not rewrite it.
 *
 * Filled-in steps get no date: an invented one reads as fact, and the tick is
 * the whole claim.
 *
 * @returns {{ steps: Object, filled: string[] }} the new steps and what changed
 */
function backfillEarlierSteps(steps, stepKey) {
  const upto = STEP_KEYS.indexOf(stepKey);
  if (upto <= 0) return { steps, filled: [] };

  const status = steps[stepKey].status;
  let fillable;
  if (status === 'passed') {
    fillable = (st) => st === 'pending' || st === 'active';
  } else if (status === 'failed') {
    const untouched = STEP_KEYS.every((k) => k === stepKey || steps[k].status === 'pending');
    if (!untouched) return { steps, filled: [] };
    fillable = (st) => st === 'pending';
  } else {
    return { steps, filled: [] };
  }

  const next = { ...steps };
  const filled = [];
  for (const key of STEP_KEYS.slice(0, upto)) {
    if (fillable(next[key].status)) {
      next[key] = { ...next[key], status: 'passed' };
      filled.push(key);
    }
  }
  return { steps: next, filled };
}

/** Steps before `stepKey` that setting it to `status` would fill in. */
function backfillPreview(steps, stepKey, status) {
  const hypothetical = { ...steps, [stepKey]: { ...steps[stepKey], status } };
  return backfillEarlierSteps(hypothetical, stepKey).filled;
}

function parseDate(value) {
  if (!value) return null;
  const d = new Date(value.length <= 10 ? value + 'T00:00:00Z' : value);
  return isNaN(d.getTime()) ? null : d;
}

function daysBetween(from, to) {
  if (!from || !to) return null;
  return Math.floor((to.getTime() - from.getTime()) / 86400000);
}

/**
 * Everything the views need about one row, derived from its steps.
 *
 * @param {Object} row        pipeline row (steps already parsed)
 * @param {Object} candidate  { name, role, isSubcontractor }
 * @param {Date}   [now]      injectable for tests
 */
function deriveRow(row, candidate, now = new Date()) {
  const client = normalizeClient(row.client);
  const label = clientLabel(client);
  const isSub = !!(candidate && candidate.isSubcontractor);
  const steps = normalizeSteps(row.steps);

  const failedIndex = STEP_KEYS.findIndex((k) => steps[k].status === 'failed');
  const rejected = failedIndex !== -1;

  // How far along: the furthest cleared step, with a half point for having
  // something in flight beyond it. Drives the sort order.
  let furthest = -1;
  let activeIndex = -1;
  STEP_KEYS.forEach((k, i) => {
    const st = steps[k].status;
    if (st === 'passed' || st === 'skipped') furthest = i;
    if (st === 'active' && activeIndex === -1) activeIndex = i;
  });
  const progress = (furthest + 1) * 2 + (activeIndex > furthest ? 1 : 0);

  const lastKey = STEP_KEYS[STEP_KEYS.length - 1];
  const done = !rejected && steps[lastKey].status === 'passed';
  const outcome = rejected ? 'rejected' : done ? 'done' : 'active';

  const action = nextAction({ steps, rejected, failedIndex, done, row, label, isSub, now });

  return {
    client,
    clientLabel: label,
    steps,
    stepLabels: stepsFor(client, isSub),
    isSubcontractor: isSub,
    outcome,
    progress,
    failedStep: rejected ? STEP_KEYS[failedIndex] : null,
    // Cells after a rejection are not "to do", they are not applicable.
    inactiveFrom: rejected ? failedIndex + 1 : null,
    nextAction: action,
    waitingDays: action.days || 0,
    // Per step: which earlier ones a green tick here would fill in. Shipped so
    // the dialog can warn before it happens, rather than the browser working
    // the rule out for itself.
    backfillOnPass: STEP_KEYS.reduce((acc, key) => {
      acc[key] = backfillPreview(steps, key, 'passed');
      return acc;
    }, {}),
    backfillOnFail: STEP_KEYS.reduce((acc, key) => {
      acc[key] = backfillPreview(steps, key, 'failed');
      return acc;
    }, {}),
  };
}

function nextAction({ steps, rejected, failedIndex, done, row, label, isSub, now }) {
  const since = (value) => {
    const d = parseDate(value);
    if (!d) return null;
    const days = daysBetween(d, now);
    return days != null && days > 0 ? days : null;
  };

  if (rejected) {
    // A rejection is not finished until the candidate has been told.
    if (row.feedbackStatus === 'done') {
      const when = row.feedbackDate ? ` ${formatDate(row.feedbackDate)}` : '';
      return { kind: 'closed', label: `Återkopplad${when} · avslutad`, days: 0 };
    }
    const failedDate = steps[STEP_KEYS[failedIndex]].date;
    return { kind: 'mine', label: 'Återkoppla till kandidaten', days: since(failedDate) || 0 };
  }

  if (done) {
    if (row.endedAt) return { kind: 'closed', label: `Uppdraget avslutat ${formatDate(row.endedAt)}`, days: 0 };
    if (!row.startDate) {
      return { kind: 'waiting', label: `Väntar på startdatum från ${label}`, days: since(steps.confirmed.date) || 0 };
    }
    const start = parseDate(row.startDate);
    const diff = daysBetween(now, start);
    if (diff != null && diff > 0) return { kind: 'soon', label: `Startar ${formatDate(row.startDate)}`, days: 0 };
    return { kind: 'closed', label: `På plats sedan ${formatDate(row.startDate)}`, days: 0 };
  }

  // First step that still needs something to happen.
  const key = STEP_KEYS.find((k) => steps[k].status === 'pending' || steps[k].status === 'active');
  if (!key) return { kind: 'mine', label: 'Klar', days: 0 };

  const step = steps[key];
  const actions = (isSub && SUB_STEP_ACTIONS[key]) || STEP_ACTIONS[key];
  const vars = { client: label, date: step.date ? formatDate(step.date) : '' };

  if (step.status === 'active') {
    const future = step.date && daysBetween(now, parseDate(step.date)) > 0;
    // A booked future date is not something to chase — show the date instead.
    if (future && actions.waitingDated) return { kind: 'waiting', label: fill(actions.waitingDated, vars), days: 0 };
    if (future) return { kind: 'waiting', label: fill(actions.waiting, vars), days: 0 };
    return { kind: 'waiting', label: fill(actions.waiting, vars), days: since(step.date) || 0 };
  }
  return { kind: 'mine', label: fill(actions.mine, vars), days: 0 };
}

const MONTHS_SV = ['jan', 'feb', 'mar', 'apr', 'maj', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'];

function formatDate(value) {
  const d = parseDate(value);
  if (!d) return '';
  return `${d.getUTCDate()} ${MONTHS_SV[d.getUTCMonth()]}`;
}

// Klara överst, pågående därefter (längst i processen högst), avslag sist.
const OUTCOME_RANK = { done: 0, active: 1, rejected: 2 };

function compareRows(a, b) {
  const ra = OUTCOME_RANK[a.outcome];
  const rb = OUTCOME_RANK[b.outcome];
  if (ra !== rb) return ra - rb;

  if (a.outcome === 'done') {
    // Someone with no start date is waiting on you, so they come first;
    // otherwise the soonest starter is the most interesting.
    const aMissing = a.startDate ? 1 : 0;
    const bMissing = b.startDate ? 1 : 0;
    if (aMissing !== bMissing) return aMissing - bMissing;
    if (a.startDate && b.startDate && a.startDate !== b.startDate) {
      return a.startDate < b.startDate ? -1 : 1;
    }
  } else if (a.outcome === 'active') {
    if (a.progress !== b.progress) return b.progress - a.progress;
    // Same depth: the one that has been sitting longest floats up.
    if (a.waitingDays !== b.waitingDays) return b.waitingDays - a.waitingDays;
  } else {
    // Rejections that still owe the candidate an answer come before closed ones.
    const aOpen = a.nextAction.kind === 'mine' ? 0 : 1;
    const bOpen = b.nextAction.kind === 'mine' ? 0 : 1;
    if (aOpen !== bOpen) return aOpen - bOpen;
    if (a.waitingDays !== b.waitingDays) return b.waitingDays - a.waitingDays;
  }

  return String(a.candidateName || '').localeCompare(String(b.candidateName || ''), 'sv');
}

function sortRows(rows) {
  return rows.slice().sort(compareRows);
}

/** Counts for the funnel strip and the filter chips. */
function summarize(rows) {
  const passed = (r, key) => ['passed', 'skipped'].includes(r.steps[key].status);
  const activeRows = rows.filter((r) => r.outcome === 'active');
  return {
    total: rows.length,
    active: activeRows.length,
    done: rows.filter((r) => r.outcome === 'done').length,
    rejected: rows.filter((r) => r.outcome === 'rejected').length,
    needsAction: activeRows.filter((r) => r.nextAction.kind === 'mine' || r.waitingDays > 0).length,
    awaitingFeedback: rows.filter((r) => r.outcome === 'rejected' && r.nextAction.kind === 'mine').length,
    employment: rows.filter((r) => !r.isSubcontractor).length,
    subcontractor: rows.filter((r) => r.isSubcontractor).length,
    steps: STEP_KEYS.map((key) => ({
      key,
      cleared: rows.filter((r) => passed(r, key)).length,
      waiting: rows.filter((r) => r.steps[key].status === 'active').length,
      rejected: rows.filter((r) => r.steps[key].status === 'failed').length,
    })),
  };
}

module.exports = {
  CLIENTS,
  DEFAULT_CLIENT,
  STEPS,
  STEP_KEYS,
  STATUSES,
  TEAMS,
  STEP_STATUS_LABELS,
  SUB_STEP_STATUS_LABELS,
  GENERIC_STATUS_LABELS,
  statusLabel,
  clientLabel,
  normalizeClient,
  normalizeTeam,
  normalizeSteps,
  backfillEarlierSteps,
  backfillPreview,
  stepsFor,
  deriveRow,
  sortRows,
  compareRows,
  summarize,
  formatDate,
};
