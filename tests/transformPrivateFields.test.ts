import { describe, it, expect, vi } from 'vitest';

vi.mock('../src/utils', () => ({ patchFetch: () => {} }));

import { transpile, init } from '../src/index';

const BASE_URL = 'https://assets-proxy.anthropic.com/claude-ai/v2/assets/v1';
const src = `${BASE_URL}/test.js`;

init({ BASE_URL, minify: false, target: { platform: 'iOS', version: '14.0' }, runScript: () => {} });

function iife(body: string): string {
  const lines = body.split('\n').filter(l => l.length > 0);
  if (lines.length === 0) return "'use strict';\n(async function () {})();\n";
  const indented = lines.map(l => '  ' + l).join('\n');
  return `'use strict';\n(async function () {\n${indented}\n})();\n`;
}

describe('transformPrivateFields', () => {
  it('renames private field declarations and accesses', () => {
    const input = `class BankAccount {\n  #balance = 0;\n  constructor(initial) {\n    this.#balance = initial;\n  }\n  getBalance() {\n    return this.#balance;\n  }\n}`;
    expect(transpile(src, input)).toBe(
      iife(
        "class BankAccount {\n" +
        "  _private_field__balance = 0;\n" +
        "  constructor(initial) {\n" +
        "    this._private_field__balance = initial;\n" +
        "  }\n" +
        "  getBalance() {\n" +
        "    return this._private_field__balance;\n" +
        "  }\n" +
        "}\n"
      )
    );
  });

  it('preserves public fields alongside private ones', () => {
    const input = `class BankAccount {\n  #balance = 0;\n  owner;\n  constructor(owner, initial) {\n    this.owner = owner;\n    this.#balance = initial;\n  }\n}`;
    expect(transpile(src, input)).toBe(
      iife(
        "class BankAccount {\n" +
        "  _private_field__balance = 0;\n" +
        "  owner;\n" +
        "  constructor(owner, initial) {\n" +
        "    this.owner = owner;\n" +
        "    this._private_field__balance = initial;\n" +
        "  }\n" +
        "}\n"
      )
    );
  });

  it('renames private methods', () => {
    const input = `class Validator {\n  #rules = [];\n  #runRules(value) {\n    return this.#rules.every(fn => fn(value));\n  }\n  validate(value) {\n    return this.#runRules(value);\n  }\n}`;
    expect(transpile(src, input)).toBe(
      iife(
        "class Validator {\n" +
        "  _private_field__rules = [];\n" +
        "  _private_field__runRules(value) {\n" +
        "    return this._private_field__rules.every(fn => fn(value));\n" +
        "  }\n" +
        "  validate(value) {\n" +
        "    return this._private_field__runRules(value);\n" +
        "  }\n" +
        "}\n"
      )
    );
  });

  it('renames private field in `in` expression', () => {
    const input = `class Foo {\n  #x = 1;\n  static has(obj) {\n    return #x in obj;\n  }\n}`;
    expect(transpile(src, input)).toBe(
      iife(
        "class Foo {\n" +
        "  _private_field__x = 1;\n" +
        "  static has(obj) {\n" +
        "    return (_private_field__x in obj);\n" +
        "  }\n" +
        "}\n"
      )
    );
  });

  it('handles class expression', () => {
    const input = `const C = class {\n  #n = 1;\n  get() {\n    return this.#n;\n  }\n};`;
    expect(transpile(src, input)).toBe(
      iife(
        "const C = class {\n" +
        "  _private_field__n = 1;\n" +
        "  get() {\n" +
        "    return this._private_field__n;\n" +
        "  }\n" +
        "};\n"
      )
    );
  });

  it('does not touch classes without private fields', () => {
    const input = `class Plain {\n  x = 1;\n  get() {\n    return this.x;\n  }\n}`;
    expect(transpile(src, input)).toBe(
      iife(
        "class Plain {\n" +
        "  x = 1;\n" +
        "  get() {\n" +
        "    return this.x;\n" +
        "  }\n" +
        "}\n"
      )
    );
  });

  it('skips the transform for iOS 15.0 and above', () => {
    init({ BASE_URL, minify: false, target: { platform: 'iOS', version: '15.4' }, runScript: () => {} });
    const input = `class Foo {\n  #x = 1;\n  get() {\n    return this.#x;\n  }\n}`;
    expect(transpile(src, input)).toBe(
      iife(
        "class Foo {\n" +
        "  #x = 1;\n" +
        "  get() {\n" +
        "    return this.#x;\n" +
        "  }\n" +
        "}\n"
      )
    );
    init({ BASE_URL, minify: false, target: { platform: 'iOS', version: '14.0' }, runScript: () => {} });
  });

  it('applies the transform for iOS below 15.0', () => {
    init({ BASE_URL, minify: false, target: { platform: 'iOS', version: '14.8' }, runScript: () => {} });
    const input = `class Foo {\n  #x = 1;\n  get() {\n    return this.#x;\n  }\n}`;
    expect(transpile(src, input)).toBe(
      iife(
        "class Foo {\n" +
        "  _private_field__x = 1;\n" +
        "  get() {\n" +
        "    return this._private_field__x;\n" +
        "  }\n" +
        "}\n"
      )
    );
    init({ BASE_URL, minify: false, target: { platform: 'iOS', version: '14.0' }, runScript: () => {} });
  });
});
