import { describe, it, expect, beforeEach, vi } from 'vitest';
import { init, loadCode, importModule, exportModule } from '../src/index';

const BASE_URL = 'https://assets-proxy.anthropic.com/claude-ai/v2/assets/v1';

const sources: Record<string, string> = {
  [`${BASE_URL}/a.js`]: `import { b } from './b.js';\nexport const a = 1;`,
  [`${BASE_URL}/b.js`]: `import { a } from './a.js';\nexport const b = 2;`,
  [`${BASE_URL}/z.js`]: `export const z = 42;`,
  [`${BASE_URL}/x.js`]: `import { z } from './z.js';\nexport const x = z + 1;`,
  [`${BASE_URL}/y.js`]: `import { z } from './z.js';\nexport const y = z + 2;`,
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
