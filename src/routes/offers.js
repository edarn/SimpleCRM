const express = require('express');
const fs = require('fs');
const path = require('path');
const data = require('../data');
const { computeVariableSalary, getWorkingHoursForYear, DEFAULT_VACATION_DAYS, DEFAULT_SALARY_COST_FACTOR, DEFAULT_SOCIAL_FEES_DIVISOR } = require('../lib/salary-model');
const { renderContractDocx, normalizeLanguage } = require('../lib/contract-template');
const { renderOfferPdf } = require('../lib/offer-pdf');
const { buildOutlookDraftEml } = require('../lib/eml-builder');

const DOCX_MIME = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

// Optional third attachment: the salary-model explainer, generated from
// docs/"Lönemodell Fast och Rorlig - Förklaring.docx" by
// scripts/build-salary-model-pdf.js. It is the same static file for every
// offer (and holds both a Swedish and an English version of the text), so it
// is read from templates/ rather than copied into uploads/.
const SALARY_MODEL_PDF = path.join(__dirname, '..', '..', 'templates', 'salary-model-explained.pdf');
const SALARY_MODEL_NAMES = {
  sv: 'Lonemodell_fast_och_rorlig_lon.pdf',
  en: 'Salary_model_fixed_and_variable_pay.pdf',
};

function safeFilenameSegment(s) {
  return String(s || '')
    .normalize('NFKD')
    .replace(/[^\w\d-]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 60) || 'offer';
}

function makeContractName(candidateName, language) {
  const stamp = new Date().toISOString().slice(0, 10);
  const stem = language === 'en' ? 'Employment_contract' : 'Anstallningsavtal';
  return `${stem}_${safeFilenameSegment(candidateName)}_${stamp}.docx`;
}

function makeAttachmentName(candidateName, language) {
  const stamp = new Date().toISOString().slice(0, 10);
  const stem = language === 'en' ? 'Variable_salary_appendix' : 'Rorlig_lon_bilaga';
  return `${stem}_${safeFilenameSegment(candidateName)}_${stamp}.pdf`;
}

function makeEmlName(candidateName, language) {
  const stem = language === 'en' ? 'Offer' : 'Erbjudande';
  return `${stem}_${safeFilenameSegment(candidateName)}.eml`;
}

// Default covering note for the Outlook draft, in the contract's language.
function defaultEmail(offer, language, withSalaryModel) {
  if (language === 'en') {
    const bullets = [
      ' \u2022 Employment contract',
      ' \u2022 Appendix showing how the variable part of the salary is calculated',
    ];
    if (withSalaryModel) bullets.push(' \u2022 An explanation of the salary model');
    return {
      subject: `Employment offer \u2013 ${offer.candidateName}`,
      body:
        `Hi ${offer.candidateName},\n\n` +
        `As discussed, please find your employment offer below.\n` +
        `Attached you will find:\n` +
        bullets.join('\n') + `\n\n` +
        `Let me know if you have any questions.\n\n` +
        `Best regards,\n` +
        `${offer.signerName || ''}`,
    };
  }
  const bullets = [
    ' \u2022 Anställningsavtal',
    ' \u2022 Bilaga som visar hur den rörliga delen av lönen beräknas',
  ];
  if (withSalaryModel) bullets.push(' \u2022 En förklaring av lönemodellen');
  return {
    subject: `Anställningserbjudande \u2013 ${offer.candidateName}`,
    body:
      `Hej ${offer.candidateName},\n\n` +
      `Som diskuterat skickar jag här ditt anställningserbjudande.\n` +
      `Bifogat finner du:\n` +
      bullets.join('\n') + `\n\n` +
      `Hör av dig om du har frågor.\n\n` +
      `Med vänlig hälsning,\n` +
      `${offer.signerName || ''}`,
  };
}

