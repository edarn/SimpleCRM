// Pseudonymization for text sent to the AI (Anthropic).
//
// Why: candidate matching sends CV text to a third-country sub-processor. The
// match is driven by skills/experience, NOT by name or contact details, and the
// AI answers only with a local numeric id we map back ourselves — so direct
// identifiers can be stripped before the call with no loss of match quality.
// This is a risk-reducing safeguard (GDPR art. 25/32), NOT anonymization: the
// data is still personal data and an LLM may still infer identity from rare
// free-text combinations. See docs/DPIA-cv-import.md (section 8.2).
//
// Do NOT use this on the email-classifier input — that step is meant to extract
// contact details.

function escapeRegExp(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Replace a known name (full form + individual parts >= 2 chars) with a label.
function replaceName(text, name, label) {
  const clean = String(name || '').trim();
  if (!clean) return text;
  let out = text.replace(new RegExp(escapeRegExp(clean), 'gi'), label);
  for (const part of clean.split(/\s+/).filter(p => p.length >= 2)) {
    out = out.replace(new RegExp('\\b' + escapeRegExp(part) + '\\b', 'gi'), label);
  }
  return out;
}

// Remove direct identifiers from free text before sending it to the AI.
// `known` carries the candidate's structured fields (most precise removal);
// the generic patterns are a safety net for whatever is embedded in the CV.
function scrubPII(text, known = {}) {
  if (!text) return text;
  const { name, email, phone } = known;
  let out = String(text);

  // Order matters: scrub emails and URLs BEFORE the name, since the name often
  // appears *inside* an address/handle (e.g. anna.andersson@... or
  // linkedin.com/in/annaandersson). Removing those first stops the name pass
  // from mangling them into "[KANDIDAT].[KANDIDAT]@...".

  // 1. Email addresses (known exact value first, then generic).
  if (email) out = out.split(String(email)).join('[EMAIL]');
  out = out.replace(/[\w.+-]+@[\w-]+\.[\w.-]+/g, '[EMAIL]');

  // 2. URLs / LinkedIn profiles.
  out = out.replace(/\b(?:https?:\/\/|www\.)\S+/gi, '[URL]');
  out = out.replace(/\b(?:[\w-]+\.)?linkedin\.com\/[^\s)]+/gi, '[URL]');

  // 3. Swedish personal numbers (YYMMDD-XXXX / YYYYMMDD-XXXX, with - or +, or
  //    no separator). Run BEFORE the phone pattern so it wins the overlap.
  out = out.replace(/\b(?:\d{8}|\d{6})[-+]?\d{4}\b/g, '[PERSONNUMMER]');

  // 4. Phone numbers: digit runs (with common separators) of >= 9 digits, so
  //    year ranges like "2018-2022" (8 digits) are preserved as useful context.
  if (phone) out = out.split(String(phone)).join('[TELEFON]');
  out = out.replace(/\+?\d[\d\s().-]{7,}\d/g, (m) =>
    (m.replace(/\D/g, '').length >= 9 ? '[TELEFON]' : m)
  );

  // 5. Name last (full form + individual parts >= 2 chars).
  if (name) out = replaceName(out, name, '[KANDIDAT]');

  return out;
}

module.exports = { scrubPII };
