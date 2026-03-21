import { describe, it, expect } from 'vitest';
import { wrapAsyncIIFE } from '../src/transforms/wrapAsyncIIFE';

describe('wrapAsyncIIFE', () => {
  it('wraps a single statement', () => {
    const input = `console.log("hello");`;
    expect(wrapAsyncIIFE(input)).toBe('(async function () {\n  console.log("hello");\n})();\n');
  });

  it('wraps code containing await', () => {
    const input = `const x = await fetch("/api");\nconsole.log(x);`;
    expect(wrapAsyncIIFE(input)).toBe('(async function () {\n  const x = await fetch("/api");\n  console.log(x);\n})();\n');
  });

  it('wraps multiple statements', () => {
    const input = `const a = 1;\nconst b = 2;\nconsole.log(a + b);`;
    expect(wrapAsyncIIFE(input)).toBe('(async function () {\n  const a = 1;\n  const b = 2;\n  console.log(a + b);\n})();\n');
  });
});
