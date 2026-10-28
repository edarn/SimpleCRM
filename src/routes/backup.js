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

const BACKUP_VERSIONS = [1, 2, 3, 4];

// One import for both the ZIP and the legacy JSON path, so they cannot drift
// apart (they used to be two hand-copied ~200-line blocks). Must be called
// inside a transaction. Every row gets a new id and is re-homed to the
// importing user's team (or solo scope); cross-entity references are remapped
// through the id maps, and anything whose parent was not imported is skipped.
//
// Authorship is kept where it is safe: a row's created_by survives only if
// that user is the importer or a member of the importing team (the normal case
// when restoring your own team's backup). Anyone else becomes the importer, so
// a backup can never attribute rows to users outside the team.
//
// Deliberately not restored (all rebuild on their own): candidates'
// request_matches / match_status and requests' match_status / match_stage /
// match_summary (they reference ids that change on import), the
// request_match_cache (a cache, keyed on ids), inbox `stage` (transient) and
// inbox external_message_id (unique — restoring next to the original would
// fail the whole import).
function importBackupData(importData, userId, teamId) {
  const d = importData.data || {};
  const now = data.getTimestamp();
  const companyIdMap = new Map();
  const contactIdMap = new Map();
  const candidateIdMap = new Map();
  const checklistIdMap = new Map();
  const todoIdMap = new Map();
  const requestIdMap = new Map();
  const inboxIdMap = new Map();
  const counts = {};
  const bump = (k) => { counts[k] = (counts[k] || 0) + 1; };

  const authorCache = new Map();
  const author = (oldId) => {
    if (!oldId || oldId === userId) return userId;
    if (!authorCache.has(oldId)) {
      const u = teamId ? db.prepare('SELECT team_id FROM users WHERE id = ?').get(oldId) : null;
      authorCache.set(oldId, u && u.team_id === teamId ? oldId : userId);
    }
    return authorCache.get(oldId);
  };

  for (const company of d.companies || []) {
    const newId = data.generateId();
    companyIdMap.set(company.id, newId);
    db.prepare(`
      INSERT INTO companies (id, name, technologies, organization_number, address, archived_at, team_id, created_by, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(newId, company.name, company.technologies || '', company.organization_number || '', company.address || '',
      company.archived_at || null, teamId, author(company.created_by), company.created_at || now, now);
    bump('companies');
  }

  for (const contact of d.contacts || []) {
    const newCompanyId = companyIdMap.get(contact.company_id);
    if (!newCompanyId) continue;
    const newId = data.generateId();
    contactIdMap.set(contact.id, newId);
    db.prepare(`
      INSERT INTO contacts (id, company_id, name, role, department, description, email, phone, archived_at, team_id, created_by, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(newId, newCompanyId, contact.name, contact.role || '', contact.department || '', contact.description || '',
      contact.email || '', contact.phone || '', contact.archived_at || null, teamId, author(contact.created_by), contact.created_at || now, now);
    bump('contacts');
  }

  for (const note of d.notes || []) {
    const newContactId = contactIdMap.get(note.contact_id);
    if (!newContactId) continue;
    db.prepare(`
      INSERT INTO notes (id, contact_id, content, deleted_at, team_id, created_by, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(data.generateId(), newContactId, note.content, note.deleted_at || null, teamId, author(note.created_by), note.created_at || now, note.updated_at || now);
    bump('notes');
  }

  for (const checklist of d.checklists || []) {
    const newId = data.generateId();
    checklistIdMap.set(checklist.id, newId);
    db.prepare(`
      INSERT INTO checklists (id, name, items, team_id, created_by, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(newId, checklist.name, checklist.items || '[]', teamId, author(checklist.created_by), checklist.created_at || now, now);
    bump('checklists');
  }

  // Candidates before todos/comments/files/offers/pipeline, which point at them.
  // resume_text / profile_json / skill_tags are derived from the CV but NOT
  // cheap to rebuild (CPU-bound extraction, one AI call per candidate), and
  // carry no foreign ids, so they restore verbatim.
  for (const c of d.candidates || []) {
    const newId = data.generateId();
    candidateIdMap.set(c.id, newId);
    db.prepare(`
      INSERT INTO candidates (id, name, email, phone, role, skills, category, is_subcontractor, subcontractor_company, subcontractor_contact,
                              resume_filename, resume_original_name, resume_text, resume_text_status, profile_json, profile_status, skill_tags,
                              team_id, created_by, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(newId, c.name, c.email || '', c.phone || '', c.role || '', c.skills || '', c.category || 'in_progress',
      c.is_subcontractor ? 1 : 0, c.subcontractor_company || '', c.subcontractor_contact || '',
      c.resume_filename || '', c.resume_original_name || '', c.resume_text || '', c.resume_text_status || null,
      c.profile_json || null, c.profile_status || null, c.skill_tags || null,
      teamId, author(c.created_by), c.created_at || now, now);
    bump('candidates');
  }

  for (const todo of d.todos || []) {
    let newLinkedId = null;
    if (todo.linked_type === 'company') newLinkedId = companyIdMap.get(todo.linked_id);
    else if (todo.linked_type === 'contact') newLinkedId = contactIdMap.get(todo.linked_id);
    else if (todo.linked_type === 'candidate') newLinkedId = candidateIdMap.get(todo.linked_id);
    // Unlinked ToDos (e.g. from the AI inbox) used to be dropped on restore.
    else if (todo.linked_type === 'general') newLinkedId = todo.linked_id || 'email';
    if (newLinkedId === undefined || newLinkedId === null) continue;
    const newId = data.generateId();
    todoIdMap.set(todo.id, newId);
    const newChecklistId = todo.checklist_id ? (checklistIdMap.get(todo.checklist_id) || null) : null;
    db.prepare(`
      INSERT INTO todos (id, title, description, due_date, completed, completed_at, linked_type, linked_id, checklist_id, checklist_items_state, team_id, created_by, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(newId, todo.title, todo.description || '', todo.due_date, todo.completed || 0, todo.completed_at,
      todo.linked_type, newLinkedId, newChecklistId, todo.checklist_items_state || '[]',
      teamId, author(todo.created_by), todo.created_at || now, now);
    bump('todos');
  }

  for (const comment of d.candidateComments || []) {
    const newCandidateId = candidateIdMap.get(comment.candidate_id);
    if (!newCandidateId) continue;
    db.prepare(`
      INSERT INTO candidate_comments (id, candidate_id, content, team_id, created_by, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(data.generateId(), newCandidateId, comment.content, teamId, author(comment.created_by), comment.created_at || now, comment.updated_at || now);
    bump('candidateComments');
  }

  for (const file of d.candidateFiles || []) {
    const newCandidateId = candidateIdMap.get(file.candidate_id);
    if (!newCandidateId) continue;
    db.prepare(`
      INSERT INTO candidate_files (id, candidate_id, filename, original_name, file_size, mime_type, uploaded_at, uploaded_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(data.generateId(), newCandidateId, file.filename, file.original_name, file.file_size || 0,
      file.mime_type || '', file.uploaded_at || now, author(file.uploaded_by));
    bump('candidateFiles');
  }

  // user_emails — re-homed to the importing user. Global UNIQUE index on email,
  // so skip any address that already exists.
  for (const ue of d.userEmails || []) {
    if (!ue.email) continue;
    if (db.prepare('SELECT id FROM user_emails WHERE email = ?').get(ue.email)) continue;
    db.prepare('INSERT INTO user_emails (id, user_id, email, label, created_at) VALUES (?, ?, ?, ?, ?)')
      .run(data.generateId(), userId, ue.email, ue.label || '', ue.created_at || now);
    bump('userEmails');
  }

  // email_inbox. action_type / action_id are parallel comma-separated lists
  // (one entry per action); action ids are remapped entry by entry in a second
  // pass below, once requests exist too.
  const INBOX_STATUS = ['pending', 'processing', 'completed', 'failed', 'review'];
  const inboxRows = [];
  for (const em of d.emailInbox || []) {
    const newId = data.generateId();
    inboxIdMap.set(em.id, newId);
    // A row caught mid-processing in the backup can never finish here.
    const status = INBOX_STATUS.includes(em.status) && em.status !== 'processing' ? em.status : (em.status === 'processing' ? 'failed' : 'completed');
    db.prepare(`
      INSERT INTO email_inbox (id, from_email, from_name, subject, body, classification, confidence, extracted_data, status, action_type, action_id, action_summary, error_message, user_id, team_id, created_at, processed_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(newId, em.from_email || 'imported', em.from_name || '', em.subject || '', em.body || '',
      em.classification || 'pending', em.confidence || 0, em.extracted_data || '{}',
      status, em.action_type || null, null, em.action_summary || '',
      em.error_message || '', author(em.user_id), teamId, em.created_at || now, em.processed_at || null);
    inboxRows.push({ newId, types: em.action_type, ids: em.action_id });
    bump('emailInbox');
  }

  // consultant_requests — remap candidate ids inside matched_candidates (drop
  // entries whose candidate wasn't imported; stars ride along in the entries)
  // and the email_inbox_id link.
  const REQ_STATUS = ['open', 'in_progress', 'filled', 'closed'];
  const REQ_URGENCY = ['low', 'normal', 'high', 'urgent'];
  for (const r of d.consultantRequests || []) {
    let matched = [];
    try { matched = JSON.parse(r.matched_candidates || '[]'); } catch (_) { matched = []; }
    const remapped = (Array.isArray(matched) ? matched : [])
      .map(m => { const c = candidateIdMap.get(m.candidateId); return c ? { ...m, candidateId: c } : null; })
      .filter(Boolean);
    const newId = data.generateId();
    requestIdMap.set(r.id, newId);
    db.prepare(`
      INSERT INTO consultant_requests (id, title, description, required_skills, role, client_name, client_email, urgency, status, matched_candidates, email_inbox_id, team_id, created_by, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(newId, r.title || 'Untitled request', r.description || '', r.required_skills || '',
      r.role || '', r.client_name || '', r.client_email || '',
      REQ_URGENCY.includes(r.urgency) ? r.urgency : 'normal', REQ_STATUS.includes(r.status) ? r.status : 'open',
      JSON.stringify(remapped), r.email_inbox_id ? (inboxIdMap.get(r.email_inbox_id) || null) : null,
      teamId, author(r.created_by), r.created_at || now, now);
    bump('consultantRequests');
  }

  // Second pass: inbox action links. Unknown/unmapped entries become '' so the
  // lists stay aligned (the inbox view zips them by index).
  const mapAction = (type, id) => {
    if (!id) return '';
    if (['contact', 'new_contact', 'existing_contact'].includes(type)) return contactIdMap.get(id) || '';
    if (type === 'company') return companyIdMap.get(id) || '';
    if (type === 'candidate') return candidateIdMap.get(id) || '';
    if (type === 'consultant_request') return requestIdMap.get(id) || '';
    if (type === 'todo') return todoIdMap.get(id) || '';
    return '';
  };
  for (const row of inboxRows) {
    if (!row.types || !row.ids) continue;
    const types = String(row.types).split(',').map(x => x.trim());
    const ids = String(row.ids).split(',').map(x => x.trim());
    const mapped = types.map((t, i) => mapAction(t, ids[i]));
    db.prepare('UPDATE email_inbox SET action_id = ? WHERE id = ?').run(mapped.join(', '), row.newId);
  }

  // candidate_offers — remap candidate_id (skip if candidate not imported).
  const OFFER_TYPES = ['probationary', 'permanent'];
  for (const o of d.candidateOffers || []) {
    const newCandidateId = candidateIdMap.get(o.candidate_id);
    if (!newCandidateId) continue;
    db.prepare(`
      INSERT INTO candidate_offers (id, candidate_id, contract_type, candidate_name, personal_number, start_date, work_location, department, sign_location, sign_date, signer_name, signer_title, fixed_salary, expected_rate, variable_percentage, salary_year, calculation_json, language, include_salary_model, contract_filename, contract_original_name, attachment_filename, attachment_original_name, email_subject, email_body, team_id, created_by, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(data.generateId(), newCandidateId, OFFER_TYPES.includes(o.contract_type) ? o.contract_type : 'permanent',
      o.candidate_name || '', o.personal_number || '', o.start_date || '', o.work_location || '', o.department || '',
      o.sign_location || '', o.sign_date || '', o.signer_name || '', o.signer_title || '',
      o.fixed_salary || 0, o.expected_rate || 0, o.variable_percentage || 0, o.salary_year || 0,
      o.calculation_json || '{}', o.language === 'en' ? 'en' : 'sv', o.include_salary_model ? 1 : 0,
      o.contract_filename || '', o.contract_original_name || '',
      o.attachment_filename || '', o.attachment_original_name || '', o.email_subject || '',
      o.email_body || '', teamId, author(o.created_by), o.created_at || now, now);
    bump('candidateOffers');
  }

  // client_pipeline (the Apple flow, backup v4) — remap candidate_id. Steps are
  // re-normalised so a hand-edited or older backup cannot store junk.
  const pipelineLib = require('../lib/pipeline');
  for (const pr of d.clientPipeline || []) {
    const newCandidateId = candidateIdMap.get(pr.candidate_id);
    if (!newCandidateId) continue;
    let steps = {};
    try { steps = JSON.parse(pr.steps_json || '{}'); } catch (_) { steps = {}; }
    const result = db.prepare(`
      INSERT INTO client_pipeline (id, client, candidate_id, team, steps_json, feedback_status, feedback_date, start_date, ended_at, note, team_id, created_by, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(client, candidate_id) DO NOTHING
    `).run(data.generateId(), pipelineLib.normalizeClient(pr.client), newCandidateId, pipelineLib.normalizeTeam(pr.team),
      JSON.stringify(pipelineLib.normalizeSteps(steps)), pr.feedback_status === 'done' ? 'done' : 'pending',
      pr.feedback_date || '', pr.start_date || '', pr.ended_at || null, pr.note || '',
      teamId, author(pr.created_by), pr.created_at || now, now);
    if (result.changes) bump('clientPipeline');
  }

  return counts;
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
    let consultantRequests, emailInbox, candidateOffers, userEmails, clientPipeline;

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
      // Scoped through the candidate, exactly like the Apple view itself.
      clientPipeline = db.prepare('SELECT p.* FROM client_pipeline p JOIN candidates c ON c.id = p.candidate_id WHERE c.team_id = ?').all(teamId);
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
      clientPipeline = db.prepare('SELECT p.* FROM client_pipeline p JOIN candidates c ON c.id = p.candidate_id WHERE c.created_by = ? AND c.team_id IS NULL').all(userId);
    }
    const teamLogo = teamId ? (db.prepare('SELECT logo_filename FROM teams WHERE id = ?').get(teamId) || {}).logo_filename || null : null;

    // Authorized sender addresses are per-user (no team_id) — export the
    // exporting user's own.
    userEmails = db.prepare('SELECT * FROM user_emails WHERE user_id = ?').all(userId);

    // Get candidate files from DB
    const candidateIds = candidates.map(c => c.id);
    candidateFiles = candidateIds.length > 0
      ? db.prepare(`SELECT * FROM candidate_files WHERE candidate_id IN (${candidateIds.map(() => '?').join(',')})`).all(...candidateIds)
      : [];

    const exportData = {
      version: 4,
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
        userEmails,
        clientPipeline,
        teamLogo
      }
    };

    // Every uploaded file the data refers to: CVs, offer documents, team logo.
    // A file the DB knows but the disk does not is reported, not silently
    // skipped — otherwise a backup could be incomplete without anyone knowing.
    const fileNames = new Set();
    for (const file of candidateFiles) fileNames.add(file.filename);
    for (const offer of candidateOffers) {
      if (offer.contract_filename) fileNames.add(offer.contract_filename);
      if (offer.attachment_filename) fileNames.add(offer.attachment_filename);
    }
    if (teamLogo) fileNames.add(teamLogo);
    const presentFiles = [];
    const missingFiles = [];
    for (const filename of fileNames) {
      if (uploadsDir && fs.existsSync(path.join(uploadsDir, filename))) presentFiles.push(filename);
      else missingFiles.push(filename);
    }
    exportData.files = { included: presentFiles.length, missing: missingFiles };
    if (missingFiles.length) console.warn(`Backup export: ${missingFiles.length} file(s) missing on disk:`, missingFiles.join(', '));

    const dateStr = new Date().toISOString().split('T')[0];
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="simple-crm-backup-${dateStr}.zip"`);
    res.setHeader('X-Backup-Files', String(presentFiles.length));
    res.setHeader('X-Backup-Missing-Files', String(missingFiles.length));

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

    for (const filename of presentFiles) {
      archive.file(path.join(uploadsDir, filename), { name: `files/${filename}` });
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

    if (!BACKUP_VERSIONS.includes(importData.version)) {
      return res.status(400).json({ error: 'Unsupported backup version' });
    }

    const teamId = data.getUserTeamId(userId);
    // No files travel with a JSON backup, so the team logo is not restored here.
    const imported = db.transaction(() => importBackupData(importData, userId, teamId))();
    res.json({ success: true, imported });
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
    if (importData.version !== undefined && !BACKUP_VERSIONS.includes(importData.version)) {
      return res.status(400).json({ error: 'Unsupported backup version' });
    }

    const teamId = data.getUserTeamId(userId);

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

    const imported = db.transaction(() => {
      const counts = importBackupData(importData, userId, teamId);
      // Team logo: only into a team that has none yet (never overwrite the
      // current one), only an image, and only if the file came in the ZIP.
      const logo = importData.data.teamLogo;
      if (teamId && logo && /^[a-zA-Z0-9._-]+\.(png|jpe?g|gif|webp)$/i.test(logo) && uploadsDir
          && fs.existsSync(path.join(uploadsDir, logo))) {
        const team = db.prepare('SELECT logo_filename FROM teams WHERE id = ?').get(teamId);
        if (team && !team.logo_filename) {
          db.prepare('UPDATE teams SET logo_filename = ? WHERE id = ?').run(logo, teamId);
          counts.teamLogo = 1;
        }
      }
      return counts;
    })();

    res.json({ success: true, imported });
  } catch (err) {
    console.error('Error importing ZIP backup:', err);
    res.status(500).json({ error: 'Import failed: ' + err.message });
  } finally {
    if (tmpFile) try { fs.unlinkSync(tmpFile); } catch (e) { /* ignore */ }
  }
});

  return router;
};
