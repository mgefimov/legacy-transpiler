import { describe, it, expect } from 'vitest';
import { staticImportToDynamic } from '../src/transforms/staticImportToDynamic';

const BASE_URL = 'https://assets-proxy.anthropic.com/claude-ai/v2/assets/v1';
const resolveModule = (source: string) => `${BASE_URL}/${source.replace(/^\.\//, '')}`;

describe('staticImportToDynamic', () => {
  it('converts named import with relative path', () => {
    const input = `import { something } from './vendor-Dfbm12k5.js';`;
    expect(staticImportToDynamic(input, { resolveModule })).toBe(
      'const {something} = window.LegacyTranspiler._moduleExports["https://assets-proxy.anthropic.com/claude-ai/v2/assets/v1/vendor-Dfbm12k5.js"];\n'
    );
  });

  it('converts aliased named import', () => {
    const input = `import { x as y } from './vendor-Dfbm12k5.js';`;
    expect(staticImportToDynamic(input, { resolveModule })).toBe(
      'const {x: y} = window.LegacyTranspiler._moduleExports["https://assets-proxy.anthropic.com/claude-ai/v2/assets/v1/vendor-Dfbm12k5.js"];\n'
    );
  });

  it('converts default import', () => {
    const input = `import defaultExport from './vendor-Dfbm12k5.js';`;
    expect(staticImportToDynamic(input, { resolveModule })).toBe(
      'const {default: defaultExport} = window.LegacyTranspiler._moduleExports["https://assets-proxy.anthropic.com/claude-ai/v2/assets/v1/vendor-Dfbm12k5.js"];\n'
    );
  });

  it('converts namespace import', () => {
    const input = `import * as mod from './vendor-Dfbm12k5.js';`;
    expect(staticImportToDynamic(input, { resolveModule })).toBe(
      'const mod = window.LegacyTranspiler._moduleExports["https://assets-proxy.anthropic.com/claude-ai/v2/assets/v1/vendor-Dfbm12k5.js"];\n'
    );
  });

  it('strips side-effect import', () => {
    const input = `import './vendor-Dfbm12k5.js';`;
    expect(staticImportToDynamic(input, { resolveModule })).toBe('');
  });

  it('converts mixed default and named import', () => {
    const input = `import defaultExport, { named } from './vendor-Dfbm12k5.js';`;
    expect(staticImportToDynamic(input, { resolveModule })).toBe(
      'const {default: defaultExport, named} = window.LegacyTranspiler._moduleExports["https://assets-proxy.anthropic.com/claude-ai/v2/assets/v1/vendor-Dfbm12k5.js"];\n'
    );
  });

  it('converts multiple named imports', () => {
    const input = `import { a, b, c } from './vendor-Dfbm12k5.js';`;
    expect(staticImportToDynamic(input, { resolveModule })).toBe(
      'const {a, b, c} = window.LegacyTranspiler._moduleExports["https://assets-proxy.anthropic.com/claude-ai/v2/assets/v1/vendor-Dfbm12k5.js"];\n'
    );
  });

  it('resolves module path', () => {
    const input = `import { x } from './some-module';`;
    expect(staticImportToDynamic(input, { resolveModule })).toBe(
      'const {x} = window.LegacyTranspiler._moduleExports["https://assets-proxy.anthropic.com/claude-ai/v2/assets/v1/some-module"];\n'
    );
  });
});
