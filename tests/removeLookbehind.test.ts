import { describe, it, expect } from 'vitest';
import { removeLookbehind } from '../src/transforms/removeLookbehind';

describe('removeLookbehind', () => {
  it('removes positive lookbehind', () => {
    const input = `/(?<=foo)bar/g`;
    expect(removeLookbehind(input)).toBe('/bar/g;\n');
  });

  it('removes negative lookbehind', () => {
    const input = `/(?<!foo)bar/g`;
    expect(removeLookbehind(input)).toBe('/bar/g;\n');
  });

  it('removes lookbehind with escaped chars', () => {
    const input = `/(?<=\\d{3})\\d+/`;
    expect(removeLookbehind(input)).toBe('/\\d+/;\n');
  });

  it('removes multiple lookbehinds', () => {
    const input = `/(?<=foo)(?<!bar)baz/g`;
    expect(removeLookbehind(input)).toBe('/baz/g;\n');
  });

  it('does not modify regex without lookbehinds', () => {
    const input = `/^hello$/`;
    expect(removeLookbehind(input)).toBe('/^hello$/;\n');
  });

  it('handles regex in variable declaration', () => {
    const input = `const re = /(?<=prefix-)\\w+/g;`;
    expect(removeLookbehind(input)).toBe('const re = /\\w+/g;\n');
  });
});
