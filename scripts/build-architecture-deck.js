// Builds docs/SimpleCRM-arkitektur.pptx — an architecture deck with tech
// choices and box-and-arrow diagrams.
//
// pptxgenjs is not a project dependency (this is a docs tool, not runtime
// code). Install it on demand:
//
//   npm i --no-save pptxgenjs && node scripts/build-architecture-deck.js
//
// Layout is 16:9 = 13.333 x 7.5 inches; every coordinate below is in inches.

const path = require('path');
const PptxGenJS = require('pptxgenjs');

const OUT = path.join(__dirname, '..', 'docs', 'SimpleCRM-arkitektur.pptx');

const FONT = 'Segoe UI';

// Palette — mirrors the app's own slate/rose Tailwind theme.
const C = {
  ink: '0F172A',
  body: '334155',
  muted: '64748B',
  rule: 'CBD5E1',
  panel: 'F8FAFC',
  panelLine: 'E2E8F0',
  rose: 'E11D48',
  blue: '1D4ED8',
  emerald: '059669',
  amber: 'B45309',
  violet: '7C3AED',
};

// tone -> [fill, border, title colour]
const TONES = {
  slate: ['F8FAFC', 'CBD5E1', C.ink],
  rose: ['FFF1F3', 'FDA4AF', C.rose],
  blue: ['EFF6FF', '93C5FD', C.blue],
  emerald: ['ECFDF5', '6EE7B7', C.emerald],
  amber: ['FFFBEB', 'FCD34D', C.amber],
  violet: ['F5F3FF', 'C4B5FD', C.violet],
};

let pptx;

function slideBase(title, kicker) {
  const s = pptx.addSlide();
  s.background = { color: 'FFFFFF' };
  s.addText(title, {
    x: 0.6, y: 0.3, w: 12.1, h: 0.5,
    fontFace: FONT, fontSize: 25, bold: true, color: C.ink,
  });
  if (kicker) {
    s.addText(kicker, {
      x: 0.6, y: 0.82, w: 12.1, h: 0.32,
      fontFace: FONT, fontSize: 12, color: C.muted,
    });
  }
  s.addShape(pptx.ShapeType.line, { x: 0.6, y: 1.22, w: 12.1, h: 0, line: { color: C.rule, width: 1 } });
  return s;
}

function footer(s, n) {
  s.addText('SimpleCRM · Arkitektur', {
    x: 0.6, y: 6.95, w: 6, h: 0.3, fontFace: FONT, fontSize: 9, color: C.muted,
  });
  s.addText(String(n), {
    x: 11.7, y: 6.95, w: 1.0, h: 0.3, fontFace: FONT, fontSize: 9, color: C.muted, align: 'right',
  });
}

// A labelled box. `body` is optional smaller muted text under the title.
function box(s, o) {
  const [fill, border, titleColor] = TONES[o.tone || 'slate'];
  const runs = [{ text: o.title, options: { fontSize: o.size || 12, bold: true, color: o.color || titleColor, breakLine: !!o.body } }];
  if (o.body) runs.push({ text: o.body, options: { fontSize: (o.size || 12) - 3, bold: false, color: C.muted } });
  s.addText(runs, {
    shape: pptx.ShapeType.roundRect, rectRadius: 0.04,
    x: o.x, y: o.y, w: o.w, h: o.h,
    fill: { color: fill }, line: { color: border, width: 1 },
    fontFace: FONT, align: o.align || 'center', valign: 'middle', margin: 5,
  });
}

// A group container: light panel with a small label in its top-left corner.
function panel(s, o) {
  s.addShape(pptx.ShapeType.roundRect, {
    x: o.x, y: o.y, w: o.w, h: o.h, rectRadius: 0.03,
    fill: { color: 'FFFFFF' }, line: { color: o.line || C.panelLine, width: 1 },
  });
  if (o.label) {
    s.addText(o.label, {
      x: o.x + 0.12, y: o.y + 0.08, w: o.w - 0.24, h: 0.28,
      fontFace: FONT, fontSize: 9.5, bold: true, color: o.labelColor || C.muted, charSpacing: 1,
    });
  }
}

