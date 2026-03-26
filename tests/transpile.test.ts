import { describe, it, expect } from 'vitest';
import { transpile } from '../src/index';

const BASE_URL = 'https://assets-proxy.anthropic.com/claude-ai/v2/assets/v1';
const resolveModule = (source: string) => `${BASE_URL}/${source.replace(/^\.\//, '')}`;
const staticImportModule = async (resolvedSource: string) => {
  // In a real implementation, this would fetch the module and store it in a way that it can be accessed at runtime.
  // For testing, we can just log it or do nothing.
}
const src = `${BASE_URL}/index.js`;
const me = (s: string) => `window.LegacyTranspiler._moduleExports["${s}"]`;

describe('transpile', () => {
  it('converts import with resolveModule', async () => {
    const input = `import { something } from './vendor-Dfbm12k5.js';`;
    expect(await transpile(input, { src, resolveModule, staticImportModule })).toBe(
      `const {something} = ${me(`${BASE_URL}/vendor-Dfbm12k5.js`)};\n`
    );
  });

  it('converts import with surrounding code', async () => {
    const input = `import { something } from './vendor-Dfbm12k5.js';\nconsole.log(something);`;
    expect(await transpile(input, { src, resolveModule, staticImportModule })).toBe(
      `const {something} = ${me(`${BASE_URL}/vendor-Dfbm12k5.js`)};\nconsole.log(something);\n`
    );
  });

  it('converts multiple imports', async () => {
    const input = `import { a } from './mod-a.js';\nimport { b } from './mod-b.js';\nconsole.log(a, b);`;
    expect(await transpile(input, { src, resolveModule, staticImportModule })).toBe(
      `const {a} = ${me(`${BASE_URL}/mod-a.js`)};\nconst {b} = ${me(`${BASE_URL}/mod-b.js`)};\nconsole.log(a, b);\n`
    );
  });

  it('resolves import path', async () => {
    const input = `import { something } from './some-module';`;
    expect(await transpile(input, { src, resolveModule, staticImportModule })).toBe(
      `const {something} = ${me(`${BASE_URL}/some-module`)};\n`
    );
  });

  it('passes through plain code', async () => {
    const input = `const x = 1;\nconsole.log(x);`;
    expect(await transpile(input, { src, resolveModule, staticImportModule })).toBe(
      'const x = 1;\nconsole.log(x);\n'
    );
  });
});
