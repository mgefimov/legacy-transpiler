import { describe, it, expect } from 'vitest';
import { transpile, init } from '../src/index';

const BASE_URL = 'https://assets-proxy.anthropic.com/claude-ai/v2/assets/v1';
const src = `${BASE_URL}/index-BIdSPwg7.js`;

init({ BASE_URL, minify: false, runScript: () => {} });

function iife(body: string): string {
  const lines = body.split('\n').filter(l => l.length > 0);
  if (lines.length === 0) return "'use strict';\n(async function () {})();\n";
  const indented = lines.map(l => '  ' + l).join('\n');
  return `'use strict';\n(async function () {\n${indented}\n})();\n`;
}

describe('replaceImportMeta', () => {
  it('replaces import.meta.url with string literal', async () => {
    const input = `const url = import.meta.url;`;
    expect(transpile(src,input)).toBe(
      iife(`const url = "${src}";\n`)
    );
  });

  it('replaces import.meta.url inside expressions', async () => {
    const input = `new URL("./worker.js", import.meta.url);`;
    expect(transpile(src,input)).toBe(
      iife(`new URL("./worker.js", "${src}");\n`)
    );
  });

  it('replaces multiple occurrences', async () => {
    const input = `console.log(import.meta.url, import.meta.url);`;
    expect(transpile(src,input)).toBe(
      iife(`console.log("${src}", "${src}");\n`)
    );
  });
});