function arrowR(s, x, y, w, color) {
  s.addShape(pptx.ShapeType.line, { x, y, w, h: 0, line: { color: color || C.muted, width: 1.5, endArrowType: 'triangle' } });
}
function arrowD(s, x, y, h, color) {
  s.addShape(pptx.ShapeType.line, { x, y, w: 0, h, line: { color: color || C.muted, width: 1.5, endArrowType: 'triangle' } });
}
function lineH(s, x, y, w, color) {
  s.addShape(pptx.ShapeType.line, { x, y, w, h: 0, line: { color: color || C.muted, width: 1.5 } });
}
function lineV(s, x, y, h, color) {
  s.addShape(pptx.ShapeType.line, { x, y, w: 0, h, line: { color: color || C.muted, width: 1.5 } });
}
function caption(s, text, x, y, w, align) {
  s.addText(text, { x, y, w, h: 0.24, fontFace: FONT, fontSize: 8.5, color: C.muted, align: align || 'center' });
}
function bullets(s, items, o) {
  s.addText(items.map((t) => ({ text: t, options: { breakLine: true } })), {
    x: o.x, y: o.y, w: o.w, h: o.h,
    fontFace: FONT, fontSize: o.size || 11.5, color: C.body,
    bullet: { characterCode: '2022' }, lineSpacingMultiple: 1.25, valign: 'top',
  });
}

// ---------------------------------------------------------------- slide 1
function slideTitle() {
  const s = pptx.addSlide();
  s.background = { color: 'FFFFFF' };
  s.addShape(pptx.ShapeType.rect, { x: 0.6, y: 2.25, w: 0.1, h: 1.75, fill: { color: C.rose }, line: { color: C.rose } });
  s.addText('SimpleCRM', { x: 0.95, y: 2.2, w: 6.5, h: 0.9, fontFace: FONT, fontSize: 44, bold: true, color: C.ink });
  s.addText('Arkitektur, teknikval och flöden', { x: 0.98, y: 3.1, w: 6.5, h: 0.5, fontFace: FONT, fontSize: 19, color: C.body });
  s.addText('Node.js · Express 5 · SQLite · Vanilla JS · Claude AI', {
    x: 0.98, y: 3.65, w: 6.5, h: 0.4, fontFace: FONT, fontSize: 12.5, color: C.muted,
  });

  box(s, { x: 7.7, y: 2.9, w: 1.5, h: 0.8, title: 'Klient', tone: 'rose', size: 12 });
  arrowR(s, 9.25, 3.3, 0.35);
  box(s, { x: 9.65, y: 2.9, w: 1.5, h: 0.8, title: 'Server', tone: 'blue', size: 12 });
  arrowR(s, 11.2, 3.3, 0.35);
  box(s, { x: 11.6, y: 2.9, w: 1.5, h: 0.8, title: 'Data', tone: 'emerald', size: 12 });

  s.addText('Augusti 2026', { x: 0.98, y: 5.6, w: 5, h: 0.3, fontFace: FONT, fontSize: 11, color: C.muted });
}

