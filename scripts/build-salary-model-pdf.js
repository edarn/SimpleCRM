#!/usr/bin/env node
// One-shot script that renders docs/"Lönemodell Fast och Rorlig - Förklaring.docx"
// as templates/salary-model-explained.pdf.
//
// The PDF is the optional third attachment on an employment offer (see
// src/routes/offers.js). The Word file is the source of truth, so when it is
// edited, re-run this script and commit the regenerated PDF.
//
// There is no LibreOffice/Word on the server, so this walks word/document.xml
// itself and repaints the document with pdfkit. The source uses only the
// handful of constructs handled below — Heading1/2/3, bulleted list
// paragraphs, bordered 3-column tables and one full-page screenshot — and the
// script throws if it meets anything it cannot place.

const fs = require('fs');
const path = require('path');
const unzipper = require('unzipper');
const PDFDocument = require('pdfkit');

const SOURCE = path.join(__dirname, '..', 'docs', 'Lönemodell Fast och Rorlig - Förklaring.docx');
const TARGET = path.join(__dirname, '..', 'templates', 'salary-model-explained.pdf');

const COLORS = {
  text: '#1f2937',
  muted: '#6b7280',
  heading: '#111827',
  border: '#d1d5db',
  headerBg: '#1f3864',
  headerText: '#ffffff',
};

// pdfkit's built-in Helvetica is WinAnsi-encoded, so the few typographic
// characters outside that set have to be folded down to something it can draw.
const CHAR_FALLBACKS = {
  '−': '-',    // minus sign
  '≈': 'ca ',  // almost equal to
  '→': '->',   // rightwards arrow
  '≤': '<=',
  '≥': '>=',
  ' ': ' ',    // non-breaking space
  ' ': ' ',    // thin space
  ' ': ' ',    // narrow no-break space
};

function toWinAnsi(s) {
  let out = String(s);
  for (const [from, to] of Object.entries(CHAR_FALLBACKS)) {
    out = out.split(from).join(to);
  }
  return out;
}

function unescapeXml(s) {
  return String(s)
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&amp;/g, '&');
}

// --- docx parsing -----------------------------------------------------------

async function readEntry(filePath, name) {
  const directory = await unzipper.Open.file(filePath);
  const file = directory.files.find((f) => f.path === name);
  if (!file) throw new Error(`${name} not found in ${path.basename(filePath)}`);
  return await file.buffer();
}

// Find the end of the element that starts at `start` (which must point at its
// opening "<"), counting nested opens of the same tag. Empty paragraphs are
// written as self-closing `<w:p .../>`, which ends the element right there.
function elementEnd(xml, start, tag) {
  const openRe = new RegExp(`<${tag}(?:\\s[^>]*?)?\\s*(/?)>`, 'g');
  const closeTag = `</${tag}>`;
  let depth = 0;
  let pos = start;
  for (;;) {
    openRe.lastIndex = pos;
    const open = openRe.exec(xml);
    const close = xml.indexOf(closeTag, pos);
    if (open && (close === -1 || open.index < close)) {
      pos = open.index + open[0].length;
      if (open[1] !== '/') depth++;
      else if (depth === 0) return pos;
      continue;
    }
    if (close === -1) throw new Error(`Unterminated <${tag}> at ${start}`);
    depth--;
    pos = close + closeTag.length;
    if (depth === 0) return pos;
  }
}

// Runs of one paragraph: [{ text, bold, italic }]. <w:tab/> and <w:br/> become
// whitespace; a <w:drawing> makes the paragraph an image paragraph instead.
function parseRuns(paraXml) {
  const runs = [];
  const re = /<w:r(?: [^>]*)?>([\s\S]*?)<\/w:r>/g;
  let m;
  while ((m = re.exec(paraXml))) {
    const runXml = m[1];
    const rPr = (runXml.match(/<w:rPr>([\s\S]*?)<\/w:rPr>/) || [])[1] || '';
    const bold = /<w:b\/>|<w:b /.test(rPr);
    const italic = /<w:i\/>|<w:i /.test(rPr);
    let text = '';
    const partRe = /<w:t(?: [^>]*)?>([\s\S]*?)<\/w:t>|<w:tab\/>|<w:br\/>/g;
    let p;
    while ((p = partRe.exec(runXml))) {
      text += p[1] === undefined ? ' ' : unescapeXml(p[1]);
    }
    if (!text) continue;
    // Word splits text across runs on every edit; stitching the fragments back
    // together keeps each paragraph to as few text() calls as its formatting
    // actually needs.
    const prev = runs[runs.length - 1];
    if (prev && prev.bold === bold && prev.italic === italic) prev.text += toWinAnsi(text);
    else runs.push({ text: toWinAnsi(text), bold, italic });
  }
  return runs;
}

function parseParagraph(paraXml) {
  const pPr = (paraXml.match(/<w:pPr>([\s\S]*?)<\/w:pPr>/) || [])[1] || '';
  const style = (pPr.match(/<w:pStyle w:val="([^"]+)"/) || [])[1] || '';
  const bullet = /<w:numPr>/.test(pPr);
  if (/<w:drawing>/.test(paraXml)) return { kind: 'image' };
  return { kind: 'paragraph', style, bullet, runs: parseRuns(paraXml) };
}

