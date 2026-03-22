import { describe, it, expect } from 'vitest';
import { transpile } from '../src/index';

const BASE_URL = 'https://assets-proxy.anthropic.com/claude-ai/v2/assets/v1';
const resolveModule = (source: string) => `${BASE_URL}/${source.replace(/^\.\//, '')}`;
const src = `${BASE_URL}/index-BIdSPwg7.js`;

describe('replaceImportMeta', () => {
  it('replaces import.meta.url with string literal', async () => {
    const input = `const url = import.meta.url;`;
    expect(await transpile(input, { src, resolveModule })).toBe(
      `const url = "${src}";\n`
    );
  });

  it('replaces import.meta.url inside expressions', async () => {
    const input = `new URL("./worker.js", import.meta.url);`;
    expect(await transpile(input, { src, resolveModule })).toBe(
      `new URL("./worker.js", "${src}");\n`
    );
  });

  it('replaces multiple occurrences', async () => {
    const input = `console.log(import.meta.url, import.meta.url);`;
    expect(await transpile(input, { src, resolveModule })).toBe(
      `console.log("${src}", "${src}");\n`
    );
  });
});