// ---------------------------------------------------------------- slide 2
function slideOverview() {
  const s = slideBase('Systemöversikt', 'En Node-process, en SQLite-fil, ingen byggkedja i frontend.');

  panel(s, { x: 0.6, y: 1.55, w: 2.9, h: 3.05, label: 'KLIENT (WEBBLÄSARE)', labelColor: C.rose });
  box(s, { x: 0.78, y: 2.1, w: 2.54, h: 0.6, title: 'public/index.html', body: 'HTML-skal', tone: 'rose', size: 11 });
  box(s, { x: 0.78, y: 2.8, w: 2.54, h: 0.85, title: 'public/app.js', body: 'SPA: router, vyer, fetch', tone: 'rose', size: 11 });
  box(s, { x: 0.78, y: 3.75, w: 2.54, h: 0.7, title: 'Tailwind CSS (CDN)', body: 'ingen build-pipeline', tone: 'rose', size: 11 });

  caption(s, 'HTTPS · JSON', 3.52, 2.62, 0.86);
  arrowR(s, 3.55, 3.0, 0.8);
  caption(s, 'session-cookie', 3.52, 3.08, 0.86);

  panel(s, { x: 4.4, y: 1.55, w: 5.0, h: 4.65, label: 'SERVER — NODE.JS 18+ / EXPRESS 5', labelColor: C.blue });
  const srv = [
    ['server.js', 'app-uppsättning, statiska filer, route-montering'],
    ['src/middleware/', 'helmet · session · rate-limit · auth · validate'],
    ['src/routes/ (16 moduler)', 'HTTP-lager och auktorisering'],
    ['src/data.js', 'all SQL och affärslogik'],
    ['src/lib/', 'salary-model · docx · pdf · eml · AI'],
    ['src/database.js', 'schema och migrationer vid start'],
  ];
  srv.forEach(([t, b], i) => {
    box(s, { x: 4.62, y: 2.1 + i * 0.66, w: 4.56, h: 0.56, title: t, body: b, tone: 'blue', size: 10.5 });
  });

  panel(s, { x: 9.7, y: 1.55, w: 3.0, h: 2.2, label: 'DATA', labelColor: C.emerald });
  box(s, { x: 9.88, y: 2.08, w: 2.64, h: 0.5, title: 'data/crm.db', body: 'SQLite · better-sqlite3', tone: 'emerald', size: 10.5 });
  box(s, { x: 9.88, y: 2.65, w: 2.64, h: 0.5, title: 'data/sessions.db', body: 'connect-sqlite3', tone: 'emerald', size: 10.5 });
  box(s, { x: 9.88, y: 3.22, w: 2.64, h: 0.45, title: 'uploads/', body: 'CV, .docx, .pdf', tone: 'emerald', size: 10.5 });
  arrowR(s, 9.42, 2.6, 0.24, C.emerald);

  panel(s, { x: 9.7, y: 4.1, w: 3.0, h: 2.1, label: 'EXTERNT', labelColor: C.violet });
  box(s, { x: 9.88, y: 4.62, w: 2.64, h: 0.5, title: 'Anthropic API', body: 'Claude — klassificering, matchning', tone: 'violet', size: 10.5 });
  box(s, { x: 9.88, y: 5.19, w: 2.64, h: 0.45, title: 'Outlook', body: '.eml-utkast med bilagor', tone: 'violet', size: 10.5 });
  box(s, { x: 9.88, y: 5.71, w: 2.64, h: 0.42, title: 'Coderbyte (planerad)', body: 'assessments & invites', tone: 'slate', size: 10.5 });
  arrowR(s, 9.42, 5.1, 0.24, C.violet);

  footer(s, 2);
}

// ---------------------------------------------------------------- slide 3
function slideStack() {
  const s = slideBase('Teknikval', 'Minimala beroenden — varje val ska gå att motivera på en rad.');
  const rows = [
    ['Runtime', 'Node.js 18+', 'Bred hosting, inget byggsteg'],
    ['Backend', 'Express 5', 'Minimal routing, välkänt API'],
    ['Databas', 'SQLite via better-sqlite3', 'Synkront API, ingen separat serverprocess'],
    ['Sessioner', 'express-session + connect-sqlite3', 'Överlever omstart, ligger på samma volym som datan'],
    ['Auth', 'bcryptjs', 'Lösenordshash'],
    ['Frontend', 'HTML + vanilla JS (public/app.js)', 'Ingen build, en fil att ändra i'],
    ['Styling', 'Tailwind CSS via CDN', 'Modern yta utan pipeline'],
    ['Filuppladdning', 'multer + magic-byte-validering', 'Innehållet avgör filtypen, inte filändelsen'],
    ['DOCX', 'unzipper + archiver', 'Avtalsmallen är en zip — {{PLACEHOLDER}} byts i word/document.xml'],
    ['PDF', 'pdfkit', 'Lönebilagan renderas i kod, inte som mall'],
    ['CV-text', 'pdf-parse + mammoth', 'Extraheras en gång per fil och sparas'],
    ['AI', '@anthropic-ai/sdk (Claude)', 'E-postklassificering, CV-tolkning, kandidatmatchning'],
    ['Säkerhet', 'helmet + express-rate-limit', 'CSP/HSTS · 240 API-anrop/min per användare'],
    ['Drift', 'Railway + volym på /data', 'DB och uppladdningar på samma disk'],
  ];
  const head = (t) => ({ text: t, options: { bold: true, color: 'FFFFFF', fill: { color: C.ink } } });
  const table = [[head('Lager'), head('Teknik'), head('Varför')]].concat(
    rows.map((r, ri) => r.map((cell, i) => ({
      text: cell,
      options: { bold: i === 1, color: i === 2 ? C.muted : C.ink, fill: { color: ri % 2 ? 'FFFFFF' : C.panel } },
    })))
  );

  s.addTable(table, {
    x: 0.6, y: 1.45, w: 12.1, colW: [2.1, 3.6, 6.4],
    fontFace: FONT, fontSize: 10.5, border: { type: 'solid', color: C.panelLine, pt: 0.5 },
    rowH: 0.33, valign: 'middle', margin: 4,
    autoPage: false,
  });

  footer(s, 3);
}

