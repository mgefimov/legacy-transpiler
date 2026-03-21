import { describe, it, expect } from 'vitest';
import { transpile } from '../src/index';

const BASE_URL = 'https://assets-proxy.anthropic.com/claude-ai/v2/assets/v1';
const resolveModule = (source: string) => `${BASE_URL}/${source.replace(/^\.\//, '')}`;

describe('transpile', () => {
  it('converts import and wraps in async IIFE with resolveModule', () => {
    const input = `import { something } from './vendor-Dfbm12k5.js';`;
    expect(transpile(input, { resolveModule })).toBe(
      `(async function () {\n  const {something} = await import("${BASE_URL}/vendor-Dfbm12k5.js");\n})();\n`
    );
  });

  it('converts import with surrounding code', () => {
    const input = `import { something } from './vendor-Dfbm12k5.js';\nconsole.log(something);`;
    expect(transpile(input, { resolveModule })).toBe(
      `(async function () {\n  const {something} = await import("${BASE_URL}/vendor-Dfbm12k5.js");\n  console.log(something);\n})();\n`
    );
  });

  it('converts multiple imports', () => {
    const input = `import { a } from './mod-a.js';\nimport { b } from './mod-b.js';\nconsole.log(a, b);`;
    expect(transpile(input, { resolveModule })).toBe(
      `(async function () {\n  const {a} = await import("${BASE_URL}/mod-a.js");\n  const {b} = await import("${BASE_URL}/mod-b.js");\n  console.log(a, b);\n})();\n`
    );
  });

  it('keeps original path without resolveModule', () => {
    const input = `import { something } from './some-module';`;
    expect(transpile(input)).toBe(
      "(async function () {\n  const {something} = await import('./some-module');\n})();\n"
    );
  });

  it('wraps plain code without imports', () => {
    const input = `const x = 1;\nconsole.log(x);`;
    expect(transpile(input)).toBe(
      '(async function () {\n  const x = 1;\n  console.log(x);\n})();\n'
    );
  });
});
