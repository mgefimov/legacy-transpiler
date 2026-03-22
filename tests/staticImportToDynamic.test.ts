import { describe, it, expect } from 'vitest';
import { transpile } from '../src/index';

const BASE_URL = 'https://assets-proxy.anthropic.com/claude-ai/v2/assets/v1';
const resolveModule = (source: string) => `${BASE_URL}/${source.replace(/^\.\//, '')}`;
const src = `${BASE_URL}/test.js`;
const me = (s: string) => `window.LegacyTranspiler._moduleExports["${s}"]`;

describe('staticImportToDynamic', () => {
  it('converts named import with relative path', async () => {
    const input = `import { something } from './vendor-Dfbm12k5.js';`;
    expect(await transpile(input, { src, resolveModule })).toBe(
      `const {something} = ${me(`${BASE_URL}/vendor-Dfbm12k5.js`)};\n`
    );
  });

  it('converts aliased named import', async () => {
    const input = `import { x as y } from './vendor-Dfbm12k5.js';`;
    expect(await transpile(input, { src, resolveModule })).toBe(
      `const {x: y} = ${me(`${BASE_URL}/vendor-Dfbm12k5.js`)};\n`
    );
  });

  it('converts default import', async () => {
    const input = `import defaultExport from './vendor-Dfbm12k5.js';`;
    expect(await transpile(input, { src, resolveModule })).toBe(
      `const {default: defaultExport} = ${me(`${BASE_URL}/vendor-Dfbm12k5.js`)};\n`
    );
  });

  it('converts namespace import', async () => {
    const input = `import * as mod from './vendor-Dfbm12k5.js';`;
    expect(await transpile(input, { src, resolveModule })).toBe(
      `const mod = ${me(`${BASE_URL}/vendor-Dfbm12k5.js`)};\n`
    );
  });

  it('strips side-effect import', async () => {
    const input = `import './vendor-Dfbm12k5.js';`;
    expect(await transpile(input, { src, resolveModule })).toBe('');
  });

  it('converts mixed default and named import', async () => {
    const input = `import defaultExport, { named } from './vendor-Dfbm12k5.js';`;
    expect(await transpile(input, { src, resolveModule })).toBe(
      `const {default: defaultExport, named} = ${me(`${BASE_URL}/vendor-Dfbm12k5.js`)};\n`
    );
  });

  it('converts multiple named imports', async () => {
    const input = `import { a, b, c } from './vendor-Dfbm12k5.js';`;
    expect(await transpile(input, { src, resolveModule })).toBe(
      `const {a, b, c} = ${me(`${BASE_URL}/vendor-Dfbm12k5.js`)};\n`
    );
  });

  it('resolves module path', async () => {
    const input = `import { x } from './some-module';`;
    expect(await transpile(input, { src, resolveModule })).toBe(
      `const {x} = ${me(`${BASE_URL}/some-module`)};\n`
    );
  });
});