// ---------------------------------------------------------------- slide 4
function slideRequest() {
  const s = slideBase('Vägen genom ett API-anrop', 'Varje lager har ett jobb — och auktorisationen ligger längst ner, inte i routen.');

  const steps = [
    ['Webbläsare: fetch(\'/api/...\')', 'session-cookie följer med'],
    ['helmet', 'CSP, HSTS, nosniff, X-Frame-Options'],
    ['express-rate-limit', 'auth 20/15 min per IP · API 240/min per användare'],
    ['express-session', 'sessionen läses ur sessions.db'],
    ['requireAuth', 'teammedlemskapet omvalideras vid varje anrop'],
    ['validate + file-validate', 'fältlängder, magic bytes på uppladdningar'],
    ['src/routes/*', 'HTTP-form och behörighetskontroll'],
    ['src/data.js → SQLite', 'prepared statements, transaktioner'],
  ];
  steps.forEach(([t, b], i) => {
    box(s, {
      x: 0.85, y: 1.5 + i * 0.64, w: 5.0, h: 0.52, title: t, body: b, size: 11,
      tone: i === 0 ? 'rose' : i === steps.length - 1 ? 'emerald' : 'blue', align: 'left',
    });
  });
  arrowD(s, 0.68, 1.55, 4.85, C.rose);

  panel(s, { x: 6.25, y: 1.5, w: 6.45, h: 5.1, label: 'VARFÖR SÅ HÄR' });
  bullets(s, [
    'Rate-limit räknas per användare, inte per IP — ett helt kontor delar utgående IP, så en IP-baserad budget gjorde att kollegor strypte varandra.',
    'De två status-endpointsen (AI-inkorg och matchning) är undantagna, så ett långt AI-jobb inte äter upp budgeten för vanligt arbete.',
    'requireAuth läser om teammedlemskapet vid varje anrop. En borttagen medlem tappar åtkomsten direkt, utan att behöva loggas ut.',
    'All scoping mot användare/team sker i data.js. Ett nytt route-lager kan alltså inte glömma bort den.',
    'better-sqlite3 är synkront: ingen halvskriven state mellan läsning och skrivning i samma anrop, och sammanhängande skrivningar körs i transaktion.',
    'Verifiering sker med ett enda kommando — node scripts/smoke.mjs startar servern på en slask-DB, kör kontrollerna och river ner.',
  ], { x: 6.45, y: 1.95, w: 6.05, h: 4.5, size: 11.5 });

  footer(s, 4);
}

