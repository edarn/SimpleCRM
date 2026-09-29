#!/usr/bin/env node
// Regression check for the router's history rules:
//
//   node scripts/check-router-history.mjs
//
// The rules are easy to break by accident and impossible to see in a diff —
// which entries get pushed, which get replaced, where Back lands, whether the
// scroll offset survives. This pulls the router straight out of public/app.js
// and drives it against a simulated history stack, so it needs no browser and
// runs as a single `node` command.
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = readFileSync(join(repoRoot, 'public/app.js'), 'utf8');
const rStart = src.indexOf('// Overlays are mounted outside #app');
const rEnd = src.indexOf('\n};\n\n// Find and focus the first element', rStart);
const routerSrc = src.slice(rStart, rEnd + 4) + '\nfunction focusAutofocus() {}';
const popstateStart = src.indexOf("window.addEventListener('popstate'");
const popstateEnd = src.indexOf('\n});', popstateStart);
const popstateSrc = src.slice(popstateStart, popstateEnd + 4);

// ---- simulated browser ----
let hash = '';
const stack = [];
let cursor = -1;
let popHandler = null;

function setUrl(url) {
  if (url === undefined || url === null) return;      // replaceState(state, '') keeps the URL
  hash = url.startsWith('#') ? url : '';
}
const history = {
  scrollRestoration: 'auto',
  get state() { return cursor >= 0 ? stack[cursor].state : null; },
  pushState(state, _t, url) {
    stack.splice(cursor + 1);
    setUrl(url);
    stack.push({ state, url: hash });
    cursor = stack.length - 1;
  },
  replaceState(state, _t, url) {
    setUrl(url);
    if (cursor < 0) { stack.push({ state, url: hash }); cursor = 0; }
    else { stack[cursor] = { state, url: hash }; }
  },
  back() {
    if (cursor <= 0) return;
    cursor--;
    hash = stack[cursor].url;
    popHandler({ state: stack[cursor].state });
  },
};

const fakeEl = { querySelector: () => null, classList: { contains: () => true } };
const document = {
  getElementById: (id) => (id === 'app' ? fakeEl : null),
  querySelectorAll: () => [],
};
const window = {
  scrollY: 0,
  scrollTo(_x, y) { this.scrollY = y; },
  addEventListener: (ev, fn) => { if (ev === 'popstate') popHandler = fn; },
};
const rendered = [];
const views = new Proxy({}, {
  get: (_t, prop) => async (...a) => { rendered.push(prop + (a[1] ? ':' + a[1] : '')); },
});
const modal = { hide() {} };
const auth = { currentUser: { id: 'u1' } };
const location = { get hash() { return hash; }, pathname: '/', search: '' };

const ctx = vm.createContext({ history, document, window, views, modal, auth, location, console, URLSearchParams });
vm.runInContext(routerSrc + '\n' + popstateSrc + '\nglobalThis.router = router;', ctx);
const router = ctx.router;

// ---- checks ----
let pass = 0, fail = 0;
const check = (name, cond, detail = '') => {
  if (cond) { pass++; console.log('  ✓ ' + name); }
  else { fail++; console.log('  ✗ ' + name + (detail ? '  -> ' + detail : '')); }
};
const depth = () => stack.length;
const at = () => hash;

console.log('\n-- boot uses replace, so the first Back is not a no-op --');
hash = '#candidates';
const boot = router._fromHash(hash);
router.navigate(boot.route, boot.params, { replace: true });
check('one history entry after boot', depth() === 1, 'depth=' + depth());
check('hash preserved', at() === '#candidates', at());
check('idx 0', router._idx === 0, String(router._idx));

console.log('\n-- navigating to the page you are already on replaces --');
router.navigate('candidates');
router.navigate('candidates');
check('still one entry', depth() === 1, 'depth=' + depth());
router.navigate('candidate-detail', { id: 'c1' });
check('a real move pushes', depth() === 2, 'depth=' + depth());
router.navigate('candidate-detail', { id: 'c1' });
router.navigate('candidate-detail', { id: 'c1' });
check('re-render of the same detail does not stack', depth() === 2, 'depth=' + depth());
check('different id does push', (router.navigate('candidate-detail', { id: 'c2' }), depth() === 3), 'depth=' + depth());

console.log('\n-- Back walks back one real step --');
history.back();
check('back lands on c1', at() === '#candidate-detail/c1', at());
check('idx tracks the entry', router._idx === 1, String(router._idx));
history.back();
check('back lands on the list', at() === '#candidates', at());
check('idx 0 at the bottom', router._idx === 0, String(router._idx));

console.log('\n-- router.back() from a breadcrumb steps back, never forward --');
router.navigate('candidate-detail', { id: 'c9' });
const before = depth();
router.back('candidates');
check('no new entry', depth() === before, 'depth=' + depth());
check('landed on the list', at() === '#candidates', at());

console.log('\n-- breadcrumb on a deep link replaces instead of stacking --');
stack.length = 0; cursor = -1; hash = '#candidate-detail/deep';
router.currentRoute = null; router._idx = 0;
const deep = router._fromHash(hash);
router.navigate(deep.route, deep.params, { replace: true });
check('deep link is one entry', depth() === 1, 'depth=' + depth());
router.back('candidates');
check('still one entry', depth() === 1, 'depth=' + depth());
check('shows the list', at() === '#candidates', at());

console.log('\n-- replace on delete leaves no dead entry behind --');
stack.length = 0; cursor = -1; hash = ''; router.currentRoute = null; router._idx = 0;
router.navigate('candidates', {}, { replace: true });
router.navigate('candidate-detail', { id: 'gone' });
router.navigate('candidates', {}, { replace: true });   // what deleteCandidate does
check('two entries, not three', depth() === 2, 'depth=' + depth());
history.back();
check('Back skips the deleted record', at() === '#candidates', at());

console.log('\n-- non-id params survive the hash --');
const h = router._toHash('contact-form', { companyId: 'co7' });
check('companyId in hash', h === '#contact-form?companyId=co7', h);
const parsed = router._fromHash(h);
check('and parses back', parsed.route === 'contact-form' && parsed.params.companyId === 'co7', JSON.stringify(parsed));
const h2 = router._toHash('contact-detail', { id: 'abc' });
check('plain id hash unchanged', h2 === '#contact-detail/abc', h2);

console.log('\n-- scroll offset is remembered per entry --');
stack.length = 0; cursor = -1; hash = ''; router.currentRoute = null; router._idx = 0;
router.navigate('candidates', {}, { replace: true });
const tick = () => new Promise((r) => setTimeout(r, 0));
window.scrollY = 850;
router.navigate('candidate-detail', { id: 'x' });
check('leaving entry recorded the offset', stack[0].state.scrollY === 850, JSON.stringify(stack[0].state));
await tick();
check('forward move starts at the top', window.scrollY === 0, String(window.scrollY));
history.back();
check('autofocus suppressed while Back renders', router._skipAutofocus === true, String(router._skipAutofocus));
await tick();
check('Back restores the offset', window.scrollY === 850, String(window.scrollY));
check('autofocus flag consumed after render', router._skipAutofocus === false, String(router._skipAutofocus));

console.log('\n-- _rememberScroll must not drop the hash --');
check('hash intact after remembering scroll', at() === '#candidates', at());

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
