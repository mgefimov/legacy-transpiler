import { describe, it, expect } from 'vitest';
import { transpile } from '../src/index';

const BASE_URL = 'https://assets-proxy.anthropic.com/claude-ai/v2/assets/v1';
const resolveModule = (source: string) => `${BASE_URL}/${source.replace(/^\.\//, '')}`;
const staticImportModule = async (resolvedSource: string) => {
  // In a real implementation, this would fetch the module and store it in a way that it can be accessed at runtime.
  // For testing, we can just log it or do nothing.
}
const src = `${BASE_URL}/test.js`;

describe('transformStaticBlock', () => {
  it('converts static block to static private arrow IIFE', async () => {
    const input = `class Foo {\n  static {\n    __name(this, "Foo");\n  }\n}`;
    expect(await transpile(input, { src, resolveModule, staticImportModule })).toBe(
      'class Foo {\n  static #_0 = (() => {\n    __name(this, "Foo");\n  })();\n}\n'
    );
  });

  it('preserves this and multiple statements', async () => {
    const input = `class Bar {\n  static {\n    this.x = 1;\n    this.y = 2;\n  }\n  method() {}\n}`;
    expect(await transpile(input, { src, resolveModule, staticImportModule })).toBe(
      'class Bar {\n  static #_0 = (() => {\n    this.x = 1;\n    this.y = 2;\n  })();\n  method() {}\n}\n'
    );
  });

  it('handles multiple static blocks with unique names', async () => {
    const input = `class Baz {\n  static {\n    console.log("init");\n  }\n  static {\n    console.log("init2");\n  }\n}`;
    expect(await transpile(input, { src, resolveModule, staticImportModule })).toBe(
      'class Baz {\n  static #_0 = (() => {\n    console.log("init");\n  })();\n  static #_1 = (() => {\n    console.log("init2");\n  })();\n}\n'
    );
  });

  it('handles class expression in variable declaration', async () => {
    const input = `const Qux = class Qux {\n  static {\n    __name(this, "Qux");\n  }\n};`;
    expect(await transpile(input, { src, resolveModule, staticImportModule })).toBe(
      'var Qux = class Qux {\n  static #_0 = (() => {\n    __name(this, "Qux");\n  })();\n};\n'
    );
  });

  it('does not modify class without static blocks', async () => {
    const input = `class Plain {\n  method() { return 1; }\n}`;
    expect(await transpile(input, { src, resolveModule, staticImportModule })).toBe(
      'class Plain {\n  method() {\n    return 1;\n  }\n}\n'
    );
  });

  it('preserves this in arrow functions inside static block', async () => {
    const input = `class WithArrow {\n  static {\n    const fn = () => this;\n  }\n}`;
    expect(await transpile(input, { src, resolveModule, staticImportModule })).toBe(
      'class WithArrow {\n  static #_0 = (() => {\n    var fn = () => this;\n  })();\n}\n'
    );
  });
});