// ---------------------------------------------------------------- slide 5
function slideData() {
  const s = slideBase('Datamodell', 'En SQLite-fil. Varje rad bär user_id och created_by — data.js scopar mot solo-användaren eller teamet.');

  // P1
  panel(s, { x: 0.6, y: 1.5, w: 5.9, h: 2.4, label: 'KONTON & TEAM', labelColor: C.rose });
  box(s, { x: 0.85, y: 2.05, w: 2.0, h: 0.6, title: 'teams', tone: 'rose', size: 11.5 });
  arrowR(s, 2.95, 2.35, 0.5, C.rose);
  caption(s, '1:N', 2.9, 2.03, 0.6);
  box(s, { x: 3.5, y: 2.05, w: 2.0, h: 0.6, title: 'users', tone: 'rose', size: 11.5 });
  s.addText('team_invitations · roller: solo / owner / member · borttagen medlem behåller inte datan',
    { x: 0.85, y: 2.85, w: 5.4, h: 0.8, fontFace: FONT, fontSize: 10.5, color: C.muted, valign: 'top' });

  // P2
  panel(s, { x: 6.85, y: 1.5, w: 5.85, h: 2.4, label: 'CRM-KÄRNA', labelColor: C.blue });
  box(s, { x: 7.05, y: 2.05, w: 1.55, h: 0.6, title: 'companies', tone: 'blue', size: 10.5 });
  arrowR(s, 8.68, 2.35, 0.42, C.blue);
  box(s, { x: 9.15, y: 2.05, w: 1.5, h: 0.6, title: 'contacts', tone: 'blue', size: 10.5 });
  arrowR(s, 10.72, 2.35, 0.42, C.blue);
  box(s, { x: 11.2, y: 2.05, w: 1.3, h: 0.6, title: 'notes', tone: 'blue', size: 10.5 });
  s.addText('todos · checklists · arkivering är soft delete och kan återställas',
    { x: 7.05, y: 2.85, w: 5.4, h: 0.8, fontFace: FONT, fontSize: 10.5, color: C.muted, valign: 'top' });

  // P3
  panel(s, { x: 0.6, y: 4.1, w: 5.9, h: 2.4, label: 'KANDIDATER', labelColor: C.emerald });
  box(s, { x: 0.85, y: 4.65, w: 1.5, h: 0.6, title: 'candidate_files', tone: 'emerald', size: 10 });
  s.addShape(pptx.ShapeType.line, { x: 2.42, y: 4.95, w: 0.45, h: 0, line: { color: C.emerald, width: 1.5, beginArrowType: 'triangle' } });
  box(s, { x: 2.95, y: 4.65, w: 1.55, h: 0.6, title: 'candidates', tone: 'emerald', size: 10.5 });
  arrowR(s, 4.57, 4.95, 0.45, C.emerald);
  box(s, { x: 5.1, y: 4.65, w: 1.2, h: 0.6, title: 'candidate_offers', tone: 'emerald', size: 9 });
  s.addText('profile_json · skill_tags · resume_text — CV:t tolkas en gång per fil, aldrig på matchningsvägen',
    { x: 0.85, y: 5.45, w: 5.4, h: 0.8, fontFace: FONT, fontSize: 10.5, color: C.muted, valign: 'top' });

  // P4
  panel(s, { x: 6.85, y: 4.1, w: 5.85, h: 2.4, label: 'MATCHNING & AI', labelColor: C.violet });
  box(s, { x: 7.05, y: 4.65, w: 1.75, h: 0.6, title: 'consultant_requests', tone: 'violet', size: 9 });
  arrowR(s, 8.87, 4.95, 0.4, C.violet);
  box(s, { x: 9.35, y: 4.65, w: 1.5, h: 0.6, title: 'request_matches', tone: 'violet', size: 9 });
  arrowR(s, 10.92, 4.95, 0.4, C.violet);
  box(s, { x: 11.4, y: 4.65, w: 1.1, h: 0.6, title: 'request_match_cache', tone: 'violet', size: 8 });
  s.addText('inbox_emails · user_emails — AI-inkorgen med klassificerad e-post',
    { x: 7.05, y: 5.45, w: 5.4, h: 0.8, fontFace: FONT, fontSize: 10.5, color: C.muted, valign: 'top' });

  footer(s, 5);
}

