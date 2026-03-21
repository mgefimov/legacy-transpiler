import { describe, it, expect } from 'vitest';
import { functionToArrow } from '../src/transforms/functionToArrow';

describe('functionToArrow', () => {
  it('converts function expression with single return to arrow with expression body', () => {
    const input = 'const add = function(a, b) { return a + b; };';
    const result = functionToArrow(input);
    expect(result).toBe('const add = (a, b) => a + b;\n');
  });

  it('converts function expression with block body to arrow with block body', () => {
    const input = `const greet = function(name) {
  console.log("Hello, " + name);
  return name;
};`;
    const result = functionToArrow(input);
    expect(result).toBe('const greet = name => {\n  console.log("Hello, " + name);\n  return name;\n};\n');
  });

  it('produces concise body for single return', () => {
    const input = 'const double = function(x) { return x * 2; };';
    const result = functionToArrow(input);
    expect(result).toBe('const double = x => x * 2;\n');
  });

  it('does not touch function declarations', () => {
    const input = 'function foo() { return 1; }';
    const result = functionToArrow(input);
    expect(result).toBe('function foo() {\n  return 1;\n}\n');
  });

  it('handles no-argument function expressions', () => {
    const input = 'const noop = function() { return null; };';
    const result = functionToArrow(input);
    expect(result).toBe('const noop = () => null;\n');
  });
});
