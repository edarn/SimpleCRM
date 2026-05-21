const fs = require('fs');
const path = require('path');

// Magic byte signatures for allowed file types
const MAGIC_BYTES = {
  // PDF: %PDF
  pdf: { bytes: [0x25, 0x50, 0x44, 0x46], ext: '.pdf' },
  // DOC: D0 CF 11 E0 (OLE2 compound document)
  doc: { bytes: [0xD0, 0xCF, 0x11, 0xE0], ext: '.doc' },
  // DOCX/ZIP: PK (50 4B 03 04)
  docx: { bytes: [0x50, 0x4B, 0x03, 0x04], ext: '.docx' },
  // PNG: 89 50 4E 47
  png: { bytes: [0x89, 0x50, 0x4E, 0x47], ext: '.png' },
  // JPEG: FF D8 FF
  jpg: { bytes: [0xFF, 0xD8, 0xFF], ext: '.jpg' },
  // GIF: GIF87a or GIF89a
  gif: { bytes: [0x47, 0x49, 0x46], ext: '.gif' },
  // WebP: RIFF....WEBP
  webp: { bytes: [0x52, 0x49, 0x46, 0x46], ext: '.webp' },
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

    // Map extension to expected magic bytes
    const expectedSignatures = [];
    if (ext === '.pdf') expectedSignatures.push(MAGIC_BYTES.pdf);
    if (ext === '.doc') expectedSignatures.push(MAGIC_BYTES.doc);
    if (ext === '.docx') expectedSignatures.push(MAGIC_BYTES.docx);
    if (ext === '.png') expectedSignatures.push(MAGIC_BYTES.png);
    if (ext === '.jpg' || ext === '.jpeg') expectedSignatures.push(MAGIC_BYTES.jpg);
    if (ext === '.gif') expectedSignatures.push(MAGIC_BYTES.gif);
    if (ext === '.webp') expectedSignatures.push(MAGIC_BYTES.webp);

    if (expectedSignatures.length === 0) return true; // Unknown extension, skip

    return expectedSignatures.some(sig => matchesMagicBytes(buf, sig.bytes));
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
