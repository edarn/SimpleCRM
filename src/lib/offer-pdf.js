// Renders the variable-salary attachment PDF using pdfkit.
//
// Layout: a one-page (or near one-page) A4 landscape document showing
//   1) header with the candidate name and key inputs (fixed, %, rate, year)
//   2) a 12-month breakdown table (the same rows the calculator displays)
//   3) summary cards with annual fixed / variable / total / monthly average
//
// We use landscape orientation so the 12-month table fits comfortably without
// truncating column labels.

const PDFDocument = require('pdfkit');
const { computeVariableSalary, MONTH_LABELS_SV } = require('./salary-model');

const COLORS = {
  text: '#1f2937',
  muted: '#6b7280',
  border: '#e5e7eb',
  headerBg: '#f3f4f6',
  alt: '#fafafa',
  accent: '#1d4ed8',
  green: '#15803d',
  amber: '#92400e',
};

function fmt(n, digits = 0) {
  if (n == null || !isFinite(n)) return '0';
  return new Intl.NumberFormat('sv-SE', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(Math.round(n));
}

/**
 * Render the salary-attachment PDF and return it as a Buffer.
 *
 * @param {Object} opts
 * @param {string} opts.candidateName
 * @param {string} [opts.role]                  — optional, shown in header
 * @param {number} opts.salaryYear
 * @param {number} opts.fixedSalary
 * @param {number} opts.expectedRate
 * @param {number} opts.variablePercentage
 * @param {Object} opts.calcResult              — output of computeVariableSalary
 * @returns {Promise<Buffer>}
 */
function renderOfferPdf(opts) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4',
      layout: 'landscape',
      margins: { top: 36, bottom: 36, left: 36, right: 36 },
      info: {
        Title: `Rörlig lön — ${opts.candidateName}`,
        Author: 'Sigma Technology Software Solution',
      },
    });
    const chunks = [];
    doc.on('data', (c) => chunks.push(c));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    drawDocument(doc, opts);
    doc.end();
  });
}

function drawDocument(doc, opts) {
  const result = opts.calcResult;
  const pageLeft = doc.page.margins.left;
  const pageRight = doc.page.width - doc.page.margins.right;
  const usableWidth = pageRight - pageLeft;

  // --- Header ---
  doc.fillColor(COLORS.text).font('Helvetica-Bold').fontSize(18);
  doc.text(`Rörlig lön — ${opts.candidateName}`, pageLeft, doc.y);
  doc.moveDown(0.2);
  doc.font('Helvetica').fontSize(10).fillColor(COLORS.muted);
  doc.text(
    `Bilaga till anställningserbjudande. Beräkning enligt Sigma Technology Group's "Rörligtmål"-modell (${opts.salaryYear} års arbetstimmar).`
  );
  doc.moveDown(0.6);

  // --- Inputs row ---
  const inputs = [
    ['Fast månadslön (netto)', `${fmt(opts.fixedSalary)} kr`],
    ['%-sats rörlig (brutto)', `${opts.variablePercentage} %`],
    ['Arvode (kr / tim)', `${fmt(opts.expectedRate)} kr`],
    ['Lönekostnadsfaktor', String(result.inputs.salaryCostFactor)],
    ['Sociala avgifter (divisor)', String(result.inputs.socialFeesDivisor)],
  ];
  drawKeyValueRow(doc, inputs, pageLeft, doc.y, usableWidth);
  doc.moveDown(0.8);

  // --- Monthly table ---
  drawMonthlyTable(doc, result, pageLeft, doc.y, usableWidth);
  doc.moveDown(0.6);

  // --- Info note ---
  doc.font('Helvetica-Oblique').fontSize(9).fillColor(COLORS.amber);
  doc.text(
    'Semestertillägg på rörlig lön betalas som klumpsumma i april och beräknas enligt procentregeln (12 % av årets rörliga bruttolön).',
    pageLeft,
    doc.y,
    { width: usableWidth }
  );
  doc.moveDown(0.6);

  // --- Summary cards ---
  drawSummaryCards(doc, result, opts.variablePercentage, pageLeft, doc.y, usableWidth);
}

function drawKeyValueRow(doc, items, x, y, width) {
  const colW = width / items.length;
  const padX = 8;
  const rowH = 32;
  doc.save();
  doc.lineWidth(0.5).strokeColor(COLORS.border);
  for (let i = 0; i < items.length; i++) {
    const cx = x + i * colW;
    doc.rect(cx, y, colW, rowH).stroke();
    const [label, value] = items[i];
    doc.font('Helvetica').fontSize(8).fillColor(COLORS.muted);
    doc.text(label, cx + padX, y + 5, { width: colW - 2 * padX });
    doc.font('Helvetica-Bold').fontSize(11).fillColor(COLORS.text);
    doc.text(value, cx + padX, y + 16, { width: colW - 2 * padX });
  }
  doc.restore();
  doc.y = y + rowH;
}

