import { describe, it, expect } from 'vitest';
import { transpile } from '../src/index';

const BASE_URL = 'https://assets-proxy.anthropic.com/claude-ai/v2/assets/v1';
const resolveModule = (source: string) => `${BASE_URL}/${source.replace(/^\.\//, '')}`;
const staticImportModule = async (resolvedSource: string) => {
  // In a real implementation, this would fetch the module and store it in a way that it can be accessed at runtime.
  // For testing, we can just log it or do nothing.
}
const src = `${BASE_URL}/test.js`;
const me = (s: string) => `window.LegacyTranspiler._moduleExports["${s}"]`;

function iife(body: string): string {
  const lines = body.split('\n').filter(l => l.length > 0);
  if (lines.length === 0) return "'use strict';\n(async function () {})();\n";
  const indented = lines.map(l => '  ' + l).join('\n');
  return `'use strict';\n(async function () {\n${indented}\n})();\n`;
}

describe('staticImportToDynamic', () => {
  it('converts named import with relative path', async () => {
    const input = `import { something } from './vendor-Dfbm12k5.js';`;
    expect(await transpile(input, { src, resolveModule, staticImportModule })).toBe(
      iife(`const {something} = ${me(`${BASE_URL}/vendor-Dfbm12k5.js`)};\n`)
    );
  });

  it('converts aliased named import', async () => {
    const input = `import { x as y } from './vendor-Dfbm12k5.js';`;
    expect(await transpile(input, { src, resolveModule, staticImportModule })).toBe(
      iife(`const {x: y} = ${me(`${BASE_URL}/vendor-Dfbm12k5.js`)};\n`)
    );
  });

  it('converts default import', async () => {
    const input = `import defaultExport from './vendor-Dfbm12k5.js';`;
    expect(await transpile(input, { src, resolveModule, staticImportModule })).toBe(
      iife(`const {default: defaultExport} = ${me(`${BASE_URL}/vendor-Dfbm12k5.js`)};\n`)
    );
  });

  it('converts namespace import', async () => {
    const input = `import * as mod from './vendor-Dfbm12k5.js';`;
    expect(await transpile(input, { src, resolveModule, staticImportModule })).toBe(
      iife(`const mod = ${me(`${BASE_URL}/vendor-Dfbm12k5.js`)};\n`)
    );
  });

  it('strips side-effect import', async () => {
    const input = `import './vendor-Dfbm12k5.js';`;
    expect(await transpile(input, { src, resolveModule, staticImportModule })).toBe(iife(''));
  });

  it('converts mixed default and named import', async () => {
    const input = `import defaultExport, { named } from './vendor-Dfbm12k5.js';`;
    expect(await transpile(input, { src, resolveModule, staticImportModule })).toBe(
      iife(`const {default: defaultExport, named} = ${me(`${BASE_URL}/vendor-Dfbm12k5.js`)};\n`)
    );
  });

  it('converts multiple named imports', async () => {
    const input = `import { a, b, c } from './vendor-Dfbm12k5.js';`;
    expect(await transpile(input, { src, resolveModule, staticImportModule })).toBe(
      iife(`const {a, b, c} = ${me(`${BASE_URL}/vendor-Dfbm12k5.js`)};\n`)
    );
  });

  it('resolves module path', async () => {
    const input = `import { x } from './some-module';`;
    expect(await transpile(input, { src, resolveModule, staticImportModule })).toBe(
      iife(`const {x} = ${me(`${BASE_URL}/some-module`)};\n`)
    );
  });
});
