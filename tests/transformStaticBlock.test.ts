import { describe, it, expect } from 'vitest';
import { transformStaticBlock } from '../src/transforms/transformStaticBlock';

describe('transformStaticBlock', () => {
  it('converts static block to static private arrow IIFE', () => {
    const input = `class Foo {\n  static {\n    __name(this, "Foo");\n  }\n}`;
    expect(transformStaticBlock(input)).toBe(
      'class Foo {\n  static #_0 = (() => {\n    __name(this, "Foo");\n  })();\n}\n'
    );
  });

  it('preserves this and multiple statements', () => {
    const input = `class Bar {\n  static {\n    this.x = 1;\n    this.y = 2;\n  }\n  method() {}\n}`;
    expect(transformStaticBlock(input)).toBe(
      'class Bar {\n  static #_0 = (() => {\n    this.x = 1;\n    this.y = 2;\n  })();\n  method() {}\n}\n'
    );
  });

  it('handles multiple static blocks with unique names', () => {
    const input = `class Baz {\n  static {\n    console.log("init");\n  }\n  static {\n    console.log("init2");\n  }\n}`;
    expect(transformStaticBlock(input)).toBe(
      'class Baz {\n  static #_0 = (() => {\n    console.log("init");\n  })();\n  static #_1 = (() => {\n    console.log("init2");\n  })();\n}\n'
    );
  });

  it('handles class expression in variable declaration', () => {
    const input = `const Qux = class Qux {\n  static {\n    __name(this, "Qux");\n  }\n};`;
    expect(transformStaticBlock(input)).toBe(
      'const Qux = class Qux {\n  static #_0 = (() => {\n    __name(this, "Qux");\n  })();\n};\n'
    );
  });

  it('does not modify class without static blocks', () => {
    const input = `class Plain {\n  method() { return 1; }\n}`;
    expect(transformStaticBlock(input)).toBe(
      'class Plain {\n  method() {\n    return 1;\n  }\n}\n'
    );
  });

  it('preserves this in arrow functions inside static block', () => {
    const input = `class WithArrow {\n  static {\n    const fn = () => this;\n  }\n}`;
    expect(transformStaticBlock(input)).toBe(
      'class WithArrow {\n  static #_0 = (() => {\n    const fn = () => this;\n  })();\n}\n'
    );
  });
});