function drawMonthlyTable(doc, result, x, y, width) {
  // Columns: Label + 12 months + Summa = 14
  const labelColW = 165;
  const sumColW = 70;
  const monthColW = (width - labelColW - sumColW) / 12;
  const headerH = 18;
  const rowH = 16;

  const rows = [
    { label: 'Max ord. timmar', values: result.months.map((m) => m.maxHours), total: sum(result.months, 'maxHours'), money: false },
    { label: 'Semesterdagar', values: result.months.map((m) => m.vacationDays), total: sum(result.months, 'vacationDays'), money: false },
    { label: 'Totalt antal timmar', values: result.months.map((m) => m.totalHours), total: sum(result.months, 'totalHours'), money: false },
    { label: 'Arvode / månad', values: result.months.map((m) => m.revenue), total: sum(result.months, 'revenue'), money: true },
    { label: '− Lönekostnad (profit)', values: result.months.map((m) => m.profit), total: sum(result.months, 'profit'), money: true, tone: 'muted' },
    { label: 'Rörlig lön brutto', values: result.months.map((m) => m.variableGross), total: sum(result.months, 'variableGross'), money: true },
    { label: 'Rörlig lön netto', values: result.months.map((m) => m.variableNet), total: sum(result.months, 'variableNet'), money: true, tone: 'green' },
    { label: 'Semestertillägg rörlig (Apr)', values: result.months.map((m) => m.semesterSupplementNet), total: result.yearly.semesterSupplementNet, money: true, tone: 'green' },
    { label: 'Fast + rörlig (netto, inkl. sem.tillägg)', values: result.months.map((m) => m.total), total: result.yearly.total, money: true, tone: 'strong' },
  ];

  // Header
  doc.save();
  doc.lineWidth(0.5).strokeColor(COLORS.border);
  doc.rect(x, y, width, headerH).fillAndStroke(COLORS.headerBg, COLORS.border);
  doc.fillColor(COLORS.muted).font('Helvetica-Bold').fontSize(8);
  doc.text('Rad', x + 6, y + 5, { width: labelColW - 12 });
  for (let i = 0; i < 12; i++) {
    doc.text(MONTH_LABELS_SV[i], x + labelColW + i * monthColW, y + 5, { width: monthColW - 4, align: 'right' });
  }
  doc.fillColor(COLORS.text).text('Summa', x + labelColW + 12 * monthColW, y + 5, { width: sumColW - 6, align: 'right' });
  doc.restore();

  // Rows
  let rowY = y + headerH;
  doc.lineWidth(0.5).strokeColor(COLORS.border);
  for (let r = 0; r < rows.length; r++) {
    const row = rows[r];
    if (r % 2 === 0) {
      doc.rect(x, rowY, width, rowH).fillAndStroke(COLORS.alt, COLORS.border);
    } else {
      doc.rect(x, rowY, width, rowH).stroke();
    }
    const cellColor =
      row.tone === 'green' ? COLORS.green :
      row.tone === 'strong' ? COLORS.accent :
      row.tone === 'muted' ? COLORS.muted :
      COLORS.text;
    doc.fillColor(COLORS.text).font('Helvetica').fontSize(8);
    doc.text(row.label, x + 6, rowY + 4, { width: labelColW - 12 });
    doc.fillColor(cellColor).font(row.tone === 'strong' ? 'Helvetica-Bold' : 'Helvetica').fontSize(8);
    for (let i = 0; i < 12; i++) {
      doc.text(fmt(row.values[i]), x + labelColW + i * monthColW, rowY + 4, { width: monthColW - 4, align: 'right' });
    }
    doc.font('Helvetica-Bold');
    doc.text(fmt(row.total), x + labelColW + 12 * monthColW, rowY + 4, { width: sumColW - 6, align: 'right' });
    rowY += rowH;
  }

  doc.y = rowY;
}

function drawSummaryCards(doc, result, variablePct, x, y, width) {
  const cards = [
    { label: 'ÅRSLÖN FAST', value: `${fmt(result.yearly.annualFixed)} kr`, hint: '12 × fast månadslön' },
    { label: 'ÅRSLÖN RÖRLIG (NETTO)', value: `${fmt(result.yearly.variableNet + result.yearly.semesterSupplementNet)} kr`, hint: `${variablePct} % av årets profit + sem.tillägg`, accent: 'green' },
    { label: 'TOTAL ÅRSLÖN (NETTO)', value: `${fmt(result.yearly.total)} kr`, hint: 'Fast + rörlig + sem.tillägg', accent: 'blue' },
    { label: 'SNITTLÖN / MÅN', value: `${fmt(result.yearly.averageMonthly)} kr`, hint: 'Inkl. rörlig del' },
  ];
  const colW = (width - 12) / 4;
  const cardH = 56;
  for (let i = 0; i < cards.length; i++) {
    const cx = x + i * (colW + 4);
    doc.save();
    doc.lineWidth(0.5).strokeColor(COLORS.border);
    doc.rect(cx, y, colW, cardH).fillAndStroke('#ffffff', COLORS.border);
    doc.fillColor(COLORS.muted).font('Helvetica-Bold').fontSize(7);
    doc.text(cards[i].label, cx + 10, y + 7, { width: colW - 20 });
    const valueColor =
      cards[i].accent === 'green' ? COLORS.green :
      cards[i].accent === 'blue' ? COLORS.accent :
      COLORS.text;
    doc.fillColor(valueColor).font('Helvetica-Bold').fontSize(16);
    doc.text(cards[i].value, cx + 10, y + 18, { width: colW - 20 });
    doc.fillColor(COLORS.muted).font('Helvetica').fontSize(7);
    doc.text(cards[i].hint, cx + 10, y + 40, { width: colW - 20 });
    doc.restore();
  }
  doc.y = y + cardH;
}

function sum(months, key) {
  return months.reduce((a, m) => a + (m[key] || 0), 0);
}

module.exports = { renderOfferPdf };
