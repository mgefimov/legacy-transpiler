import { describe, it, expect } from 'vitest';
import { transpile } from '../src/index';

const BASE_URL = 'https://assets-proxy.anthropic.com/claude-ai/v2/assets/v1';
const resolveModule = (source: string) => `${BASE_URL}/${source.replace(/^\.\//, '')}`;
const src = `${BASE_URL}/index.js`;
const me = (s: string) => `window.LegacyTranspiler._moduleExports["${s}"]`;

describe('transpile', () => {
  it('converts import and wraps in async IIFE with resolveModule', () => {
    const input = `import { something } from './vendor-Dfbm12k5.js';`;
    expect(transpile(input, { src, resolveModule })).toBe(
      `(async function () {\n  const {something} = ${me(`${BASE_URL}/vendor-Dfbm12k5.js`)};\n})();\n`
    );
  });

  it('converts import with surrounding code', () => {
    const input = `import { something } from './vendor-Dfbm12k5.js';\nconsole.log(something);`;
    expect(transpile(input, { src, resolveModule })).toBe(
      `(async function () {\n  const {something} = ${me(`${BASE_URL}/vendor-Dfbm12k5.js`)};\n  console.log(something);\n})();\n`
    );
  });

  it('converts multiple imports', () => {
    const input = `import { a } from './mod-a.js';\nimport { b } from './mod-b.js';\nconsole.log(a, b);`;
    expect(transpile(input, { src, resolveModule })).toBe(
      `(async function () {\n  const {a} = ${me(`${BASE_URL}/mod-a.js`)};\n  const {b} = ${me(`${BASE_URL}/mod-b.js`)};\n  console.log(a, b);\n})();\n`
    );
  });

  it('resolves import path', () => {
    const input = `import { something } from './some-module';`;
    expect(transpile(input, { src, resolveModule })).toBe(
      `(async function () {\n  const {something} = ${me(`${BASE_URL}/some-module`)};\n})();\n`
    );
  });

  it('wraps plain code without imports', () => {
    const input = `const x = 1;\nconsole.log(x);`;
    expect(transpile(input, { src, resolveModule })).toBe(
      '(async function () {\n  const x = 1;\n  console.log(x);\n})();\n'
    );
  });
});
