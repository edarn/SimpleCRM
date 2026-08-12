const express = require('express');
const data = require('../data');
const path = require('path');
const fs = require('fs');
const { validateFileMagic } = require('../middleware/file-validate');

// Fix multer's latin1 encoding of originalname for Swedish characters
function fixOriginalName(file) {
  if (!file) return '';
  return Buffer.from(file.originalname, 'latin1').toString('utf8');
}

module.exports = function(upload, uploadsDir) {
  const router = express.Router();

// GET /api/candidates - List all candidates
router.get('/', (req, res) => {
  try {
    const userId = req.session.userId;
    const candidates = data.getAllCandidates(userId, req.query.createdBy);
    res.json(candidates);
  } catch (err) {
    console.error('Error fetching candidates:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/candidates/duplicates - Review list of profiles that look like the
// same person. Read-only: this is the dry run a human inspects before merging.
//
// ORDER MATTERS: this must stay registered BEFORE GET /:id. Express matches in
// registration order, so with /:id first the literal path "duplicates" is taken
// as a candidate id and this route can never be reached.
router.get('/duplicates', (req, res) => {
  try {
    const userId = req.session.userId;
    const groups = data.findDuplicateCandidateGroups(userId);
    res.json({ groups });
  } catch (err) {
    console.error('Error finding duplicate candidates:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/candidates/merge - Merge duplicate profiles into a survivor.
//
// Merging DELETES the duplicate rows, so it is gated by exactly the same rule
// as DELETE /:id: an owner (or a solo user) may merge anything, a member only
// profiles they created themselves. Every duplicate is checked before anything
// is written — the merge itself is a single transaction and must not be
// entered unless all of it is allowed. The survivor is deliberately NOT
// restricted: it survives, nothing is destroyed there.
router.post('/merge', (req, res) => {
  try {
    const userId = req.session.userId;
    const { survivorId, duplicateIds } = req.body || {};

    if (!survivorId || typeof survivorId !== 'string') {
      return res.status(400).json({ error: 'survivorId is required' });
    }
    if (!Array.isArray(duplicateIds) || duplicateIds.length === 0) {
      return res.status(400).json({ error: 'duplicateIds must be a non-empty array' });
    }

    // De-dupe the list and drop the survivor from it, so a UI that sends the
    // whole group (survivor included) does the harmless thing.
    const ids = [...new Set(
      duplicateIds.filter(id => typeof id === 'string' && id && id !== survivorId)
    )];
    if (ids.length === 0) {
      return res.status(400).json({ error: 'duplicateIds must name at least one candidate other than the survivor' });
    }

    const survivor = data.getCandidateById(survivorId, userId);
    if (!survivor) {
      return res.status(404).json({ error: 'Candidate not found' });
    }

    for (const id of ids) {
      // getCandidateById is team-scoped, so this doubles as the check that the
      // id belongs to the caller's scope at all.
      const dup = data.getCandidateById(id, userId);
      if (!dup) {
        return res.status(404).json({ error: 'Candidate not found' });
      }
      if (!data.canDeleteEntity(userId, dup)) {
        return res.status(403).json({
          error: `You can only merge away candidates you created yourself (${dup.name})`
        });
      }
    }

    const result = data.mergeCandidates(survivorId, ids, userId);
    if (result.error) {
      const status = result.error === 'Candidate not found' ? 404 : 400;
      return res.status(status).json({ error: result.error });
    }

    // The merge clears the survivor's cached request matches (its CV, skills and
    // files just changed), so re-run matching or the profile is left with an
    // empty match list until someone opens it and asks manually.
    triggerRequestMatchingInBackground(survivorId, userId);

    res.json(result);
  } catch (err) {
    console.error('Error merging candidates:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/candidates/:id - Get single candidate with comments and files
router.get('/:id', (req, res) => {
  try {
    const userId = req.session.userId;
    const candidate = data.getCandidateById(req.params.id, userId);

    if (!candidate) {
      return res.status(404).json({ error: 'Candidate not found' });
    }

    res.json(candidate);
  } catch (err) {
    console.error('Error fetching candidate:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/candidates - Create new candidate (multipart/form-data)
router.post('/', upload.single('resume'), (req, res) => {
  try {
    // Validate file magic bytes if a file was uploaded
    if (req.file) {
      const ext = path.extname(req.file.originalname).toLowerCase();
      if (!validateFileMagic(req.file.path, ext)) {
        try { fs.unlinkSync(req.file.path); } catch (_) {}
        return res.status(400).json({ error: 'File content does not match its extension. Upload rejected.' });
      }
    }

    const userId = req.session.userId;
    const { name, email, phone, role, skills, category } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Candidate name is required' });
    }

    // Avoid duplicate profiles: if a candidate with this email already exists
    // in the user's scope, block creation and point at the existing one.
    if (email && email.trim()) {
      const dup = data.findCandidateByEmail(email, userId);
      if (dup) {
        if (req.file) { try { fs.unlinkSync(req.file.path); } catch (_) {} }
        return res.status(409).json({
          error: `A candidate with this email already exists: ${dup.name}`,
          existingId: dup.id,
          existingName: dup.name
        });
      }
    }

    let resumeFilename = '';
    let resumeOriginalName = '';

    if (req.file) {
      resumeFilename = req.file.filename;
      resumeOriginalName = fixOriginalName(req.file);
    }

    let newCandidate;
    try {
      newCandidate = data.createCandidate({
        name: name.trim(),
        email,
        phone,
        role,
        skills,
        category,
        resumeFilename,
        resumeOriginalName
      }, userId);

      // Also add to candidate_files table if file was uploaded
      if (req.file) {
        data.addCandidateFile(newCandidate.id, {
          filename: resumeFilename,
          originalName: resumeOriginalName,
          fileSize: req.file.size,
          mimeType: req.file.mimetype
        }, userId);
        const updated = data.getCandidateById(newCandidate.id, userId);
        triggerRequestMatchingInBackground(newCandidate.id, userId);
        return res.status(201).json(updated);
      }
    } catch (dbErr) {
      // Clean up uploaded file if DB operation failed
      if (req.file) {
        try { fs.unlinkSync(req.file.path); } catch (_) {}
      }
      throw dbErr;
    }

    triggerRequestMatchingInBackground(newCandidate.id, userId);
    res.status(201).json(newCandidate);
  } catch (err) {
    console.error('Error creating candidate:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/candidates/:id - Update candidate (multipart/form-data)
router.put('/:id', upload.single('resume'), (req, res) => {
  try {
    // Validate file magic bytes if a file was uploaded
    if (req.file) {
      const ext = path.extname(req.file.originalname).toLowerCase();
      if (!validateFileMagic(req.file.path, ext)) {
        try { fs.unlinkSync(req.file.path); } catch (_) {}
        return res.status(400).json({ error: 'File content does not match its extension. Upload rejected.' });
      }
    }

    const userId = req.session.userId;
    const { name, email, phone, role, skills, category } = req.body;

    if (name !== undefined && !name.trim()) {
      return res.status(400).json({ error: 'Candidate name cannot be empty' });
    }

    const existing = data.getCandidateById(req.params.id, userId);
    if (!existing) {
      return res.status(404).json({ error: 'Candidate not found' });
    }

    // Avoid duplicates: block changing the email to one another candidate uses.
    if (email && email.trim()) {
      const dup = data.findCandidateByEmail(email, userId, req.params.id);
      if (dup) {
        if (req.file) { try { fs.unlinkSync(req.file.path); } catch (_) {} }
        return res.status(409).json({
          error: `Another candidate already uses this email: ${dup.name}`,
          existingId: dup.id,
          existingName: dup.name
        });
      }
    }

    let resumeFilename = existing.resumeFilename;
    let resumeOriginalName = existing.resumeOriginalName;

    if (req.file) {
      resumeFilename = req.file.filename;
      resumeOriginalName = fixOriginalName(req.file);

      // Add new file to candidate_files table
      data.addCandidateFile(req.params.id, {
        filename: req.file.filename,
        originalName: resumeOriginalName,
        fileSize: req.file.size,
        mimeType: req.file.mimetype
      }, userId);
    }

    const updated = data.updateCandidate(req.params.id, {
      name: name?.trim(),
      email,
      phone,
      role,
      skills,
      category,
      resumeFilename,
      resumeOriginalName
    }, userId);

    // A replacement CV used to be stored but never re-extracted: resume_text
    // kept the OLD CV's contents and resume_text_status stayed 'ok', so no
    // backfill ever rescued it and every later match (and now every distilled
    // profile) was built from the wrong document. Re-run the same background
    // pipeline as POST /:id/files.
    if (req.file) {
      processNewResumeInBackground(req.params.id, req.file.filename, userId);
    }

    res.json(updated);
  } catch (err) {
    console.error('Error updating candidate:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/candidates/:id/transfer - Transfer candidate ownership to another team member
router.post('/:id/transfer', (req, res) => {
  try {
    const userId = req.session.userId;
    const { newOwnerId } = req.body;

    if (!newOwnerId) {
      return res.status(400).json({ error: 'New owner ID is required' });
    }

    const result = data.transferCandidate(req.params.id, newOwnerId, userId);

    if (result.error) {
      if (result.error === 'Candidate not found') {
        return res.status(404).json({ error: result.error });
      }
      return res.status(403).json({ error: result.error });
    }

    res.json(result);
  } catch (err) {
    console.error('Error transferring candidate:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/candidates/:id - Delete candidate and associated files
router.delete('/:id', (req, res) => {
  try {
    const userId = req.session.userId;

    // Get file list before deleting DB records
    const files = data.getCandidateFiles(req.params.id);

    const result = data.deleteCandidate(req.params.id, userId);

    if (result.error) {
      if (result.error === 'Candidate not found') {
        return res.status(404).json({ error: result.error });
      }
      return res.status(403).json({ error: result.error });
    }

    // Delete files from disk
    if (uploadsDir) {
      for (const file of files) {
        const filePath = path.join(uploadsDir, file.filename);
        try {
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        } catch (err) {
          console.error('Warning: Could not delete file:', err.message);
        }
      }
    }

    res.status(204).send();
  } catch (err) {
    console.error('Error deleting candidate:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/candidates/:id/files - Upload file to candidate
router.post('/:id/files', upload.single('file'), (req, res) => {
  try {
    // Validate file magic bytes
    if (req.file) {
      const ext = path.extname(req.file.originalname).toLowerCase();
      if (!validateFileMagic(req.file.path, ext)) {
        try { fs.unlinkSync(req.file.path); } catch (_) {}
        return res.status(400).json({ error: 'File content does not match its extension. Upload rejected.' });
      }
    }

    const userId = req.session.userId;
    const candidate = data.getCandidateById(req.params.id, userId);

    if (!candidate) {
      return res.status(404).json({ error: 'Candidate not found' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const originalName = fixOriginalName(req.file);
    const result = data.addCandidateFile(req.params.id, {
      filename: req.file.filename,
      originalName,
      fileSize: req.file.size,
      mimeType: req.file.mimetype
    }, userId);

    if (result.error) {
      try { fs.unlinkSync(path.join(uploadsDir, req.file.filename)); } catch (_) {}
      return res.status(400).json({ error: result.error });
    }

    // Auto-extract resume text, distill the matching profile, and run request
    // matching in the background.
    processNewResumeInBackground(req.params.id, req.file.filename, userId);

    res.status(201).json(result);
  } catch (err) {
    console.error('Error uploading file:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/candidates/:id/files/:fileId - Download or view file
router.get('/:id/files/:fileId', (req, res) => {
  try {
    const userId = req.session.userId;
    const file = data.getCandidateFileById(req.params.id, req.params.fileId, userId);

    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    if (!uploadsDir) {
      return res.status(500).json({ error: 'Uploads not configured' });
    }

    const filePath = path.join(uploadsDir, file.filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found on disk' });
    }

    // For inline viewing (PDF preview), check query param
    if (req.query.inline === 'true') {
      const encodedName = encodeURIComponent(file.originalName);
      res.setHeader('Content-Disposition', `inline; filename*=UTF-8''${encodedName}`);
      // Only allow safe MIME types for inline viewing — never trust DB value directly
      const ext = path.extname(file.filename).toLowerCase();
      const safeMimeTypes = { '.pdf': 'application/pdf', '.doc': 'application/msword', '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' };
      res.setHeader('Content-Type', safeMimeTypes[ext] || 'application/octet-stream');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      // Override helmet's frame-ancestors so PDF can render in iframe
      res.setHeader('Content-Security-Policy', "default-src 'none'; style-src 'unsafe-inline'; img-src data: blob:; font-src data:; frame-ancestors 'self'");
      return res.sendFile(filePath);
    }

    // Download with proper UTF-8 filename encoding
    const encodedName = encodeURIComponent(file.originalName);
    res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodedName}`);
    res.sendFile(filePath);
  } catch (err) {
    console.error('Error downloading file:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/candidates/:id/files/:fileId - Delete a file
router.delete('/:id/files/:fileId', (req, res) => {
  try {
    const userId = req.session.userId;
    const result = data.deleteCandidateFile(req.params.id, req.params.fileId, userId);

    if (result.error) {
      if (result.error === 'Candidate not found' || result.error === 'File not found') {
        return res.status(404).json({ error: result.error });
      }
      return res.status(403).json({ error: result.error });
    }

    // Delete file from disk
    if (result.filename && uploadsDir) {
      const filePath = path.join(uploadsDir, result.filename);
      try {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (err) {
        console.error('Warning: Could not delete file:', err.message);
      }
    }

    res.status(204).send();
  } catch (err) {
    console.error('Error deleting file:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/candidates/:id/resume - Download resume (backward compat - serves first file)
router.get('/:id/resume', (req, res) => {
  try {
    const userId = req.session.userId;
    const candidate = data.getCandidateById(req.params.id, userId);

    if (!candidate) {
      return res.status(404).json({ error: 'Candidate not found' });
    }

    // Try new files table first
    if (candidate.files && candidate.files.length > 0) {
      const file = candidate.files[0];
      const filePath = path.join(uploadsDir, file.filename);
      if (fs.existsSync(filePath)) {
        const encodedName = encodeURIComponent(file.originalName);
        res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodedName}`);
        return res.sendFile(filePath);
      }
    }

    // Fall back to legacy resume fields
    if (!candidate.resumeFilename) {
      return res.status(404).json({ error: 'No resume uploaded' });
    }

    if (!uploadsDir) {
      return res.status(500).json({ error: 'Uploads not configured' });
    }

    const filePath = path.join(uploadsDir, candidate.resumeFilename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Resume file not found' });
    }

    const encodedName = encodeURIComponent(candidate.resumeOriginalName);
    res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodedName}`);
    res.sendFile(filePath);
  } catch (err) {
    console.error('Error downloading resume:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/candidates/:id/comments - Add comment
router.post('/:id/comments', (req, res) => {
  try {
    const userId = req.session.userId;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Comment content is required' });
    }

    const comment = data.createCandidateComment(req.params.id, content.trim(), userId);

    if (!comment) {
      return res.status(404).json({ error: 'Candidate not found' });
    }

    res.status(201).json(comment);
  } catch (err) {
    console.error('Error creating comment:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/candidates/:id/comments/:commentId - Update comment
router.put('/:id/comments/:commentId', (req, res) => {
  try {
    const userId = req.session.userId;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Comment content is required' });
    }

    const comment = data.updateCandidateComment(req.params.id, req.params.commentId, content.trim(), userId);

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    res.json(comment);
  } catch (err) {
    console.error('Error updating comment:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/candidates/:id/comments/:commentId - Delete comment
router.delete('/:id/comments/:commentId', (req, res) => {
  try {
    const userId = req.session.userId;
    const result = data.deleteCandidateComment(req.params.id, req.params.commentId, userId);

    if (result.error) {
      if (result.error === 'Comment not found' || result.error === 'Candidate not found') {
        return res.status(404).json({ error: result.error });
      }
      return res.status(403).json({ error: result.error });
    }

    res.status(204).send();
  } catch (err) {
    console.error('Error deleting comment:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/candidates/:id/match-requests - Get cached request matches
router.get('/:id/match-requests', (req, res) => {
  try {
    const userId = req.session.userId;
    const candidate = data.getCandidateById(req.params.id, userId);
    if (!candidate) return res.status(404).json({ error: 'Candidate not found' });
    const matches = data.getCandidateRequestMatches(req.params.id);
    const status = data.getCandidateMatchStatus(req.params.id);
    res.json({ matches, cached: true, status });
  } catch (err) {
    console.error('Error getting cached matches:', err);
    res.json({ matches: [], cached: true });
  }
});

// POST /api/candidates/:id/match-requests - Run fresh AI matching and cache results
router.post('/:id/match-requests', async (req, res) => {
  try {
    const userId = req.session.userId;
    const candidate = data.getCandidateById(req.params.id, userId);
    if (!candidate) {
      return res.status(404).json({ error: 'Candidate not found' });
    }

    const matches = await runCandidateRequestMatching(req.params.id, candidate, userId);
    res.json({ matches, cached: false });
  } catch (err) {
    console.error('Error matching requests:', err);
    res.json({ matches: [], cached: false });
  }
});

// Shared matching logic — used by the endpoint and by file upload trigger.
// The wrapper marks match_status 'pending' for the duration so the UI can poll
// (and stop showing an empty list) while the async AI match runs, then 'done'.
async function runCandidateRequestMatching(candidateId, candidate, userId) {
  data.setCandidateMatchStatus(candidateId, 'pending');
  try {
    return await _runCandidateRequestMatching(candidateId, candidate, userId);
  } finally {
    data.setCandidateMatchStatus(candidateId, 'done');
  }
}

async function _runCandidateRequestMatching(candidateId, candidate, userId) {
  const openRequests = data.getOpenConsultantRequests(userId);
  if (openRequests.length === 0) {
    data.updateCandidateRequestMatches(candidateId, []);
    return [];
  }

  const db = require('../database');
  const row = db.prepare('SELECT resume_text FROM candidates WHERE id = ?').get(candidateId);
  let resumeText = row?.resume_text || '';

  if (!resumeText) {
    const files = data.getCandidateFiles(candidateId);
    if (files.length > 0 && uploadsDir) {
      const { extractTextFromFile } = require('../lib/resume-parser');
      for (const f of files) {
        const filePath = path.join(uploadsDir, f.filename);
        if (fs.existsSync(filePath)) {
          resumeText = await extractTextFromFile(filePath);
          if (resumeText) {
            data.updateCandidateResumeText(candidateId, resumeText);
            // First time we have text for this candidate — distill it now so
            // the next match can use the profile instead of the raw CV.
            await distillResumeInBackground(candidateId, resumeText, candidate);
            break;
          }
        }
      }
      // Every file tried and none yielded text — mark it so this candidate
      // isn't re-parsed on every subsequent match/backfill run.
      if (!resumeText) data.markCandidateResumeUnextractable(candidateId);
    }
  }

  // Pseudonymize the CV text before it leaves for the AI — the match is driven
  // by skills/experience, not identity (see src/lib/pseudonymize.js).
  const { scrubPII } = require('../lib/pseudonymize');
  const scrubbedResume = resumeText
    ? scrubPII(resumeText, { name: candidate.name, email: candidate.email, phone: candidate.phone })
    : '';
  const candidateProfile = `Kandidat\nRole: ${candidate.role || 'Not specified'}\nSkills: ${candidate.skills || 'Not specified'}${scrubbedResume ? '\nResume:\n' + scrubbedResume.substring(0, 4000) : ''}`;

  if (!process.env.ANTHROPIC_API_KEY) return [];

  // Route through the shared concurrency gate (src/lib/ai-client.js) so this
  // call counts against the same in-flight cap as email classification/matching.
  const { createMessage } = require('../lib/ai-client');
  const requestSummaries = openRequests.map((r, i) => (
    `[${i + 1}] ${r.title}\nRole: ${r.role || ''}\nSkills: ${(r.requiredSkills || '').replace(/\*\*/g, '')}\nDescription: ${(r.description || '').substring(0, 500)}`
  )).join('\n\n---\n\n');

  const response = await createMessage({
    model: 'claude-sonnet-4-6',
    max_tokens: 2000,
    temperature: 0,
    system: `You receive a candidate profile and a list of open consultant requests. Score how well the candidate matches EACH request (0-100). Only return requests where the score is 50 or higher.

IMPORTANT: Match semantically, not literally. If a request asks for "AWS", the candidate matches if they mention ANY AWS service (S3, EC2, Lambda, DynamoDB, CloudWatch, ECS, EKS, etc.). Same for "Azure" (Azure DevOps, Azure Functions, etc.), "Kubernetes" (EKS, AKS, GKE, Helm), "CI/CD" (Jenkins, GitHub Actions, GitLab CI), "Cloud" (any cloud provider), "SQL" (PostgreSQL, MySQL, MSSQL), etc. Think about what the recruiter actually means, not just the exact keyword.

Skills with version numbers like "Angular 14+" mean the technology itself — "Angular" or "Angular 16" both match.

Respond with a JSON array (no markdown, just raw JSON):
[{"id": 1, "score": 75, "reasoning": "Short explanation"}]

Empty array [] if no request matches above 50.`,
    messages: [{
      role: 'user',
      content: `## Candidate\n${candidateProfile}\n\n## Open Requests\n\n${requestSummaries}`
    }]
  });

  const text = response.content[0].text.trim();
  let aiMatches;
  try {
    aiMatches = JSON.parse(text);
  } catch (_) {
    // Guard the fallback parse too — a malformed array must degrade to "no
    // matches" rather than throw.
    const m = text.match(/\[[\s\S]*\]/);
    try { aiMatches = m ? JSON.parse(m[0]) : []; } catch (_2) { aiMatches = []; }
  }
  if (!Array.isArray(aiMatches)) aiMatches = [];

  const matches = aiMatches
    .map(m => {
      const idx = Number(m.id) - 1;
      const r = openRequests[idx];
      if (!r) return null;
      return { requestId: r.id, title: r.title, role: r.role, score: m.score, reasoning: m.reasoning };
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score);

  // Cache results on the candidate side
  data.updateCandidateRequestMatches(candidateId, matches);

  // Sync the candidate into the request-side matched lists so each open
  // request's detail page shows this candidate, sorted into the previously
  // matched candidates. Reconcile across every open request we evaluated:
  // upsert where it matched, remove where it no longer does.
  const matchedById = new Map(matches.map(m => [m.requestId, m]));
  for (const r of openRequests) {
    const m = matchedById.get(r.id);
    try {
      if (m) {
        data.addCandidateToRequestMatches(r.id, {
          candidateId,
          score: m.score,
          reasoning: m.reasoning || '',
          strengths: '',
          gaps: ''
        }, userId);
      } else {
        data.removeCandidateFromRequestMatches(r.id, candidateId, userId);
      }
    } catch (e) {
      console.error('Error syncing candidate into request matches:', e.message);
    }
  }

  return matches;
}

// Fire-and-forget: run candidate→request matching in the background so the HTTP
// response isn't blocked by the AI call. Re-fetches the candidate so it picks up
// any resume text extracted just before. Safe no-op when there are no open
// requests or no ANTHROPIC_API_KEY.
function triggerRequestMatchingInBackground(candidateId, userId) {
  // Mark pending synchronously (before the event loop yields) so a client that
  // navigates to the candidate immediately after import sees 'pending' and polls,
  // instead of reading an empty cache once and giving up.
  try { data.setCandidateMatchStatus(candidateId, 'pending'); } catch (_) {}
  setImmediate(() => {
    try {
      const candidate = data.getCandidateById(candidateId, userId);
      if (!candidate) return;
      runCandidateRequestMatching(candidateId, candidate, userId).catch(e =>
        console.error('Background request matching error:', e.message)
      );
    } catch (e) {
      console.error('Background request matching error:', e.message);
    }
  });
}

// ---------------------------------------------------------------------------
// Distilled profiles
//
// Every path that attaches or replaces CV text also distills it ONCE here, so
// matching can ship a ~400-token profile instead of 4000 chars of raw CV (see
// src/lib/profile-distiller.js). Distillation is best-effort by construction:
// it is an optimization, and a failing AI call must never cost us the import,
// the upload, or the match that triggered it.
// ---------------------------------------------------------------------------

// Persist a distilled profile + canonical skill tags. `result` is the
// { profile, skillsCsv } pair (or null when nothing usable came back — then we
// record 'empty' so the backfill stops re-selecting this candidate forever).
function storeDistilledProfile(candidateId, result, fields) {
  const { tagsFor } = require('../lib/profile-distiller');
  try {
    if (result && result.profile) {
      data.updateCandidateProfile(candidateId, result.profile, tagsFor(fields, result.skillsCsv));
    } else {
      data.markCandidateProfileEmpty(candidateId);
    }
  } catch (err) {
    console.error(`Error storing distilled profile for ${candidateId}:`, err.message);
  }
}

// Distill freshly extracted CV text for an existing candidate. Never throws.
async function distillResumeInBackground(candidateId, resumeText, candidate) {
  try {
    const { distillProfile } = require('../lib/profile-distiller');
    const result = await distillProfile(resumeText, {
      name: candidate.name,
      email: candidate.email,
      phone: candidate.phone,
    });
    storeDistilledProfile(candidateId, result, { skills: candidate.skills, role: candidate.role });
  } catch (err) {
    console.error(`Profile distillation failed for candidate ${candidateId}:`, err.message);
    try { data.markCandidateProfileEmpty(candidateId); } catch (_) {}
  }
}

// Fire-and-forget pipeline for a newly attached/replaced CV file:
// extract text -> cache it -> distill it -> re-run request matching.
// The order matters: updateCandidateResumeText clears the cached matches, so
// matching has to run afterwards or the candidate is left with none.
function processNewResumeInBackground(candidateId, filename, userId) {
  if (!filename || !uploadsDir) return;
  const { extractTextFromFile } = require('../lib/resume-parser');

  extractTextFromFile(path.join(uploadsDir, filename)).then(async (text) => {
    if (!text) {
      // Nothing extractable (.doc, image-only scan, corrupt PDF). Record the
      // attempt so the backfill loops don't re-parse this file forever.
      data.markCandidateResumeUnextractable(candidateId);
      return;
    }

    data.updateCandidateResumeText(candidateId, text);

    const candidate = data.getCandidateById(candidateId, userId);
    if (!candidate) return;

    await distillResumeInBackground(candidateId, text, candidate);
    await runCandidateRequestMatching(candidateId, candidate, userId).catch(e =>
      console.error('Background request matching error:', e.message)
    );
  }).catch(err => console.error('Resume text extraction error:', err.message));
}

// POST /api/candidates/backfill-profiles - Distill CVs that predate this feature.
//
// Bounded batch per call, mirroring POST /api/inbox/extract-resumes: each
// candidate costs one AI call, so the UI calls this repeatedly until `done`
// instead of holding one request open while the whole library is distilled.
router.post('/backfill-profiles', async (req, res) => {
  try {
    const userId = req.session.userId;

    if (!process.env.ANTHROPIC_API_KEY) {
      return res.status(503).json({ error: 'AI is not configured (ANTHROPIC_API_KEY missing)' });
    }

    const defaultLimit = Math.max(1, Number(process.env.PROFILE_BACKFILL_LIMIT) || 10);
    const requested = Number(req.body?.limit ?? req.body?.batchSize);
    const limit = Math.min(Math.max(1, requested || defaultLimit), 50);

    const { backfillProfiles } = require('../lib/profile-distiller');
    const { distilled, empty, remaining } = await backfillProfiles(userId, limit);

    const parts = [`Distilled ${distilled} CV profile(s)`];
    if (empty > 0) parts.push(`${empty} had nothing usable`);
    if (remaining > 0) parts.push(`${remaining} still pending — click again to continue`);

    res.json({
      message: parts.filter(Boolean).join(' — '),
      distilled,
      empty,
      remaining,
      done: remaining === 0
    });
  } catch (err) {
    console.error('Error backfilling candidate profiles:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/candidates/import-cvs - Bulk import with SSE progress streaming
router.post('/import-cvs', upload.array('cvFiles', 50), async (req, res) => {
  const userId = req.session.userId;
  const category = req.body.category || 'in_progress';

  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'No files uploaded' });
  }

  // Set up Server-Sent Events for progress streaming
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no' // Disable Railway/nginx buffering
  });

  function sendEvent(eventData) {
    res.write(`data: ${JSON.stringify(eventData)}\n\n`);
  }

  const total = req.files.length;
  sendEvent({ type: 'start', total });

  const { extractTextFromFile } = require('../lib/resume-parser');
  // parseCVWithProfile, not parseCV: the same single AI call returns the
  // contact fields AND the distilled profile, so importing 50 CVs still costs
  // 50 AI calls rather than 100.
  const { parseCVWithProfile } = require('../lib/cv-parser');
  let created = 0;
  let failed = 0;
  let merged = 0;
  // Reported in the 'done' event so the UI can summarise how much of the batch
  // could not be dedup-checked at all, instead of it disappearing into `created`.
  let noEmail = 0;    // created with no email whatsoever
  let ambiguous = 0;  // created despite an existing candidate with the same name
  const createdIds = [];

  for (let i = 0; i < req.files.length; i++) {
    const file = req.files[i];
    const originalName = fixOriginalName(file);
    const progress = { type: 'progress', index: i, total, file: originalName };

    try {
      // Validate magic bytes per file (skip bad ones, don't abort all)
      const ext = path.extname(file.originalname).toLowerCase();
      if (!validateFileMagic(file.path, ext)) {
        try { fs.unlinkSync(file.path); } catch (_) {}
        failed++;
        sendEvent({ ...progress, status: 'skipped', error: 'File content does not match its extension' });
        continue;
      }

      sendEvent({ ...progress, status: 'extracting' });

      const resumeText = await extractTextFromFile(file.path);
      if (!resumeText) {
        failed++;
        sendEvent({ ...progress, status: 'skipped', error: 'Could not extract text from file' });
        continue;
      }

      sendEvent({ ...progress, status: 'parsing' });

      const parsed = await parseCVWithProfile(resumeText);
      const profileResult = parsed.profile
        ? { profile: parsed.profile, skillsCsv: parsed.skillsCsv }
        : null;
      if (!parsed.name) {
        failed++;
        sendEvent({ ...progress, status: 'skipped', error: 'Could not extract candidate name from CV' });
        continue;
      }

      // ---- Dedup ladder ---------------------------------------------------
      //
      // A bulk import once produced 42 duplicates out of 288 because this was a
      // single email lookup: 51% of CVs carry no email at all, so for half the
      // batch the check silently did not run and every upload created a new
      // profile. The ladder below falls back to the name, but only where the
      // name can be trusted:
      //
      //   email hit                  -> merge (matchedBy 'email')
      //   exactly one name hit       -> merge (matchedBy 'name'), unless both
      //                                 sides have an email and they DIFFER
      //   several name hits          -> create ('ambiguous-name')
      //   no hit                     -> create ('no-email' when the CV had none)
      //
      // A name match is only trusted when it is UNIQUE and nothing contradicts
      // it. Merging two different people who happen to share a name is worse
      // than leaving a duplicate behind — a duplicate can still be merged
      // later, a wrong merge has already destroyed a profile. So every
      // ambiguous case creates, and says why.
      let dup = parsed.email ? data.findCandidateByEmail(parsed.email, userId) : null;
      let matchedBy = dup ? 'email' : null;
      let dedupNote = null;

      if (!dup) {
        const nameMatches = data.findCandidatesByName(parsed.name, userId);
        if (nameMatches.length === 1) {
          // Two known addresses that disagree are a contradiction; a missing
          // address on either side is not (that is the exact shape of the
          // duplicates this fixes: one copy with an email, one without).
          const existingEmail = data.normalizeEmail(nameMatches[0].email);
          const parsedEmail = data.normalizeEmail(parsed.email);
          if (!existingEmail || !parsedEmail || existingEmail === parsedEmail) {
            dup = nameMatches[0];
            matchedBy = 'name';
          } else {
            dedupNote = 'name-differs-email';
          }
        } else if (nameMatches.length > 1) {
          dedupNote = 'ambiguous-name';
        } else {
          dedupNote = parsed.email ? null : 'no-email';
        }
      }

      if (dup) {
        data.addCandidateFile(dup.id, {
          filename: file.filename,
          originalName,
          fileSize: file.size,
          mimeType: file.mimetype
        }, userId);
        data.updateCandidateResumeText(dup.id, resumeText);
        // Fill in only fields that were empty — never overwrite existing data.
        const fill = {};
        if (!dup.role && parsed.role) fill.role = parsed.role;
        if (!dup.skills && parsed.skills) fill.skills = parsed.skills;
        if (!dup.phone && parsed.phone) fill.phone = parsed.phone;
        // Filling an empty email matters beyond completeness: it upgrades this
        // profile to the cheap, unambiguous email path, so the NEXT import of
        // this person matches on the address instead of relying on the name
        // heuristic again.
        if (!dup.email && parsed.email) fill.email = parsed.email;
        if (Object.keys(fill).length > 0) data.updateCandidate(dup.id, fill, userId);

        // The merged profile describes the NEW CV, so it replaces the old one.
        // Tags are built from the post-merge skills/role, not the parsed ones.
        storeDistilledProfile(dup.id, profileResult, {
          skills: dup.skills || parsed.skills,
          role: dup.role || parsed.role,
        });

        // Say WHICH rule merged this. A name merge is the fallible one, so the
        // comment has to be spottable afterwards by a human auditing the batch
        // (it is also deliberately not in data.js's boilerplate-comment list,
        // so a later merge carries it over instead of dropping it).
        data.createCandidateComment(
          dup.id,
          matchedBy === 'name'
            ? 'CV uppdaterat via import (matchade på namn, ingen e-post i CV:t)'
            : 'CV uppdaterat via import (matchade befintlig e-postadress)',
          userId
        );

        merged++;
        createdIds.push(dup.id); // re-match the updated profile against open requests
        sendEvent({ ...progress, status: 'duplicate', matchedBy, candidateId: dup.id, name: dup.name, role: dup.role || parsed.role || '' });
        continue;
      }

      const candidate = data.createCandidate({
        name: parsed.name,
        email: parsed.email || '',
        phone: parsed.phone || '',
        role: parsed.role || '',
        skills: parsed.skills || '',
        category,
        resumeFilename: file.filename,
        resumeOriginalName: originalName
      }, userId);

      data.addCandidateFile(candidate.id, {
        filename: file.filename,
        originalName,
        fileSize: file.size,
        mimeType: file.mimetype
      }, userId);

      data.updateCandidateResumeText(candidate.id, resumeText);
      storeDistilledProfile(candidate.id, profileResult, {
        skills: parsed.skills || '',
        role: parsed.role || '',
      });
      data.createCandidateComment(candidate.id, 'Automatiskt skapad via CV import', userId);

      created++;
      // Counted off the actual address, not off dedupNote: a CV with no email
      // that ALSO hit a name collision is reported as 'ambiguous-name', but it
      // is still one more profile that no email check will ever catch.
      if (!data.normalizeEmail(parsed.email)) noEmail++;
      if (dedupNote === 'ambiguous-name') ambiguous++;
      createdIds.push(candidate.id);
      // dedupNote is what makes a silently-undeduped profile visible in the
      // progress list — reporting these as a plain 'created' is why a whole bad
      // batch went unnoticed.
      sendEvent({ ...progress, status: 'created', dedupNote, candidateId: candidate.id, name: parsed.name, role: parsed.role || '' });
    } catch (err) {
      console.error(`Error processing CV ${originalName}:`, err.message);
      failed++;
      sendEvent({ ...progress, status: 'error', error: err.message });
    }
  }

  sendEvent({ type: 'done', created, merged, failed, total, noEmail, ambiguous });
  res.end();

  // Background: match each imported candidate against open requests, run
  // sequentially to avoid a burst of concurrent AI calls. This updates both the
  // candidate-side cache and each open request's matched_candidates list.
  if (createdIds.length > 0) {
    setImmediate(async () => {
      for (const cid of createdIds) {
        try {
          const candidate = data.getCandidateById(cid, userId);
          if (candidate) await runCandidateRequestMatching(cid, candidate, userId);
        } catch (e) {
          console.error('Background CV-import matching error:', e.message);
        }
      }
    });
  }
});

  return router;
};
