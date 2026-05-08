// One-shot script that turns the original Provanställning Tequamnesh.docx into
// templates/contract-template.docx with consolidated {{PLACEHOLDER}} runs.
//
// The original docx has values fragmented across many <w:t> elements (Word
// splits words on edits / proof markers). To make runtime templating trivial
// ("just string-replace {{NAME}}") we collapse each fragmented sequence into
// a single run that contains the placeholder verbatim.
//
// Strategy: locate each fragmented sequence by its literal anchor text inside
// a <w:t>, then walk outward from that <w:t> to the surrounding <w:r> (and the
// enclosing <w:proofErr> markers when present), and replace that whole span
// with a single clean run that contains the placeholder.

const fs = require('fs');
const path = require('path');
const unzipper = require('unzipper');
const archiver = require('archiver');

const SOURCE = path.join(__dirname, '..', 'variable-salary-calculator-export', 'Provanställning Tequamnesh.docx');
const TARGET_DIR = path.join(__dirname, '..', 'templates');
const TARGET = path.join(TARGET_DIR, 'contract-template.docx');

async function readDocxEntries(filePath) {
  const entries = {};
  const directory = await unzipper.Open.file(filePath);
  for (const f of directory.files) {
    entries[f.path] = await f.buffer();
  }
  return entries;
}

function writeDocx(entries, outPath) {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(outPath);
    const archive = archiver('zip', { zlib: { level: 9 } });
    output.on('close', resolve);
    archive.on('error', reject);
    archive.pipe(output);
    for (const [name, buf] of Object.entries(entries)) {
      archive.append(buf, { name });
    }
    archive.finalize();
  });
}

const BODY_RPR = '<w:rPr><w:rFonts w:asciiTheme="minorHAnsi" w:eastAsia="Times New Roman" w:hAnsiTheme="minorHAnsi" w:cstheme="minorHAnsi"/><w:sz w:val="20"/><w:lang w:eastAsia="sv-SE"/></w:rPr>';

function cleanRun(text, rpr = BODY_RPR) {
  return `<w:r>${rpr}<w:t xml:space="preserve">${text}</w:t></w:r>`;
}

// Find the <w:r> that owns the <w:t> at position tPos (where tPos points to
// the `<` of `<w:t`). Returns [rStart, rEnd] absolute offsets covering the
// entire <w:r ...>...</w:r>, including any immediately surrounding
// <w:proofErr w:type="spellStart"/> before and <w:proofErr w:type="spellEnd"/>
// after that "wrap" the run for spell-checking.
function runSpan(xml, tPos) {
  // Pick the run-opening tag (either `<w:r ` with attrs or `<w:r>` without)
  // closest *before* tPos. Picking only `<w:r ` and falling back to `<w:r>`
  // is wrong because attrless runs can sit between attr'd runs and tPos.
  const rStartA = xml.lastIndexOf('<w:r ', tPos);
  const rStartB = xml.lastIndexOf('<w:r>', tPos);
  const rStart = Math.max(rStartA, rStartB);
  if (rStart === -1) {
    throw new Error('runSpan: no enclosing <w:r found before tPos=' + tPos);
  }
  const rEndIdx = xml.indexOf('</w:r>', tPos);
  const rEnd = rEndIdx + '</w:r>'.length;

  // Expand to wrap surrounding proofErr markers.
  const SPELL_START = '<w:proofErr w:type="spellStart"/>';
  const SPELL_END = '<w:proofErr w:type="spellEnd"/>';
  const GRAM_START = '<w:proofErr w:type="gramStart"/>';
  const GRAM_END = '<w:proofErr w:type="gramEnd"/>';

  let start = rStart;
  let end = rEnd;
  for (const startTag of [SPELL_START, GRAM_START]) {
    if (xml.slice(start - startTag.length, start) === startTag) {
      start -= startTag.length;
    }
  }
  for (const endTag of [SPELL_END, GRAM_END]) {
    if (xml.slice(end, end + endTag.length) === endTag) {
      end += endTag.length;
    }
  }
  return [start, end];
}

