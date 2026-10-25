const Anthropic = require('@anthropic-ai/sdk');

// Single shared Anthropic client + a process-wide concurrency gate.
//
// Why this exists: every AI call in the app (email classification, candidate
// matching) runs server-side under ONE API key, so all users/tabs share the
// same Anthropic rate limit. Without a gate, a burst of simultaneous requests
// fires that many concurrent API calls at once, which can trip rate limits
// (429) / overload (529); the SDK then retries with backoff and a call can
// appear to "hang", pinning an inbox email at "processing" forever.
//
// The gate caps how many calls are in flight at any moment. Excess calls queue
// and run as slots free up — some parallelism (good throughput) but never more
// than we allow. This is the proactive throttle; the per-call `timeout` below is
// just a safety release so a genuinely dead call can't hold its slot forever.

let client = null;

function getClient() {
  if (!client) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error('ANTHROPIC_API_KEY environment variable is not set');
    client = new Anthropic({
      apiKey,
      // SDK retries 429 / 529 / network errors with exponential backoff and
      // honors the server's `retry-after` header — this is what actually keeps
      // us within Anthropic's limits when we do bump into them.
      maxRetries: Number(process.env.AI_MAX_RETRIES || 2),
      // Hard ceiling per attempt so a hung connection releases its gate slot
      // instead of blocking the queue indefinitely. Keep timeout x (retries + 1)
      // bounded — this is an interactive feature, and the old 120s x 4 = 8min
      // worst case meant one wedged call could hold a gate slot long enough to
      // stall every other user's email behind it.
      timeout: Number(process.env.AI_REQUEST_TIMEOUT_MS || 60000),
    });
  }
  return client;
}

// Max concurrent in-flight API calls across the whole process. Keep this at or
// below what your Anthropic tier comfortably allows; bump via env as you scale.
const MAX_CONCURRENCY = Math.max(1, Number(process.env.AI_MAX_CONCURRENCY || 6));

let active = 0;
const waiters = []; // resolvers for calls waiting on a free slot, FIFO

function acquire() {
  if (active < MAX_CONCURRENCY) {
    active++;
    return Promise.resolve();
  }
  return new Promise(resolve => waiters.push(resolve));
}

function release() {
  // Hand the freed slot directly to the next waiter (active stays the same).
  // Only decrement when nobody is queued. Single-threaded JS means acquire/
  // release run atomically between awaits, so there's no race on `active`.
  const next = waiters.shift();
  if (next) {
    next();
  } else {
    active--;
  }
}

// Model per job, in one place so an upgrade is a one-line change.
//
// NOTE when changing these: Haiku 5.5 and Sonnet 5.5 reject `temperature`, think
// by default (thinking counts toward max_tokens), and can put thinking/fallback
// blocks before the answer — read replies with responseText(), never content[0].
const MODELS = {
  // Bulk CV import: contact fields + profile in one extraction call. Compared
  // against Sonnet 4.6 on 13 real CVs: same contact fields on 38/39, ~23x
  // cheaper, ~3x faster. Recruiters review imported candidates anyway.
  cvImport: 'claude-haiku-5-5',
  // Candidate <-> request scoring and standalone profile distillation: these
  // drive match scores, so they stay on the judgment tier.
  matching: 'claude-sonnet-5-5',
};

// Drop-in for `client.messages.create(...)`, but routed through the gate.
// Requests that carry `betas` (e.g. server-side refusal fallback) go to the
// beta endpoint, which is where the SDK accepts that field.
async function createMessage(params) {
  await acquire();
  try {
    const c = getClient();
    return await (params.betas ? c.beta.messages.create(params) : c.messages.create(params));
  } finally {
    release();
  }
}

// The answer text of a response, read by block TYPE: on current models the
// first block can be `thinking` (or `fallback`), not the reply. A refusal is
// thrown so callers' existing error paths handle it instead of parsing nothing.
function responseText(response) {
  if (response && response.stop_reason === 'refusal') {
    const category = response.stop_details && response.stop_details.category;
    throw new Error(`AI declined the request${category ? ` (${category})` : ''}`);
  }
  const block = ((response && response.content) || []).find(b => b.type === 'text');
  return block ? block.text : '';
}

// Server-side refusal fallback for Sonnet 5.5 requests (Claude API only): a
// declined request is retried on another model inside the same call. Haiku 5.5
// has no server-side fallback, so this is only spread into matching calls.
const MATCHING_FALLBACK = { betas: ['server-side-fallback-2026-07-01'], fallbacks: 'default' };

// Exposed for diagnostics / tests.
function stats() {
  return { active, queued: waiters.length, max: MAX_CONCURRENCY };
}

module.exports = { createMessage, getClient, stats, responseText, MODELS, MATCHING_FALLBACK };
