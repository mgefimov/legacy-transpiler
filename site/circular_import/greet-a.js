import { useGreet } from './greet-b.js';
export function greet(name) { return 'hi ' + name; }
export const viaB = () => useGreet('circular');
