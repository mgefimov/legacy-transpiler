import { a } from './a.js';
import { x } from './x.js';
import { y } from './y.js';

window.log('===================== basic circular import =====================');
// a.js and b.js import each other. Without cycle detection this deadlocks
// forever; the runtime hands the second importer an in-progress placeholder
// (Node-style require) instead, so both modules resolve.
window.log('a = ' + a);

window.log('===================== shared (non-circular) dependency =====================');
// x.js and y.js both depend on z.js but aren't part of a cycle — they must
// wait for z.js's real export, never a premature empty placeholder.
window.log('x = ' + x + ', y = ' + y);

window.log('===================== done =====================');
