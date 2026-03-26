import { describe, it, expect } from 'vitest';
import { transpile } from '../src/index';

const BASE_URL = 'https://assets-proxy.anthropic.com/claude-ai/v2/assets/v1';
const resolveModule = (source: string) => `${BASE_URL}/${source.replace(/^\.\//, '')}`;
const staticImportModule = async (resolvedSource: string) => {
  // In a real implementation, this would fetch the module and store it in a way that it can be accessed at runtime.
  // For testing, we can just log it or do nothing.
}
const src = `${BASE_URL}/index-BIdSPwg7.js`;

function iife(body: string): string {
  const lines = body.split('\n').filter(l => l.length > 0);
  if (lines.length === 0) return '(async function () {})();\n';
  const indented = lines.map(l => '  ' + l).join('\n');
  return `(async function () {\n${indented}\n})();\n`;
}

describe('replaceImportMeta', () => {
  it('replaces import.meta.url with string literal', async () => {
    const input = `const url = import.meta.url;`;
    expect(await transpile(input, { src, resolveModule, staticImportModule })).toBe(
      iife(`var url = "${src}";\n`)
    );
  });

  it('replaces import.meta.url inside expressions', async () => {
    const input = `new URL("./worker.js", import.meta.url);`;
    expect(await transpile(input, { src, resolveModule, staticImportModule })).toBe(
      iife(`new URL("./worker.js", "${src}");\n`)
    );
  });

  it('replaces multiple occurrences', async () => {
    const input = `console.log(import.meta.url, import.meta.url);`;
    expect(await transpile(input, { src, resolveModule, staticImportModule })).toBe(
      iife(`console.log("${src}", "${src}");\n`)
    );
  });
});
