const express = require('express');
const data = require('../data');
const db = require('../database');
const archiver = require('archiver');
const unzipper = require('unzipper');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const os = require('os');

const backupUpload = multer({ dest: os.tmpdir(), limits: { fileSize: 200 * 1024 * 1024 } });

module.exports = function(uploadsDir) {
  const router = express.Router();

// GET /api/backup/export - Export all user/team data as ZIP with files
router.get('/export', (req, res) => {
  try {
    const userId = req.session.userId;
    const role = data.getUserRole(userId);

    // Only owner or solo user can export
    if (role === 'member') {
      return res.status(403).json({ error: 'Only team owner can export data' });
    }

    const teamId = data.getUserTeamId(userId);

    // Get all data
    let companies, contacts, notes, todos, candidates, candidateComments, candidateFiles;

    if (teamId) {
      companies = db.prepare('SELECT * FROM companies WHERE team_id = ?').all(teamId);
      contacts = db.prepare('SELECT * FROM contacts WHERE team_id = ?').all(teamId);
      notes = db.prepare('SELECT * FROM notes WHERE team_id = ?').all(teamId);
      todos = db.prepare('SELECT * FROM todos WHERE team_id = ?').all(teamId);
      candidates = db.prepare('SELECT * FROM candidates WHERE team_id = ?').all(teamId);
      candidateComments = db.prepare('SELECT * FROM candidate_comments WHERE team_id = ?').all(teamId);
    } else {
      companies = db.prepare('SELECT * FROM companies WHERE created_by = ? AND team_id IS NULL').all(userId);
      contacts = db.prepare('SELECT * FROM contacts WHERE created_by = ? AND team_id IS NULL').all(userId);
      notes = db.prepare('SELECT * FROM notes WHERE created_by = ? AND team_id IS NULL').all(userId);
      todos = db.prepare('SELECT * FROM todos WHERE created_by = ? AND team_id IS NULL').all(userId);
      candidates = db.prepare('SELECT * FROM candidates WHERE created_by = ? AND team_id IS NULL').all(userId);
      candidateComments = db.prepare('SELECT * FROM candidate_comments WHERE created_by = ? AND team_id IS NULL').all(userId);
    }

    // Get candidate files from DB
    const candidateIds = candidates.map(c => c.id);
    candidateFiles = candidateIds.length > 0
      ? db.prepare(`SELECT * FROM candidate_files WHERE candidate_id IN (${candidateIds.map(() => '?').join(',')})`).all(...candidateIds)
      : [];

    const exportData = {
      version: 2,
      exportedAt: new Date().toISOString(),
      exportedBy: userId,
      data: {
        companies,
        contacts,
        notes,
        todos,
        candidates,
        candidateComments,
        candidateFiles
      }
    };

    const dateStr = new Date().toISOString().split('T')[0];
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="simple-crm-backup-${dateStr}.zip"`);

    const archive = archiver('zip', { zlib: { level: 9 } });
    archive.on('error', (err) => {
      console.error('Archive error:', err);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Failed to create backup archive' });
      }
    });
    archive.pipe(res);

    // Add the JSON data
    archive.append(JSON.stringify(exportData, null, 2), { name: 'data.json' });

    // Add candidate files
    if (uploadsDir) {
      for (const file of candidateFiles) {
        const filePath = path.join(uploadsDir, file.filename);
        if (fs.existsSync(filePath)) {
          archive.file(filePath, { name: `files/${file.filename}` });
        }
      }
    }

    archive.finalize();
  } catch (err) {
    console.error('Error exporting data:', err);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

// POST /api/backup/import - Import data from JSON backup (owner/solo only)
router.post('/import', (req, res) => {
  try {
    const userId = req.session.userId;
    const role = data.getUserRole(userId);

    // Only owner or solo user can import
    if (role === 'member') {
      return res.status(403).json({ error: 'Only team owner can import data' });
    }

    const { importData, mode } = req.body;

    if (!importData || !importData.data) {
      return res.status(400).json({ error: 'Invalid backup file format' });
    }

    if (importData.version !== 1 && importData.version !== 2) {
      return res.status(400).json({ error: 'Unsupported backup version' });
    }

    const teamId = data.getUserTeamId(userId);
    const now = data.getTimestamp();

    // Map old IDs to new IDs for restoring relationships
    const companyIdMap = new Map();
    const contactIdMap = new Map();
    const candidateIdMap = new Map();

    // Use a transaction for atomicity
    const importTransaction = db.transaction(() => {
      // Import companies
      for (const company of importData.data.companies || []) {
        const newId = data.generateId();
        companyIdMap.set(company.id, newId);

        db.prepare(`
          INSERT INTO companies (id, name, technologies, organization_number, address, archived_at, team_id, created_by, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          newId,
          company.name,
          company.technologies || '',
          company.organization_number || '',
          company.address || '',
          company.archived_at || null,
          teamId,
          userId,
          company.created_at || now,
          now
        );
      }

      // Import contacts (need to map company_id)
      for (const contact of importData.data.contacts || []) {
        const newCompanyId = companyIdMap.get(contact.company_id);
        if (!newCompanyId) continue; // Skip if company wasn't imported

        const newId = data.generateId();
        contactIdMap.set(contact.id, newId);

        db.prepare(`
          INSERT INTO contacts (id, company_id, name, role, department, description, email, phone, archived_at, team_id, created_by, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          newId,
          newCompanyId,
          contact.name,
          contact.role || '',
          contact.department || '',
          contact.description || '',
          contact.email || '',
          contact.phone || '',
          contact.archived_at || null,
          teamId,
          userId,
          contact.created_at || now,
          now
        );
      }

      // Import notes (need to map contact_id)
      for (const note of importData.data.notes || []) {
        const newContactId = contactIdMap.get(note.contact_id);
        if (!newContactId) continue; // Skip if contact wasn't imported

        const newId = data.generateId();

        db.prepare(`
          INSERT INTO notes (id, contact_id, content, deleted_at, team_id, created_by, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          newId,
          newContactId,
          note.content,
          note.deleted_at || null,
          teamId,
          userId,
          note.created_at || now,
          now
        );
      }

      // Import todos (need to map linked_id for contacts/companies)
      for (const todo of importData.data.todos || []) {
        let newLinkedId;
        if (todo.linked_type === 'company') {
          newLinkedId = companyIdMap.get(todo.linked_id);
        } else if (todo.linked_type === 'contact') {
          newLinkedId = contactIdMap.get(todo.linked_id);
        }
        if (!newLinkedId) continue; // Skip if linked entity wasn't imported

        const newId = data.generateId();

        db.prepare(`
          INSERT INTO todos (id, title, description, due_date, completed, completed_at, linked_type, linked_id, team_id, created_by, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          newId,
          todo.title,
          todo.description || '',
          todo.due_date,
          todo.completed || 0,
          todo.completed_at,
          todo.linked_type,
          newLinkedId,
          teamId,
          userId,
          todo.created_at || now,
          now
        );
      }

      // Import candidates
      for (const candidate of importData.data.candidates || []) {
        const newId = data.generateId();
        candidateIdMap.set(candidate.id, newId);

        db.prepare(`
          INSERT INTO candidates (id, name, email, phone, role, skills, category, resume_filename, resume_original_name, team_id, created_by, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          newId,
          candidate.name,
          candidate.email || '',
          candidate.phone || '',
          candidate.role || '',
          candidate.skills || '',
          candidate.category || 'in_progress',
          candidate.resume_filename || '',
          candidate.resume_original_name || '',
          teamId,
          userId,
          candidate.created_at || now,
          now
        );
      }

      // Import candidate comments (need to map candidate_id)
      for (const comment of importData.data.candidateComments || []) {
        const newCandidateId = candidateIdMap.get(comment.candidate_id);
        if (!newCandidateId) continue; // Skip if candidate wasn't imported

        const newId = data.generateId();

        db.prepare(`
          INSERT INTO candidate_comments (id, candidate_id, content, team_id, created_by, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(
          newId,
          newCandidateId,
          comment.content,
          teamId,
          userId,
          comment.created_at || now,
          now
        );
      }

      // Import candidate files (need to map candidate_id)
      for (const file of importData.data.candidateFiles || []) {
        const newCandidateId = candidateIdMap.get(file.candidate_id);
        if (!newCandidateId) continue;

        const newId = data.generateId();

        db.prepare(`
          INSERT INTO candidate_files (id, candidate_id, filename, original_name, file_size, mime_type, uploaded_at, uploaded_by)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          newId,
          newCandidateId,
          file.filename,
          file.original_name,
          file.file_size || 0,
          file.mime_type || '',
          file.uploaded_at || now,
          userId
        );
      }
    });

    importTransaction();

    res.json({
      success: true,
      imported: {
        companies: companyIdMap.size,
        contacts: contactIdMap.size,
        candidates: candidateIdMap.size
      }
    });
  } catch (err) {
    console.error('Error importing data:', err);
    res.status(500).json({ error: 'Import failed: ' + err.message });
  }
});

