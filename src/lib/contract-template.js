// Reads the contract template for the requested language, replaces
// {{PLACEHOLDER}} strings in word/document.xml with offer values, and returns
// the assembled .docx as a Buffer. The build script
// (scripts/build-contract-template.js) is what put the placeholders in the
// templates in the first place.

const fs = require('fs');
const path = require('path');
const unzipper = require('unzipper');
const archiver = require('archiver');
const { Writable } = require('stream');

// One template per contract language. They share everything from the
// signature table onwards (including the English terms-of-employment
// appendix); only page 1 differs. Both are built by
// scripts/build-contract-template.js.
const TEMPLATE_PATHS = {
  sv: path.join(__dirname, '..', '..', 'templates', 'contract-template.docx'),
  en: path.join(__dirname, '..', '..', 'templates', 'contract-template-en.docx'),
};
const DEFAULT_LANGUAGE = 'sv';
const LANGUAGES = Object.keys(TEMPLATE_PATHS);

// Subtitle under the "ANSTÄLLNINGSAVTAL" / "EMPLOYMENT CONTRACT" heading.
const TITLES = {
  sv: { probationary: 'Provanställning', permanent: 'Tillsvidareanställning' },
  en: { probationary: 'Probationary employment', permanent: 'Permanent employment' },
};

// The sentence that ends clause 1 and spells out the notice periods.
const CLAUSES = {
  sv: {
    probationary: 'Anställningen är en provanställning i 6 månader och under denna tid är uppsägningstiden 2 veckor. Därefter övergår anställningen till en tillsvidare anställning med en uppsägningstid på 1 månad.',
    permanent: 'Anställningen är en tillsvidareanställning med en uppsägningstid på 1 månad.',
  },
  en: {
    probationary: 'The employment is a probationary employment for 6 months, during which the period of notice is 2 weeks. It then becomes a permanent employment (tillsvidareanställning) with a period of notice of 1 month.',
    permanent: 'The employment is a permanent employment (tillsvidareanställning) with a period of notice of 1 month.',
  },
};

function normalizeLanguage(lang) {
  return LANGUAGES.includes(lang) ? lang : DEFAULT_LANGUAGE;
}

// Third signature column in the contract (next to the employee and the signing
// manager). Fixed for every contract unless the caller overrides it.
const DEFAULT_SIGNER2_NAME = 'Toni Risteski';
const DEFAULT_SIGNER2_TITLE = 'President, Sigma Technology Software Solutions AB';

function escapeXml(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatSwedishNumber(n) {
  if (n == null) return '';
  return new Intl.NumberFormat('sv-SE').format(Math.round(n));
}

function formatSwedishPercent(n) {
  if (n == null) return '';
  // Drop trailing ".0" but keep e.g. "12.5".
  const num = Number(n);
  if (!isFinite(num)) return '';
  return new Intl.NumberFormat('sv-SE', { maximumFractionDigits: 2 }).format(num);
}

async function readDocxEntries(filePath) {
  const entries = {};
  const directory = await unzipper.Open.file(filePath);
  for (const f of directory.files) {
    entries[f.path] = await f.buffer();
  }
  return entries;
}

function buildDocxBuffer(entries) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    const sink = new Writable({
      write(chunk, _enc, cb) {
        chunks.push(chunk);
        cb();
      },
    });
    sink.on('finish', () => resolve(Buffer.concat(chunks)));
    sink.on('error', reject);
    const archive = archiver('zip', { zlib: { level: 9 } });
    archive.on('error', reject);
    archive.pipe(sink);
    for (const [name, buf] of Object.entries(entries)) {
      archive.append(buf, { name });
    }
    archive.finalize();
  });
}

/**
 * Render a filled-in employment contract for the given offer values.
 *
 * @param {Object} values
 * @param {'probationary'|'permanent'} values.contractType
 * @param {'sv'|'en'} [values.language]   page-1 language; the appendix is always English
 * @param {string} values.candidateName
 * @param {string} values.personalNumber
 * @param {string} values.startDate         e.g. "2026-09-01"
 * @param {string} values.workLocation
 * @param {string} values.department
 * @param {string} values.signLocation
 * @param {string} values.signDate          e.g. "2026-05-07"
 * @param {string} values.signerName
 * @param {string} values.signerTitle
 * @param {string} [values.signer2Name]  third signatory, defaults to Toni Risteski
 * @param {string} [values.signer2Title] third signatory's title
 * @param {number} values.salaryYear
 * @param {number} values.fixedSalary       SEK / month
 * @param {number} values.variablePercentage e.g. 10 for 10 %
 * @param {number} values.estimatedMonthly  estimated monthly salary, fixed + variable (SEK, gross)
 * @returns {Promise<Buffer>} the .docx file as a Buffer
 */
async function renderContractDocx(values) {
  const language = normalizeLanguage(values.language);
  const entries = await readDocxEntries(TEMPLATE_PATHS[language]);
  if (!entries['word/document.xml']) {
    throw new Error('Template missing word/document.xml');
  }
  let xml = entries['word/document.xml'].toString('utf8');

  const titleMap = TITLES[language];
  const clauseMap = CLAUSES[language];

  const replacements = {
    '{{TITLE}}': escapeXml(titleMap[values.contractType] || values.contractType || ''),
    '{{CANDIDATE_NAME}}': escapeXml(values.candidateName || ''),
    '{{PERSONAL_NUMBER}}': escapeXml(values.personalNumber || ''),
    '{{DEPARTMENT}}': escapeXml(values.department || ''),
    '{{START_DATE}}': escapeXml(values.startDate || ''),
    '{{WORK_LOCATION}}': escapeXml(values.workLocation || ''),
    '{{CONTRACT_CLAUSE}}': escapeXml(clauseMap[values.contractType] || ''),
    '{{SALARY_YEAR}}': escapeXml(String(values.salaryYear || '')),
    '{{FIXED_SALARY}}': escapeXml(formatSwedishNumber(values.fixedSalary)),
    '{{VARIABLE_PERCENTAGE}}': escapeXml(formatSwedishPercent(values.variablePercentage)),
    '{{ESTIMATED_MONTHLY}}': escapeXml(formatSwedishNumber(values.estimatedMonthly)),
    '{{SIGN_LOCATION}}': escapeXml(values.signLocation || ''),
    '{{SIGN_DATE}}': escapeXml(values.signDate || ''),
    '{{SIGNER_NAME}}': escapeXml(values.signerName || ''),
    '{{SIGNER_TITLE}}': escapeXml(values.signerTitle || ''),
    '{{SIGNER2_NAME}}': escapeXml(values.signer2Name || DEFAULT_SIGNER2_NAME),
    '{{SIGNER2_TITLE}}': escapeXml(values.signer2Title || DEFAULT_SIGNER2_TITLE),
  };

  for (const [k, v] of Object.entries(replacements)) {
    // Naive global replace; placeholders are unique strings so collisions
    // with body text aren't possible.
    xml = xml.split(k).join(v);
  }

  // Sanity: nothing of the form {{...}} should remain.
  const leftover = xml.match(/\{\{[A-Z0-9_]+\}\}/);
  if (leftover) {
    throw new Error('Unfilled placeholder in contract: ' + leftover[0]);
  }

  entries['word/document.xml'] = Buffer.from(xml, 'utf8');
  return await buildDocxBuffer(entries);
}

module.exports = {
  renderContractDocx,
  normalizeLanguage,
  LANGUAGES,
  DEFAULT_LANGUAGE,
  DEFAULT_SIGNER2_NAME,
  DEFAULT_SIGNER2_TITLE,
};