// Locate the n-th occurrence of literal `<w:t...>${text}</w:t>` and return
// the absolute offset of the `<w:t` start. `searchFrom` lets us skip prior
// occurrences. Throws if not found.
function findTPos(xml, text, searchFrom = 0) {
  // The text may live inside <w:t> or <w:t xml:space="preserve">.
  const rePlain = `<w:t>${escapeForFind(text)}</w:t>`;
  const rePres = `<w:t xml:space="preserve">${escapeForFind(text)}</w:t>`;
  const idxPlain = xml.indexOf(rePlain, searchFrom);
  const idxPres = xml.indexOf(rePres, searchFrom);
  const candidates = [idxPlain, idxPres].filter((i) => i !== -1);
  if (!candidates.length) {
    throw new Error(`Text not found in XML: ${JSON.stringify(text)} (searchFrom=${searchFrom})`);
  }
  return Math.min(...candidates);
}

function escapeForFind(s) {
  return s; // we use indexOf, no regex escape needed
}

// Replace from runStartPos (the <w:r or surrounding proofErr) through the end
// of the LAST run in a fragmented sequence, identified by the last text in
// `texts`. All texts must appear consecutively in the XML in the order given.
function replaceFragmentedSpan(xml, texts, replacementRun, searchFrom = 0) {
  if (!texts.length) throw new Error('texts must be non-empty');
  // Find first text from searchFrom.
  const firstPos = findTPos(xml, texts[0], searchFrom);
  const [spanStart] = runSpan(xml, firstPos);

  // Walk from firstPos forward to find each subsequent text, ensuring they
  // appear in order. Each must be the next text occurrence beyond the last.
  let cursor = firstPos + 1;
  let lastTPos = firstPos;
  for (let i = 1; i < texts.length; i++) {
    const next = findTPos(xml, texts[i], cursor);
    cursor = next + 1;
    lastTPos = next;
  }
  const [, spanEnd] = runSpan(xml, lastTPos);
  return {
    next: xml.slice(0, spanStart) + replacementRun + xml.slice(spanEnd),
    consumedEnd: spanStart + replacementRun.length,
  };
}

function transformDocumentXml(xml) {
  let out = xml;
  let cursor = 0;

  function apply(label, texts, replacement) {
    const r = replaceFragmentedSpan(out, texts, replacement, cursor);
    out = r.next;
    cursor = r.consumedEnd;
  }

  // 1. Subtitle "Provanställning" (italic, single run).
  apply('TITLE', ['Provanställning'],
    // Keep italic styling for the subtitle by using a tailored rPr.
    `<w:r><w:rPr><w:rFonts w:asciiTheme="majorHAnsi" w:eastAsia="Times New Roman" w:hAnsiTheme="majorHAnsi" w:cs="Arial"/><w:bCs/><w:i/><w:lang w:eastAsia="sv-SE"/></w:rPr><w:t xml:space="preserve">{{TITLE}}</w:t></w:r>`
  );

  // 2. First name occurrence "Tequamnesh" + space + "Niguse" wrapped in spellStart/End.
  apply('CANDIDATE_NAME (intro)', ['Tequamnesh', ' ', 'Niguse'], cleanRun('{{CANDIDATE_NAME}}'));

  // 3. Personal number "YYYMMDD" + "-" + "xxxx".
  apply('PERSONAL_NUMBER', ['YYYMMDD', '-', 'xxxx'], cleanRun('{{PERSONAL_NUMBER}}'));

  // 4. Department "240" + "2".
  apply('DEPARTMENT', ['240', '2'], cleanRun('{{DEPARTMENT}}'));

  // 5. Start date "202" + "6" + "-" + "0" + "X" + "-" + "01".
  apply('START_DATE', ['202', '6', '-', '0', 'X', '-', '01'], cleanRun('{{START_DATE}}'));

  // 6. Work location "Karlskrona" (first occurrence — first paragraph).
  apply('WORK_LOCATION', ['Karlskrona'], cleanRun('{{WORK_LOCATION}}'));

  // 7. Contract clause: 8 fragments.
  apply('CONTRACT_CLAUSE', [
    'Anställningen är en provanställning i 6 månade',
    'r och under denna tid är uppsägningstiden 2 veckor. Därefter övergår anställningen till en ',
    'tillsvidare',
    ' anställning med en ',
    'u',
    'ppsägningstid',
    ' på 1',
    ' månad.',
  ], cleanRun('{{CONTRACT_CLAUSE}}'));

  // 8. Fixed salary "45 000" (appears before the year in the same sentence).
  apply('FIXED_SALARY', ['45 000'], cleanRun('{{FIXED_SALARY}}'));

  // 9. Salary year "20" + "2" + "6".
  apply('SALARY_YEAR', ['20', '2', '6'], cleanRun('{{SALARY_YEAR}}'));

  // 10. Sign location "Karlskrona" (second occurrence, in signature paragraph).
  apply('SIGN_LOCATION', ['Karlskrona'], cleanRun('{{SIGN_LOCATION}}'));

  // 11. Sign date: "den  20" + "2" + "5" + "-" + "01" + "-" + "1" + "7".
  apply('SIGN_DATE', ['den  20', '2', '5', '-', '01', '-', '1', '7'], cleanRun('den {{SIGN_DATE}}'));

  // 12. Second name occurrence in signature table.
  apply('CANDIDATE_NAME (signature)', ['Tequamnesh', ' ', 'Niguse'], cleanRun('{{CANDIDATE_NAME}}'));

  // 13. Signer name "Thomas Hermansson".
  apply('SIGNER_NAME', ['Thomas Hermansson'], cleanRun('{{SIGNER_NAME}}'));

  // 14. Signer title "Vice " + "President, Sigma Technology Software Solution ".
  apply('SIGNER_TITLE', ['Vice ', 'President, Sigma Technology Software Solution '], cleanRun('{{SIGNER_TITLE}}'));

  // 15. Inject the variable-salary clause into the salary paragraph. The run
  // immediately after {{SALARY_YEAR}} contains the rest of that sentence; we
  // splice the new clause between "års lönesamtal." and the existing
  // "(extra lön enligt nedan ej medräknat)" parenthetical.
  const salaryRunOld = ' års lönesamtal. (extra lön enligt nedan ej medräknat)';
  const salaryRunNew =
    ' års lönesamtal. Utöver detta har NN en rörlig lönedel om {{VARIABLE_PERCENTAGE}} % som beräknas enligt bifogad bilaga.' +
    ' Den uppskattade totala årslönen (fast + rörlig, netto) är {{ESTIMATED_TOTAL}} kr. (extra lön enligt nedan ej medräknat)';
  if (!out.includes(salaryRunOld)) {
    throw new Error('Salary clause anchor not found; did the upstream template change?');
  }
  out = out.replace(salaryRunOld, salaryRunNew);

  return out;
}