function buildCalculationFromPayload(p) {
  // Caller may have submitted the full set of arrays (from the calculator
  // modal) or just the headline numbers. If maxHours is missing we fall back
  // to the year defaults so the persisted result is consistent with what the
  // PDF will show.
  const year = p.salaryYear || new Date().getFullYear();
  const maxHours = Array.isArray(p.maxHours) && p.maxHours.length === 12
    ? p.maxHours.map(Number)
    : getWorkingHoursForYear(year);
  const vacationDays = Array.isArray(p.vacationDays) && p.vacationDays.length === 12
    ? p.vacationDays.map(Number)
    : [...DEFAULT_VACATION_DAYS];
  const internalHours = Array.isArray(p.internalHours) && p.internalHours.length === 12
    ? p.internalHours.map(Number)
    : new Array(12).fill(0);
  const extraHours = Array.isArray(p.extraHours) && p.extraHours.length === 12
    ? p.extraHours.map(Number)
    : new Array(12).fill(0);

  return computeVariableSalary({
    fixedSalary: Number(p.fixedSalary) || 0,
    expectedRate: Number(p.expectedRate) || 0,
    variablePercentage: Number(p.variablePercentage) || 0,
    maxHours,
    vacationDays,
    internalHours,
    extraHours,
    salaryCostFactor: p.salaryCostFactor != null ? Number(p.salaryCostFactor) : DEFAULT_SALARY_COST_FACTOR,
    socialFeesDivisor: p.socialFeesDivisor != null ? Number(p.socialFeesDivisor) : DEFAULT_SOCIAL_FEES_DIVISOR,
  });
}

