// Pure helpers for the forwarded-CV import (Postmark inbound webhook).
// No DB, no I/O — the route in src/routes/inbound.js does the side effects.

const crypto = require('crypto');
const path = require('path');
const { TEAMS } = require('./pipeline');

const CV_EXTENSIONS = ['.pdf', '.doc', '.docx'];
const MAX_CV_BYTES = 10 * 1024 * 1024; // same cap as a manual upload
const MAX_CVS_PER_MAIL = 10;

// Constant-time compare of the shared webhook secret. Accepted as the password
// of HTTP Basic auth (Postmark: https://user:SECRET@host/...) or as ?token=.
function webhookAuthorized(req, secret) {
  if (!secret) return false;
  let given = '';
  const auth = req.headers.authorization || '';
  if (auth.startsWith('Basic ')) {
    const decoded = Buffer.from(auth.slice(6), 'base64').toString('utf8');
    given = decoded.slice(decoded.indexOf(':') + 1);
  } else if (typeof req.query.token === 'string') {
    given = req.query.token;
  }
  const a = crypto.createHash('sha256').update(given).digest();
  const b = crypto.createHash('sha256').update(secret).digest();
  return given.length > 0 && crypto.timingSafeEqual(a, b);
}

function header(payload, name) {
  const h = (payload.Headers || []).find((x) => String(x.Name || '').toLowerCase() === name.toLowerCase());
  return h ? String(h.Value || '') : '';
}

// Is the From address genuine? Anyone can type any From, so a registered
// address alone proves nothing. We require a valid DKIM signature from the
// From address's own domain (relaxed alignment, as DMARC does): Gmail, Outlook
// and Google Workspace all sign. SPF is not used: it checks the envelope
// sender, which an attacker controls independently of the visible From.
//
// Two sources, either is enough:
//  1. Postmark's SpamAssassin result (X-Spam-Tests contains DKIM_VALID_AU),
//     when Postmark adds it — it does not on every account;
//  2. our own check of the raw message (Postmark: "Include raw email content
//     in JSON payload"), verified with mailauth against the sender's DNS.
// Neither available, or neither passes = reject (fail closed).
async function senderAuthenticated(payload, fromEmail, { verify } = {}) {
  const tests = header(payload, 'X-Spam-Tests');
  if (tests && tests.split(/[\s,]+/).includes('DKIM_VALID_AU')) return { ok: true, via: 'spamassassin' };

  if (!payload.RawEmail) {
    return { ok: false, reason: 'no RawEmail in payload (enable "Include raw email content in JSON payload" in Postmark)' };
  }
  const dkimVerify = verify || require('mailauth/lib/dkim/verify').dkimVerify;
  let result;
  try {
    result = await dkimVerify(Buffer.from(String(payload.RawEmail), 'utf8'));
  } catch (err) {
    return { ok: false, reason: `DKIM check failed: ${err.message}` };
  }
  // The From the signature covers must be the From we are trusting.
  const headerFrom = String((result.headerFrom || [])[0] || '').toLowerCase();
  if (headerFrom !== fromEmail) {
    return { ok: false, reason: `raw From (${headerFrom || 'none'}) differs from payload From` };
  }
  const results = result.results || [];
  if (results.some((r) => r.status && r.status.result === 'pass' && r.status.aligned)) {
    return { ok: true, via: 'dkim' };
  }
  const seen = results.map((r) => `${r.signingDomain || '?'}=${(r.status && r.status.result) || '?'}${r.status && r.status.aligned ? '' : ' (not aligned)'}`);
  return { ok: false, reason: `no aligned passing DKIM signature (${seen.join(', ') || 'unsigned'})` };
}

// The text the forwarder typed themselves: the body above the forwarded part.
// Lines below the first forward marker belong to the original mail and must
// not steer anything (the candidate's own mail may well mention "Apple").
const FORWARD_MARKERS = [
  /^-{2,}\s*(forwarded message|vidarebefordrat meddelande|original message|ursprungligt meddelande)/i,
  /^begin forwarded message/i,
  /^_{5,}\s*$/,
  /^(from|från):\s/i,
  /^>/,
];

function forwarderNote(textBody) {
  const out = [];
  for (const line of String(textBody || '').split(/\r?\n/)) {
    if (FORWARD_MARKERS.some((re) => re.test(line.trim()))) break;
    out.push(line);
  }
  return out.join('\n').trim();
}

function cleanSubject(subject) {
  return String(subject || '').replace(/^\s*((fwd?|vb|vs|re|sv|aw|wg)\s*:\s*)+/i, '').trim();
}

// "Applekandidat - Java profil" -> { apple: true, team: 'Java Backend' }.
// Lines mentioning Apple are searched for a team first; failing that, the rest
// of the forwarder's own text (never the forwarded mail). No match -> team ''
// (set it later).
const TEAM_KEYWORDS = [
  ['Java/Scala', /scala/i],
  ['TypeScript Frontend', /front\s*-?\s*end|typescript|react|\bts\b/i],
  ['iOS', /\bios\b|swift/i],
  ['Machine Learning', /machine\s*learning|\bml\b|\bai\b/i],
  ['Data Engineer', /\bdata/i],
  ['Java Backend', /java|back\s*-?\s*end/i],
];

function appleHint(subject, textBody) {
  const all = [cleanSubject(subject), ...forwarderNote(textBody).split('\n')];
  const appleLines = all.filter((l) => /apple/i.test(l));
  if (!appleLines.length) return { apple: false, team: '' };
  const find = (text) => TEAM_KEYWORDS.find(([team, re]) => TEAMS.includes(team) && re.test(text));
  const hit = find(appleLines.join(' ')) || find(all.join(' '));
  return { apple: true, team: hit ? hit[0] : '' };
}

// Attachments worth importing, with a reason for every one left out.
function pickCvAttachments(payload) {
  const picked = [];
  const skipped = [];
  for (const a of payload.Attachments || []) {
    const name = path.basename(String(a.Name || 'bilaga'));
    const ext = path.extname(name).toLowerCase();
    if (!CV_EXTENSIONS.includes(ext)) continue; // logos, calendar files etc. — not worth a mention
    const size = Number(a.ContentLength) || Math.floor(String(a.Content || '').length * 0.75);
    if (size > MAX_CV_BYTES) { skipped.push({ name, error: 'större än 10 MB' }); continue; }
    if (picked.length >= MAX_CVS_PER_MAIL) { skipped.push({ name, error: `max ${MAX_CVS_PER_MAIL} CV per mail` }); continue; }
    picked.push({ name, ext, content: String(a.Content || ''), contentType: a.ContentType || '' });
  }
  return { picked, skipped };
}

module.exports = {
  webhookAuthorized, senderAuthenticated, forwarderNote, cleanSubject, appleHint, pickCvAttachments,
  MAX_CV_BYTES,
};
