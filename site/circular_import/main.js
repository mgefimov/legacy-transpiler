import { a } from './a.js';
import { x } from './x.js';
import { y } from './y.js';
import { viaB } from './greet-a.js';

window.log('===================== basic circular import =====================');
// a.js and b.js import each other. Without cycle detection this deadlocks
// forever; the runtime hands the second importer an in-progress placeholder
// (Node-style require) instead, so both modules resolve.
window.log('a = ' + a);

window.log('===================== shared (non-circular) dependency =====================');
// x.js and y.js both depend on z.js but aren't part of a cycle — they must
// wait for z.js's real export, never a premature empty placeholder.
window.log('x = ' + x + ', y = ' + y);

window.log('===================== circular function binding (KNOWN BUG) =====================');
// greet-b.js destructures `greet` from greet-a.js while greet-a.js is still
// mid-cycle, so its `const greet` snapshot freezes to undefined. greet-a.js
// later exports the real function, but the frozen binding never updates —
// viaB() -> useGreet() -> greet() throws "greet is not a function" (the
// production `pe is not a function`). Caught here so the rest of the page
// still renders; the visible ERROR line IS the repro.
try {
  window.log('viaB() = ' + viaB());
} catch (e) {
  window.log('BUG REPRODUCED: ' + (e && e.message ? e.message : e));
}

window.log('===================== done =====================');
