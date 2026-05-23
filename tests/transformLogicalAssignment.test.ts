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

describe('transformLogicalAssignment', () => {
  it('lowers ||= to a short-circuiting OR assignment', () => {
    expect(transpile(src, `a ||= b;`)).toBe(iife("a || (a = b);\n"));
  });

  it('lowers &&= to a short-circuiting AND assignment', () => {
    expect(transpile(src, `a &&= b;`)).toBe(iife("a && (a = b);\n"));
  });

  it('lowers ??= to a nullish conditional without using ??', () => {
    expect(transpile(src, `a ??= b;`)).toBe(iife("a == null ? a = b : a;\n"));
  });

  it('handles a member expression target', () => {
    expect(transpile(src, `obj.x ||= b;`)).toBe(iife("obj.x || (obj.x = b);\n"));
  });

  it('handles a member target with ??=', () => {
    expect(transpile(src, `obj.x ??= b;`)).toBe(iife("obj.x == null ? obj.x = b : obj.x;\n"));
  });

  it('lowers when nested inside another expression', () => {
    expect(transpile(src, `var y = (a ||= b);`)).toBe(iife("var y = a || (a = b);\n"));
  });

  it('leaves plain assignment untouched', () => {
    expect(transpile(src, `a = b;`)).toBe(iife("a = b;\n"));
  });

  it('skips the transform for iOS 14.0 and above', () => {
    init({ BASE_URL, minify: false, target: { platform: 'iOS', version: '14.0' }, runScript: () => {} });
    expect(transpile(src, `a ||= b;`)).toBe(iife("a ||= b;\n"));
    init({ BASE_URL, minify: false, target: { platform: 'iOS', version: '13.4' }, runScript: () => {} });
  });

  it('applies the transform for iOS below 14.0', () => {
    expect(transpile(src, `a ??= b;`)).toBe(iife("a == null ? a = b : a;\n"));
  });
});
