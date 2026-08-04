const express = require('express');
const path = require('path');
const data = require('../data');
const { classifyEmail } = require('../lib/email-classifier');
const { matchCandidates } = require('../lib/candidate-matcher');
const { extractTextFromFile, yieldToEventLoop } = require('../lib/resume-parser');

// Cap on how many un-extracted CVs a single email job will parse inline.
// PDF parsing is CPU-bound and blocks the whole server; an unbounded loop over
// a growing CV library turns every consultant-request email into a multi-minute
// server-wide stall. Anything beyond the cap is picked up by the next job or by
// the explicit "Extract Resumes" button.
const RESUME_BACKFILL_LIMIT = Math.max(0, Number(process.env.RESUME_BACKFILL_LIMIT || 10));

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
      startProcessing(inboxEntry.id, userId);
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

      // The inbox is team-scoped: another member may already have this email in
      // flight. Reject instead of starting a second run that would duplicate
      // every side effect (a second ToDo, a second contact, ...).
      if (email.status === 'processing') {
        return res.status(409).json({ error: 'This email is already being processed.' });
      }

      if (!startProcessing(req.params.id, email.userId)) {
        return res.status(409).json({ error: 'This email is already being processed.' });
      }
      res.json({ message: 'Reprocessing started' });
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

  // POST /api/inbox/extract-resumes - Backfill resume text for candidates that
  // have never been extracted.
  //
  // Runs a bounded batch per call and reports what is left, rather than parsing
  // the entire library inline. The old version awaited every PDF before
  // responding, so with a few hundred CVs the request blocked Node's single
  // thread for minutes — freezing the app for every other user, not just the
  // caller.
  router.post('/extract-resumes', async (req, res) => {
    try {
      const userId = req.session.userId;
      const batchSize = Math.min(
        Math.max(1, Number(req.body?.batchSize) || 25),
        100
      );

      const { extracted, empty, remaining } = await backfillResumeText(userId, batchSize);

      const parts = [`Extracted text from ${extracted} resume(s)`];
      if (empty > 0) parts.push(`${empty} had no extractable content`);
      if (remaining > 0) parts.push(`${remaining} still pending — click again to continue`);

      res.json({
        message: parts.filter(Boolean).join(' — '),
        extracted,
        skipped: empty,
        remaining,
        done: remaining === 0
      });
    } catch (err) {
      console.error('Error extracting resumes:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Extract-and-cache CV text for candidates that have never been attempted.
  //
  // Every candidate processed here ends up with a non-NULL resume_text_status,
  // whether or not text came out. That is the point: .doc files, image-only
  // scans and corrupt PDFs yield '' forever, and the old
  // `WHERE resume_text = ''` condition re-selected them on every single
  // consultant-request email — re-parsing the same unparseable files for the
  // life of the system. Marking them 'empty' makes extraction genuinely
  // once-per-file. Attaching a new CV resets the marker via
  // updateCandidateResumeText.
  //
  // Returns { extracted, empty, remaining }.
  async function backfillResumeText(userId, limit) {
    if (!limit || !uploadsDir) return { extracted: 0, empty: 0, remaining: 0 };

    const candidates = data.getCandidatesNeedingResumeExtraction(userId, limit);
    let extracted = 0;
    let empty = 0;

    for (const c of candidates) {
      const filename = c.file_filename || c.resume_filename;
      let text = '';

      if (filename) {
        try {
          text = await extractTextFromFile(path.join(uploadsDir, filename));
        } catch (err) {
          console.error(`Error extracting resume for ${c.name} (${c.id}):`, err.message);
        }
      }

      // Fall back to the skills field so the candidate is still matchable even
      // when the file itself yields nothing.
      if (!text && c.skills) text = `Skills: ${c.skills}`;

      if (text) {
        data.updateCandidateResumeText(c.id, text);
        extracted++;
      } else {
        data.markCandidateResumeUnextractable(c.id);
        empty++;
      }

      // Hand the thread back to Express between documents so other users'
      // requests are not queued behind the whole batch.
      await yieldToEventLoop();
    }

    const remaining = data.countCandidatesNeedingResumeExtraction(userId);
    return { extracted, empty, remaining };
  }

  // Check if inbox entry still exists (guards against deletion during async processing)
  function inboxEntryExists(emailId, userId) {
    return !!data.getInboxEmailById(emailId, userId);
  }

  // Claim the row, then fire the background job. Returns true if THIS call won
  // the claim; false means another run already owns the email and we must not
  // start a second one (see data.claimInboxEmailForProcessing).
  function startProcessing(emailId, userId) {
    if (!data.claimInboxEmailForProcessing(emailId)) return false;

    processEmail(emailId, userId).catch(err => {
      console.error('Error processing email:', err);
      data.updateInboxEmail(emailId, {
        status: 'failed',
        stage: null,
        errorMessage: err.message,
        processedAt: new Date().toISOString()
      });
    });
    return true;
  }

  // Core email processing logic. The caller has already claimed the row and set
  // status = 'processing'; this function only advances `stage` so the UI can
  // show what it is currently doing instead of a silent multi-minute wait.
  async function processEmail(emailId, userId) {
    const email = data.getInboxEmailById(emailId, userId);
    if (!email) throw new Error('Email not found');

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
        stage: null,
        actionSummary: `Low confidence (${Math.round(minConfidence * 100)}%). ${actions.length} action(s) detected. Manual review recommended.`,
        processedAt: new Date().toISOString()
      });
      return;
    }

    // Step 2: Execute all actions
    data.updateInboxEmail(emailId, { stage: 'executing' });
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
      stage: null,
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
    const fields = {
      title: extracted.title || email.subject || 'Consultant Request',
      description: extracted.description || '',
      requiredSkills: extracted.required_skills || '',
      role: extracted.role || '',
      clientName: extracted.client_name || email.fromName || '',
      clientEmail: extracted.client_email || email.fromEmail,
      urgency: extracted.urgency || 'normal'
    };

    // Idempotent: reprocessing an email must update the request it already
    // created, not spawn a duplicate. Reuse the existing request (preserving its
    // id, matched_candidates and any "Sent" history) if one is linked to this
    // inbox email; otherwise create a fresh one.
    const existing = data.getConsultantRequestByEmailInboxId(emailId, userId);
    let request;
    let verb;
    if (existing) {
      data.updateConsultantRequest(existing.id, fields, userId);
      request = data.getConsultantRequestById(existing.id, userId);
      verb = 'Updated';
    } else {
      request = data.createConsultantRequest({ ...fields, emailInboxId: emailId }, userId);
      verb = 'Created';
    }

    // Backfill resume text for candidates that have never been extracted.
    // Normally a no-op: CVs are parsed once at upload/import and cached in
    // resume_text. This only catches profiles that predate that, or whose
    // extraction was interrupted. Bounded so it can't stall the server.
    if (emailId) data.updateInboxEmail(emailId, { stage: 'extracting_resumes' });
    await backfillResumeText(userId, RESUME_BACKFILL_LIMIT);

    // Match candidates using AI
    if (emailId) data.updateInboxEmail(emailId, { stage: 'matching' });
    const candidates = data.getCandidatesWithResumes(userId);
    let matches = [];
    let evaluatedIds = [];
    if (candidates.length > 0) {
      ({ matches, evaluatedIds } = await matchCandidates({
        title: request.title,
        description: request.description,
        requiredSkills: request.requiredSkills,
        role: request.role
      }, candidates));
    }

    // Merge instead of overwrite: preserves any candidate that inserted itself
    // into this request concurrently (e.g. a profile added while this email was
    // being processed) — see reconcileRequestMatches. Only candidates actually
    // scored are passed as evaluated, so a failed chunk preserves rather than
    // drops its candidates.
    data.reconcileRequestMatches(request.id, evaluatedIds, matches, userId);

    const matchSummary = matches.length > 0
      ? ` Matched ${matches.length} candidate(s), best: ${matches[0].score}% fit.`
      : ' No matching candidates found.';

    return { type: 'consultant_request', id: request.id, summary: `${verb} request "${request.title}".${matchSummary}` };
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
