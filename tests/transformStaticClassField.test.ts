import { describe, it, expect, vi } from 'vitest';

vi.mock('../src/utils', () => ({ patchFetch: () => {} }));

import { transpile, init } from '../src/index';

const BASE_URL = 'https://assets-proxy.anthropic.com/claude-ai/v2/assets/v1';
const src = `${BASE_URL}/test.js`;

init({ BASE_URL, minify: false, runScript: () => {} });

function iife(body: string): string {
  const lines = body.split('\n').filter(l => l.length > 0);
  if (lines.length === 0) return "'use strict';\n(async function () {})();\n";
  const indented = lines.map(l => '  ' + l).join('\n');
  return `'use strict';\n(async function () {\n${indented}\n})();\n`;
}

describe('transformStaticClassFields', () => {
  it('moves static fields to assignments after class', () => {
    const input = `class Config {\n  static defaultLocale = 'en';\n  static version = '2.0';\n}`;
    expect(transpile(src, input)).toBe(
      iife("class Config {}\nConfig.defaultLocale = 'en';\nConfig.version = '2.0';\n")
    );
  });

  it('preserves non-static members', () => {
    const input = `class Config {\n  static defaultLocale = 'en';\n  name;\n  constructor(name) {\n    this.name = name;\n  }\n}`;
    expect(transpile(src, input)).toBe(
      iife("class Config {\n  name;\n  constructor(name) {\n    this.name = name;\n  }\n}\nConfig.defaultLocale = 'en';\n")
    );
  });

  it('handles static field without initializer', () => {
    const input = `class Counter {\n  static count;\n}`;
    expect(transpile(src, input)).toBe(
      iife("class Counter {}\nCounter.count = undefined;\n")
    );
  });

  it('does not touch private static fields', () => {
    const input = `class Foo {\n  static #secret = 42;\n  static getSecret() {\n    return this.#secret;\n  }\n}`;
    expect(transpile(src, input)).toBe(
      iife("class Foo {\n  static #secret = 42;\n  static getSecret() {\n    return this.#secret;\n  }\n}\n")
    );
  });

  it('handles class without static fields unchanged', () => {
    const input = `class Plain {\n  method() {\n    return 1;\n  }\n}`;
    expect(transpile(src, input)).toBe(
      iife("class Plain {\n  method() {\n    return 1;\n  }\n}\n")
    );
  });

  it('handles class expression in variable declaration', () => {
    const input = `const Config = class Config {\n  static version = '1.0';\n};`;
    expect(transpile(src, input)).toBe(
      iife("const Config = class Config {};\nConfig.version = '1.0';\n")
    );
  });

  it('preserves methods alongside static fields', () => {
    const input = `class Config {\n  static version = '1.0';\n  static getVersion() {\n    return this.version;\n  }\n}`;
    expect(transpile(src, input)).toBe(
      iife("class Config {\n  static getVersion() {\n    return this.version;\n  }\n}\nConfig.version = '1.0';\n")
    );
  });
});