function parseTable(tblXml) {
  const widths = [...tblXml.matchAll(/<w:gridCol w:w="(\d+)"\/>/g)].map((m) => Number(m[1]));
  const rows = [];
  const rowRe = /<w:tr(?: [^>]*)?>/g;
  let m;
  while ((m = rowRe.exec(tblXml))) {
    const end = elementEnd(tblXml, m.index, 'w:tr');
    const rowXml = tblXml.slice(m.index, end);
    rowRe.lastIndex = end;

    const cells = [];
    const cellRe = /<w:tc>/g;
    let c;
    while ((c = cellRe.exec(rowXml))) {
      const cEnd = elementEnd(rowXml, c.index, 'w:tc');
      const cellXml = rowXml.slice(c.index, cEnd);
      cellRe.lastIndex = cEnd;

      const tcPr = (cellXml.match(/<w:tcPr>([\s\S]*?)<\/w:tcPr>/) || [])[1] || '';
      const fill = (tcPr.match(/<w:shd[^>]*w:fill="([0-9A-Fa-f]{6})"/) || [])[1] || null;

      // Each paragraph in the cell stays a line of its own: the "Jämförelse" /
      // "Comparison" call-outs are single-cell tables holding four of them.
      const paras = [];
      const paraRe = /<w:p(?: [^>]*)?>/g;
      let pm;
      while ((pm = paraRe.exec(cellXml))) {
        const pEnd = elementEnd(cellXml, pm.index, 'w:p');
        const runs = parseRuns(cellXml.slice(pm.index, pEnd));
        paraRe.lastIndex = pEnd;
        if (runs.length) paras.push({ text: runs.map((r) => r.text).join(''), bold: runs.some((r) => r.bold) });
      }
      cells.push({ paras, fill: fill && fill.toLowerCase() !== 'auto' ? '#' + fill : null });
    }
    rows.push({ cells, header: /<w:tblHeader\/>/.test(rowXml) });
  }
  return { kind: 'table', widths, rows };
}

// Top-level blocks of <w:body>, in document order.
function parseBody(xml) {
  const bodyStart = xml.indexOf('<w:body>');
  if (bodyStart === -1) throw new Error('No <w:body> in document.xml');
  const body = xml.slice(bodyStart + '<w:body>'.length, xml.lastIndexOf('</w:body>'));

  const blocks = [];
  let pos = 0;
  for (;;) {
    const pMatch = /<w:p(?: [^>]*)?>/g;
    pMatch.lastIndex = pos;
    const nextP = pMatch.exec(body);
    const nextTbl = body.indexOf('<w:tbl>', pos);
    if (!nextP && nextTbl === -1) break;

    if (nextTbl !== -1 && (!nextP || nextTbl < nextP.index)) {
      const end = elementEnd(body, nextTbl, 'w:tbl');
      blocks.push(parseTable(body.slice(nextTbl, end)));
      pos = end;
    } else {
      const end = elementEnd(body, nextP.index, 'w:p');
      blocks.push(parseParagraph(body.slice(nextP.index, end)));
      pos = end;
    }
  }
  return blocks;
}

// --- rendering --------------------------------------------------------------

const STYLES = {
  Heading1: { size: 18, bold: true, before: 0, after: 8, color: COLORS.heading },
  Heading2: { size: 13.5, bold: true, before: 14, after: 5, color: COLORS.heading },
  Heading3: { size: 11, bold: true, before: 10, after: 4, color: COLORS.heading },
  '': { size: 10, bold: false, before: 0, after: 7, color: COLORS.text },
};

function fontFor(bold, italic) {
  if (bold && italic) return 'Helvetica-BoldOblique';
  if (bold) return 'Helvetica-Bold';
  if (italic) return 'Helvetica-Oblique';
  return 'Helvetica';
}

// Draw runs as one flowing paragraph, switching fonts mid-line.
function drawRuns(doc, runs, x, width, base) {
  const parts = runs.length ? runs : [{ text: '' }];
  let y = doc.y;
  for (let i = 0; i < parts.length; i++) {
    const r = parts[i];
    doc.font(fontFor(r.bold || base.bold, r.italic))
      .fontSize(base.size)
      .fillColor(base.color || COLORS.text);
    doc.text(r.text, i === 0 ? x : undefined, i === 0 ? y : undefined, {
      width,
      continued: i < parts.length - 1,
      lineGap: 1,
    });
  }
}

