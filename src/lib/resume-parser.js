const fs = require('fs');
const path = require('path');

async function extractTextFromFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();

  if (ext === '.pdf') {
    return extractFromPDF(filePath);
  } else if (ext === '.docx') {
    return extractFromDOCX(filePath);
  } else if (ext === '.doc') {
    // .doc is a binary format - mammoth doesn't handle it well
    // Return empty and log warning
    console.warn('Cannot extract text from .doc files (binary format):', filePath);
    return '';
  }

  return '';
}

async function extractFromPDF(filePath) {
  try {
    const pdfParse = require('pdf-parse');
    const buffer = fs.readFileSync(filePath);
    const data = await pdfParse(buffer);
    return data.text || '';
  } catch (err) {
    console.error('Error extracting PDF text:', err.message);
    return '';
  }
}

async function extractFromDOCX(filePath) {
  try {
    const mammoth = require('mammoth');
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value || '';
  } catch (err) {
    console.error('Error extracting DOCX text:', err.message);
    return '';
  }
}

module.exports = { extractTextFromFile };
