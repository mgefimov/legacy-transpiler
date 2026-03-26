import { describe, it, expect } from 'vitest';
import { transpile } from '../src/index';

const BASE_URL = 'https://assets-proxy.anthropic.com/claude-ai/v2/assets/v1';
const resolveModule = (source: string) => `${BASE_URL}/${source.replace(/^\.\//, '')}`;
const staticImportModule = async (resolvedSource: string) => {
  // In a real implementation, this would fetch the module and store it in a way that it can be accessed at runtime.
  // For testing, we can just log it or do nothing.
}
const src = 'https://example.com/module.js';
const prefix = `window.LegacyTranspiler._moduleExports["${src}"]`;

describe('removeExport', () => {
  it('exports const to _moduleExports', async () => {
    expect(await transpile(`export const foo = 1;`, { src, resolveModule, staticImportModule })).toBe(
      `var foo = 1;\n${prefix} = {\n  foo\n};\n`
    );
  });

  it('exports function to _moduleExports', async () => {
    expect(await transpile(`export function greet() { return "hi"; }`, { src, resolveModule, staticImportModule })).toBe(
      `function greet() {\n  return "hi";\n}\n${prefix} = {\n  greet\n};\n`
    );
  });

  it('exports class to _moduleExports', async () => {
    expect(await transpile(`export class Foo {}`, { src, resolveModule, staticImportModule })).toBe(
      `class Foo {}\n${prefix} = {\n  Foo\n};\n`
    );
  });

  it('exports named exports to _moduleExports', async () => {
    const input = `const a = 1;\nconst b = 2;\nexport { a, b };`;
    expect(await transpile(input, { src, resolveModule, staticImportModule })).toBe(
      `var a = 1;\nvar b = 2;\n${prefix} = {\n  a,\n  b\n};\n`
    );
  });

  it('exports aliased names to _moduleExports', async () => {
    const input = `const foo = 1;\nexport { foo as bar };`;
    expect(await transpile(input, { src, resolveModule, staticImportModule })).toBe(
      `var foo = 1;\n${prefix} = {\n  bar: foo\n};\n`
    );
  });

  it('exports default expression to _moduleExports', async () => {
    expect(await transpile(`export default 42;`, { src, resolveModule, staticImportModule })).toBe(
      `var __default = 42;\n${prefix} = {\n  default: __default\n};\n`
    );
  });

  it('exports default named function to _moduleExports', async () => {
    expect(await transpile(`export default function named() {}`, { src, resolveModule, staticImportModule })).toBe(
      `function named() {}\n${prefix} = {\n  default: named\n};\n`
    );
  });

  it('exports default anonymous function to _moduleExports', async () => {
    expect(await transpile(`export default function() {}`, { src, resolveModule, staticImportModule })).toBe(
      `var __default = function () {};\n${prefix} = {\n  default: __default\n};\n`
    );
  });

  it('exports mixed declarations to _moduleExports', async () => {
    const input = `export const a = 1;\nexport function b() {}\nexport { a as c };`;
    expect(await transpile(input, { src, resolveModule, staticImportModule })).toBe(
      `var a = 1;\nfunction b() {}\n${prefix} = {\n  a,\n  b,\n  c: a\n};\n`
    );
  });

  it('removes export all', async () => {
    expect(await transpile(`export * from './module';`, { src, resolveModule, staticImportModule })).toBe('');
  });

  it('no assignment when no exports', async () => {
    expect(await transpile(`const x = 1;`, { src, resolveModule, staticImportModule })).toBe('var x = 1;\n');
  });

  it('keeps surrounding code', async () => {
    const input = `const x = 1;\nexport { x };\nconsole.log(x);`;
    expect(await transpile(input, { src, resolveModule, staticImportModule })).toBe(
      `var x = 1;\nconsole.log(x);\n${prefix} = {\n  x\n};\n`
    );
  });
});