// Is a hex fill dark enough that text on it has to be white?
function isDarkFill(hex) {
  if (!hex) return false;
  const n = parseInt(hex.slice(1), 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  return (0.299 * r + 0.587 * g + 0.114 * b) < 140;
}

function drawTable(doc, table, x, width) {
  const totalGrid = table.widths.reduce((a, b) => a + b, 0) || 1;
  const colWidths = table.widths.map((w) => (w / totalGrid) * width);
  const padX = 7;
  const padY = 6;
  const paraGap = 3;
  const size = 9;

  const header = table.rows.find((r) => r.header) || table.rows[0];

  // Every paragraph is drawn with exactly the call it was measured with, so a
  // row never overflows the height reserved for it.
  const paraHeight = (para, bold, w) => {
    doc.font(fontFor(bold || para.bold, false)).fontSize(size);
    return doc.heightOfString(para.text || ' ', { width: w, lineGap: 1 });
  };
  const cellHeight = (cell, bold, w) =>
    cell.paras.reduce((h, para, i) => h + (i ? paraGap : 0) + paraHeight(para, bold, w), 0);

  const drawRow = (row, isHeader) => {
    const bold = isHeader;
    const heights = row.cells.map((cell, i) => cellHeight(cell, bold, (colWidths[i] || width) - 2 * padX));
    const rowH = Math.max(...heights, 12) + 2 * padY;

    if (doc.y + rowH > doc.page.height - doc.page.margins.bottom) {
      doc.addPage();
      if (!isHeader && header !== row) drawRow(header, true);
    }

    const y = doc.y;
    let cx = x;
    for (let i = 0; i < row.cells.length; i++) {
      const cell = row.cells[i];
      const cw = colWidths[i] || width;
      const fill = cell.fill || (isHeader ? COLORS.headerBg : '#ffffff');
      const color = isDarkFill(fill) ? COLORS.headerText : COLORS.text;

      doc.save().lineWidth(0.5).strokeColor(COLORS.border);
      doc.rect(cx, y, cw, rowH).fillAndStroke(fill, COLORS.border);
      doc.restore();

      let cy = y + padY;
      for (const para of cell.paras) {
        doc.font(fontFor(bold || para.bold, false)).fontSize(size).fillColor(color);
        doc.text(para.text, cx + padX, cy, { width: cw - 2 * padX, lineGap: 1 });
        cy += paraHeight(para, bold, cw - 2 * padX) + paraGap;
      }
      cx += cw;
    }
    doc.y = y + rowH;
  };

  for (const row of table.rows) drawRow(row, row.header);
  doc.y += 8;
  doc.x = x;
}

function render(blocks, imageBuffer) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 56, bottom: 56, left: 56, right: 56 },
      info: {
        Title: 'Lönemodell – Fast och rörlig lön / Salary Model – Fixed and Variable Pay',
        Author: 'Sigma Technology Software Solution',
      },
      autoFirstPage: true,
    });
    const chunks = [];
    doc.on('data', (c) => chunks.push(c));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const x = doc.page.margins.left;
    const width = doc.page.width - doc.page.margins.left - doc.page.margins.right;
    let firstHeading = true;

    for (const block of blocks) {
      if (block.kind === 'table') {
        drawTable(doc, block, x, width);
        continue;
      }
      if (block.kind === 'image') {
        // The screenshot is a landscape page of its own in the source too.
        doc.addPage({ size: 'A4', layout: 'landscape', margins: { top: 36, bottom: 36, left: 36, right: 36 } });
        const iw = doc.page.width - 72;
        const ih = doc.page.height - 72;
        doc.image(imageBuffer, 36, 36, { fit: [iw, ih], align: 'center', valign: 'center' });
        continue;
      }

      const style = STYLES[block.style] || STYLES[''];
      if (!block.runs.length) {
        doc.y += 4;
        continue;
      }
      // A Heading1 starts a fresh page (the file holds a Swedish and an
      // English version of the same document).
      if (block.style === 'Heading1' && !firstHeading) doc.addPage();
      if (block.style === 'Heading1') firstHeading = false;

      doc.y += style.before;
      if (block.bullet) {
        doc.font('Helvetica').fontSize(style.size).fillColor(COLORS.muted);
        doc.text('•', x + 6, doc.y, { width: 10, continued: false });
        doc.y -= doc.currentLineHeight();
        drawRuns(doc, block.runs, x + 20, width - 20, style);
      } else {
        drawRuns(doc, block.runs, x, width, style);
      }
      doc.y += style.after;
      doc.x = x;
    }

    doc.end();
  });
}

async function main() {
  if (!fs.existsSync(SOURCE)) throw new Error('Source docx not found at: ' + SOURCE);

  const xml = (await readEntry(SOURCE, 'word/document.xml')).toString('utf8');
  const image = await readEntry(SOURCE, 'word/media/image1.png');
  const blocks = parseBody(xml);

  const headings = blocks.filter((b) => b.kind === 'paragraph' && b.style === 'Heading1').length;
  const tables = blocks.filter((b) => b.kind === 'table').length;
  const images = blocks.filter((b) => b.kind === 'image').length;
  if (headings !== 2 || tables !== 8 || images !== 1) {
    throw new Error(`Unexpected source structure: ${headings} H1, ${tables} tables, ${images} images `
      + '— check docs/"Lönemodell Fast och Rorlig - Förklaring.docx" and adjust this script.');
  }

  const pdf = await render(blocks, image);
  fs.writeFileSync(TARGET, pdf);
  console.log('Wrote', TARGET, `(${(pdf.length / 1024).toFixed(0)} kB)`);
}

main().catch((err) => {
  console.error('Build failed:', err.message);
  process.exit(1);
});
