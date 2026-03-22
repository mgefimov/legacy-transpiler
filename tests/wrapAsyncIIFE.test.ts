import { describe, it, expect } from 'vitest';
import { transpile } from '../src/index';

const BASE_URL = 'https://assets-proxy.anthropic.com/claude-ai/v2/assets/v1';
const resolveModule = (source: string) => `${BASE_URL}/${source.replace(/^\.\//, '')}`;
const src = `${BASE_URL}/test.js`;

describe('wrapAsyncIIFE', () => {
  it.skip('wraps a single statement', async () => {
    const input = `console.log("hello");`;
    expect(await transpile(input, { src, resolveModule })).toBe('(async function () {\n  console.log("hello");\n})();\n');
  });

  it.skip('wraps code containing await', async () => {
    const input = `const x = await fetch("/api");\nconsole.log(x);`;
    expect(await transpile(input, { src, resolveModule })).toBe('(async function () {\n  const x = await fetch("/api");\n  console.log(x);\n})();\n');
  });

  it.skip('wraps multiple statements', async () => {
    const input = `const a = 1;\nconst b = 2;\nconsole.log(a + b);`;
    expect(await transpile(input, { src, resolveModule })).toBe('(async function () {\n  const a = 1;\n  const b = 2;\n  console.log(a + b);\n})();\n');
  });
});
