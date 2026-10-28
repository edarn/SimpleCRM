const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const data = require('../data');
const inbound = require('../lib/inbound-cv');
const { logSecurity } = require('../lib/security-logger');

// POST /api/inbound/postmark — forward any mail to the Postmark inbound
// address. Attachments the AI recognises as CVs are imported as candidates;
// a mail with no CV (typically a client's request) goes to the AI inbox, the
// same pipeline as a pasted email (consultant request, contacts, ToDos).
//
// No session here: the caller is Postmark. Three gates, all required:
//   1. the shared secret (INBOUND_WEBHOOK_SECRET) — only Postmark can call us;
//   2. the From address belongs to an account (Settings address or login email);
//   3. that From is genuine (DKIM from the sender's own domain — see
//      senderAuthenticated in src/lib/inbound-cv.js).
// Rejections answer 403, which also tells Postmark not to retry.
//
// The work runs after the 200 (it is several AI calls). Mails are sorted and
// CVs imported one mail at a time: two forwards of the same CV arriving
// together must not both pass the dedup check and create the person twice.

module.exports = function ({ importCvFile, matchCandidatesInBackground, startInboxProcessing, uploadsDir }) {
  const { extractTextFromFile } = require('../lib/resume-parser');
  let queue = Promise.resolve();

  return async function postmarkInbound(req, res, next) {
    try {
      await handle(req, res);
    } catch (err) {
      next(err);
    }
  };

  async function handle(req, res) {
    const secret = process.env.INBOUND_WEBHOOK_SECRET;
    if (!secret) return res.status(404).json({ error: 'Inbound email is not configured' });
    if (!inbound.webhookAuthorized(req, secret)) {
      logSecurity('inbound_bad_secret', { ip: req.ip });
      return res.status(403).json({ error: 'Forbidden' });
    }

    const payload = req.body || {};
    const fromEmail = String((payload.FromFull && payload.FromFull.Email) || payload.From || '').toLowerCase().trim();
    const fromName = String((payload.FromFull && payload.FromFull.Name) || payload.FromName || '');
    const user = data.findUserBySenderEmail(fromEmail);
    if (!user) {
      logSecurity('inbound_unknown_sender', { from: fromEmail });
      return res.status(403).json({ error: 'Sender not allowed' });
    }
    const auth = await inbound.senderAuthenticated(payload, fromEmail);
    if (!auth.ok) {
      logSecurity('inbound_unauthenticated_sender', { from: fromEmail, reason: auth.reason });
      return res.status(403).json({ error: 'Sender not authenticated' });
    }

    // The insert is the claim: a Postmark retry carries the same MessageID and
    // hits the unique index instead of importing again.
    let row;
    try {
      row = data.createInboxEmail({
        fromEmail,
        fromName,
        subject: String(payload.Subject || '').slice(0, 500),
        body: String(payload.TextBody || payload.StrippedTextReply || '').slice(0, 20000) || '(tomt)',
        userId: user.userId,
        teamId: user.teamId,
        externalMessageId: payload.MessageID ? String(payload.MessageID) : null,
      });
    } catch (err) {
      if (/UNIQUE/i.test(err.message)) return res.status(200).json({ status: 'duplicate' });
      throw err;
    }
    data.updateInboxEmail(row.id, { status: 'processing', stage: 'classifying' });
    res.status(200).json({ status: 'accepted' });

    queue = queue.then(() => processMail(row.id, payload, user.userId)).catch((err) => {
      console.error('Inbound CV import failed:', err);
      data.updateInboxEmail(row.id, { status: 'completed', stage: null, errorMessage: err.message, processedAt: new Date().toISOString() });
    });
  }

  async function processMail(inboxId, payload, userId) {
    const { picked, skipped } = inbound.pickCvAttachments(payload);

    // Save each document and read its text, so the AI can tell a CV from a
    // role description and the inbox can read a non-CV attachment.
    const docs = [];
    for (const att of picked) {
      const filename = `candidate-${Date.now()}-${crypto.randomInt(1e9)}${att.ext}`;
      const filePath = path.join(uploadsDir, filename);
      const buf = Buffer.from(att.content, 'base64');
      fs.writeFileSync(filePath, buf);
      let text = '';
      try { text = await extractTextFromFile(filePath); } catch (_) { /* scanned PDF etc. — the name still helps */ }
      docs.push({ ...att, filename, filePath, size: buf.length, text: text || '' });
    }
    const isCv = await inbound.classifyAttachments({ subject: payload.Subject, textBody: payload.TextBody, docs });
    const cvs = docs.filter((_, i) => isCv[i]);
    const others = docs.filter((_, i) => !isCv[i]);
    for (const d of others) { try { fs.unlinkSync(d.filePath); } catch (_) {} }

    if (!cvs.length) return toInbox(inboxId, payload, others, userId);

    data.updateInboxEmail(inboxId, { classification: 'cv_import', stage: 'extracting_resumes' });
    const hint = inbound.appleHint(payload.Subject, payload.TextBody);
    const types = [];
    const ids = [];
    const summaries = [];
    const candidateIds = [];

    for (const s of skipped) {
      types.push('skipped'); ids.push(''); summaries.push(`Hoppade över ${s.name}: ${s.error}`);
    }
    for (const d of others) {
      types.push('skipped'); ids.push(''); summaries.push(`Inte ett CV, ignorerades: ${d.name}`);
    }

    for (const att of cvs) {
      try {
        const result = await importCvFile(
          { path: att.filePath, filename: att.filename, size: att.size, mimetype: att.contentType },
          att.name,
          { createdComment: 'Automatiskt skapad via vidarebefordrat mail' },
          userId
        );
        if (result.status === 'skipped') {
          types.push('skipped'); ids.push(''); summaries.push(`Hoppade över ${att.name}: ${result.error}`);
          continue;
        }
        candidateIds.push(result.candidateId);
        types.push('candidate'); ids.push(result.candidateId);
        summaries.push(`${result.status === 'duplicate' ? 'Uppdaterad (fanns redan)' : 'Ny kandidat'}: ${result.name}${result.role ? ` — ${result.role}` : ''}`);
      } catch (err) {
        console.error(`Inbound CV ${att.name} failed:`, err.message);
        types.push('skipped'); ids.push(''); summaries.push(`Kunde inte importera ${att.name}: ${err.message}`);
      }
    }

    let appleNote = '';
    if (hint.apple && candidateIds.length) {
      try {
        const r = data.addToPipeline('apple', candidateIds, hint.team, userId);
        appleNote = `Tillagd i Apple-flödet${hint.team ? ` (${hint.team})` : ' — välj team manuellt'}`
          + (r.added.length < candidateIds.length ? ` · ${candidateIds.length - r.added.length} fanns redan där` : '');
      } catch (err) {
        appleNote = `Kunde inte lägga till i Apple-flödet: ${err.message}`;
      }
      types.push('apple'); ids.push(''); summaries.push(appleNote);
    }

    data.updateInboxEmail(inboxId, {
      status: 'completed',
      stage: null,
      extractedData: {
        cv: cvs.map((p) => p.name).join(', '),
        apple_flöde: hint.apple ? (hint.team || 'ja, utan team') : 'nej',
      },
      actionType: types.join(', '),
      actionId: ids.join(', '),
      // ' | ' separates the entries in the inbox view, so it must not occur inside one.
      actionSummary: summaries.map((s) => s.replace(/\s*\|\s*/g, ' / ')).join(' | '),
      processedAt: new Date().toISOString(),
    });

    if (candidateIds.length) matchCandidatesInBackground(candidateIds, userId);
  }

  // Not a CV mail: hand it to the AI inbox exactly as if it had been pasted.
  // The forwarded thread is the body ('pasted' lets the classifier fill in the
  // original sender and subject), with the text of any non-CV attachment
  // appended so a role description in a PDF still reaches the request.
  function toInbox(inboxId, payload, others, userId) {
    let body = String(payload.TextBody || payload.StrippedTextReply || '');
    for (const d of others) {
      if (d.text) body += `\n\n--- Bilaga: ${d.name} ---\n${d.text.slice(0, 8000)}`;
    }
    data.updateInboxEmail(inboxId, {
      fromEmail: 'pasted',
      fromName: '',
      subject: inbound.cleanSubject(payload.Subject) || '(pasted email)',
      body: body.slice(0, 40000) || '(tomt)',
      classification: 'pending',
      status: 'pending',
      stage: null,
    });
    if (!startInboxProcessing(inboxId, userId)) {
      console.error(`Inbound mail ${inboxId}: could not start inbox processing`);
    }
  }
};
