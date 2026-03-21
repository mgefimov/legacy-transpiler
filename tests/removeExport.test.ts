import { describe, it, expect } from 'vitest';
import { removeExport } from '../src/transforms/removeExport';

describe('removeExport', () => {
  it('removes export from const declaration', () => {
    expect(removeExport(`export const foo = 1;`)).toBe('const foo = 1;\n');
  });

  it('removes export from function declaration', () => {
    expect(removeExport(`export function greet() { return "hi"; }`)).toBe(
      'function greet() {\n  return "hi";\n}\n'
    );
  });

  it('removes export from class declaration', () => {
    expect(removeExport(`export class Foo {}`)).toBe('class Foo {}\n');
  });

  it('removes named export statement', () => {
    const input = `const foo = 1;\nconst bar = 2;\nexport { foo, bar };`;
    expect(removeExport(input)).toBe('const foo = 1;\nconst bar = 2;\n');
  });

  it('removes aliased named export statement', () => {
    const input = `const foo = 1;\nexport { foo as bar };`;
    expect(removeExport(input)).toBe('const foo = 1;\n');
  });

  it('removes export default expression', () => {
    expect(removeExport(`export default 42;`)).toBe('');
  });

  it('keeps named function from export default', () => {
    expect(removeExport(`export default function named() {}`)).toBe('function named() {}\n');
  });

  it('removes anonymous export default function', () => {
    expect(removeExport(`export default function() {}`)).toBe('');
  });

  it('removes export all', () => {
    expect(removeExport(`export * from './module';`)).toBe('');
  });

  it('removes export but keeps surrounding code', () => {
    const input = `const x = 1;\nexport { x };\nconsole.log(x);`;
    expect(removeExport(input)).toBe('const x = 1;\nconsole.log(x);\n');
  });
});