// ---------------------------------------------------------------- slide 6
function slideAI() {
  const s = slideBase('AI-pipelinen', 'Kostnaden för en matchning ska inte växa med CV-bibliotekets storlek.');

  const xs = [0.6, 3.02, 5.44, 7.86, 10.28];
  const w = 2.0;

  s.addText('1 · När ett CV läggs till', { x: 0.6, y: 1.45, w: 6, h: 0.28, fontFace: FONT, fontSize: 11, bold: true, color: C.ink });
  const row1 = [
    ['CV (PDF/DOCX)', 'uppladdat eller från AI-inkorgen'],
    ['resume-parser', 'pdf-parse · mammoth'],
    ['scrubPII', 'identifierare bort före AI'],
    ['profile-distiller', 'Claude → ~400 tokens'],
    ['profile_json + skill_tags', 'sparas på kandidaten'],
  ];
  row1.forEach(([t, b], i) => {
    box(s, { x: xs[i], y: 1.78, w, h: 0.95, title: t, body: b, tone: i === 4 ? 'emerald' : 'violet', size: 10.5 });
    if (i < 4) arrowR(s, xs[i] + w + 0.05, 2.25, 0.32, C.violet);
  });

  s.addText('2 · När en konsultförfrågan matchas', { x: 0.6, y: 3.15, w: 6, h: 0.28, fontFace: FONT, fontSize: 11, bold: true, color: C.ink });
  const row2 = [
    ['Konsultförfrågan', 'krav och beskrivning'],
    ['skills.js prefilter', 'lokalt, ~80 kandidater, 0 AI-anrop'],
    ['Chunkad scoring', 'Claude, 40 kandidater per anrop'],
    ['request_match_cache', 'per par, fingeravtryck på texten'],
    ['Matchlista i UI', 'topp 3 på kandidatvyn'],
  ];
  row2.forEach(([t, b], i) => {
    box(s, { x: xs[i], y: 3.48, w, h: 0.95, title: t, body: b, tone: i === 4 ? 'rose' : 'violet', size: 10.5 });
    if (i < 4) arrowR(s, xs[i] + w + 0.05, 3.95, 0.32, C.violet);
  });

  panel(s, { x: 0.6, y: 4.85, w: 12.1, h: 1.75, label: 'DE FYRA GREPPEN' });
  bullets(s, [
    'Distillerad profil i stället för rå CV-text: ~400 tokens mot ~1300 — billigare, och matchar bättre eftersom rå CV mest är försättsblad och kontaktuppgifter.',
    'Lokalt skill-prefilter väljer ut vilka som är värda att poängsätta. Kandidatsidan breddas (S3 ⇒ AWS ⇒ moln), kravsidan tas bokstavligt.',
    'Per-par-cache: oförändrade par poängsätts inte om. Fingeravtrycket hashar texten som skickades — ingen invalideringslogik som kan bli inaktuell.',
    'Promptordning anpassad efter Anthropics prefix-cache: rubrik och kandidater först, förfrågan sist.',
  ], { x: 0.8, y: 5.2, w: 11.7, h: 1.3, size: 10.5 });

  footer(s, 6);
}

// ---------------------------------------------------------------- slide 7
function slideOffer() {
  const s = slideBase('Anställningserbjudande — från kalkyl till Outlook-utkast', 'Ett submit producerar tre artefakter och en spårbar rad i databasen.');

  box(s, { x: 0.6, y: 1.7, w: 2.8, h: 0.8, title: 'Modal i app.js', body: 'lönekalkylator + förhandsvisning', tone: 'rose', size: 11 });
  arrowR(s, 3.45, 2.1, 0.35, C.rose);
  box(s, { x: 3.85, y: 1.7, w: 3.2, h: 0.8, title: 'POST /api/candidates/:id/offers', body: 'validering och behörighet', tone: 'blue', size: 11 });
  arrowR(s, 7.1, 2.1, 0.35, C.blue);
  box(s, { x: 7.5, y: 1.7, w: 2.6, h: 0.8, title: 'salary-model.js', body: '12-månadersmodellen', tone: 'blue', size: 11 });

  // Fan-out from salary-model to the three artefacts.
  lineV(s, 8.8, 2.5, 0.35, C.rule);
  lineH(s, 2.4, 2.85, 7.9, C.rule);
  [2.4, 6.35, 10.3].forEach((x) => arrowD(s, x, 2.85, 0.25, C.rule));

  box(s, { x: 0.6, y: 3.1, w: 3.6, h: 0.85, title: 'contract-template.js', body: 'fyller {{PLACEHOLDER}} i .docx-mallen', tone: 'emerald', size: 11 });
  box(s, { x: 4.55, y: 3.1, w: 3.6, h: 0.85, title: 'offer-pdf.js', body: 'lönebilaga i pdfkit', tone: 'emerald', size: 11 });
  box(s, { x: 8.5, y: 3.1, w: 3.6, h: 0.85, title: 'candidate_offers', body: 'snapshot av indata + hela uträkningen', tone: 'amber', size: 11 });

  // .docx + .pdf -> eml-builder
  lineV(s, 2.4, 3.95, 0.25, C.rule);
  lineH(s, 2.4, 4.2, 3.95, C.rule);
  lineV(s, 6.35, 3.95, 0.25, C.rule);
  arrowD(s, 6.35, 4.2, 0.3, C.rule);
  box(s, { x: 4.55, y: 4.5, w: 3.6, h: 0.8, title: 'eml-builder.js', body: 'X-Unsent: 1 · båda bilagorna base64', tone: 'blue', size: 11 });
  arrowD(s, 6.35, 5.3, 0.45, C.blue);
  box(s, { x: 4.55, y: 5.75, w: 3.6, h: 0.7, title: 'Outlook-utkast', body: 'laddas ner i webbläsaren och öppnas lokalt', tone: 'rose', size: 11 });

  panel(s, { x: 8.5, y: 4.5, w: 4.2, h: 1.95, label: 'SPÅRBARHET' });
  bullets(s, [
    'Varje submit skapar en ny rad och nya filer — tidigare versioner finns kvar.',
    '"Revidera" förifyller modalen med det gamla erbjudandets värden.',
    'Avtalstexten byggs av scripts/build-contract-template.js från källdokumentet.',
  ], { x: 8.7, y: 4.85, w: 3.85, h: 1.5, size: 10 });

  footer(s, 7);
}

