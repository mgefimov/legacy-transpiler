import { describe, it, expect } from 'vitest';
import { replaceImportMeta } from '../src/transforms/replaceImportMeta';

const URL = 'https://assets-proxy.anthropic.com/claude-ai/v2/assets/v1/index-BIdSPwg7.js';

describe('replaceImportMeta', () => {
  it('replaces import.meta.url with string literal', () => {
    const input = `const url = import.meta.url;`;
    expect(replaceImportMeta(input, { url: URL })).toBe(
      `const url = "${URL}";\n`
    );
  });

  it('replaces import.meta.url inside expressions', () => {
    const input = `new URL("./worker.js", import.meta.url);`;
    expect(replaceImportMeta(input, { url: URL })).toBe(
      `new URL("./worker.js", "${URL}");\n`
    );
  });

  it('replaces multiple occurrences', () => {
    const input = `console.log(import.meta.url, import.meta.url);`;
    expect(replaceImportMeta(input, { url: URL })).toBe(
      `console.log("${URL}", "${URL}");\n`
    );
  });

  it('falls back to document.currentScript.src without url option', () => {
    const input = `const url = import.meta.url;`;
    expect(replaceImportMeta(input)).toBe('const url = document.currentScript.src;\n');
  });
});
