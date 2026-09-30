#!/usr/bin/env node
// Regression check for the modal dismissal lock:
//
//   node scripts/check-modal-lock.mjs
//
// A CV import keeps running whether or not its modal is on screen, so losing
// the modal to a stray backdrop click loses the summary — including the
// warning about profiles created without a duplicate check. This drives the
// lock against a DOM stub: the state machine, both dismissal guards, and that
// the lock can never be left behind for the next modal.
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');

const noop = () => {};
const listeners = { document: {}, byId: {} };

// One object per id, each with its own classList — sharing one classList made
// an unrelated handler (the user-menu dropdown) look like it closed the modal.
const els = {};
function makeEl(id) {
  const state = { hidden: true };
  const target = {
    id,
    classList: {
      add: (c) => { if (c === 'hidden') state.hidden = true; },
      remove: (c) => { if (c === 'hidden') state.hidden = false; },
      contains: (c) => (c === 'hidden' ? state.hidden : false),
      toggle: noop,
    },
    addEventListener: (ev, fn) => { ((listeners.byId[id] = listeners.byId[id] || {})[ev] ||= []).push(fn); },
    contains: () => false,
    dataset: {}, style: {}, value: '', textContent: '', innerHTML: '', checked: false, files: [],
  };
  return new Proxy(target, {
    get: (t, p) => (p in t ? t[p] : typeof p === 'string' ? noop : undefined),
    set: (t, p, v) => { t[p] = v; return true; },   // assignments must stick
  });
}
const getEl = (id) => (els[id] ||= makeEl(id));

const document = {
  getElementById: getEl,
  querySelector: () => getEl('_q'), querySelectorAll: () => [], createElement: () => getEl('_c'),
  addEventListener: (ev, fn) => { (listeners.document[ev] ||= []).push(fn); },
  body: getEl('_body'), documentElement: getEl('_html'),
};

let confirmAnswer = true;
const confirmCalls = [];
const ctx = vm.createContext({
  document,
  window: { addEventListener: noop, scrollTo: noop, scrollY: 0, innerWidth: 1400, location: { hash: '' } },
  history: { pushState: noop, replaceState: noop, back: noop, state: null, scrollRestoration: 'auto' },
  console, URLSearchParams, URL, Set, Map, Intl,
  location: { hash: '', pathname: '/', search: '', href: 'http://localhost/' },
  navigator: { language: 'sv' }, localStorage: { getItem: () => null, setItem: noop, removeItem: noop },
  fetch: async () => ({ ok: true, status: 200, json: async () => ({}) }),
  setTimeout, clearTimeout, setInterval, clearInterval, Blob: class {}, FormData: class {},
  requestAnimationFrame: (f) => setTimeout(f, 0), alert: noop,
  confirm: (msg) => { confirmCalls.push(msg); return confirmAnswer; },
});
ctx.globalThis = ctx;

const { modal, views, closeOverlays } = vm.runInContext(
  readFileSync(join(repoRoot, 'public/app.js'), 'utf8') + ';({ modal, views, closeOverlays });',
  ctx, { filename: 'app.js' });

const backdrop = () => (listeners.byId.modal?.click || []).forEach((fn) => fn({ target: { id: 'modal' } }));
const escape = () => (listeners.document.keydown || []).forEach((fn) => fn({ key: 'Escape' }));

let fail = 0;
const check = (name, cond, detail = '') => {
  if (cond) console.log('  ✓ ' + name);
  else { fail++; console.log('  ✗ ' + name + (detail ? '  -> ' + detail : '')); }
};

console.log('\n-- stubben är rätt kopplad --');
check('backdrop-lyssnaren är registrerad', (listeners.byId.modal?.click || []).length === 1,
  String((listeners.byId.modal?.click || []).length));
check('Escape-lyssnaren är registrerad', (listeners.document.keydown || []).length >= 1);

console.log('\n-- modalen kan inte stängas av misstag under import --');
modal.show('<p>import</p>');
check('öppen och olåst från start', modal.isOpen() && !modal.isLocked());
backdrop();
check('backdrop stänger när olåst', !modal.isOpen());
modal.show('<p>import</p>');
escape();
check('Escape stänger när olåst', !modal.isOpen());

modal.show('<p>import</p>');
modal.lock();
backdrop();
check('backdrop ignoreras när låst', modal.isOpen());
escape();
check('Escape ignoreras när låst', modal.isOpen());

console.log('\n-- den uttryckliga vägen ut frågar först --');
confirmAnswer = false;
confirmCalls.length = 0;
views.closeCVImport();
check('nekad bekräftelse lämnar rutan öppen', modal.isOpen());
check('texten säger att den fortsätter i bakgrunden', /bakgrunden/.test(confirmCalls[0] || ''), confirmCalls[0]);
check('texten lovar inte att avbryta', /kan inte avbrytas/.test(confirmCalls[0] || ''));
confirmAnswer = true;
views.closeCVImport();
check('bekräftad stängning stänger', !modal.isOpen());
check('och släpper låset', !modal.isLocked());

console.log('\n-- låset blir aldrig kvar --');
modal.show('<p>import</p>');
modal.lock();
modal.show('<p>något annat</p>');
check('ny modal ärver inte låset', !modal.isLocked());
backdrop();
check('och går att stänga', !modal.isOpen());

modal.show('<p>import</p>');
modal.lock();
closeOverlays();
check('navigering stänger även låst modal', !modal.isOpen());
check('och släpper låset', !modal.isLocked());

console.log('\n-- när inget kör är allt som förut --');
modal.show('<p>vanlig dialog</p>');
confirmCalls.length = 0;
views.closeCVImport();
check('ingen fråga när inget kör', confirmCalls.length === 0);
check('stänger direkt', !modal.isOpen());

process.exit(fail ? 1 : 0);