function verify(xml) {
  const required = [
    '{{TITLE}}', '{{CANDIDATE_NAME}}', '{{PERSONAL_NUMBER}}', '{{DEPARTMENT}}',
    '{{START_DATE}}', '{{WORK_LOCATION}}', '{{CONTRACT_CLAUSE}}', '{{SALARY_YEAR}}',
    '{{FIXED_SALARY}}', '{{VARIABLE_PERCENTAGE}}', '{{ESTIMATED_TOTAL}}',
    '{{SIGN_LOCATION}}', '{{SIGN_DATE}}', '{{SIGNER_NAME}}', '{{SIGNER_TITLE}}',
  ];
  const missing = required.filter((p) => !xml.includes(p));
  if (missing.length) {
    throw new Error('Missing placeholders after transform: ' + missing.join(', '));
  }
  const nameCount = (xml.match(/\{\{CANDIDATE_NAME\}\}/g) || []).length;
  if (nameCount !== 2) {
    throw new Error(`Expected 2 occurrences of {{CANDIDATE_NAME}}, got ${nameCount}`);
  }
  // Make sure no original sample data remains.
  const leaks = ['Tequamnesh', 'YYYMMDD', '45 000', 'Thomas Hermansson', 'Karlskrona'];
  for (const leak of leaks) {
    if (xml.includes(leak)) {
      throw new Error(`Original sample data still present in template: ${leak}`);
    }
  }
}

async function main() {
  if (!fs.existsSync(SOURCE)) {
    throw new Error('Source docx not found at: ' + SOURCE);
  }
  if (!fs.existsSync(TARGET_DIR)) {
    fs.mkdirSync(TARGET_DIR, { recursive: true });
  }

  const entries = await readDocxEntries(SOURCE);
  if (!entries['word/document.xml']) {
    throw new Error('word/document.xml not found in source docx');
  }

  const originalXml = entries['word/document.xml'].toString('utf8');
  const transformedXml = transformDocumentXml(originalXml);
  verify(transformedXml);

  entries['word/document.xml'] = Buffer.from(transformedXml, 'utf8');
  await writeDocx(entries, TARGET);
  console.log('Wrote', TARGET);
}

main().catch((err) => {
  console.error('Build failed:', err.message);
  process.exit(1);
});
