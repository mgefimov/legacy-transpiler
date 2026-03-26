import { describe, it, expect } from 'vitest';
import { transpile } from '../src/index';

const BASE_URL = 'https://assets-proxy.anthropic.com/claude-ai/v2/assets/v1';
const resolveModule = (source: string) => `${BASE_URL}/${source.replace(/^\.\//, '')}`;
const staticImportModule = async (resolvedSource: string) => {
  // In a real implementation, this would fetch the module and store it in a way that it can be accessed at runtime.
  // For testing, we can just log it or do nothing.
}
const src = `${BASE_URL}/test.js`;

function iife(body: string): string {
  const lines = body.split('\n').filter(l => l.length > 0);
  if (lines.length === 0) return "'use strict';\n(async function () {})();\n";
  const indented = lines.map(l => '  ' + l).join('\n');
  return `'use strict';\n(async function () {\n${indented}\n})();\n`;
}

describe('removeLookbehind', () => {
  it('removes positive lookbehind', async () => {
    const input = `/(?<=foo)bar/g`;
    expect(await transpile(input, { src, resolveModule, staticImportModule })).toBe(iife('/bar/g;\n'));
  });

  it('removes negative lookbehind', async () => {
    const input = `/(?<!foo)bar/g`;
    expect(await transpile(input, { src, resolveModule, staticImportModule })).toBe(iife('/bar/g;\n'));
  });

  it('removes lookbehind with escaped chars', async () => {
    const input = `/(?<=\\d{3})\\d+/`;
    expect(await transpile(input, { src, resolveModule, staticImportModule })).toBe(iife('/\\d+/;\n'));
  });

  it('removes multiple lookbehinds', async () => {
    const input = `/(?<=foo)(?<!bar)baz/g`;
    expect(await transpile(input, { src, resolveModule, staticImportModule })).toBe(iife('/baz/g;\n'));
  });

  it('does not modify regex without lookbehinds', async () => {
    const input = `/^hello$/`;
    expect(await transpile(input, { src, resolveModule, staticImportModule })).toBe(iife('/^hello$/;\n'));
  });

  it('handles regex in variable declaration', async () => {
    const input = `const re = /(?<=prefix-)\\w+/g;`;
    expect(await transpile(input, { src, resolveModule, staticImportModule })).toBe(iife('const re = /\\w+/g;\n'));
  });
});
