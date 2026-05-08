// Reads templates/contract-template.docx, replaces {{PLACEHOLDER}} strings in
// word/document.xml with offer values, and returns the assembled .docx as a
// Buffer. The build script (scripts/build-contract-template.js) is what put
// the placeholders in the template in the first place.

const fs = require('fs');
const path = require('path');
const unzipper = require('unzipper');
const archiver = require('archiver');
const { Writable } = require('stream');

const TEMPLATE_PATH = path.join(__dirname, '..', '..', 'templates', 'contract-template.docx');

const PROBATIONARY_CLAUSE = 'Anställningen är en provanställning i 6 månader och under denna tid är uppsägningstiden 2 veckor. Därefter övergår anställningen till en tillsvidare anställning med en uppsägningstid på 1 månad.';
const PERMANENT_CLAUSE = 'Anställningen är en tillsvidareanställning med en uppsägningstid på 1 månad.';

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
 * @param {string} values.candidateName
 * @param {string} values.personalNumber
 * @param {string} values.startDate         e.g. "2026-09-01"
 * @param {string} values.workLocation
 * @param {string} values.department
 * @param {string} values.signLocation
 * @param {string} values.signDate          e.g. "2026-05-07"
 * @param {string} values.signerName
 * @param {string} values.signerTitle
 * @param {number} values.salaryYear
 * @param {number} values.fixedSalary       SEK / month
 * @param {number} values.variablePercentage e.g. 10 for 10 %
 * @param {number} values.estimatedTotal    estimated total annual salary (SEK, net)
 * @returns {Promise<Buffer>} the .docx file as a Buffer
 */
async function renderContractDocx(values) {
  const entries = await readDocxEntries(TEMPLATE_PATH);
  if (!entries['word/document.xml']) {
    throw new Error('Template missing word/document.xml');
  }
  let xml = entries['word/document.xml'].toString('utf8');

  const titleMap = { probationary: 'Provanställning', permanent: 'Tillsvidareanställning' };
  const clauseMap = { probationary: PROBATIONARY_CLAUSE, permanent: PERMANENT_CLAUSE };

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
    '{{ESTIMATED_TOTAL}}': escapeXml(formatSwedishNumber(values.estimatedTotal)),
    '{{SIGN_LOCATION}}': escapeXml(values.signLocation || ''),
    '{{SIGN_DATE}}': escapeXml(values.signDate || ''),
    '{{SIGNER_NAME}}': escapeXml(values.signerName || ''),
    '{{SIGNER_TITLE}}': escapeXml(values.signerTitle || ''),
  };

  for (const [k, v] of Object.entries(replacements)) {
    // Naive global replace; placeholders are unique strings so collisions
    // with body text aren't possible.
    xml = xml.split(k).join(v);
  }

  // Sanity: nothing of the form {{...}} should remain.
  const leftover = xml.match(/\{\{[A-Z_]+\}\}/);
  if (leftover) {
    throw new Error('Unfilled placeholder in contract: ' + leftover[0]);
  }

  entries['word/document.xml'] = Buffer.from(xml, 'utf8');
  return await buildDocxBuffer(entries);
}

module.exports = { renderContractDocx };
