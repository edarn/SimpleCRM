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

// Drop-in for `client.messages.create(...)`, but routed through the gate.
async function createMessage(params) {
  await acquire();
  try {
    return await getClient().messages.create(params);
  } finally {
    release();
  }
}

// Exposed for diagnostics / tests.
function stats() {
  return { active, queued: waiters.length, max: MAX_CONCURRENCY };
}

module.exports = { createMessage, getClient, stats };