// ---------------------------------------------------------------- slide 8
function slideOps() {
  const s = slideBase('Säkerhet & drift', 'Skyddet sitter i lager, och datan ligger på en volym som överlever deployer.');

  panel(s, { x: 0.6, y: 1.5, w: 5.9, h: 3.6, label: 'SÄKERHET', labelColor: C.rose });
  bullets(s, [
    'bcryptjs-hashade lösenord, sessioner i SQLite',
    'helmet: CSP, HSTS, nosniff, X-Frame-Options',
    'Rate limit: 20 inloggningsförsök/15 min per IP, 240 API-anrop/min per användare',
    'Uppladdade filer valideras på magic bytes, inte filändelse',
    'Team-scoping i datalagret, inte i route-lagret',
    'PII skrubbas innan CV-text går till Claude — DPIA finns i docs/',
    'Kvarstår: lösenordskomplexitet, gränser vid backup-import, inaktivitetstimeout',
  ], { x: 0.8, y: 1.9, w: 5.5, h: 3.1, size: 11 });

  panel(s, { x: 6.85, y: 1.5, w: 5.85, h: 3.6, label: 'DRIFT & DATA', labelColor: C.emerald });
  bullets(s, [
    'Railway med volym monterad på /data',
    'DATABASE_PATH=/data/crm.db, uppladdningar i /data/uploads',
    'Miljövariabler: SESSION_SECRET, ANTHROPIC_API_KEY, AI_*-tuning',
    'Migrationer körs vid start i src/database.js',
    'Backup: ZIP-export och -import av hela datamängden inklusive filer',
    'Verifiering: node scripts/smoke.mjs — egen DB, egen port, ett kommando',
  ], { x: 7.05, y: 1.9, w: 5.45, h: 3.1, size: 11 });

  const dep = [
    ['GitHub', 'push till master', 2.4],
    ['Railway', 'bygger och startar', 2.4],
    ['Node-process', 'server.js', 2.4],
    ['Volym /data', 'crm.db · sessions.db · uploads/', 3.85],
  ];
  let x = 0.6;
  dep.forEach(([t, b, w], i) => {
    box(s, { x, y: 5.5, w, h: 0.85, title: t, body: b, tone: i === 3 ? 'emerald' : 'slate', size: 11 });
    x += w;
    if (i < dep.length - 1) { arrowR(s, x + 0.05, 5.92, 0.25); x += 0.35; }
  });

  footer(s, 8);
}

