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
  it('converts static block to static method plus post-class call', async () => {
    const input = `class Foo {\n  static {\n    __name(this, "Foo");\n  }\n}`;
    expect(transpile(src,input)).toBe(
      iife('class Foo {\n  static _static_block__0() {\n    __name(this, "Foo");\n  }\n}\nFoo._static_block__0();\n')
    );
  });

  it('preserves this and multiple statements', async () => {
    const input = `class Bar {\n  static {\n    this.x = 1;\n    this.y = 2;\n  }\n  method() {}\n}`;
    expect(transpile(src,input)).toBe(
      iife('class Bar {\n  static _static_block__0() {\n    this.x = 1;\n    this.y = 2;\n  }\n  method() {}\n}\nBar._static_block__0();\n')
    );
  });

  it('handles multiple static blocks with unique names', async () => {
    const input = `class Baz {\n  static {\n    console.log("init");\n  }\n  static {\n    console.log("init2");\n  }\n}`;
    expect(transpile(src,input)).toBe(
      iife('class Baz {\n  static _static_block__0() {\n    console.log("init");\n  }\n  static _static_block__1() {\n    console.log("init2");\n  }\n}\nBaz._static_block__0();\nBaz._static_block__1();\n')
    );
  });

  it('wraps a class expression in a variable declaration in a self-contained IIFE', async () => {
    const input = `const Qux = class Qux {\n  static {\n    __name(this, "Qux");\n  }\n};`;
    expect(transpile(src,input)).toBe(
      iife(
        'const Qux = (function () {\n' +
        '  const _static_block_class__ = class Qux {};\n' +
        '  (function () {\n' +
        '    __name(this, "Qux");\n' +
        '  }).call(_static_block_class__);\n' +
        '  return _static_block_class__;\n' +
        '})();\n'
      )
    );
  });

  it('wraps a bare class expression (any position) in a self-contained IIFE', async () => {
    // A class expression that isn't a declaration or a `const X = class` has no
    // outer name to hang a post-class call on — this is the case that used to
    // leak `static {` into the output and crash older Safari parsers.
    const input = `f(class e extends Error {\n  static {\n    Object.defineProperty(this, "b", { value: 1 });\n  }\n});`;
    expect(transpile(src,input)).toBe(
      iife(
        'f((function () {\n' +
        '  const _static_block_class__ = class e extends Error {};\n' +
        '  (function () {\n' +
        '    Object.defineProperty(this, "b", {\n' +
        '      value: 1\n' +
        '    });\n' +
        '  }).call(_static_block_class__);\n' +
        '  return _static_block_class__;\n' +
        '})());\n'
      )
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
      iife('class WithArrow {\n  static _static_block__0() {\n    const fn = () => this;\n  }\n}\nWithArrow._static_block__0();\n')
    );
  });
});
