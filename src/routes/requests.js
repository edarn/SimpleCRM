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
          candidateCategory: candidate ? candidate.category : ''
        };
      });
    }

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

// POST /api/requests/:id/rematch - Re-run candidate matching
router.post('/:id/rematch', async (req, res) => {
  try {
    const userId = req.session.userId;
    const request = data.getConsultantRequestById(req.params.id, userId);
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    const { matchCandidates } = require('../lib/candidate-matcher');
    const candidates = data.getCandidatesWithResumes(userId);

    let matches = [];
    if (candidates.length > 0) {
      matches = await matchCandidates({
        title: request.title,
        description: request.description,
        requiredSkills: request.requiredSkills,
        role: request.role
      }, candidates);
    }

    data.updateConsultantRequest(req.params.id, { matchedCandidates: matches }, userId);

    res.json({ message: `Matched ${matches.length} candidate(s)`, matchCount: matches.length });
  } catch (err) {
    console.error('Error re-matching:', err);
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

    // Mark selected candidates as "sent" in the matched_candidates JSON
    const updatedMatches = matches.map((m, i) => {
      if (selectedIndices.includes(i)) {
        return { ...m, sent: true };
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
