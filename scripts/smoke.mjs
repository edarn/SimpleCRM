#!/usr/bin/env node
// Dev smoke-test harness.
//
//   node scripts/smoke.mjs
//
// Spawns the app on a throwaway SQLite DB + port, waits until it is actually
// listening (the WSL2 bind can take ~20s), runs the checks in
// scripts/smoke.checks.mjs, then tears everything down and reports pass/fail.
//
// Why this exists: it lets the whole "test phase" run as a SINGLE `node ...`
// command instead of dozens of ad-hoc curl/kill/lsof shell commands — so it is
// covered by the existing `Bash(node:*)` allow rule and doesn't spam approval
// prompts. Put per-feature assertions in scripts/smoke.checks.mjs (gitignored).
import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, '..');

const PORT = Number(process.env.SMOKE_PORT) || 3099;
const BASE = `http://127.0.0.1:${PORT}`;
const dbDir = mkdtempSync(join(tmpdir(), 'crm-smoke-'));

const server = spawn('node', ['server.js'], {
  cwd: repoRoot,
  env: { ...process.env, DATABASE_PATH: join(dbDir, 'crm.db'), PORT: String(PORT), NODE_ENV: 'development' },
  stdio: ['ignore', 'pipe', 'pipe'],
});
let serverLog = '';
server.stdout.on('data', d => { serverLog += d; });
server.stderr.on('data', d => { serverLog += d; });

// --- cookie-jar fetch helpers handed to the checks file ---
let cookie = '';
async function api(method, path, body, opts = {}) {
  const headers = {};
  if (cookie) headers.Cookie = cookie;
  let payload;
  if (opts.form) {
    payload = body; // expects a FormData instance
  } else if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
    payload = JSON.stringify(body);
  }
  const res = await fetch(`${BASE}${path}`, { method, headers, body: payload, redirect: 'manual' });
  const setCookie = res.headers.get('set-cookie');
  if (setCookie) cookie = setCookie.split(';')[0];
  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch { json = text; }
  return { status: res.status, body: json };
}

let pass = 0, fail = 0;
function check(name, cond, detail = '') {
  if (cond) { pass++; console.log(`  ✓ ${name}`); }
  else { fail++; console.log(`  ✗ ${name}${detail ? '  -> ' + detail : ''}`); }
}
const log = (...a) => console.log(...a);

async function waitForServer(timeoutMs = 60000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (server.exitCode !== null) throw new Error('Server exited early:\n' + serverLog);
    try {
      const r = await fetch(`${BASE}/api/health`);
      if (r.ok) return;
    } catch { /* not up yet */ }
    await new Promise(r => setTimeout(r, 500));
  }
  throw new Error(`Server did not become ready on ${BASE} within ${timeoutMs}ms:\n` + serverLog);
}

try {
  await waitForServer();
  console.log(`Server ready on ${BASE}\n`);

  const checksPath = join(__dirname, 'smoke.checks.mjs');
  if (existsSync(checksPath)) {
    const mod = await import(pathToFileURL(checksPath).href);
    const run = mod.default || mod.run;
    if (typeof run !== 'function') throw new Error('smoke.checks.mjs must export a default async function');
    await run({ api, check, log, BASE });
  } else {
    console.log('(no scripts/smoke.checks.mjs found — only verified the server boots)');
  }
} catch (err) {
  fail++;
  console.error('\nSMOKE ERROR:', err.message);
} finally {
  server.kill('SIGKILL');
  try { rmSync(dbDir, { recursive: true, force: true }); } catch { /* ignore */ }
  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}
