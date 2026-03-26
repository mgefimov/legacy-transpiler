import { describe, it, expect } from 'vitest';
import { transpile } from '../src/index';

const BASE_URL = 'https://assets-proxy.anthropic.com/claude-ai/v2/assets/v1';
const resolveModule = (source: string) => `${BASE_URL}/${source.replace(/^\.\//, '')}`;
const staticImportModule = async (resolvedSource: string) => {
  // In a real implementation, this would fetch the module and store it in a way that it can be accessed at runtime.
  // For testing, we can just log it or do nothing.
}
const src = `${BASE_URL}/test.js`;
const me = (s: string) => `window.LegacyTranspiler._moduleExports["${s}"]`;
const di = (s: string) => `window.LegacyTranspiler._import(${s})`;

function iife(body: string): string {
  const lines = body.split('\n').filter(l => l.length > 0);
  if (lines.length === 0) return '(async function () {})();\n';
  const indented = lines.map(l => '  ' + l).join('\n');
  return `(async function () {\n${indented}\n})();\n`;
}

describe('resolveDynamicImport', () => {
  it('converts dynamic import with await', async () => {
    const input = `const { L } = await import('./tree-sitter-CkPuvsme.js');`;
    expect(await transpile(input, { src, resolveModule, staticImportModule })).toBe(
      iife(`var {L} = ${me(`${BASE_URL}/tree-sitter-CkPuvsme.js`)};\n`)
    );
  });

  it('converts dynamic import without await', async () => {
    const input = `const p = import('./vendor-Dfbm12k5.js');`;
    expect(await transpile(input, { src, resolveModule, staticImportModule })).toBe(
      iife(`var p = ${me(`${BASE_URL}/vendor-Dfbm12k5.js`)};\n`)
    );
  });

  it('converts dynamic import with .then()', async () => {
    const input = `import('./vendor-Dfbm12k5.js').then(m => m.foo());`;
    expect(await transpile(input, { src, resolveModule, staticImportModule })).toBe(
      iife(`${me(`${BASE_URL}/vendor-Dfbm12k5.js`)}.then(m => m.foo());\n`)
    );
  });

  it('wraps template literal dynamic import via _import (no compile-time resolution)', async () => {
    const input = 'const m = import(`./${name}.js`);';
    expect(await transpile(input, { src, resolveModule, staticImportModule })).toBe(
      iife(`var m = ${di('`./${name}.js`')};\n`)
    );
  });

  it('preserves await on template literal dynamic import via _import', async () => {
    const input = 'const m = await import(`./${name}.js`);';
    expect(await transpile(input, { src, resolveModule, staticImportModule })).toBe(
      iife(`var m = await ${di('`./${name}.js`')};\n`)
    );
  });

  it('wraps identifier dynamic import via _import (no compile-time resolution)', async () => {
    const input = `var path = './path/to/module.js';\nconst m = await import(path);`;
    expect(await transpile(input, { src, resolveModule, staticImportModule })).toBe(
      iife(`var path = './path/to/module.js';\nvar m = await ${di('path')};\n`)
    );
  });

  it('wraps call expression dynamic import via _import', async () => {
    const input = 'const m = import(getPath());';
    expect(await transpile(input, { src, resolveModule, staticImportModule })).toBe(
      iife(`var m = ${di('getPath()')};\n`)
    );
  });

  it('does not inject _import helper into output', async () => {
    const input = 'const m = import(`./${name}.js`);';
    const result = await transpile(input, { src, resolveModule, staticImportModule });
    expect(result).not.toContain('function _import');
  });

  it('keeps code unchanged when no dynamic imports', async () => {
    const input = `const x = 1;`;
    expect(await transpile(input, { src, resolveModule, staticImportModule })).toBe(iife('var x = 1;\n'));
  });
});
