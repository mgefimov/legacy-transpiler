import { describe, it, expect } from 'vitest';
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

describe('transformStaticBlock', () => {
  it('converts static block to static private arrow IIFE', async () => {
    const input = `class Foo {\n  static {\n    __name(this, "Foo");\n  }\n}`;
    expect(transpile(src,input)).toBe(
      iife('class Foo {\n  static #_0 = (() => {\n    __name(this, "Foo");\n  })();\n}\n')
    );
  });

  it('preserves this and multiple statements', async () => {
    const input = `class Bar {\n  static {\n    this.x = 1;\n    this.y = 2;\n  }\n  method() {}\n}`;
    expect(transpile(src,input)).toBe(
      iife('class Bar {\n  static #_0 = (() => {\n    this.x = 1;\n    this.y = 2;\n  })();\n  method() {}\n}\n')
    );
  });

  it('handles multiple static blocks with unique names', async () => {
    const input = `class Baz {\n  static {\n    console.log("init");\n  }\n  static {\n    console.log("init2");\n  }\n}`;
    expect(transpile(src,input)).toBe(
      iife('class Baz {\n  static #_0 = (() => {\n    console.log("init");\n  })();\n  static #_1 = (() => {\n    console.log("init2");\n  })();\n}\n')
    );
  });

  it('handles class expression in variable declaration', async () => {
    const input = `const Qux = class Qux {\n  static {\n    __name(this, "Qux");\n  }\n};`;
    expect(transpile(src,input)).toBe(
      iife('const Qux = class Qux {\n  static #_0 = (() => {\n    __name(this, "Qux");\n  })();\n};\n')
    );
  });

  it('does not modify class without static blocks', async () => {
    const input = `class Plain {\n  method() { return 1; }\n}`;
    expect(transpile(src,input)).toBe(
      iife('class Plain {\n  method() {\n    return 1;\n  }\n}\n')
    );
  });

  it('preserves this in arrow functions inside static block', async () => {
    const input = `class WithArrow {\n  static {\n    const fn = () => this;\n  }\n}`;
    expect(transpile(src,input)).toBe(
      iife('class WithArrow {\n  static #_0 = (() => {\n    const fn = () => this;\n  })();\n}\n')
    );
  });
});
