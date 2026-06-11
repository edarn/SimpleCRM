const express = require('express');
const path = require('path');
const data = require('../data');
const { classifyEmail } = require('../lib/email-classifier');
const { matchCandidates } = require('../lib/candidate-matcher');
const { extractTextFromFile } = require('../lib/resume-parser');

module.exports = function(uploadsDir) {
  const router = express.Router();

  // GET /api/inbox - List all inbox emails
  router.get('/', (req, res) => {
    try {
      const emails = data.getAllInboxEmails(req.session.userId);
      res.json(emails);
    } catch (err) {
      console.error('Error fetching inbox:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // GET /api/inbox/:id - Get single inbox email
  router.get('/:id', (req, res) => {
    try {
      const email = data.getInboxEmailById(req.params.id, req.session.userId);
      if (!email) {
        return res.status(404).json({ error: 'Email not found' });
      }
      res.json(email);
    } catch (err) {
      console.error('Error fetching inbox email:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // POST /api/inbox/simulate - Simulate receiving an email (temporary dev UI)
  // Accepts { rawEmail } — a single pasted blob that the AI will parse
  router.post('/simulate', async (req, res) => {
    try {
      const { rawEmail } = req.body;
      if (!rawEmail || !rawEmail.trim()) {
        return res.status(400).json({ error: 'rawEmail is required' });
      }

      // Use the logged-in user as the actor (authorized by being logged in)
      const userId = req.session.userId;
      const teamId = data.getUserTeamId(userId) || null;

      // Try to extract a from-email from the raw text for display purposes
      const fromMatch = rawEmail.match(/[Ff]rom:\s*(?:.*<)?([^\s<>]+@[^\s<>]+)>?/);
      const subjectMatch = rawEmail.match(/[Ss]ubject:\s*(.+)/);
      const fromEmail = fromMatch ? fromMatch[1].trim() : '';
      const subject = subjectMatch ? subjectMatch[1].trim() : '';

      // Create inbox entry with the raw email as body
      const inboxEntry = data.createInboxEmail({
        fromEmail: fromEmail || 'pasted',
        fromName: '',
        subject: subject || '(pasted email)',
        body: rawEmail.trim(),
        userId, teamId
      });

      // Process asynchronously — respond immediately
      res.status(201).json(inboxEntry);

      // Process in background
      processEmail(inboxEntry.id, userId).catch(err => {
        console.error('Error processing email:', err);
        data.updateInboxEmail(inboxEntry.id, {
          status: 'failed',
          errorMessage: err.message,
          processedAt: new Date().toISOString()
        });
      });
    } catch (err) {
      console.error('Error simulating email:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // POST /api/inbox/:id/reprocess - Reprocess an email
  router.post('/:id/reprocess', async (req, res) => {
    try {
      const email = data.getInboxEmailById(req.params.id, req.session.userId);
      if (!email) {
        return res.status(404).json({ error: 'Email not found' });
      }

      data.updateInboxEmail(req.params.id, { status: 'pending' });
      res.json({ message: 'Reprocessing started' });

      processEmail(req.params.id, email.userId).catch(err => {
        console.error('Error reprocessing email:', err);
        data.updateInboxEmail(req.params.id, {
          status: 'failed',
          errorMessage: err.message,
          processedAt: new Date().toISOString()
        });
      });
    } catch (err) {
      console.error('Error reprocessing:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // DELETE /api/inbox/:id - Delete an inbox email
  router.delete('/:id', (req, res) => {
    try {
      const result = data.deleteInboxEmail(req.params.id, req.session.userId);
      if (result.error) {
        return res.status(404).json({ error: result.error });
      }
      res.status(204).send();
    } catch (err) {
      console.error('Error deleting inbox email:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // POST /api/inbox/extract-resumes - Trigger resume text extraction for all candidates
  router.post('/extract-resumes', async (req, res) => {
    try {
      const userId = req.session.userId;
      const teamId = data.getUserTeamId(userId);

      // Get all candidates that have files but no extracted text
      // Check both candidate_files table and legacy resume_filename column
      const db = require('../database');
      const whereClause = teamId ? 'c.team_id = ?' : 'c.created_by = ?';
      const param = teamId || userId;

      const candidates = db.prepare(`
        SELECT DISTINCT c.id, c.name, c.skills, c.resume_filename,
               cf.filename AS file_filename, cf.original_name AS file_original_name
        FROM candidates c
        LEFT JOIN candidate_files cf ON cf.candidate_id = c.id
        WHERE ${whereClause} AND (c.resume_text IS NULL OR c.resume_text = '')
      `).all(param);

      let extracted = 0;
      let skipped = 0;
      for (const c of candidates) {
        // Try candidate_files first, fall back to legacy resume_filename
        const filename = c.file_filename || c.resume_filename;
        let text = '';

        if (uploadsDir && filename) {
          const filePath = path.join(uploadsDir, filename);
          try {
            text = await extractTextFromFile(filePath);
          } catch (err) {
            console.error(`Error extracting resume for ${c.name} (${c.id}):`, err.message);
          }
        }

        // If file extraction failed (e.g. .doc format), use skills as fallback
        if (!text && c.skills) {
          text = `Skills: ${c.skills}`;
        }

        if (text) {
          data.updateCandidateResumeText(c.id, text);
          extracted++;
        } else {
          skipped++;
        }
      }

      res.json({ message: `Extracted text from ${extracted} resumes` + (skipped > 0 ? ` (${skipped} had no extractable content)` : ''), total: candidates.length, extracted, skipped });
    } catch (err) {
      console.error('Error extracting resumes:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Check if inbox entry still exists (guards against deletion during async processing)
  function inboxEntryExists(emailId, userId) {
    return !!data.getInboxEmailById(emailId, userId);
  }

  // Core email processing logic
  async function processEmail(emailId, userId) {
    const email = data.getInboxEmailById(emailId, userId);
    if (!email) throw new Error('Email not found');

    data.updateInboxEmail(emailId, { status: 'processing' });

    // Step 1: Classify the email using AI (returns multiple actions)
    const result = await classifyEmail({
      fromEmail: email.fromEmail,
      fromName: email.fromName,
      subject: email.subject,
      body: email.body
    });

    // Normalize: support both old single-action and new multi-action format
    const actions = result.actions || [{
      classification: result.classification,
      confidence: result.confidence,
      extracted: result.extracted
    }];

    // Update with AI-extracted sender info
    const updates = {
      classification: actions.map(a => a.classification).join(', '),
      confidence: Math.min(...actions.map(a => a.confidence)),
      extractedData: actions.map(a => ({ classification: a.classification, ...a.extracted }))
    };
    if (result.sender_email && email.fromEmail === 'pasted') {
      updates.fromEmail = result.sender_email;
    }
    if (result.sender_name && !email.fromName) {
      updates.fromName = result.sender_name;
    }
    if (result.subject && email.subject === '(pasted email)') {
      updates.subject = result.subject;
    }
    data.updateInboxEmail(emailId, updates);

    // If lowest confidence is below threshold, mark for review
    const minConfidence = Math.min(...actions.map(a => a.confidence));
    if (minConfidence < 0.7) {
      data.updateInboxEmail(emailId, {
        status: 'review',
        actionSummary: `Low confidence (${Math.round(minConfidence * 100)}%). ${actions.length} action(s) detected. Manual review recommended.`,
        processedAt: new Date().toISOString()
      });
      return;
    }

    // Step 2: Execute all actions
    const summaries = [];
    const actionIds = [];
    const actionTypes = [];

    for (const action of actions) {
      // Guard: check inbox entry wasn't deleted during async processing
      if (!inboxEntryExists(emailId, userId)) {
        console.log(`Inbox entry ${emailId} deleted during processing, aborting remaining actions`);
        return;
      }

      try {
        switch (action.classification) {
          case 'new_contact': {
            const r = await handleNewContact(action.extracted, userId);
            summaries.push(r.summary);
            actionTypes.push(r.type);
            actionIds.push(r.id);
            break;
          }
          case 'consultant_request': {
            const r = await handleConsultantRequest(action.extracted, email, userId, emailId);
            summaries.push(r.summary);
            actionTypes.push(r.type);
            actionIds.push(r.id);
            break;
          }
          case 'todo': {
            const r = await handleTodo(action.extracted, email, userId);
            summaries.push(r.summary);
            actionTypes.push(r.type);
            actionIds.push(r.id);
            break;
          }
          default:
            summaries.push(`Unknown action: ${action.classification}`);
            actionTypes.push(action.classification || 'unknown');
            actionIds.push('');
        }
      } catch (err) {
        // Keep the three arrays aligned: every action must push exactly one
        // entry to summaries, actionTypes and actionIds — otherwise the inbox
        // detail view (which zips them by index) mislabels a failed action with
        // another action's type and drops the other summaries.
        summaries.push(`Error: ${err.message}`);
        actionTypes.push(action.classification || 'error');
        actionIds.push('');
      }
    }

    data.updateInboxEmail(emailId, {
      status: 'completed',
      actionType: actionTypes.join(', '),
      actionId: actionIds.join(', '),
      actionSummary: summaries.join(' | '),
      processedAt: new Date().toISOString()
    });
  }

  async function handleNewContact(extracted, userId) {
    // Check if contact already exists by email
    if (extracted.email) {
      const allContacts = data.getAllContacts(userId);
      const existing = allContacts.find(c =>
        c.email && c.email.toLowerCase() === extracted.email.toLowerCase()
      );
      if (existing) {
        return { type: 'existing_contact', id: existing.id, summary: `Contact "${existing.name}" already exists.` };
      }
    }

    // Find or create company
    let companyId = null;
    if (extracted.company) {
      const companies = data.getAllCompanies(userId);
      const existingCompany = companies.find(c =>
        c.name.toLowerCase() === extracted.company.toLowerCase()
      );
      if (existingCompany) {
        companyId = existingCompany.id;
      } else {
        const newCompany = data.createCompany({
          name: extracted.company,
          technologies: '',
          organizationNumber: '',
          address: ''
        }, userId);
        companyId = newCompany.id;
      }
    } else {
      const companies = data.getAllCompanies(userId);
      let unknownCompany = companies.find(c => c.name === 'Unknown Company');
      if (!unknownCompany) {
        unknownCompany = data.createCompany({
          name: 'Unknown Company',
          technologies: '',
          organizationNumber: '',
          address: ''
        }, userId);
      }
      companyId = unknownCompany.id;
    }

    const contact = data.createContact({
      companyId,
      name: extracted.name || 'Unknown',
      role: extracted.title || '',
      department: extracted.department || '',
      description: extracted.notes || '',
      email: extracted.email || '',
      phone: extracted.phone || ''
    }, userId);

    return { type: 'new_contact', id: contact.id, summary: `Created contact "${contact.name}"${extracted.company ? ' at ' + extracted.company : ''}.` };
  }

  async function handleConsultantRequest(extracted, email, userId, emailId) {
    const request = data.createConsultantRequest({
      title: extracted.title || email.subject || 'Consultant Request',
      description: extracted.description || '',
      requiredSkills: extracted.required_skills || '',
      role: extracted.role || '',
      clientName: extracted.client_name || email.fromName || '',
      clientEmail: extracted.client_email || email.fromEmail,
      urgency: extracted.urgency || 'normal',
      emailInboxId: emailId
    }, userId);

    // Extract resume text for candidates that don't have it yet
    const db = require('../database');
    const teamId = data.getUserTeamId(userId);
    let candidateFiles;
    if (teamId) {
      candidateFiles = db.prepare(`
        SELECT c.id, cf.filename FROM candidates c
        JOIN candidate_files cf ON cf.candidate_id = c.id
        WHERE c.team_id = ? AND (c.resume_text IS NULL OR c.resume_text = '')
      `).all(teamId);
    } else {
      candidateFiles = db.prepare(`
        SELECT c.id, cf.filename FROM candidates c
        JOIN candidate_files cf ON cf.candidate_id = c.id
        WHERE c.created_by = ? AND (c.resume_text IS NULL OR c.resume_text = '')
      `).all(userId);
    }

    for (const cf of candidateFiles) {
      if (uploadsDir && cf.filename) {
        try {
          const text = await extractTextFromFile(path.join(uploadsDir, cf.filename));
          if (text) data.updateCandidateResumeText(cf.id, text);
        } catch (err) {
          console.error(`Resume extract error for ${cf.id}:`, err.message);
        }
      }
    }

    // Match candidates using AI
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

    data.updateConsultantRequest(request.id, { matchedCandidates: matches }, userId);

    const matchSummary = matches.length > 0
      ? ` Matched ${matches.length} candidate(s), best: ${matches[0].score}% fit.`
      : ' No matching candidates found.';

    return { type: 'consultant_request', id: request.id, summary: `Created request "${request.title}".${matchSummary}` };
  }

  async function handleTodo(extracted, email, userId) {
    let linkedType = 'general';
    let linkedId = 'email';

    const allContacts = data.getAllContacts(userId);
    const senderContact = allContacts.find(c =>
      c.email && c.email.toLowerCase() === email.fromEmail.toLowerCase()
    );
    if (senderContact) {
      linkedType = 'contact';
      linkedId = senderContact.id;
    }

    const todo = data.createTodo({
      title: extracted.title || email.subject || 'Task from email',
      description: extracted.description || '',
      dueDate: extracted.due_date || null,
      linkedType,
      linkedId,
      checklistId: null
    }, userId);

    const linkedSummary = senderContact ? ` Linked to "${senderContact.name}".` : '';
    return { type: 'todo', id: todo.id, summary: `Created ToDo "${todo.title}".${linkedSummary}` };
  }

  return router;
};
