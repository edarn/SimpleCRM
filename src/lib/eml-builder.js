// Builds an RFC-822 message (.eml) that, when opened on Windows, makes Outlook
// open it as a *draft* (because of the X-Unsent: 1 header). Supports both
// plain text and HTML bodies with file attachments.

const CRLF = '\r\n';

function generateBoundary() {
  return '----=_Boundary_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2);
}

// RFC 2047 encoded-word for non-ASCII header values.
function encodeHeader(value) {
  const v = String(value || '');
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

// Encode as quoted-printable for non-ASCII content.
function quotedPrintable(text) {
  const buf = Buffer.from(text, 'utf8');
  const out = [];
  let lineLen = 0;
  for (let i = 0; i < buf.length; i++) {
    const b = buf[i];
    let token;
    if (b === 0x0D && buf[i + 1] === 0x0A) {
      out.push(CRLF); lineLen = 0; i++; continue;
    }
    if (b === 0x0A) {
      out.push(CRLF); lineLen = 0; continue;
    }
    if ((b === 0x09 || b === 0x20) && (buf[i + 1] === 0x0D || buf[i + 1] === 0x0A || i === buf.length - 1)) {
      token = '=' + b.toString(16).toUpperCase().padStart(2, '0');
    } else if (b === 0x3D || b < 0x20 || b > 0x7E) {
      token = '=' + b.toString(16).toUpperCase().padStart(2, '0');
    } else {
      token = String.fromCharCode(b);
    }
    if (lineLen + token.length > 75) {
      out.push('=' + CRLF); lineLen = 0;
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
 * @param {string} [opts.to]         — recipient address
 * @param {string} [opts.from]       — From header
 * @param {string} opts.subject
 * @param {string} [opts.body]       — plain text fallback (UTF-8)
 * @param {string} [opts.htmlBody]   — HTML body (preferred by Outlook)
 * @param {Array<{filename:string, content:Buffer, contentType:string}>} [opts.attachments]
 * @returns {Buffer}
 */
function buildOutlookDraftEml(opts) {
  const mixedBoundary = generateBoundary();
  const altBoundary = generateBoundary();
  const headers = [
    `MIME-Version: 1.0`,
    `X-Unsent: 1`,
    `Date: ${new Date().toUTCString()}`,
  ];
  if (opts.from) headers.push(`From: ${encodeHeader(opts.from)}`);
  if (opts.to) headers.push(`To: ${encodeHeader(opts.to)}`);
  headers.push(`Subject: ${encodeHeader(opts.subject || '')}`);

  const attachments = opts.attachments || [];
  const hasHtml = !!opts.htmlBody;
  const plainText = opts.body || '';

  // No attachments and no HTML — simple plain text
  if (attachments.length === 0 && !hasHtml) {
    headers.push(`Content-Type: text/plain; charset="UTF-8"`);
    headers.push(`Content-Transfer-Encoding: quoted-printable`);
    return Buffer.from(headers.join(CRLF) + CRLF + CRLF + quotedPrintable(plainText), 'utf8');
  }

  headers.push(`Content-Type: multipart/mixed; boundary="${mixedBoundary}"`);

  const parts = [];

  // Body: multipart/alternative (plain + HTML) or just plain
  if (hasHtml) {
    const altPart =
      `--${mixedBoundary}${CRLF}` +
      `Content-Type: multipart/alternative; boundary="${altBoundary}"${CRLF}${CRLF}` +
      `--${altBoundary}${CRLF}` +
      `Content-Type: text/plain; charset="UTF-8"${CRLF}` +
      `Content-Transfer-Encoding: quoted-printable${CRLF}${CRLF}` +
      quotedPrintable(plainText) + CRLF +
      `--${altBoundary}${CRLF}` +
      `Content-Type: text/html; charset="UTF-8"${CRLF}` +
      `Content-Transfer-Encoding: quoted-printable${CRLF}${CRLF}` +
      quotedPrintable(opts.htmlBody) + CRLF +
      `--${altBoundary}--`;
    parts.push(altPart);
  } else {
    parts.push(
      `--${mixedBoundary}${CRLF}` +
      `Content-Type: text/plain; charset="UTF-8"${CRLF}` +
      `Content-Transfer-Encoding: quoted-printable${CRLF}${CRLF}` +
      quotedPrintable(plainText)
    );
  }

  // Attachment parts
  for (const att of attachments) {
    const filename = att.filename || 'attachment.bin';
    const ct = att.contentType || 'application/octet-stream';
    parts.push(
      `--${mixedBoundary}${CRLF}` +
      `Content-Type: ${ct}; name="${encodeHeader(filename)}"${CRLF}` +
      `Content-Transfer-Encoding: base64${CRLF}` +
      `Content-Disposition: attachment; filename="${encodeHeader(filename)}"${CRLF}${CRLF}` +
      base64Wrap(att.content)
    );
  }

  const body = parts.join(CRLF) + CRLF + `--${mixedBoundary}--${CRLF}`;
  return Buffer.from(headers.join(CRLF) + CRLF + CRLF + body, 'utf8');
}

module.exports = { buildOutlookDraftEml };
