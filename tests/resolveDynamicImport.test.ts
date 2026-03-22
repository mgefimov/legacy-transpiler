import { describe, it, expect } from 'vitest';
import { transpile } from '../src/index';

const BASE_URL = 'https://assets-proxy.anthropic.com/claude-ai/v2/assets/v1';
const resolveModule = (source: string) => `${BASE_URL}/${source.replace(/^\.\//, '')}`;
const src = `${BASE_URL}/test.js`;
const me = (s: string) => `window.LegacyTranspiler._moduleExports["${s}"]`;

describe('resolveDynamicImport', () => {
  it('converts dynamic import with await', async () => {
    const input = `const { L } = await import('./tree-sitter-CkPuvsme.js');`;
    expect(await transpile(input, { src, resolveModule })).toBe(
      `const {L} = ${me(`${BASE_URL}/tree-sitter-CkPuvsme.js`)};\n`
    );
  });

  it('converts dynamic import without await', async () => {
    const input = `const p = import('./vendor-Dfbm12k5.js');`;
    expect(await transpile(input, { src, resolveModule })).toBe(
      `const p = ${me(`${BASE_URL}/vendor-Dfbm12k5.js`)};\n`
    );
  });

  it('converts dynamic import with .then()', async () => {
    const input = `import('./vendor-Dfbm12k5.js').then(m => m.foo());`;
    expect(await transpile(input, { src, resolveModule })).toBe(
      `${me(`${BASE_URL}/vendor-Dfbm12k5.js`)}.then(m => m.foo());\n`
    );
  });

  it('keeps code unchanged when no dynamic imports', async () => {
    const input = `const x = 1;`;
    expect(await transpile(input, { src, resolveModule })).toBe('const x = 1;\n');
  });
});
