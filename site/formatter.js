import { multiply } from './math.js';

export function formatProduct(a, b) {
  return a + ' × ' + b + ' = ' + multiply(a, b);
}

export const af = { version: '1.0' };
