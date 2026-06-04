const fs = require('fs');
const path = require('path');

// Magic byte signatures for allowed file types
const MAGIC_BYTES = {
  // PDF: %PDF
  pdf: [{ bytes: [0x25, 0x50, 0x44, 0x46] }],
  // DOC: D0 CF 11 E0 (OLE2 compound document — also used by .xls, .ppt)
  doc: [{ bytes: [0xD0, 0xCF, 0x11, 0xE0] }],
  // DOCX: ZIP archive variants (PK header with different version bytes)
  docx: [
    { bytes: [0x50, 0x4B, 0x03, 0x04] }, // Standard ZIP local file header
    { bytes: [0x50, 0x4B, 0x05, 0x06] }, // Empty archive / end of central directory
    { bytes: [0x50, 0x4B, 0x07, 0x08] }, // Spanned archive
  ],
  // PNG: 89 50 4E 47
  png: [{ bytes: [0x89, 0x50, 0x4E, 0x47] }],
  // JPEG: FF D8 FF
  jpg: [{ bytes: [0xFF, 0xD8, 0xFF] }],
  // GIF: GIF87a or GIF89a
  gif: [{ bytes: [0x47, 0x49, 0x46] }],
  // WebP: RIFF....WEBP
  webp: [{ bytes: [0x52, 0x49, 0x46, 0x46] }],
};

function matchesMagicBytes(buffer, signature) {
  if (buffer.length < signature.length) return false;
  for (let i = 0; i < signature.length; i++) {
    if (buffer[i] !== signature[i]) return false;
  }
  return true;
}

// Validate uploaded file's magic bytes match its extension
function validateFileMagic(filePath, originalExt) {
  try {
    const fd = fs.openSync(filePath, 'r');
    const buf = Buffer.alloc(16);
    fs.readSync(fd, buf, 0, 16, 0);
    fs.closeSync(fd);

    const ext = originalExt.toLowerCase();

    // Map extension to expected signature arrays
    const extMap = {
      '.pdf': MAGIC_BYTES.pdf,
      '.doc': MAGIC_BYTES.doc,
      '.docx': MAGIC_BYTES.docx,
      '.png': MAGIC_BYTES.png,
      '.jpg': MAGIC_BYTES.jpg,
      '.jpeg': MAGIC_BYTES.jpg,
      '.gif': MAGIC_BYTES.gif,
      '.webp': MAGIC_BYTES.webp,
    };

    const signatures = extMap[ext];
    if (!signatures) return true; // Unknown extension, skip

    return signatures.some(sig => matchesMagicBytes(buf, sig.bytes));
  } catch (err) {
    console.error('Magic byte validation error:', err.message);
    return false;
  }
}

// Express middleware: validates file after multer uploads it.
// If magic bytes don't match, deletes the file and returns 400.
function validateUploadedFile(fieldName) {
  return (req, res, next) => {
    const file = fieldName ? req.file : req.files?.[0];
    if (!file) return next(); // No file uploaded, skip

    const ext = path.extname(file.originalname).toLowerCase();
    if (!validateFileMagic(file.path, ext)) {
      // Delete the invalid file
      try { fs.unlinkSync(file.path); } catch (_) {}
      return res.status(400).json({ error: 'File content does not match its extension. Upload rejected.' });
    }
    next();
  };
}

module.exports = { validateFileMagic, validateUploadedFile };
