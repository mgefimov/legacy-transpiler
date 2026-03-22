import { describe, it, expect } from 'vitest';
import { resolveDynamicImport } from '../src/transforms/resolveDynamicImport';

const BASE_URL = 'https://assets-proxy.anthropic.com/claude-ai/v2/assets/v1';
const resolveModule = (source: string) => `${BASE_URL}/${source.replace(/^\.\//, '')}`;

describe('resolveDynamicImport', () => {
  it('converts dynamic import with await', async () => {
    const input = `const { L } = await import('./tree-sitter-CkPuvsme.js');`;
    expect(await resolveDynamicImport(input, { resolveModule })).toBe(
      'const {L} = window.LegacyTranspiler._moduleExports["https://assets-proxy.anthropic.com/claude-ai/v2/assets/v1/tree-sitter-CkPuvsme.js"];\n'
    );
  });

  it('converts dynamic import without await', async () => {
    const input = `const p = import('./vendor-Dfbm12k5.js');`;
    expect(await resolveDynamicImport(input, { resolveModule })).toBe(
      'const p = window.LegacyTranspiler._moduleExports["https://assets-proxy.anthropic.com/claude-ai/v2/assets/v1/vendor-Dfbm12k5.js"];\n'
    );
  });

  it('converts dynamic import with .then()', async () => {
    const input = `import('./vendor-Dfbm12k5.js').then(m => m.foo());`;
    expect(await resolveDynamicImport(input, { resolveModule })).toBe(
      'window.LegacyTranspiler._moduleExports["https://assets-proxy.anthropic.com/claude-ai/v2/assets/v1/vendor-Dfbm12k5.js"].then(m => m.foo());\n'
    );
  });

  it('returns code unchanged when no dynamic imports', async () => {
    const input = `const x = 1;\n`;
    expect(await resolveDynamicImport(input, { resolveModule })).toBe(input);
  });
});
