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

    // Auto-extract resume text and run request matching in the background
    const { extractTextFromFile } = require('../lib/resume-parser');
    const candidateId = req.params.id;
    extractTextFromFile(path.join(uploadsDir, req.file.filename)).then(async (text) => {
      if (text) {
        data.updateCandidateResumeText(candidateId, text);
        // Trigger request matching with fresh text
        const candidate = data.getCandidateById(candidateId, userId);
        if (candidate) {
          await runCandidateRequestMatching(candidateId, candidate, userId).catch(e =>
            console.error('Background request matching error:', e.message)
          );
        }
      }
    }).catch(err => console.error('Resume text extraction error:', err.message));

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
    res.json({ matches, cached: true });
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

// Shared matching logic — used by the endpoint and by file upload trigger
async function runCandidateRequestMatching(candidateId, candidate, userId) {
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
            break;
          }
        }
      }
    }
  }

  const candidateProfile = `${candidate.name}\nRole: ${candidate.role || 'Not specified'}\nSkills: ${candidate.skills || 'Not specified'}${resumeText ? '\nResume:\n' + resumeText.substring(0, 4000) : ''}`;

  const Anthropic = require('@anthropic-ai/sdk');
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return [];

  const client = new Anthropic({ apiKey });
  const requestSummaries = openRequests.map((r, i) => (
    `[${i + 1}] ${r.title}\nRole: ${r.role || ''}\nSkills: ${(r.requiredSkills || '').replace(/\*\*/g, '')}\nDescription: ${(r.description || '').substring(0, 500)}`
  )).join('\n\n---\n\n');

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
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
  const { parseCV } = require('../lib/cv-parser');
  let created = 0;
  let failed = 0;
  let merged = 0;
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

      const parsed = await parseCV(resumeText);
      if (!parsed.name) {
        failed++;
        sendEvent({ ...progress, status: 'skipped', error: 'Could not extract candidate name from CV' });
        continue;
      }

      // Dedup by email: if a candidate with this email already exists, merge
      // the new CV into that profile instead of creating a duplicate.
      const dup = parsed.email ? data.findCandidateByEmail(parsed.email, userId) : null;
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
        if (Object.keys(fill).length > 0) data.updateCandidate(dup.id, fill, userId);
        data.createCandidateComment(dup.id, 'CV uppdaterat via import (matchade befintlig e-postadress)', userId);

        merged++;
        createdIds.push(dup.id); // re-match the updated profile against open requests
        sendEvent({ ...progress, status: 'duplicate', candidateId: dup.id, name: dup.name, role: dup.role || parsed.role || '' });
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
      data.createCandidateComment(candidate.id, 'Automatiskt skapad via CV import', userId);

      created++;
      createdIds.push(candidate.id);
      sendEvent({ ...progress, status: 'created', candidateId: candidate.id, name: parsed.name, role: parsed.role || '' });
    } catch (err) {
      console.error(`Error processing CV ${originalName}:`, err.message);
      failed++;
      sendEvent({ ...progress, status: 'error', error: err.message });
    }
  }

  sendEvent({ type: 'done', created, merged, failed, total });
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
