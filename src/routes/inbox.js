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

  // Core email processing logic
  async function processEmail(emailId, userId) {
    const email = data.getInboxEmailById(emailId, userId);
    if (!email) throw new Error('Email not found');

    data.updateInboxEmail(emailId, { status: 'processing' });

    // Step 1: Classify the email using AI
    const classification = await classifyEmail({
      fromEmail: email.fromEmail,
      fromName: email.fromName,
      subject: email.subject,
      body: email.body
    });

    // Update with classification results and AI-extracted sender info
    const updates = {
      classification: classification.classification,
      confidence: classification.confidence,
      extractedData: classification.extracted
    };
    // If the AI extracted better sender/subject info, update those too
    if (classification.sender_email && email.fromEmail === 'pasted') {
      updates.fromEmail = classification.sender_email;
    }
    if (classification.sender_name && !email.fromName) {
      updates.fromName = classification.sender_name;
    }
    if (classification.subject && email.subject === '(pasted email)') {
      updates.subject = classification.subject;
    }
    data.updateInboxEmail(emailId, updates);

    // If confidence is low, mark for review
    if (classification.confidence < 0.7) {
      data.updateInboxEmail(emailId, {
        status: 'review',
        actionSummary: `Low confidence (${Math.round(classification.confidence * 100)}%). Manual review recommended.`,
        processedAt: new Date().toISOString()
      });
      return;
    }

    // Step 2: Execute the appropriate action
    const ext = classification.extracted;

    switch (classification.classification) {
      case 'new_contact':
        await handleNewContact(emailId, ext, userId);
        break;
      case 'consultant_request':
        await handleConsultantRequest(emailId, ext, email, userId);
        break;
      case 'todo':
        await handleTodo(emailId, ext, email, userId);
        break;
      default:
        data.updateInboxEmail(emailId, {
          status: 'failed',
          errorMessage: `Unknown classification: ${classification.classification}`,
          processedAt: new Date().toISOString()
        });
    }
  }

  async function handleNewContact(emailId, extracted, userId) {
    // Check if contact already exists by email
    if (extracted.email) {
      const allContacts = data.getAllContacts(userId);
      const existing = allContacts.find(c =>
        c.email && c.email.toLowerCase() === extracted.email.toLowerCase()
      );
      if (existing) {
        data.updateInboxEmail(emailId, {
          status: 'completed',
          actionType: 'existing_contact',
          actionId: existing.id,
          actionSummary: `Contact "${existing.name}" already exists with this email.`,
          processedAt: new Date().toISOString()
        });
        return;
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
      // Need a company - create a placeholder
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

    data.updateInboxEmail(emailId, {
      status: 'completed',
      actionType: 'new_contact',
      actionId: contact.id,
      actionSummary: `Created contact "${contact.name}"${extracted.company ? ' at ' + extracted.company : ''}.`,
      processedAt: new Date().toISOString()
    });
  }

  async function handleConsultantRequest(emailId, extracted, email, userId) {
    // Create the consultant request
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

    data.updateConsultantRequest(request.id, {
      matchedCandidates: matches
    }, userId);

    const matchSummary = matches.length > 0
      ? ` Matched ${matches.length} candidate(s), best: ${matches[0].score}% fit.`
      : ' No matching candidates found.';

    data.updateInboxEmail(emailId, {
      status: 'completed',
      actionType: 'consultant_request',
      actionId: request.id,
      actionSummary: `Created request "${request.title}".${matchSummary}`,
      processedAt: new Date().toISOString()
    });
  }

  async function handleTodo(emailId, extracted, email, userId) {
    // Try to match sender to a contact
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

    const linkedSummary = senderContact
      ? ` Linked to contact "${senderContact.name}".`
      : '';

    data.updateInboxEmail(emailId, {
      status: 'completed',
      actionType: 'todo',
      actionId: todo.id,
      actionSummary: `Created ToDo "${todo.title}".${linkedSummary}`,
      processedAt: new Date().toISOString()
    });
  }

  return router;
};
