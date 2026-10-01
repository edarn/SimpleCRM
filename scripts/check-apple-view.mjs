#!/usr/bin/env node
// Regression check for the Apple view's row-move animation:
//
//   node scripts/check-apple-view.mjs
//
// Changing a status re-sorts the list under the user's hands. The rows are
// rebuilt from scratch, so the move is replayed afterwards from the old
// position (FLIP). This drives that replay against a DOM stub: that rows
// carry the handle it needs, that a moved row is offset and then released,
// that the changed row is flashed and handed back to its own colour, that
// reduced motion is honoured, and that the whole thing stays under a second.
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const noop = () => {};

// --- rows the helper will walk ---
let rows = [];
function makeRow(id, top) {
  return {
    dataset: { rowId: id },
    style: {},
    getBoundingClientRect: () => ({ top }),
    classList: { add: noop, remove: noop, contains: () => false, toggle: noop },
  };
}

let reduceMotion = false;
const rafQueue = [];
const timers = [];
const el = new Proxy({}, {
  get: (_t, p) => {
    if (p === 'classList') return { add: noop, remove: noop, contains: () => true, toggle: noop };
    if (p === 'dataset') return {};
    if (p === 'style') return {};
    if (p === 'value' || p === 'textContent' || p === 'innerHTML') return '';
    if (typeof p === 'string') return noop;
    return undefined;
  },
  set: () => true,
});
const document = {
  getElementById: () => el, querySelector: () => el, createElement: () => el,
  querySelectorAll: (sel) => (sel.includes('data-row-id') ? rows : []),
  addEventListener: noop, body: el, documentElement: el,
};
const ctx = vm.createContext({
  document,
  window: {
    addEventListener: noop, scrollTo: noop, scrollY: 0, innerWidth: 1400, location: { hash: '' },
    matchMedia: (q) => ({ matches: q.includes('reduced-motion') && reduceMotion }),
  },
  history: { pushState: noop, replaceState: noop, back: noop, state: null, scrollRestoration: 'auto' },
  console, URLSearchParams, URL, Set, Map, Intl,
  location: { hash: '', pathname: '/', search: '', href: 'http://localhost/' },
  navigator: { language: 'sv' }, localStorage: { getItem: () => null, setItem: noop, removeItem: noop },
  fetch: async () => ({ ok: true, status: 200, json: async () => ({}) }),
  setTimeout: (fn, ms) => { timers.push({ fn, ms }); return timers.length; },
  clearTimeout: noop, setInterval: noop, clearInterval: noop,
  requestAnimationFrame: (fn) => { rafQueue.push(fn); return rafQueue.length; },
  Blob: class {}, FormData: class {}, alert: noop, confirm: () => true,
});
ctx.globalThis = ctx;
const { views } = vm.runInContext(
  readFileSync(join(repoRoot, 'public/app.js'), 'utf8') + ';({ views });', ctx, { filename: 'app.js' });

const flushRaf = () => { const q = rafQueue.splice(0); q.forEach((fn) => fn()); };

let fail = 0;
const check = (name, cond, detail = '') => {
  if (cond) console.log('  ✓ ' + name);
  else { fail++; console.log('  ✗ ' + name + (detail ? '  -> ' + detail : '')); }
};

console.log('\n-- raderna bär handtaget animationen behöver --');
const src = readFileSync(join(repoRoot, 'public/app.js'), 'utf8');
check('flödesraden har data-row-id', /data-row-id="\$\{r\.id\}"[^]{0,120}_APPLE_GRID/.test(src));
check('roster-raden har data-row-id', /data-row-id="\$\{r\.id\}"[^]{0,120}_APPLE_ROSTER_GRID/.test(src));

console.log('\n-- en rad som flyttat sig spelas upp från sin gamla plats --');
rows = [makeRow('a', 300), makeRow('b', 100), makeRow('c', 500)];
// 'b' rose from 300 to 100, 'a' sank from 100 to 300, 'c' did not move.
const before = new Map([['a', 100], ['b', 300], ['c', 500]]);
views._playAppleRowMoves(before, 'b');

check('rad som steg förskjuts nedåt först', rows[1].style.transform === 'translateY(200px)', rows[1].style.transform);
check('rad som sjönk förskjuts uppåt först', rows[0].style.transform === 'translateY(-200px)', rows[0].style.transform);
check('orörd rad får ingen förskjutning', !rows[2].style.transform, rows[2].style.transform);
check('förskjutningen sker utan transition', rows[1].style.transition === 'none', rows[1].style.transition);
check('den ändrade raden markeras', !!rows[1].style.backgroundColor && !!rows[1].style.boxShadow,
  `${rows[1].style.backgroundColor} / ${rows[1].style.boxShadow}`);
check('bara den ändrade raden markeras', !rows[0].style.backgroundColor);

flushRaf();
check('förskjutningen släpps', rows[1].style.transform === '', JSON.stringify(rows[1].style.transform));
check('markeringen tonas bort', rows[1].style.backgroundColor === '' && rows[1].style.boxShadow === '');
check('raden lämnas tillbaka till sin egen färg', rows[1].style.backgroundColor === '');
check('rörelsen har en transition', /transform \d+ms/.test(rows[1].style.transition), rows[1].style.transition);
check('markeringen tonar med fördröjning', /background-color \d+ms ease \d+ms/.test(rows[1].style.transition), rows[1].style.transition);

console.log('\n-- den håller sig under en sekund --');
const longest = Math.max(...timers.map((t) => t.ms));
check('allt är klart inom 1 s', longest <= 1000, longest + ' ms');
check('städar upp inline-transition efteråt', timers.length > 0 && typeof timers[0].fn === 'function');

console.log('\n-- orörda rader och minskad rörelse --');
rows = [makeRow('a', 100)];
views._playAppleRowMoves(new Map([['a', 100]]), null);
check('ingen rörelse, ingen markering, inget gjort', !rows[0].style.transform && !rows[0].style.transition);

reduceMotion = true;
rows = [makeRow('a', 100), makeRow('b', 300)];
views._playAppleRowMoves(new Map([['a', 300], ['b', 100]]), 'a');
check('prefers-reduced-motion hoppar över allt', !rows[0].style.transform && !rows[0].style.backgroundColor);
reduceMotion = false;

console.log('\n-- nya rader animeras inte in --');
rows = [makeRow('ny', 100)];
views._playAppleRowMoves(new Map(), null);
check('rad utan tidigare plats lämnas ifred', !rows[0].style.transform);

process.exit(fail ? 1 : 0);
