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

// Import the entities added in backup version 3 (consultant requests + their
// matchings, AI inbox emails, authorized sender addresses, employment offers).
// Shared by both the JSON and ZIP import paths so they can't drift apart. Must
// run inside the import transaction, after candidates/contacts/companies have
// been imported (so their id maps are populated). Re-homes everything to the
// importing user/team and remaps cross-entity references.
function importVersion3Entities(importData, maps, userId, teamId, now) {
  const { companyIdMap, contactIdMap, candidateIdMap } = maps;
  const inboxIdMap = new Map();

  const OFFER_TYPES = ['probationary', 'permanent'];
  const REQ_STATUS = ['open', 'in_progress', 'filled', 'closed'];
  const REQ_URGENCY = ['low', 'normal', 'high', 'urgent'];
  const INBOX_STATUS = ['pending', 'processing', 'completed', 'failed', 'review'];

  // user_emails — re-homed to the importing user. Global UNIQUE index on email,
  // so skip any address that already exists.
  for (const ue of importData.data.userEmails || []) {
    if (!ue.email) continue;
    const exists = db.prepare('SELECT id FROM user_emails WHERE email = ?').get(ue.email);
    if (exists) continue;
    db.prepare('INSERT INTO user_emails (id, user_id, email, label, created_at) VALUES (?, ?, ?, ?, ?)')
      .run(data.generateId(), userId, ue.email, ue.label || '', ue.created_at || now);
  }

  // email_inbox — best-effort remap of action_id to the imported entity;
  // unresolved links (incl. consultant_request actions) are nulled so nothing
  // dangles. The email record itself (body/classification/summary) is preserved.
  for (const em of importData.data.emailInbox || []) {
    const newId = data.generateId();
    inboxIdMap.set(em.id, newId);
    let actionId = null;
    if (['contact', 'new_contact', 'existing_contact'].includes(em.action_type)) actionId = contactIdMap.get(em.action_id) || null;
    else if (em.action_type === 'company') actionId = companyIdMap.get(em.action_id) || null;
    else if (em.action_type === 'candidate') actionId = candidateIdMap.get(em.action_id) || null;
    const status = INBOX_STATUS.includes(em.status) ? em.status : 'completed';
    db.prepare(`
      INSERT INTO email_inbox (id, from_email, from_name, subject, body, classification, confidence, extracted_data, status, action_type, action_id, action_summary, error_message, user_id, team_id, created_at, processed_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      newId, em.from_email || 'imported', em.from_name || '', em.subject || '', em.body || '',
      em.classification || 'pending', em.confidence || 0, em.extracted_data || '{}',
      status, em.action_type || null, actionId, em.action_summary || '',
      em.error_message || '', userId, teamId, em.created_at || now, em.processed_at || null
    );
  }

  // consultant_requests — remap candidate ids inside matched_candidates (drop
  // entries whose candidate wasn't imported) and the email_inbox_id link.
  for (const r of importData.data.consultantRequests || []) {
    let matched = [];
    try { matched = JSON.parse(r.matched_candidates || '[]'); } catch (_) { matched = []; }
    const remapped = matched
      .map(m => { const c = candidateIdMap.get(m.candidateId); return c ? { ...m, candidateId: c } : null; })
      .filter(Boolean);
    const newInboxId = r.email_inbox_id ? (inboxIdMap.get(r.email_inbox_id) || null) : null;
    const status = REQ_STATUS.includes(r.status) ? r.status : 'open';
    const urgency = REQ_URGENCY.includes(r.urgency) ? r.urgency : 'normal';
    db.prepare(`
      INSERT INTO consultant_requests (id, title, description, required_skills, role, client_name, client_email, urgency, status, matched_candidates, email_inbox_id, team_id, created_by, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      data.generateId(), r.title || 'Untitled request', r.description || '', r.required_skills || '',
      r.role || '', r.client_name || '', r.client_email || '', urgency, status,
      JSON.stringify(remapped), newInboxId, teamId, userId, r.created_at || now, now
    );
  }

  // candidate_offers — remap candidate_id (skip if candidate not imported).
  for (const o of importData.data.candidateOffers || []) {
    const newCandidateId = candidateIdMap.get(o.candidate_id);
    if (!newCandidateId) continue;
    const contractType = OFFER_TYPES.includes(o.contract_type) ? o.contract_type : 'permanent';
    db.prepare(`
      INSERT INTO candidate_offers (id, candidate_id, contract_type, candidate_name, personal_number, start_date, work_location, department, sign_location, sign_date, signer_name, signer_title, fixed_salary, expected_rate, variable_percentage, salary_year, calculation_json, contract_filename, contract_original_name, attachment_filename, attachment_original_name, email_subject, email_body, team_id, created_by, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      data.generateId(), newCandidateId, contractType, o.candidate_name || '',
      o.personal_number || '', o.start_date || '', o.work_location || '', o.department || '',
      o.sign_location || '', o.sign_date || '', o.signer_name || '', o.signer_title || '',
      o.fixed_salary || 0, o.expected_rate || 0, o.variable_percentage || 0, o.salary_year || 0,
      o.calculation_json || '{}', o.contract_filename || '', o.contract_original_name || '',
      o.attachment_filename || '', o.attachment_original_name || '', o.email_subject || '',
      o.email_body || '', teamId, userId, o.created_at || now, now
    );
  }
}

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
    let companies, contacts, notes, todos, candidates, candidateComments, candidateFiles, checklists;
    let consultantRequests, emailInbox, candidateOffers, userEmails;

    if (teamId) {
      companies = db.prepare('SELECT * FROM companies WHERE team_id = ?').all(teamId);
      contacts = db.prepare('SELECT * FROM contacts WHERE team_id = ?').all(teamId);
      notes = db.prepare('SELECT * FROM notes WHERE team_id = ?').all(teamId);
      todos = db.prepare('SELECT * FROM todos WHERE team_id = ?').all(teamId);
      candidates = db.prepare('SELECT * FROM candidates WHERE team_id = ?').all(teamId);
      candidateComments = db.prepare('SELECT * FROM candidate_comments WHERE team_id = ?').all(teamId);
      checklists = db.prepare('SELECT * FROM checklists WHERE team_id = ?').all(teamId);
      consultantRequests = db.prepare('SELECT * FROM consultant_requests WHERE team_id = ?').all(teamId);
      emailInbox = db.prepare('SELECT * FROM email_inbox WHERE team_id = ?').all(teamId);
      candidateOffers = db.prepare('SELECT * FROM candidate_offers WHERE team_id = ?').all(teamId);
    } else {
      companies = db.prepare('SELECT * FROM companies WHERE created_by = ? AND team_id IS NULL').all(userId);
      contacts = db.prepare('SELECT * FROM contacts WHERE created_by = ? AND team_id IS NULL').all(userId);
      notes = db.prepare('SELECT * FROM notes WHERE created_by = ? AND team_id IS NULL').all(userId);
      todos = db.prepare('SELECT * FROM todos WHERE created_by = ? AND team_id IS NULL').all(userId);
      candidates = db.prepare('SELECT * FROM candidates WHERE created_by = ? AND team_id IS NULL').all(userId);
      candidateComments = db.prepare('SELECT * FROM candidate_comments WHERE created_by = ? AND team_id IS NULL').all(userId);
      checklists = db.prepare('SELECT * FROM checklists WHERE created_by = ? AND team_id IS NULL').all(userId);
      consultantRequests = db.prepare('SELECT * FROM consultant_requests WHERE created_by = ? AND team_id IS NULL').all(userId);
      emailInbox = db.prepare('SELECT * FROM email_inbox WHERE user_id = ? AND team_id IS NULL').all(userId);
      candidateOffers = db.prepare('SELECT * FROM candidate_offers WHERE created_by = ? AND team_id IS NULL').all(userId);
    }

    // Authorized sender addresses are per-user (no team_id) — export the
    // exporting user's own.
    userEmails = db.prepare('SELECT * FROM user_emails WHERE user_id = ?').all(userId);

    // Get candidate files from DB
    const candidateIds = candidates.map(c => c.id);
    candidateFiles = candidateIds.length > 0
      ? db.prepare(`SELECT * FROM candidate_files WHERE candidate_id IN (${candidateIds.map(() => '?').join(',')})`).all(...candidateIds)
      : [];

    const exportData = {
      version: 3,
      exportedAt: new Date().toISOString(),
      exportedBy: userId,
      data: {
        companies,
        contacts,
        notes,
        todos,
        candidates,
        candidateComments,
        candidateFiles,
        checklists,
        consultantRequests,
        emailInbox,
        candidateOffers,
        userEmails
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

    // Add candidate files + employment-offer files (contract .docx / attachment .pdf)
    if (uploadsDir) {
      const fileNames = new Set();
      for (const file of candidateFiles) fileNames.add(file.filename);
      for (const offer of candidateOffers) {
        if (offer.contract_filename) fileNames.add(offer.contract_filename);
        if (offer.attachment_filename) fileNames.add(offer.attachment_filename);
      }
      for (const filename of fileNames) {
        const filePath = path.join(uploadsDir, filename);
        if (fs.existsSync(filePath)) {
          archive.file(filePath, { name: `files/${filename}` });
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

// GET /api/backup/db-snapshot - Download a full, consistent copy of the entire
// SQLite database (every table: users, teams, candidates, requests, inbox,
// offers — everything). This is the disaster-recovery backup; restoring it is an
// ops step (replace data/crm.db on the server and restart). It contains ALL
// teams' data and password hashes, so it is restricted to owner/solo users.
router.get('/db-snapshot', async (req, res) => {
  let tmpPath;
  try {
    const userId = req.session.userId;
    const role = data.getUserRole(userId);
    if (role === 'member') {
      return res.status(403).json({ error: 'Only the team owner can download a full database snapshot' });
    }

    // better-sqlite3 online backup → a consistent copy even while the app runs.
    tmpPath = path.join(os.tmpdir(), `crm-snapshot-${process.pid}-${Date.now()}.db`);
    await db.backup(tmpPath);

    const dateStr = new Date().toISOString().split('T')[0];
    res.download(tmpPath, `simple-crm-full-db-${dateStr}.db`, (err) => {
      try { if (tmpPath) fs.unlinkSync(tmpPath); } catch (_) { /* ignore */ }
      if (err && !res.headersSent) console.error('DB snapshot download error:', err);
    });
  } catch (err) {
    console.error('Error creating DB snapshot:', err);
    if (tmpPath) { try { fs.unlinkSync(tmpPath); } catch (_) {} }
    if (!res.headersSent) res.status(500).json({ error: 'Failed to create database snapshot' });
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

    if (![1, 2, 3].includes(importData.version)) {
      return res.status(400).json({ error: 'Unsupported backup version' });
    }

    const teamId = data.getUserTeamId(userId);
    const now = data.getTimestamp();

    // Map old IDs to new IDs for restoring relationships
    const companyIdMap = new Map();
    const contactIdMap = new Map();
    const candidateIdMap = new Map();
    const checklistIdMap = new Map();

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

      // Import checklists
      for (const checklist of importData.data.checklists || []) {
        const newId = data.generateId();
        checklistIdMap.set(checklist.id, newId);
        db.prepare(`
          INSERT INTO checklists (id, name, items, team_id, created_by, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(newId, checklist.name, checklist.items, teamId, userId, checklist.created_at || now, now);
      }

      // Import candidates (before todos, so candidate-linked todos can resolve)
      for (const candidate of importData.data.candidates || []) {
        const newId = data.generateId();
        candidateIdMap.set(candidate.id, newId);

        // resume_text / profile_json / skill_tags are derived from the CV but
        // are NOT cheap to rebuild: re-extracting is CPU-bound and re-distilling
        // is an AI call per candidate. Dropping them on import (as this used to)
        // meant a restore silently cost a full re-extraction and re-distillation
        // of the whole library. They carry no foreign ids, so they restore
        // verbatim.
        //
        // request_matches and match_status are deliberately NOT restored: they
        // reference consultant_request ids that are remapped during import, so
        // restoring them would point at the wrong requests. They rebuild on the
        // next match.
        db.prepare(`
          INSERT INTO candidates (id, name, email, phone, role, skills, category, is_subcontractor, resume_filename, resume_original_name,
                                  resume_text, resume_text_status, profile_json, profile_status, skill_tags,
                                  team_id, created_by, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          newId,
          candidate.name,
          candidate.email || '',
          candidate.phone || '',
          candidate.role || '',
          candidate.skills || '',
          candidate.category || 'in_progress',
          candidate.is_subcontractor ? 1 : 0,
          candidate.resume_filename || '',
          candidate.resume_original_name || '',
          candidate.resume_text || '',
          candidate.resume_text_status || null,
          candidate.profile_json || null,
          candidate.profile_status || null,
          candidate.skill_tags || null,
          teamId,
          userId,
          candidate.created_at || now,
          now
        );
      }

      // Import todos (need to map linked_id for contacts/companies/candidates)
      for (const todo of importData.data.todos || []) {
        let newLinkedId;
        if (todo.linked_type === 'company') {
          newLinkedId = companyIdMap.get(todo.linked_id);
        } else if (todo.linked_type === 'contact') {
          newLinkedId = contactIdMap.get(todo.linked_id);
        } else if (todo.linked_type === 'candidate') {
          newLinkedId = candidateIdMap.get(todo.linked_id);
        }
        if (!newLinkedId) continue; // Skip if linked entity wasn't imported

        const newId = data.generateId();
        const newChecklistId = todo.checklist_id ? (checklistIdMap.get(todo.checklist_id) || null) : null;

        db.prepare(`
          INSERT INTO todos (id, title, description, due_date, completed, completed_at, linked_type, linked_id, checklist_id, checklist_items_state, team_id, created_by, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          newId,
          todo.title,
          todo.description || '',
          todo.due_date,
          todo.completed || 0,
          todo.completed_at,
          todo.linked_type,
          newLinkedId,
          newChecklistId,
          todo.checklist_items_state || '[]',
          teamId,
          userId,
          todo.created_at || now,
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

      importVersion3Entities(importData, { companyIdMap, contactIdMap, candidateIdMap }, userId, teamId, now);
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
    const checklistIdMap = new Map();
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

      // Import checklists
      for (const checklist of importData.data.checklists || []) {
        const newId = data.generateId();
        checklistIdMap.set(checklist.id, newId);
        db.prepare(`
          INSERT INTO checklists (id, name, items, team_id, created_by, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(newId, checklist.name, checklist.items, teamId, userId, checklist.created_at || now, now);
      }

      // Import candidates (before todos, so candidate-linked todos can resolve)
      for (const candidate of importData.data.candidates || []) {
        const newId = data.generateId();
        candidateIdMap.set(candidate.id, newId);
        // See the ZIP import above for why resume_text/profile_json/skill_tags
        // are restored and request_matches/match_status deliberately are not.
        db.prepare(`
          INSERT INTO candidates (id, name, email, phone, role, skills, category, is_subcontractor, resume_filename, resume_original_name,
                                  resume_text, resume_text_status, profile_json, profile_status, skill_tags,
                                  team_id, created_by, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(newId, candidate.name, candidate.email || '', candidate.phone || '', candidate.role || '', candidate.skills || '', candidate.category || 'in_progress', candidate.is_subcontractor ? 1 : 0, candidate.resume_filename || '', candidate.resume_original_name || '', candidate.resume_text || '', candidate.resume_text_status || null, candidate.profile_json || null, candidate.profile_status || null, candidate.skill_tags || null, teamId, userId, candidate.created_at || now, now);
      }

      // Import todos
      for (const todo of importData.data.todos || []) {
        let newLinkedId;
        if (todo.linked_type === 'company') newLinkedId = companyIdMap.get(todo.linked_id);
        else if (todo.linked_type === 'contact') newLinkedId = contactIdMap.get(todo.linked_id);
        else if (todo.linked_type === 'candidate') newLinkedId = candidateIdMap.get(todo.linked_id);
        if (!newLinkedId) continue;
        const newId = data.generateId();
        const newChecklistId = todo.checklist_id ? (checklistIdMap.get(todo.checklist_id) || null) : null;
        db.prepare(`
          INSERT INTO todos (id, title, description, due_date, completed, completed_at, linked_type, linked_id, checklist_id, checklist_items_state, team_id, created_by, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(newId, todo.title, todo.description || '', todo.due_date, todo.completed || 0, todo.completed_at, todo.linked_type, newLinkedId, newChecklistId, todo.checklist_items_state || '[]', teamId, userId, todo.created_at || now, now);
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

      importVersion3Entities(importData, { companyIdMap, contactIdMap, candidateIdMap }, userId, teamId, now);
    });

    // Extract files BEFORE DB transaction so they exist when DB references them
    if (uploadsDir) {
      for (const entry of directory.files) {
        if (entry.path.startsWith('files/') && entry.path !== 'files/') {
          const filename = path.basename(entry.path);
          if (!/^[a-zA-Z0-9._-]+$/.test(filename)) continue; // skip suspicious filenames
          const destPath = path.join(uploadsDir, filename);
          if (!fs.existsSync(destPath)) {
            const buf = await entry.buffer();
            fs.writeFileSync(destPath, buf);
          }
        }
      }
    }

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
    console.error('Error importing ZIP backup:', err);
    res.status(500).json({ error: 'Import failed: ' + err.message });
  } finally {
    if (tmpFile) try { fs.unlinkSync(tmpFile); } catch (e) { /* ignore */ }
  }
});

  return router;
};