module.exports = function (uploadsDir) {
  const router = express.Router({ mergeParams: true });

  // GET /api/candidates/:candidateId/offers
  router.get('/', (req, res) => {
    try {
      const userId = req.session.userId;
      const candidate = data.getCandidateById(req.params.candidateId, userId);
      if (!candidate) return res.status(404).json({ error: 'Candidate not found' });
      const offers = data.getOffersForCandidate(candidate.id, userId);
      res.json(offers);
    } catch (err) {
      console.error('Error listing offers:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // POST /api/candidates/:candidateId/offers
  // Generates contract docx + attachment pdf, persists files + offer row.
  router.post('/', async (req, res) => {
    try {
      const userId = req.session.userId;
      const candidate = data.getCandidateById(req.params.candidateId, userId);
      if (!candidate) return res.status(404).json({ error: 'Candidate not found' });

      const p = req.body || {};
      const required = ['contractType', 'candidateName', 'fixedSalary', 'expectedRate', 'variablePercentage', 'salaryYear'];
      for (const k of required) {
        if (p[k] === undefined || p[k] === null || p[k] === '') {
          return res.status(400).json({ error: `Missing field: ${k}` });
        }
      }
      if (!['probationary', 'permanent'].includes(p.contractType)) {
        return res.status(400).json({ error: 'Invalid contractType' });
      }

      // Page 1 of the contract is Swedish or English; the terms-of-employment
      // appendix is English either way.
      const language = normalizeLanguage(p.language);
      const includeSalaryModel = !!p.includeSalaryModel;

      const calc = buildCalculationFromPayload(p);

      // Render artefacts.
      const contractBuf = await renderContractDocx({
        language,
        contractType: p.contractType,
        candidateName: p.candidateName,
        personalNumber: p.personalNumber,
        startDate: p.startDate,
        workLocation: p.workLocation,
        department: p.department,
        signLocation: p.signLocation || p.workLocation,
        signDate: p.signDate || new Date().toISOString().slice(0, 10),
        signerName: p.signerName,
        signerTitle: p.signerTitle,
        signer2Name: p.signer2Name,
        signer2Title: p.signer2Title,
        salaryYear: p.salaryYear,
        fixedSalary: Number(p.fixedSalary) || 0,
        variablePercentage: Number(p.variablePercentage) || 0,
        estimatedMonthly: calc && calc.yearly ? calc.yearly.averageMonthly : 0,
      });

      const pdfBuf = await renderOfferPdf({
        candidateName: p.candidateName,
        salaryYear: Number(p.salaryYear) || new Date().getFullYear(),
        fixedSalary: Number(p.fixedSalary) || 0,
        expectedRate: Number(p.expectedRate) || 0,
        variablePercentage: Number(p.variablePercentage) || 0,
        calcResult: calc,
      });

      const contractFilename = `offer-${data.generateId()}.docx`;
      const attachmentFilename = `offer-${data.generateId()}.pdf`;
      const contractOriginalName = makeContractName(p.candidateName, language);
      const attachmentOriginalName = makeAttachmentName(p.candidateName, language);

      const contractPath = path.join(uploadsDir, contractFilename);
      const attachmentPath = path.join(uploadsDir, attachmentFilename);
      fs.writeFileSync(contractPath, contractBuf);
      fs.writeFileSync(attachmentPath, pdfBuf);

      let result;
      try {
        result = data.createOffer(candidate.id, {
        contractType: p.contractType,
        candidateName: p.candidateName,
        personalNumber: p.personalNumber,
        startDate: p.startDate,
        workLocation: p.workLocation,
        department: p.department,
        signLocation: p.signLocation || p.workLocation,
        signDate: p.signDate || new Date().toISOString().slice(0, 10),
        signerName: p.signerName,
        signerTitle: p.signerTitle,
        fixedSalary: Number(p.fixedSalary) || 0,
        expectedRate: Number(p.expectedRate) || 0,
        variablePercentage: Number(p.variablePercentage) || 0,
        salaryYear: Number(p.salaryYear) || new Date().getFullYear(),
        calculation: calc,
        language,
        includeSalaryModel,
        contractFilename,
        contractOriginalName,
        attachmentFilename,
        attachmentOriginalName,
        emailSubject: p.emailSubject || '',
        emailBody: p.emailBody || '',
      }, userId);

      } catch (dbErr) {
        // Clean up files if DB insert failed
        try { fs.unlinkSync(contractPath); } catch (_) {}
        try { fs.unlinkSync(attachmentPath); } catch (_) {}
        throw dbErr;
      }

      if (result.error) {
        try { fs.unlinkSync(contractPath); } catch (_) {}
        try { fs.unlinkSync(attachmentPath); } catch (_) {}
        return res.status(400).json({ error: result.error });
      }

      res.status(201).json(result);
    } catch (err) {
      console.error('Error creating offer:', err);
      res.status(500).json({ error: err.message || 'Internal server error' });
    }
  });

  // GET /api/candidates/:candidateId/offers/:offerId/contract
  router.get('/:offerId/contract', (req, res) => {
    try {
      const userId = req.session.userId;
      const offer = data.getOfferById(req.params.candidateId, req.params.offerId, userId);
      if (!offer) return res.status(404).json({ error: 'Offer not found' });
      if (!offer.contractFilename) return res.status(404).json({ error: 'Contract file missing' });
      const filePath = path.join(uploadsDir, offer.contractFilename);
      if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'Contract file not found on disk' });
      const encoded = encodeURIComponent(offer.contractOriginalName || 'contract.docx');
      res.setHeader('Content-Type', DOCX_MIME);
      res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encoded}`);
      res.sendFile(filePath);
    } catch (err) {
      console.error('Error downloading contract:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // GET /api/candidates/:candidateId/offers/:offerId/attachment
  router.get('/:offerId/attachment', (req, res) => {
    try {
      const userId = req.session.userId;
      const offer = data.getOfferById(req.params.candidateId, req.params.offerId, userId);
      if (!offer) return res.status(404).json({ error: 'Offer not found' });
      if (!offer.attachmentFilename) return res.status(404).json({ error: 'Attachment file missing' });
      const filePath = path.join(uploadsDir, offer.attachmentFilename);
      if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'Attachment file not found on disk' });
      const encoded = encodeURIComponent(offer.attachmentOriginalName || 'attachment.pdf');
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encoded}`);
      res.sendFile(filePath);
    } catch (err) {
      console.error('Error downloading attachment:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // GET /api/candidates/:candidateId/offers/:offerId/eml
  // Streams a multipart .eml that opens in Outlook as a draft (X-Unsent: 1)
  // with both files attached.
  router.get('/:offerId/eml', (req, res) => {
    try {
      const userId = req.session.userId;
      const candidate = data.getCandidateById(req.params.candidateId, userId);
      if (!candidate) return res.status(404).json({ error: 'Candidate not found' });
      const offer = data.getOfferById(candidate.id, req.params.offerId, userId);
      if (!offer) return res.status(404).json({ error: 'Offer not found' });

      const contractPath = path.join(uploadsDir, offer.contractFilename);
      const pdfPath = path.join(uploadsDir, offer.attachmentFilename);
      if (!fs.existsSync(contractPath) || !fs.existsSync(pdfPath)) {
        return res.status(404).json({ error: 'Offer files not found on disk' });
      }
      const contractBuf = fs.readFileSync(contractPath);
      const pdfBuf = fs.readFileSync(pdfPath);

      const language = normalizeLanguage(offer.language);
      const attachments = [
        { filename: offer.contractOriginalName, content: contractBuf, contentType: DOCX_MIME },
        { filename: offer.attachmentOriginalName, content: pdfBuf, contentType: 'application/pdf' },
      ];
      // Best effort: a missing explainer must not cost the user their draft.
      let salaryModelAttached = false;
      if (offer.includeSalaryModel && fs.existsSync(SALARY_MODEL_PDF)) {
        attachments.push({
          filename: SALARY_MODEL_NAMES[language],
          content: fs.readFileSync(SALARY_MODEL_PDF),
          contentType: 'application/pdf',
        });
        salaryModelAttached = true;
      }

      const fallback = defaultEmail(offer, language, salaryModelAttached);
      const eml = buildOutlookDraftEml({
        to: candidate.email || '',
        subject: offer.emailSubject || fallback.subject,
        body: offer.emailBody || fallback.body,
        attachments,
      });

      const emlName = makeEmlName(offer.candidateName, language);
      res.setHeader('Content-Type', 'message/rfc822');
      res.setHeader('Content-Disposition', `attachment; filename="${emlName}"`);
      res.send(eml);
    } catch (err) {
      console.error('Error generating .eml:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // GET /api/candidates/:candidateId/offers/:offerId/salary-model
  // The static salary-model explainer PDF, named for the offer's language.
  router.get('/:offerId/salary-model', (req, res) => {
    try {
      const userId = req.session.userId;
      const offer = data.getOfferById(req.params.candidateId, req.params.offerId, userId);
      if (!offer) return res.status(404).json({ error: 'Offer not found' });
      if (!fs.existsSync(SALARY_MODEL_PDF)) {
        return res.status(404).json({ error: 'Salary-model PDF not built; run scripts/build-salary-model-pdf.js' });
      }
      const name = SALARY_MODEL_NAMES[normalizeLanguage(offer.language)];
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(name)}`);
      res.sendFile(SALARY_MODEL_PDF);
    } catch (err) {
      console.error('Error downloading salary-model PDF:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // DELETE /api/candidates/:candidateId/offers/:offerId
  router.delete('/:offerId', (req, res) => {
    try {
      const userId = req.session.userId;
      const result = data.deleteOffer(req.params.candidateId, req.params.offerId, userId);
      if (result.error) {
        const code = result.error === 'Offer not found' ? 404 : 403;
        return res.status(code).json({ error: result.error });
      }
      // Best-effort: remove the artefact files from disk.
      for (const fn of [result.contractFilename, result.attachmentFilename].filter(Boolean)) {
        const p = path.join(uploadsDir, fn);
        try { if (fs.existsSync(p)) fs.unlinkSync(p); } catch (e) { /* ignore */ }
      }
      res.status(204).send();
    } catch (err) {
      console.error('Error deleting offer:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  return router;
};
