const express = require('express');
const path = require('path');
const fs = require('fs');
const data = require('../data');
const { buildOutlookDraftEml } = require('../lib/eml-builder');

module.exports = function(uploadsDir) {
  const router = express.Router();

// GET /api/requests - List all consultant requests
router.get('/', (req, res) => {
  try {
    const requests = data.getAllConsultantRequests(req.session.userId);
    res.json(requests);
  } catch (err) {
    console.error('Error fetching requests:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/requests/:id/source - The original email this request was extracted
// from. Deliberately its own endpoint rather than a field on GET /:id: that one
// is polled every few seconds while a match runs, and a full email body in
// every poll response would be pure waste.
router.get('/:id/source', (req, res) => {
  try {
    const userId = req.session.userId;
    const request = data.getConsultantRequestById(req.params.id, userId);
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }
    if (!request.emailInboxId) {
      return res.status(404).json({ error: 'Den här förfrågan har ingen ursprungstext.' });
    }

    // Scoped the same way as the request itself, so this cannot be used to read
    // another team's inbox by guessing ids.
    const email = data.getInboxEmailById(request.emailInboxId, userId);
    if (!email) {
      // The source email was deleted from the inbox after the request was created.
      return res.status(404).json({ error: 'Ursprungsmejlet finns inte kvar i inkorgen.' });
    }

    res.json({
      emailInboxId: email.id,
      fromEmail: email.fromEmail || '',
      fromName: email.fromName || '',
      subject: email.subject || '',
      body: email.body || '',
      receivedAt: email.createdAt || null
    });
  } catch (err) {
    console.error('Error fetching request source:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/requests/:id - Get single request with match details
router.get('/:id', (req, res) => {
  try {
    const request = data.getConsultantRequestById(req.params.id, req.session.userId);
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    // Enrich matched candidates with their full names
    if (request.matchedCandidates && request.matchedCandidates.length > 0) {
      request.matchedCandidates = request.matchedCandidates.map(match => {
        const candidate = data.getCandidateById(match.candidateId, req.session.userId);
        return {
          ...match,
          candidateName: candidate ? candidate.name : 'Unknown',
          candidateRole: candidate ? candidate.role : '',
          candidateSkills: candidate ? candidate.skills : '',
          candidateCategory: candidate ? candidate.category : '',
          candidateIsSubcontractor: candidate ? !!candidate.isSubcontractor : false,
          // Who owns the profile. On a shared request the match list mixes
          // candidates from every team member, so the owner is what tells you
          // whom to talk to before putting someone forward.
          candidateOwnerId: candidate ? candidate.createdBy : null,
          candidateOwner: candidate ? (candidate.createdByUsername || '') : ''
        };
      });
    }

    // Background matching job state — the frontend polls this endpoint while a
    // re-match is running, and reads `summary` for the diff once it is done.
    request.matchState = data.getRequestMatchState(req.params.id, req.session.userId);

    res.json(request);
  } catch (err) {
    console.error('Error fetching request:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/requests/:id - Update request status
router.put('/:id', (req, res) => {
  try {
    const updated = data.updateConsultantRequest(req.params.id, req.body, req.session.userId);
    if (!updated) {
      return res.status(404).json({ error: 'Request not found' });
    }
    res.json(updated);
  } catch (err) {
    console.error('Error updating request:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Resolve candidate display names for the diff, memoized so a 1000-candidate
// full rematch doesn't issue the same lookup twice.
function makeNameResolver(userId) {
  const cache = new Map();
  return (candidateId) => {
    if (cache.has(candidateId)) return cache.get(candidateId);
    let name = 'Unknown';
    try {
      const c = data.getCandidateById(candidateId, userId);
      if (c && c.name) name = c.name;
    } catch (err) {
      console.error('Error resolving candidate name for diff:', candidateId, err);
    }
    cache.set(candidateId, name);
    return name;
  };
}

// Score movement below this is noise from the model, not a real change.
const SCORE_DELTA_THRESHOLD = 5;

// The actual matching work. Runs detached from the HTTP request (see the route
// below) because a full rematch over the whole CV library takes many minutes —
// far longer than a browser will hold a POST open.
//
// The caller has already won the claim and set match_status = 'running'; this
// function only advances match_stage so the UI can show progress, and always
// ends by calling finishRequestMatching.
async function runMatchJob(requestId, userId, mode, request) {
  const { matchCandidates } = require('../lib/candidate-matcher');

  // Snapshot BEFORE anything mutates the list — this is the baseline the diff
  // is computed against.
  const before = Array.isArray(request.matchedCandidates) ? request.matchedCandidates : [];
  const beforeById = new Map(before.map(m => [m.candidateId, m]));

  // Candidates already on the list are pinned into the scoring pool, so a
  // prefilter can never silently drop an existing match.
  const alwaysInclude = before.map(m => m.candidateId).filter(Boolean);

  if (mode === 'full') {
    // Full verification run: no cached scores, everything is re-derived.
    data.clearRequestMatchCache(requestId);
  } else {
    // Newly imported CVs have no distilled profile yet; top a few up so they can
    // take part in the cheap path. Bounded, and never fatal — a backfill
    // failure must not cost the user their match run.
    data.setRequestMatchStage(requestId, 'Uppdaterar profiler');
    try {
      const { backfillProfiles } = require('../lib/profile-distiller');
      await backfillProfiles(userId, 10);
    } catch (err) {
      console.error('Profile backfill failed, matching anyway:', err);
    }
  }

  data.setRequestMatchStage(requestId, 'Matchar');
  const candidates = data.getCandidatesWithResumes(userId);

  let matches = [];
  let evaluatedIds = [];
  let stats = { mode, pool: candidates.length, selected: 0, scored: 0 };

  if (candidates.length > 0) {
    const result = await matchCandidates({
      title: request.title,
      description: request.description,
      requiredSkills: request.requiredSkills,
      role: request.role
    }, candidates, {
      mode,
      requestId,
      alwaysInclude,
      onProgress: ({ stage, done, total }) => {
        // Progress reporting is cosmetic — never let it break the job.
        try {
          const label = stage || 'Matchar';
          data.setRequestMatchStage(requestId, total ? `${label} ${done || 0}/${total}` : label);
        } catch (err) { /* ignore */ }
      }
    });
    matches = result.matches || [];
    evaluatedIds = result.evaluatedIds || [];
    stats = { ...stats, ...(result.stats || {}) };
  }

  data.setRequestMatchStage(requestId, 'Sparar');

  // Merge instead of overwrite so a candidate added concurrently isn't wiped.
  // Pass only the candidates actually scored — a failed chunk must not read as
  // "these candidates no longer match".
  data.reconcileRequestMatches(requestId, evaluatedIds, matches, userId);

  // Diff against what was actually persisted, not against `matches`.
  // reconcileRequestMatches deliberately preserves unevaluated entries and
  // refuses to apply an empty result, so the stored list is the only honest
  // "after" — diffing `matches` would report removals that never happened.
  const saved = data.getConsultantRequestById(requestId, userId);
  const after = (saved && Array.isArray(saved.matchedCandidates)) ? saved.matchedCandidates : [];
  const afterById = new Map(after.map(m => [m.candidateId, m]));
  const nameOf = makeNameResolver(userId);

  const added = [];
  const scoreChanged = [];
  for (const m of after) {
    const prev = beforeById.get(m.candidateId);
    if (!prev) {
      added.push({ candidateId: m.candidateId, name: nameOf(m.candidateId), score: m.score });
      continue;
    }
    const from = Number(prev.score) || 0;
    const to = Number(m.score) || 0;
    if (Math.abs(to - from) >= SCORE_DELTA_THRESHOLD) {
      scoreChanged.push({ candidateId: m.candidateId, name: nameOf(m.candidateId), from, to });
    }
  }

  const removed = before
    .filter(m => !afterById.has(m.candidateId))
    .map(m => ({ candidateId: m.candidateId, name: nameOf(m.candidateId), score: m.score }));

  const summary = {
    mode,
    stats,
    added,
    removed,
    scoreChanged,
    matchCount: after.length,
    finishedAt: data.getTimestamp()
  };

  // The AI returned nothing while there were candidates to score. The old list
  // was left untouched (by design), so "no differences" would be a lie here.
  if (candidates.length > 0 && matches.length === 0) {
    summary.noMatchesReturned = true;
  }

  data.finishRequestMatching(requestId, 'done', summary);
}

// POST /api/requests/:id/rematch - Kick off candidate matching in the background.
// Returns 202 immediately; the client polls GET /api/requests/:id for matchState.
router.post('/:id/rematch', (req, res) => {
  try {
    const userId = req.session.userId;
    const mode = (req.body && req.body.mode === 'full') ? 'full' : 'fast';

    // Claim first: exactly one caller can own the job, so a double-click or a
    // second teammate can't run the same multi-minute AI job twice.
    const claim = data.claimRequestForMatching(req.params.id, userId, mode);
    if (claim.error === 'not_found') {
      return res.status(404).json({ error: 'Request not found' });
    }
    if (claim.error === 'already_running') {
      return res.status(409).json({ error: 'En matchning pågår redan för det här uppdraget.' });
    }

    // Fire and forget — same shape as the inbox processing job.
    runMatchJob(req.params.id, userId, mode, claim.request).catch(err => {
      console.error('Error re-matching:', err);
      try {
        data.finishRequestMatching(req.params.id, 'failed', { mode, error: err.message });
      } catch (finishErr) {
        console.error('Error recording match failure:', finishErr);
      }
    });

    res.status(202).json({ status: 'running', mode });
  } catch (err) {
    console.error('Error starting re-match:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/requests/:id/send-eml - Generate Outlook draft with selected candidates
router.post('/:id/send-eml', (req, res) => {
  try {
    const userId = req.session.userId;
    const request = data.getConsultantRequestById(req.params.id, userId);
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    const { selectedIndices } = req.body;
    if (!selectedIndices || selectedIndices.length === 0) {
      return res.status(400).json({ error: 'No candidates selected' });
    }

    const matches = request.matchedCandidates || [];
    const selected = selectedIndices
      .filter(i => i >= 0 && i < matches.length)
      .map(i => matches[i]);

    if (selected.length === 0) {
      return res.status(400).json({ error: 'No valid candidates selected' });
    }

    // Build email body with candidate presentations
    const esc = s => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const skills = (request.requiredSkills || '').replace(/\*\*/g, '');

    const plainParts = [`Consultant proposal: ${request.title}`];
    if (request.role) plainParts.push(`Role: ${request.role}`);
    if (skills) plainParts.push(`Required Skills: ${skills}`);
    plainParts.push('', 'Proposed Candidates:', '');

    let htmlCandidates = '';
    const attachments = [];
    const sentCandidateIds = [];

    for (const match of selected) {
      const candidate = data.getCandidateById(match.candidateId, userId);
      if (!candidate) continue;

      sentCandidateIds.push(candidate.id);

      // Plain text version
      plainParts.push(`${candidate.name}${candidate.role ? ' — ' + candidate.role : ''}`);
      if (match.strengths) plainParts.push(`+ ${match.strengths}`);
      if (match.gaps) plainParts.push(`- ${match.gaps}`);
      if (!match.strengths && match.reasoning) plainParts.push(match.reasoning);
      plainParts.push('');

      // HTML version
      htmlCandidates += `<h3 style="margin: 16px 0 4px 0; font-size: 15px; color: #1e293b;">${esc(candidate.name)}${candidate.role ? ` <span style="font-weight: normal; color: #64748b;">— ${esc(candidate.role)}</span>` : ''}</h3>\n`;
      if (match.strengths) htmlCandidates += `<p style="margin: 4px 0; color: #166534;">&#10003; ${esc(match.strengths)}</p>\n`;
      if (match.gaps) htmlCandidates += `<p style="margin: 4px 0; color: #dc2626;">&#10007; ${esc(match.gaps)}</p>\n`;
      if (!match.strengths && match.reasoning) htmlCandidates += `<p style="margin: 4px 0; color: #475569;">${esc(match.reasoning)}</p>\n`;
      if (candidate.skills) htmlCandidates += `<p style="margin: 4px 0; font-size: 12px; color: #94a3b8;">Skills: ${esc(candidate.skills)}</p>\n`;
      htmlCandidates += `<hr style="border: none; border-top: 1px solid #e2e8f0; margin: 12px 0;">\n`;

      // Attach CV files
      const files = data.getCandidateFiles(match.candidateId);
      if (files && files.length > 0 && uploadsDir) {
        for (const file of files) {
          const filePath = path.join(uploadsDir, file.filename);
          if (fs.existsSync(filePath)) {
            const ext = path.extname(file.originalName || file.filename).toLowerCase();
            const contentType = ext === '.pdf' ? 'application/pdf'
              : ext === '.docx' ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
              : ext === '.doc' ? 'application/msword'
              : 'application/octet-stream';
            attachments.push({
              filename: file.originalName || file.filename,
              content: fs.readFileSync(filePath),
              contentType
            });
          }
        }
      }
    }

    const htmlBody = `<!DOCTYPE html>
<html><head><meta charset="UTF-8"></head>
<body style="font-family: Calibri, Arial, sans-serif; font-size: 14px; color: #1e293b;">
<h2 style="color: #7c3aed; margin-bottom: 4px;">Consultant Proposal</h2>
<p style="margin: 2px 0;"><b>${esc(request.title)}</b></p>
${request.role ? `<p style="margin: 2px 0; color: #64748b;">Role: ${esc(request.role)}</p>` : ''}
${skills ? `<p style="margin: 2px 0; color: #64748b;">Required: ${esc(skills)}</p>` : ''}
<br>
<p style="font-size: 13px; font-weight: 600; color: #7c3aed; text-transform: uppercase; letter-spacing: 0.05em;">Proposed Candidates (${selected.length})</p>
${htmlCandidates}
<p style="font-size: 12px; color: #94a3b8;">CVs are attached to this email.</p>
</body></html>`;

    const eml = buildOutlookDraftEml({
      to: request.clientEmail || '',
      subject: `Consultant Proposal: ${request.title}`,
      body: plainParts.join('\n'),
      htmlBody,
      attachments
    });

    // Mark selected candidates as "sent" in the matched_candidates JSON. "sent"
    // is the primary status on send; an existing client status (e.g. interview)
    // is preserved if the candidate is re-sent.
    const updatedMatches = matches.map((m, i) => {
      if (selectedIndices.includes(i)) {
        return { ...m, sent: true, status: m.status || 'sent' };
      }
      return m;
    });
    data.updateConsultantRequest(req.params.id, { matchedCandidates: updatedMatches }, userId);

    // Log a small note in each sent candidate's history. Guarded so a note
    // failure never blocks the .eml download.
    const noteText = `Skickad till uppdrag: ${request.title}${request.clientName ? ` (${request.clientName})` : ''}`;
    for (const candidateId of sentCandidateIds) {
      try {
        data.createCandidateComment(candidateId, noteText, userId);
      } catch (noteErr) {
        console.error('Error adding sent-to-request note for candidate', candidateId, noteErr);
      }
    }

    res.setHeader('Content-Type', 'message/rfc822');
    res.setHeader('Content-Disposition', 'attachment; filename="candidate-proposal.eml"');
    res.send(eml);
  } catch (err) {
    console.error('Error generating send EML:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/requests/:id/candidates/:candidateId/status - Update a sent
// candidate's client-response status (sent / declined / interview / accepted)
router.put('/:id/candidates/:candidateId/status', (req, res) => {
  try {
    const { status } = req.body;
    const updated = data.setRequestCandidateStatus(
      req.params.id, req.params.candidateId, status, req.session.userId
    );
    if (!updated) {
      return res.status(400).json({
        error: 'Invalid status, request not found, or candidate has not been sent'
      });
    }
    res.json({ success: true });
  } catch (err) {
    console.error('Error updating candidate status:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/requests/:id - Delete a request
router.delete('/:id', (req, res) => {
  try {
    const result = data.deleteConsultantRequest(req.params.id, req.session.userId);
    if (result.error) {
      return res.status(result.error === 'Permission denied' ? 403 : 404).json({ error: result.error });
    }
    res.status(204).send();
  } catch (err) {
    console.error('Error deleting request:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

  return router;
};
