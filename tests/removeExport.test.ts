import { describe, it, expect } from 'vitest';
import { transpile, init } from '../src/index';

const BASE_URL = 'https://assets-proxy.anthropic.com/claude-ai/v2/assets/v1';
const src = 'https://example.com/module.js';
const prefix = `window.LegacyTranspiler.exportModule("${src}",`;

init({ BASE_URL, minify: false, runScript: () => {} });

function iife(body: string): string {
  const lines = body.split('\n').filter(l => l.length > 0);
  if (lines.length === 0) return "'use strict';\n(async function () {})();\n";
  const indented = lines.map(l => '  ' + l).join('\n');
  return `'use strict';\n(async function () {\n${indented}\n})();\n`;
}

describe('removeExport', () => {
  it('exports const to _moduleExports', async () => {
    expect(transpile(src,`export const foo = 1;`)).toBe(
      iife(`const foo = 1;\n${prefix} {\n  foo\n});\n`)
    );
  });

  it('exports function to _moduleExports', async () => {
    expect(transpile(src,`export function greet() { return "hi"; }`)).toBe(
      iife(`function greet() {\n  return "hi";\n}\n${prefix} {\n  greet\n});\n`)
    );
  });

  it('exports class to _moduleExports', async () => {
    expect(transpile(src,`export class Foo {}`)).toBe(
      iife(`class Foo {}\n${prefix} {\n  Foo\n});\n`)
    );
  });

  it('exports named exports to _moduleExports', async () => {
    const input = `const a = 1;\nconst b = 2;\nexport { a, b };`;
    expect(transpile(src,input)).toBe(
      iife(`const a = 1;\nconst b = 2;\n${prefix} {\n  a,\n  b\n});\n`)
    );
  });

  it('exports aliased names to _moduleExports', async () => {
    const input = `const foo = 1;\nexport { foo as bar };`;
    expect(transpile(src,input)).toBe(
      iife(`const foo = 1;\n${prefix} {\n  bar: foo\n});\n`)
    );
  });

  it('exports default expression to _moduleExports', async () => {
    expect(transpile(src,`export default 42;`)).toBe(
      iife(`var __default = 42;\n${prefix} {\n  default: __default\n});\n`)
    );
  });

  it('exports default named function to _moduleExports', async () => {
    expect(transpile(src,`export default function named() {}`)).toBe(
      iife(`function named() {}\n${prefix} {\n  default: named\n});\n`)
    );
  });

  it('exports default anonymous function to _moduleExports', async () => {
    expect(transpile(src,`export default function() {}`)).toBe(
      iife(`var __default = function () {};\n${prefix} {\n  default: __default\n});\n`)
    );
  });

  it('exports mixed declarations to _moduleExports', async () => {
    const input = `export const a = 1;\nexport function b() {}\nexport { a as c };`;
    expect(transpile(src,input)).toBe(
      iife(`const a = 1;\nfunction b() {}\n${prefix} {\n  a,\n  b,\n  c: a\n});\n`)
    );
  });

  it('removes export all', async () => {
    expect(transpile(src,`export * from './module';`)).toBe(iife(''));
  });

  it('no assignment when no exports', async () => {
    expect(transpile(src,`const x = 1;`)).toBe(iife('const x = 1;\n'));
  });

  it('keeps surrounding code', async () => {
    const input = `const x = 1;\nexport { x };\nconsole.log(x);`;
    expect(transpile(src,input)).toBe(
      iife(`const x = 1;\nconsole.log(x);\n${prefix} {\n  x\n});\n`)
    );
  });
});
