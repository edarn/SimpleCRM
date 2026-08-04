const fs = require('fs');
const path = require('path');

// Yield the event loop back to Express between CPU-bound parses.
//
// pdf-parse is pure JS and CPU-bound: it blocks Node's single thread for the
// whole parse. A serial loop over many CVs therefore stalls EVERY user's
// requests — including the POST /api/inbox/simulate that is supposed to return
// immediately. setImmediate lets queued I/O callbacks run between files. It
// does not make an individual parse non-blocking (that needs worker_threads),
// but it caps the stall at one document instead of the whole batch.
function yieldToEventLoop() {
  return new Promise(resolve => setImmediate(resolve));
}

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
    const { PDFParse } = require('pdf-parse');
    const buffer = fs.readFileSync(filePath);
    const parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    return result.text || '';
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

module.exports = { extractTextFromFile, yieldToEventLoop };
