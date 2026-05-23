import { describe, it, expect, vi } from 'vitest';

vi.mock('../src/utils', () => ({ patchFetch: () => {} }));

import { transpile, init } from '../src/index';

const BASE_URL = 'https://assets-proxy.anthropic.com/claude-ai/v2/assets/v1';
const src = `${BASE_URL}/test.js`;

const iOS13 = { platform: 'iOS' as const, version: '13.4' };

init({ BASE_URL, minify: false, target: iOS13, runScript: () => {} });

function iife(body: string): string {
  const lines = body.split('\n').filter(l => l.length > 0);
  if (lines.length === 0) return "'use strict';\n(async function () {})();\n";
  const indented = lines.map(l => '  ' + l).join('\n');
  return `'use strict';\n(async function () {\n${indented}\n})();\n`;
}

describe('transformInstanceClassFields', () => {
  it('moves instance field initializers to the top of an existing constructor', () => {
    const input =
      `class Point {\n  x = 0;\n  y = 0;\n  label = 'origin';\n` +
      `  constructor(x, y) {\n    this.x = x;\n    this.y = y;\n  }\n` +
      `  toString() {\n    return this.label + ': (' + this.x + ', ' + this.y + ')';\n  }\n}`;
    expect(transpile(src, input)).toBe(
      iife(
        "class Point {\n" +
        "  constructor(x, y) {\n" +
        "    this.x = 0;\n" +
        "    this.y = 0;\n" +
        "    this.label = 'origin';\n" +
        "    this.x = x;\n" +
        "    this.y = y;\n" +
        "  }\n" +
        "  toString() {\n" +
        "    return this.label + ': (' + this.x + ', ' + this.y + ')';\n" +
        "  }\n" +
        "}\n"
      )
    );
  });

  it('synthesizes a constructor when the base class has none', () => {
    const input = `class Box {\n  size = 10;\n}`;
    expect(transpile(src, input)).toBe(
      iife(
        "class Box {\n" +
        "  constructor() {\n" +
        "    this.size = 10;\n" +
        "  }\n" +
        "}\n"
      )
    );
  });

  it('initializes a field without an initializer to undefined', () => {
    const input = `class C {\n  x;\n}`;
    expect(transpile(src, input)).toBe(
      iife(
        "class C {\n" +
        "  constructor() {\n" +
        "    this.x = undefined;\n" +
        "  }\n" +
        "}\n"
      )
    );
  });

  it('inserts inits after super() in a derived class with a constructor', () => {
    const input =
      `class Dog extends Animal {\n  sound = 'woof';\n` +
      `  constructor(name) {\n    super(name);\n    this.name = name;\n  }\n}`;
    expect(transpile(src, input)).toBe(
      iife(
        "class Dog extends Animal {\n" +
        "  constructor(name) {\n" +
        "    super(name);\n" +
        "    this.sound = 'woof';\n" +
        "    this.name = name;\n" +
        "  }\n" +
        "}\n"
      )
    );
  });

  it('synthesizes a super-forwarding constructor for a derived class with none', () => {
    const input = `class Dog extends Animal {\n  sound = 'woof';\n}`;
    expect(transpile(src, input)).toBe(
      iife(
        "class Dog extends Animal {\n" +
        "  constructor(...args) {\n" +
        "    super(...args);\n" +
        "    this.sound = 'woof';\n" +
        "  }\n" +
        "}\n"
      )
    );
  });

  it('handles a class expression in a variable declaration', () => {
    const input = `const Box = class {\n  size = 1;\n};`;
    expect(transpile(src, input)).toBe(
      iife(
        "const Box = class {\n" +
        "  constructor() {\n" +
        "    this.size = 1;\n" +
        "  }\n" +
        "};\n"
      )
    );
  });

  it('moves renamed private fields (from the private-fields transform) into the constructor', () => {
    const input =
      `class BankAccount {\n  #balance = 0;\n` +
      `  constructor(initial) {\n    this.#balance = initial;\n  }\n}`;
    expect(transpile(src, input)).toBe(
      iife(
        "class BankAccount {\n" +
        "  constructor(initial) {\n" +
        "    this._private_field__balance = 0;\n" +
        "    this._private_field__balance = initial;\n" +
        "  }\n" +
        "}\n"
      )
    );
  });

  it('leaves a class without instance fields unchanged', () => {
    const input = `class C {\n  m() {\n    return 1;\n  }\n}`;
    expect(transpile(src, input)).toBe(
      iife(
        "class C {\n" +
        "  m() {\n" +
        "    return 1;\n" +
        "  }\n" +
        "}\n"
      )
    );
  });

  it('skips the transform for iOS 14.0 and above', () => {
    init({ BASE_URL, minify: false, target: { platform: 'iOS', version: '14.0' }, runScript: () => {} });
    const input = `class C {\n  x = 1;\n}`;
    expect(transpile(src, input)).toBe(
      iife("class C {\n  x = 1;\n}\n")
    );
    init({ BASE_URL, minify: false, target: iOS13, runScript: () => {} });
  });

  it('applies the transform for iOS below 14.0', () => {
    const input = `class C {\n  x = 1;\n}`;
    expect(transpile(src, input)).toBe(
      iife(
        "class C {\n" +
        "  constructor() {\n" +
        "    this.x = 1;\n" +
        "  }\n" +
        "}\n"
      )
    );
  });
});
