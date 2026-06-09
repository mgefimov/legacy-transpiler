import { describe, it, expect } from 'vitest';
import { transpile, init } from '../src/index';

const BASE_URL = 'https://assets-proxy.anthropic.com/claude-ai/v2/assets/v1';
const src = `${BASE_URL}/test.js`;

init({ BASE_URL, minify: false, runScript: () => {} });

function iife(body: string): string {
  const lines = body.split('\n').filter(l => l.length > 0);
  if (lines.length === 0) return "'use strict';\n(async function () {})();\n";
  const indented = lines.map(l => '  ' + l).join('\n');
  return `'use strict';\n(async function () {\n${indented}\n})();\n`;
}

describe('removeLookbehind', () => {
  it('removes positive lookbehind', async () => {
    const input = `/(?<=foo)bar/g`;
    expect(transpile(src,input)).toBe(iife('/bar/g;\n'));
  });

  it('removes negative lookbehind', async () => {
    const input = `/(?<!foo)bar/g`;
    expect(transpile(src,input)).toBe(iife('/bar/g;\n'));
  });

  it('removes lookbehind with escaped chars', async () => {
    const input = `/(?<=\\d{3})\\d+/`;
    expect(transpile(src,input)).toBe(iife('/\\d+/;\n'));
  });

  it('removes multiple lookbehinds', async () => {
    const input = `/(?<=foo)(?<!bar)baz/g`;
    expect(transpile(src,input)).toBe(iife('/baz/g;\n'));
  });

  it('does not modify regex without lookbehinds', async () => {
    const input = `/^hello$/`;
    expect(transpile(src,input)).toBe(iife('/^hello$/;\n'));
  });

  it('handles regex in variable declaration', async () => {
    const input = `const re = /(?<=prefix-)\\w+/g;`;
    expect(transpile(src,input)).toBe(iife('const re = /\\w+/g;\n'));
  });

  it('removes lookbehind from new RegExp string pattern', async () => {
    const input = `new RegExp('(?<=foo)bar', 'g')`;
    expect(transpile(src,input)).toBe(iife('new RegExp("bar", \'g\');\n'));
  });

  it('removes lookbehind from RegExp() call without new', async () => {
    const input = `RegExp('(?<!foo)bar')`;
    expect(transpile(src,input)).toBe(iife('RegExp("bar");\n'));
  });

  it('removes lookbehind from RegExp string pattern with escaped chars', async () => {
    const input = `new RegExp('(?<=\\\\d{3})\\\\d+')`;
    expect(transpile(src,input)).toBe(iife('new RegExp("\\\\d+");\n'));
  });

  it('does not modify RegExp string pattern without lookbehind', async () => {
    const input = `new RegExp('^hello$', 'i')`;
    expect(transpile(src,input)).toBe(iife("new RegExp('^hello$', 'i');\n"));
  });

  it('does not modify RegExp with non-literal pattern', async () => {
    const input = `const p = '(?<=foo)bar';\nnew RegExp(p, 'g');`;
    expect(transpile(src,input)).toBe(iife("const p = '(?<=foo)bar';\nnew RegExp(p, 'g');\n"));
  });

  it('removes lookbehind from a template-literal RegExp pattern', async () => {
    const input = 'new RegExp(`(?<![A-Za-z0-9])(${hm})x${vm}`, "gi");';
    expect(transpile(src,input)).toBe(iife('new RegExp(`(${hm})x${vm}`, "gi");\n'));
  });

  it('removes escaped lookbehind from a template-literal RegExp pattern', async () => {
    const input = 'new RegExp(`(?<![\\\\w-])(-${hm})${vm}`, "gi");';
    expect(transpile(src,input)).toBe(iife('new RegExp(`(-${hm})${vm}`, "gi");\n'));
  });

  it('leaves a template RegExp untouched when no static lookbehind', async () => {
    const input = 'new RegExp(`(?!<token>)${hm}x`, "gi");';
    expect(transpile(src,input)).toBe(iife('new RegExp(`(?!<token>)${hm}x`, "gi");\n'));
  });
});