// POST /api/backup/import-zip - Import data from ZIP backup (owner/solo only)
router.post('/import-zip', backupUpload.single('backup'), async (req, res) => {
  let tmpFile = req.file?.path;
  try {
    const userId = req.session.userId;
    const role = data.getUserRole(userId);

    if (role === 'member') {
      return res.status(403).json({ error: 'Only team owner can import data' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No backup file uploaded' });
    }

    // Extract ZIP and read data.json
    const directory = await unzipper.Open.file(tmpFile);
    const dataEntry = directory.files.find(f => f.path === 'data.json');
    if (!dataEntry) {
      return res.status(400).json({ error: 'Invalid backup: missing data.json' });
    }

    const dataBuffer = await dataEntry.buffer();
    const importData = JSON.parse(dataBuffer.toString('utf8'));

    if (!importData.data) {
      return res.status(400).json({ error: 'Invalid backup file format' });
    }

    const teamId = data.getUserTeamId(userId);
    const now = data.getTimestamp();

    const companyIdMap = new Map();
    const contactIdMap = new Map();
    const candidateIdMap = new Map();
    const fileNameMap = new Map(); // old filename -> new filename

    const importTransaction = db.transaction(() => {
      // Import companies
      for (const company of importData.data.companies || []) {
        const newId = data.generateId();
        companyIdMap.set(company.id, newId);
        db.prepare(`
          INSERT INTO companies (id, name, technologies, organization_number, address, archived_at, team_id, created_by, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(newId, company.name, company.technologies || '', company.organization_number || '', company.address || '', company.archived_at || null, teamId, userId, company.created_at || now, now);
      }

      // Import contacts
      for (const contact of importData.data.contacts || []) {
        const newCompanyId = companyIdMap.get(contact.company_id);
        if (!newCompanyId) continue;
        const newId = data.generateId();
        contactIdMap.set(contact.id, newId);
        db.prepare(`
          INSERT INTO contacts (id, company_id, name, role, department, description, email, phone, archived_at, team_id, created_by, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(newId, newCompanyId, contact.name, contact.role || '', contact.department || '', contact.description || '', contact.email || '', contact.phone || '', contact.archived_at || null, teamId, userId, contact.created_at || now, now);
      }

      // Import notes
      for (const note of importData.data.notes || []) {
        const newContactId = contactIdMap.get(note.contact_id);
        if (!newContactId) continue;
        const newId = data.generateId();
        db.prepare(`
          INSERT INTO notes (id, contact_id, content, deleted_at, team_id, created_by, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).run(newId, newContactId, note.content, note.deleted_at || null, teamId, userId, note.created_at || now, now);
      }

      // Import todos
      for (const todo of importData.data.todos || []) {
        let newLinkedId;
        if (todo.linked_type === 'company') newLinkedId = companyIdMap.get(todo.linked_id);
        else if (todo.linked_type === 'contact') newLinkedId = contactIdMap.get(todo.linked_id);
        if (!newLinkedId) continue;
        const newId = data.generateId();
        db.prepare(`
          INSERT INTO todos (id, title, description, due_date, completed, completed_at, linked_type, linked_id, team_id, created_by, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(newId, todo.title, todo.description || '', todo.due_date, todo.completed || 0, todo.completed_at, todo.linked_type, newLinkedId, teamId, userId, todo.created_at || now, now);
      }

      // Import candidates
      for (const candidate of importData.data.candidates || []) {
        const newId = data.generateId();
        candidateIdMap.set(candidate.id, newId);
        db.prepare(`
          INSERT INTO candidates (id, name, email, phone, role, skills, category, resume_filename, resume_original_name, team_id, created_by, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(newId, candidate.name, candidate.email || '', candidate.phone || '', candidate.role || '', candidate.skills || '', candidate.category || 'in_progress', candidate.resume_filename || '', candidate.resume_original_name || '', teamId, userId, candidate.created_at || now, now);
      }

      // Import candidate comments
      for (const comment of importData.data.candidateComments || []) {
        const newCandidateId = candidateIdMap.get(comment.candidate_id);
        if (!newCandidateId) continue;
        const newId = data.generateId();
        db.prepare(`
          INSERT INTO candidate_comments (id, candidate_id, content, team_id, created_by, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(newId, newCandidateId, comment.content, teamId, userId, comment.created_at || now, now);
      }

      // Import candidate files (DB records)
      for (const file of importData.data.candidateFiles || []) {
        const newCandidateId = candidateIdMap.get(file.candidate_id);
        if (!newCandidateId) continue;
        const newId = data.generateId();
        db.prepare(`
          INSERT INTO candidate_files (id, candidate_id, filename, original_name, file_size, mime_type, uploaded_at, uploaded_by)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).run(newId, newCandidateId, file.filename, file.original_name, file.file_size || 0, file.mime_type || '', file.uploaded_at || now, userId);
      }
    });

    importTransaction();

    // Extract actual files from ZIP to uploads directory
    if (uploadsDir) {
      for (const entry of directory.files) {
        if (entry.path.startsWith('files/') && entry.path !== 'files/') {
          const filename = path.basename(entry.path);
          const destPath = path.join(uploadsDir, filename);
          if (!fs.existsSync(destPath)) {
            const buf = await entry.buffer();
            fs.writeFileSync(destPath, buf);
          }
        }
      }
    }

    res.json({
      success: true,
      imported: {
        companies: companyIdMap.size,
        contacts: contactIdMap.size,
        candidates: candidateIdMap.size
      }
    });
  } catch (err) {
    console.error('Error importing ZIP backup:', err);
    res.status(500).json({ error: 'Import failed: ' + err.message });
  } finally {
    if (tmpFile) try { fs.unlinkSync(tmpFile); } catch (e) { /* ignore */ }
  }
});

  return router;
};
