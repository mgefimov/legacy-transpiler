import { describe, it, expect, vi } from 'vitest';

vi.mock('../src/utils', () => ({ patchFetch: () => {} }));

import { transpile, init } from '../src/index';

const BASE_URL = 'https://assets-proxy.anthropic.com/claude-ai/v2/assets/v1';
const src = `${BASE_URL}/test.js`;

init({ BASE_URL, minify: false, target: { platform: 'iOS', version: '13.4' }, runScript: () => {} });

function iife(body: string): string {
  const lines = body.split('\n').filter(l => l.length > 0);
  if (lines.length === 0) return "'use strict';\n(async function () {})();\n";
  const indented = lines.map(l => '  ' + l).join('\n');
  return `'use strict';\n(async function () {\n${indented}\n})();\n`;
}

describe('transformBigInt', () => {
  it('strips the n suffix from a decimal BigInt literal', () => {
    expect(transpile(src, `var x = 0n;`)).toBe(iife("var x = 0;\n"));
  });

  it('strips the n suffix from a larger BigInt literal', () => {
    expect(transpile(src, `var x = 123n;`)).toBe(iife("var x = 123;\n"));
  });

  it('preserves the radix prefix when stripping (hex)', () => {
    expect(transpile(src, `var x = 0xFFn;`)).toBe(iife("var x = 0xFF;\n"));
  });

  it('strips BigInt literals inside an expression', () => {
    expect(transpile(src, `var x = 5n + 3n;`)).toBe(iife("var x = 5 + 3;\n"));
  });

  it('leaves ordinary number literals untouched', () => {
    expect(transpile(src, `var x = 42;`)).toBe(iife("var x = 42;\n"));
  });

  it('skips the transform for iOS 14.0 and above', () => {
    init({ BASE_URL, minify: false, target: { platform: 'iOS', version: '14.0' }, runScript: () => {} });
    expect(transpile(src, `var x = 0n;`)).toBe(iife("var x = 0n;\n"));
    init({ BASE_URL, minify: false, target: { platform: 'iOS', version: '13.4' }, runScript: () => {} });
  });

  it('applies the transform for iOS below 14.0', () => {
    expect(transpile(src, `var x = 0n;`)).toBe(iife("var x = 0;\n"));
  });
});
