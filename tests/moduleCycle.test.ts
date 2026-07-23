import { describe, it, expect, beforeEach, vi } from 'vitest';
import { init, loadCode, importModule, exportModule } from '../src/index';

const BASE_URL = 'https://assets-proxy.anthropic.com/claude-ai/v2/assets/v1';

const sources: Record<string, string> = {
  [`${BASE_URL}/a.js`]: `import { b } from './b.js';\nexport const a = 1;`,
  [`${BASE_URL}/b.js`]: `import { a } from './a.js';\nexport const b = 2;`,
  [`${BASE_URL}/z.js`]: `export const z = 42;`,
  [`${BASE_URL}/x.js`]: `import { z } from './z.js';\nexport const x = z + 1;`,
  [`${BASE_URL}/y.js`]: `import { z } from './z.js';\nexport const y = z + 2;`,
  [`${BASE_URL}/greet-a.js`]: `import { useGreet } from './greet-b.js';\nexport function greet(name) { return 'hi ' + name; }\nexport const viaB = () => useGreet('circular');`,
  [`${BASE_URL}/greet-b.js`]: `import { greet } from './greet-a.js';\nexport function useGreet(name) { return greet(name); }`,
};

function timeout(ms: number, label: string): Promise<never> {
  return new Promise((_, reject) => setTimeout(() => reject(new Error(label)), ms));
}

function setup(delayUrl?: string): void {
  vi.stubGlobal('fetch', vi.fn(async (url: string) => {
    if (url === delayUrl) {
      await new Promise((resolve) => setTimeout(resolve, 20));
    }
    return { text: async () => sources[url] };
  }));

  const windowStub = { LegacyTranspiler: { importModule, exportModule } };
  init({
    BASE_URL,
    minify: false,
    runScript: (code: string) => {
      new Function('window', code)(windowStub);
    },
  });
}

describe('circular static imports', () => {
  beforeEach(() => setup());

  it('resolves both modules instead of deadlocking', async () => {
    loadCode(`${BASE_URL}/a.js`);

    const result = await Promise.race([
      importModule(`./a.js`),
      timeout(1000, 'deadlock: importModule(a.js) never resolved'),
    ]);
    expect(result).toEqual({ a: 1 });
  });
});

// RED test — reproduces the "X is not a function" bug (the production
// `pe is not a function`). greet-b.js destructures `greet` from greet-a.js
// while greet-a.js is still mid-cycle, so its `const greet` snapshot freezes
// to undefined; greet-a.js later exports the real function but the frozen
// binding never updates. Asserts the correct (live-binding) behavior, so it
// FAILS today and will go green once bindings are made live.
describe('circular destructured function binding (known bug)', () => {
  beforeEach(() => setup());

  it('keeps a circular function binding live instead of freezing undefined', async () => {
    loadCode(`${BASE_URL}/greet-a.js`);

    const a = await Promise.race([
      importModule(`./greet-a.js`),
      timeout(1000, 'deadlock: greet-a.js never resolved'),
    ]);

    if (typeof a !== 'object' || a === null || !('viaB' in a) || typeof a.viaB !== 'function') {
      throw new Error('expected greet-a.js to export a viaB function');
    }

    // viaB() -> useGreet('circular') -> greet('circular'). With the current
    // const snapshot, greet is undefined here and this throws
    // "greet is not a function". Should return the real greeting.
    expect(a.viaB()).toBe('hi circular');
  });
});

describe('shared (non-circular) dependency', () => {
  beforeEach(() => setup(`${BASE_URL}/z.js`));

  it('waits for the real export instead of a premature placeholder', async () => {
    loadCode(`${BASE_URL}/x.js`);
    loadCode(`${BASE_URL}/y.js`);

    const [x, y] = await Promise.all([
      Promise.race([importModule(`./x.js`), timeout(1000, 'x.js never resolved')]),
      Promise.race([importModule(`./y.js`), timeout(1000, 'y.js never resolved')]),
    ]);

    expect(x).toEqual({ x: 43 });
    expect(y).toEqual({ y: 44 });
  });
});
