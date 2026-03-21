import { describe, it, expect } from 'vitest';
import { removeExport } from '../src/transforms/removeExport';

const src = 'https://example.com/module.js';
const prefix = `window.LegacyTranspiler._moduleExports["${src}"]`;

describe('removeExport', () => {
  it('exports const to _moduleExports', () => {
    expect(removeExport(`export const foo = 1;`, { src })).toBe(
      `const foo = 1;\n${prefix} = {\n  foo\n};\n`
    );
  });

  it('exports function to _moduleExports', () => {
    expect(removeExport(`export function greet() { return "hi"; }`, { src })).toBe(
      `function greet() {\n  return "hi";\n}\n${prefix} = {\n  greet\n};\n`
    );
  });

  it('exports class to _moduleExports', () => {
    expect(removeExport(`export class Foo {}`, { src })).toBe(
      `class Foo {}\n${prefix} = {\n  Foo\n};\n`
    );
  });

  it('exports named exports to _moduleExports', () => {
    const input = `const a = 1;\nconst b = 2;\nexport { a, b };`;
    expect(removeExport(input, { src })).toBe(
      `const a = 1;\nconst b = 2;\n${prefix} = {\n  a,\n  b\n};\n`
    );
  });

  it('exports aliased names to _moduleExports', () => {
    const input = `const foo = 1;\nexport { foo as bar };`;
    expect(removeExport(input, { src })).toBe(
      `const foo = 1;\n${prefix} = {\n  bar: foo\n};\n`
    );
  });

  it('exports default expression to _moduleExports', () => {
    expect(removeExport(`export default 42;`, { src })).toBe(
      `var __default = 42;\n${prefix} = {\n  default: __default\n};\n`
    );
  });

  it('exports default named function to _moduleExports', () => {
    expect(removeExport(`export default function named() {}`, { src })).toBe(
      `function named() {}\n${prefix} = {\n  default: named\n};\n`
    );
  });

  it('exports default anonymous function to _moduleExports', () => {
    expect(removeExport(`export default function() {}`, { src })).toBe(
      `var __default = function () {};\n${prefix} = {\n  default: __default\n};\n`
    );
  });

  it('exports mixed declarations to _moduleExports', () => {
    const input = `export const a = 1;\nexport function b() {}\nexport { a as c };`;
    expect(removeExport(input, { src })).toBe(
      `const a = 1;\nfunction b() {}\n${prefix} = {\n  a,\n  b,\n  c: a\n};\n`
    );
  });

  it('removes export all', () => {
    expect(removeExport(`export * from './module';`, { src })).toBe('');
  });

  it('no assignment when no exports', () => {
    expect(removeExport(`const x = 1;`, { src })).toBe('const x = 1;\n');
  });

  it('keeps surrounding code', () => {
    const input = `const x = 1;\nexport { x };\nconsole.log(x);`;
    expect(removeExport(input, { src })).toBe(
      `const x = 1;\nconsole.log(x);\n${prefix} = {\n  x\n};\n`
    );
  });
});
