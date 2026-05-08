// Builds an RFC-822 message (.eml) that, when opened on Windows, makes Outlook
// open it as a *draft* (because of the X-Unsent: 1 header). The message is
// multipart/mixed so we can include both the contract .docx and the salary
// attachment .pdf as base64 attachments.
//
// Usage from the route:
//
//   const eml = buildOutlookDraftEml({
//     to: candidate.email, subject, body,
//     attachments: [
//       { filename: contractName, content: docxBuffer, contentType: 'application/vnd...' },
//       { filename: pdfName, content: pdfBuffer, contentType: 'application/pdf' },
//     ],
//   });
//   res.setHeader('Content-Type', 'message/rfc822');
//   res.setHeader('Content-Disposition', `attachment; filename="${draftName}.eml"`);
//   res.send(eml);

const CRLF = '\r\n';

function generateBoundary() {
  return '----=_Boundary_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2);
}

// RFC 2047 encoded-word for non-ASCII header values.
function encodeHeader(value) {
  const v = String(value || '');
  // ASCII fast path
  // eslint-disable-next-line no-control-regex
  if (/^[\x00-\x7F]*$/.test(v)) return v;
  return '=?UTF-8?B?' + Buffer.from(v, 'utf8').toString('base64') + '?=';
}

// Encode a base64 string with hard line breaks every 76 chars (RFC 2045).
function base64Wrap(buf) {
  const b64 = buf.toString('base64');
  const lines = [];
  for (let i = 0; i < b64.length; i += 76) lines.push(b64.slice(i, i + 76));
  return lines.join(CRLF);
}

// Encode the body as quoted-printable so non-ASCII characters survive but the
// content stays readable.
function quotedPrintable(text) {
  const buf = Buffer.from(text, 'utf8');
  const out = [];
  let lineLen = 0;
  for (let i = 0; i < buf.length; i++) {
    const b = buf[i];
    let token;
    if (b === 0x0D && buf[i + 1] === 0x0A) {
      out.push(CRLF);
      lineLen = 0;
      i++;
      continue;
    }
    if (b === 0x0A) {
      out.push(CRLF);
      lineLen = 0;
      continue;
    }
    if ((b === 0x09 || b === 0x20) && (buf[i + 1] === 0x0D || buf[i + 1] === 0x0A || i === buf.length - 1)) {
      // Trailing whitespace must be encoded.
      token = '=' + b.toString(16).toUpperCase().padStart(2, '0');
    } else if (b === 0x3D || b < 0x20 || b > 0x7E) {
      token = '=' + b.toString(16).toUpperCase().padStart(2, '0');
    } else {
      token = String.fromCharCode(b);
    }
    if (lineLen + token.length > 75) {
      out.push('=' + CRLF);
      lineLen = 0;
    }
    out.push(token);
    lineLen += token.length;
  }
  return out.join('');
}

/**
 * Build an Outlook-draft .eml message buffer.
 *
 * @param {Object} opts
 * @param {string} [opts.to]                — recipient address
 * @param {string} [opts.from]              — From header (some Outlook versions ignore this for drafts)
 * @param {string} opts.subject
 * @param {string} opts.body                — plain text (UTF-8)
 * @param {Array<{filename:string, content:Buffer, contentType:string}>} [opts.attachments]
 * @returns {Buffer}
 */
function buildOutlookDraftEml(opts) {
  const boundary = generateBoundary();
  const headers = [
    `MIME-Version: 1.0`,
    `X-Unsent: 1`, // Outlook reads this as "open as draft".
    `Date: ${new Date().toUTCString()}`,
  ];
  if (opts.from) headers.push(`From: ${encodeHeader(opts.from)}`);
  if (opts.to) headers.push(`To: ${encodeHeader(opts.to)}`);
  headers.push(`Subject: ${encodeHeader(opts.subject || '')}`);

  const attachments = opts.attachments || [];
  if (attachments.length === 0) {
    headers.push(`Content-Type: text/plain; charset="UTF-8"`);
    headers.push(`Content-Transfer-Encoding: quoted-printable`);
    return Buffer.from(headers.join(CRLF) + CRLF + CRLF + quotedPrintable(opts.body || ''), 'utf8');
  }

  headers.push(`Content-Type: multipart/mixed; boundary="${boundary}"`);

  const parts = [];
  // Body part
  parts.push(
    `--${boundary}${CRLF}` +
    `Content-Type: text/plain; charset="UTF-8"${CRLF}` +
    `Content-Transfer-Encoding: quoted-printable${CRLF}${CRLF}` +
    quotedPrintable(opts.body || '')
  );

  // Attachment parts
  for (const att of attachments) {
    const filename = att.filename || 'attachment.bin';
    const ct = att.contentType || 'application/octet-stream';
    parts.push(
      `--${boundary}${CRLF}` +
      `Content-Type: ${ct}; name="${encodeHeader(filename)}"${CRLF}` +
      `Content-Transfer-Encoding: base64${CRLF}` +
      `Content-Disposition: attachment; filename="${encodeHeader(filename)}"${CRLF}${CRLF}` +
      base64Wrap(att.content)
    );
  }

  const body = parts.join(CRLF) + CRLF + `--${boundary}--${CRLF}`;
  return Buffer.from(headers.join(CRLF) + CRLF + CRLF + body, 'utf8');
}

module.exports = { buildOutlookDraftEml };
