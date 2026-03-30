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

describe('wrapAsyncIIFE', () => {
  it('wraps a single statement', async () => {
    const input = `console.log("hello");`;
    expect(transpile(src,input)).toBe(
      iife('console.log("hello");\n')
    );
  });

  it('wraps code containing await', async () => {
    const input = `const x = await fetch("/api");\nconsole.log(x);`;
    expect(transpile(src,input)).toBe(
      iife('const x = await fetch("/api");\nconsole.log(x);\n')
    );
  });

  it('wraps multiple statements', async () => {
    const input = `const a = 1;\nconst b = 2;\nconsole.log(a + b);`;
    expect(transpile(src,input)).toBe(
      iife('const a = 1;\nconst b = 2;\nconsole.log(a + b);\n')
    );
  });
});
