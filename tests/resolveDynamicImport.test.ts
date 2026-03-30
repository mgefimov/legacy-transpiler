import { describe, it, expect } from 'vitest';
import { transpile, init } from '../src/index';

const BASE_URL = 'https://assets-proxy.anthropic.com/claude-ai/v2/assets/v1';
const src = `${BASE_URL}/test.js`;
const im = (s: string) => `window.LegacyTranspiler.importModule(${s})`;

init({ BASE_URL, minify: false, runScript: () => {} });

function iife(body: string): string {
  const lines = body.split('\n').filter(l => l.length > 0);
  if (lines.length === 0) return "'use strict';\n(async function () {})();\n";
  const indented = lines.map(l => '  ' + l).join('\n');
  return `'use strict';\n(async function () {\n${indented}\n})();\n`;
}

describe('resolveDynamicImport', () => {
  it('converts dynamic import with await', async () => {
    const input = `const { L } = await import('./tree-sitter-CkPuvsme.js');`;
    expect(transpile(src,input)).toBe(
      iife(`const {L} = await ${im(`"./tree-sitter-CkPuvsme.js"`)};\n`)
    );
  });

  it('converts dynamic import without await', async () => {
    const input = `const p = import('./vendor-Dfbm12k5.js');`;
    expect(transpile(src,input)).toBe(
      iife(`const p = ${im(`"./vendor-Dfbm12k5.js"`)};\n`)
    );
  });

  it('converts dynamic import with .then()', async () => {
    const input = `import('./vendor-Dfbm12k5.js').then(m => m.foo());`;
    expect(transpile(src,input)).toBe(
      iife(`${im(`"./vendor-Dfbm12k5.js"`)}.then(m => m.foo());\n`)
    );
  });

  it('wraps template literal dynamic import via _import (no compile-time resolution)', async () => {
    const input = 'const m = import(`./${name}.js`);';
    expect(transpile(src,input)).toBe(
      iife(`const m = ${im('`./${name}.js`')};\n`)
    );
  });

  it('preserves await on template literal dynamic import via _import', async () => {
    const input = 'const m = await import(`./${name}.js`);';
    expect(transpile(src,input)).toBe(
      iife(`const m = await ${im('`./${name}.js`')};\n`)
    );
  });

  it('wraps identifier dynamic import via _import (no compile-time resolution)', async () => {
    const input = `var path = './path/to/module.js';\nconst m = await import(path);`;
    expect(transpile(src,input)).toBe(
      iife(`var path = './path/to/module.js';\nconst m = await ${im('path')};\n`)
    );
  });

  it('wraps call expression dynamic import via _import', async () => {
    const input = 'const m = import(getPath());';
    expect(transpile(src,input)).toBe(
      iife(`const m = ${im('getPath()')};\n`)
    );
  });

  it('does not inject _import helper into output', async () => {
    const input = 'const m = import(`./${name}.js`);';
    const result = transpile(src,input);
    expect(result).not.toContain('function _import');
  });

  it('keeps code unchanged when no dynamic imports', async () => {
    const input = `const x = 1;`;
    expect(transpile(src,input)).toBe(iife('const x = 1;\n'));
  });
});
