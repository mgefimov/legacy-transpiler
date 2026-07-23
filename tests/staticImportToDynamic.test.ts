import { describe, it, expect } from 'vitest';
import { transpile, init } from '../src/index';

const BASE_URL = 'https://assets-proxy.anthropic.com/claude-ai/v2/assets/v1';
const src = `${BASE_URL}/test.js`;
const me = (s: string) => `await window.LegacyTranspiler.importModule('${s}', "${src}")`;

// A destructured import now emits the `let` binding plus a resync callback
// that re-destructures once the source module publishes its exports, so a
// circular import doesn't freeze an `undefined` snapshot.
const importBlock = (pattern: string, s: string) =>
  `let ${pattern} = ${me(s)};\n` +
  `window.LegacyTranspiler.onExportsUpdated("${s}", () => {\n` +
  `  (${pattern} = window.LegacyTranspiler.getModuleExports("${s}"));\n` +
  `});`;

init({ BASE_URL, minify: false, runScript: () => {} });

function iife(body: string): string {
  const lines = body.split('\n').filter(l => l.length > 0);
  if (lines.length === 0) return "'use strict';\n(async function () {})();\n";
  const indented = lines.map(l => '  ' + l).join('\n');
  return `'use strict';\n(async function () {\n${indented}\n})();\n`;
}

describe('staticImportToDynamic', () => {
  it('converts named import with relative path', async () => {
    const input = `import { something } from './vendor-Dfbm12k5.js';`;
    expect(transpile(src,input)).toBe(
      iife(`${importBlock('{something}', './vendor-Dfbm12k5.js')}\n`)
    );
  });

  it('converts aliased named import', async () => {
    const input = `import { x as y } from './vendor-Dfbm12k5.js';`;
    expect(transpile(src,input)).toBe(
      iife(`${importBlock('{x: y}', './vendor-Dfbm12k5.js')}\n`)
    );
  });

  it('converts default import', async () => {
    const input = `import defaultExport from './vendor-Dfbm12k5.js';`;
    expect(transpile(src,input)).toBe(
      iife(`${importBlock('{default: defaultExport}', './vendor-Dfbm12k5.js')}\n`)
    );
  });

  it('converts namespace import', async () => {
    const input = `import * as mod from './vendor-Dfbm12k5.js';`;
    expect(transpile(src,input)).toBe(
      iife(`const mod = ${me(`./vendor-Dfbm12k5.js`)};\n`)
    );
  });

  it('strips side-effect import', async () => {
    const input = `import './vendor-Dfbm12k5.js';`;
    expect(transpile(src,input)).toBe(iife(''));
  });

  it('converts mixed default and named import', async () => {
    const input = `import defaultExport, { named } from './vendor-Dfbm12k5.js';`;
    expect(transpile(src,input)).toBe(
      iife(`${importBlock('{default: defaultExport, named}', './vendor-Dfbm12k5.js')}\n`)
    );
  });

  it('converts multiple named imports', async () => {
    const input = `import { a, b, c } from './vendor-Dfbm12k5.js';`;
    expect(transpile(src,input)).toBe(
      iife(`${importBlock('{a, b, c}', './vendor-Dfbm12k5.js')}\n`)
    );
  });

  it('resolves module path', async () => {
    const input = `import { x } from './some-module';`;
    expect(transpile(src,input)).toBe(
      iife(`${importBlock('{x}', './some-module')}\n`)
    );
  });
});
