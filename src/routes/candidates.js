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

    let resumeFilename = '';
    let resumeOriginalName = '';

    if (req.file) {
      resumeFilename = req.file.filename;
      resumeOriginalName = fixOriginalName(req.file);
    }

    const newCandidate = data.createCandidate({
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
      // Re-fetch to include files
      const updated = data.getCandidateById(newCandidate.id, userId);
      return res.status(201).json(updated);
    }

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
      // Clean up uploaded file since we can't store it
      try {
        fs.unlinkSync(path.join(uploadsDir, req.file.filename));
      } catch (e) { /* ignore */ }
      return res.status(400).json({ error: result.error });
    }

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

// POST /api/candidates/import-cvs - Bulk import candidates from CV files
router.post('/import-cvs', upload.array('cvFiles', 20), async (req, res) => {
  try {
    const userId = req.session.userId;
    const category = req.body.category || 'in_progress';

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    // Validate magic bytes for all files
    for (const file of req.files) {
      const ext = path.extname(file.originalname).toLowerCase();
      if (!validateFileMagic(file.path, ext)) {
        // Clean up all uploaded files
        for (const f of req.files) {
          try { fs.unlinkSync(f.path); } catch (_) {}
        }
        const name = fixOriginalName(file);
        return res.status(400).json({ error: `File "${name}" content does not match its extension. All uploads rejected.` });
      }
    }

    const { extractTextFromFile } = require('../lib/resume-parser');
    const { parseCV } = require('../lib/cv-parser');

    const results = [];

    for (const file of req.files) {
      const originalName = fixOriginalName(file);
      try {
        // Extract text from the CV file
        const resumeText = await extractTextFromFile(file.path);
        if (!resumeText) {
          results.push({ file: originalName, status: 'skipped', error: 'Could not extract text from file' });
          continue;
        }

        // Use AI to parse the CV
        const parsed = await parseCV(resumeText);

        if (!parsed.name) {
          results.push({ file: originalName, status: 'skipped', error: 'Could not extract candidate name from CV' });
          continue;
        }

        // Create the candidate
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

        // Add file to candidate_files table
        data.addCandidateFile(candidate.id, {
          filename: file.filename,
          originalName,
          fileSize: file.size,
          mimeType: file.mimetype
        }, userId);

        // Cache extracted text for AI matching
        data.updateCandidateResumeText(candidate.id, resumeText);

        // Add automatic comment
        data.createCandidateComment(candidate.id, 'Automatiskt skapad via CV import', userId);

        results.push({
          file: originalName,
          status: 'created',
          candidateId: candidate.id,
          name: parsed.name,
          role: parsed.role || '',
          skills: parsed.skills || ''
        });
      } catch (err) {
        console.error(`Error processing CV ${originalName}:`, err.message);
        results.push({ file: originalName, status: 'error', error: err.message });
      }
    }

    const created = results.filter(r => r.status === 'created').length;
    const failed = results.filter(r => r.status !== 'created').length;

    res.status(201).json({
      message: `Created ${created} candidate(s)` + (failed > 0 ? `, ${failed} failed` : ''),
      results
    });
  } catch (err) {
    console.error('Error importing CVs:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

  return router;
};