// ---------------------------------------------------------------- slide 9
function slideCoderbyte() {
  const s = slideBase('Nästa integration: Coderbyte', 'Bjud in kandidaten till ett kodtest utan att lämna kandidatvyn.');
  s.addText('PLANERAD', {
    shape: pptx.ShapeType.roundRect, rectRadius: 0.5,
    x: 11.35, y: 0.35, w: 1.35, h: 0.34,
    fill: { color: 'FFFBEB' }, line: { color: 'FCD34D', width: 1 },
    fontFace: FONT, fontSize: 9.5, bold: true, color: C.amber, align: 'center', valign: 'middle',
  });

  const xs = [0.6, 3.75, 6.9, 10.05];
  const w = 2.85;
  const rows = [
    ['1 · Hämta testerna', [
      ['SimpleCRM', 'kandidatvyn'],
      ['GET /organization/assessments', 'Bearer API-nyckel'],
      ['Cachas lokalt', 'display_name · test_id · public_url'],
      ['Dropdown i UI', 'stängda tester filtreras bort'],
    ], 'blue'],
    ['2 · Bjud in kandidaten', [
      ['Val av test + kandidat', 'från kandidatvyn'],
      ['POST /candidates/invite', 'assessment_url = public_url'],
      ['Unik engångslänk', 'per kandidat'],
      ['Mejl', 'från Coderbyte eller eget .eml'],
    ], 'rose'],
    ['3 · Ta emot resultatet', [
      ['Webhook assessment_completed', 'JWT HS256, verifieras'],
      ['/api/coderbyte/webhook', 'kvitterar och köar'],
      ['GET report data', 'hämtar hela rapporten'],
      ['Resultat på kandidaten', 'status och poäng i vyn'],
    ], 'emerald'],
  ];

  rows.forEach(([label, items, tone], r) => {
    const y = 1.5 + r * 1.62;
    s.addText(label, { x: 0.6, y, w: 6, h: 0.26, fontFace: FONT, fontSize: 11, bold: true, color: C.ink });
    items.forEach(([t, b], i) => {
      box(s, { x: xs[i], y: y + 0.3, w, h: 0.9, title: t, body: b, tone, size: 10 });
      if (i < 3) arrowR(s, xs[i] + w + 0.02, y + 0.75, 0.26, TONES[tone][2]);
    });
  });

  panel(s, { x: 0.6, y: 6.05, w: 12.1, h: 0.75, label: null });
  s.addText('Öppna frågor: var API-nyckeln ska bo (env-variabel eller krypterad per team i DB) och webhook kontra polling. Dygnsgräns på 1 000 anrop gör att listan måste cachas.',
    { x: 0.8, y: 6.05, w: 11.7, h: 0.75, fontFace: FONT, fontSize: 10.5, color: C.body, valign: 'middle' });

  footer(s, 9);
}

// --------------------------------------------------------------- slide 10
function slidePrinciples() {
  const s = slideBase('Principer som håller ihop bygget', 'Varför koden ser ut som den gör — och vad som står på tur.');

  panel(s, { x: 0.6, y: 1.5, w: 5.9, h: 4.9, label: 'PRINCIPER', labelColor: C.blue });
  bullets(s, [
    'Ingen byggkedja. Frontend är en fil som körs som den ligger — ändring till körning tar sekunder.',
    'Affärslogiken bor i data.js. Routes gör HTTP, inte regler.',
    'Databasen och filerna ligger på samma volym, så en backup är en enda ZIP.',
    'AI används där den tillför något, med kostnaden inbyggd i designen: distillera en gång, filtrera lokalt, cacha per par.',
    'Allt som skickas till en kandidat sparas som en snapshot — inget rekonstrueras i efterhand.',
    'Verifiering med ett kommando i stället för en rad ad-hoc-anrop.',
  ], { x: 0.8, y: 1.9, w: 5.5, h: 4.4, size: 11.5 });

  panel(s, { x: 6.85, y: 1.5, w: 5.85, h: 4.9, label: 'PÅ TUR', labelColor: C.amber });
  bullets(s, [
    'Coderbyte-integration: assessments i dropdown, invite från kandidatvyn, resultat tillbaka via webhook.',
    'De tre kvarstående säkerhetspunkterna: lösenordskomplexitet, gränser vid backup-import, inaktivitetstimeout.',
    'app.js har passerat 7 000 rader — dags att fundera på uppdelning i moduler innan den blir svårnavigerad.',
    'Fler smoke-checkar som permanent svit i stället för scratch-fil per ändring.',
  ], { x: 7.05, y: 1.9, w: 5.45, h: 4.4, size: 11.5 });

  footer(s, 10);
}

async function main() {
  pptx = new PptxGenJS();
  pptx.layout = 'LAYOUT_16x9';
  pptx.author = 'SimpleCRM';
  pptx.title = 'SimpleCRM — Arkitektur';

  slideTitle();
  slideOverview();
  slideStack();
  slideRequest();
  slideData();
  slideAI();
  slideOffer();
  slideOps();
  slideCoderbyte();
  slidePrinciples();

  await pptx.writeFile({ fileName: OUT });
  console.log('Wrote', OUT);
}

main().catch((err) => {
  console.error('Deck build failed:', err);
  process.exit(1);
});
