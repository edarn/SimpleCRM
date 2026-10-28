const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const data = require('../data');
const inbound = require('../lib/inbound-cv');
const { logSecurity } = require('../lib/security-logger');

// POST /api/inbound/postmark — forward a mail with a CV attached to the
// Postmark inbound address and the CV is imported as a candidate.
//
// No session here: the caller is Postmark. Three gates, all required:
//   1. the shared secret (INBOUND_WEBHOOK_SECRET) — only Postmark can call us;
//   2. the From address belongs to an account (Settings address or login email);
//   3. that From is genuine (DKIM from the sender's own domain — see
//      senderAuthenticated in src/lib/inbound-cv.js).
// Rejections answer 403, which also tells Postmark not to retry.
//
// The import itself runs after the 200 (it is several AI calls). Mails are
// processed one at a time: two forwards of the same CV arriving together must
// not both pass the dedup check and create the person twice.

module.exports = function ({ importCvFile, matchCandidatesInBackground, uploadsDir }) {
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
    data.updateInboxEmail(row.id, { status: 'processing', stage: 'extracting_resumes', classification: 'cv_import' });
    res.status(200).json({ status: 'accepted' });

    queue = queue.then(() => processMail(row.id, payload, user.userId)).catch((err) => {
      console.error('Inbound CV import failed:', err);
      data.updateInboxEmail(row.id, { status: 'completed', stage: null, errorMessage: err.message, processedAt: new Date().toISOString() });
    });
  }

  async function processMail(inboxId, payload, userId) {
    const hint = inbound.appleHint(payload.Subject, payload.TextBody);
    const { picked, skipped } = inbound.pickCvAttachments(payload);
    const types = [];
    const ids = [];
    const summaries = [];
    const candidateIds = [];

    for (const s of skipped) {
      types.push('skipped'); ids.push(''); summaries.push(`Hoppade över ${s.name}: ${s.error}`);
    }

    for (const att of picked) {
      const filename = `candidate-${Date.now()}-${crypto.randomInt(1e9)}${att.ext}`;
      const filePath = path.join(uploadsDir, filename);
      try {
        const buf = Buffer.from(att.content, 'base64');
        fs.writeFileSync(filePath, buf);
        const result = await importCvFile(
          { path: filePath, filename, size: buf.length, mimetype: att.contentType },
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
        bilagor: picked.map((p) => p.name).join(', ') || 'inga',
        apple_flöde: hint.apple ? (hint.team || 'ja, utan team') : 'nej',
      },
      actionType: types.join(', '),
      actionId: ids.join(', '),
      // ' | ' separates the entries in the inbox view, so it must not occur inside one.
      actionSummary: summaries.map((s) => s.replace(/\s*\|\s*/g, ' / ')).join(' | '),
      errorMessage: picked.length ? '' : 'Mailet hade ingen CV-bilaga (PDF, DOC eller DOCX).',
      processedAt: new Date().toISOString(),
    });

    if (candidateIds.length) matchCandidatesInBackground(candidateIds, userId);
  }
};
