import { describe, it, expect } from 'vitest';
import { moduleExportsAccess } from '../src/transforms/moduleExportsAccess';

describe('moduleExportsAccess', () => {
  it('returns a CallExpression node', () => {
    const source = { type: 'Literal' as const, value: './mod.js', start: 0, end: 10 };
    const result = moduleExportsAccess(source, 0, 10);
    expect(result.type).toBe('CallExpression');
    expect(result.optional).toBe(false);
  });

  it('builds window.LegacyTranspiler.importModule callee', () => {
    const source = { type: 'Literal' as const, value: './mod.js', start: 0, end: 10 };
    const result = moduleExportsAccess(source, 0, 10);

    const callee = result.callee;
    expect(callee.type).toBe('MemberExpression');

    if (callee.type === 'MemberExpression') {
      // .importModule
      expect(callee.property).toEqual(
        expect.objectContaining({ type: 'Identifier', name: 'importModule' }),
      );

      // window.LegacyTranspiler
      const outer = callee.object;
      expect(outer.type).toBe('MemberExpression');
      if (outer.type === 'MemberExpression') {
        expect(outer.object).toEqual(
          expect.objectContaining({ type: 'Identifier', name: 'window' }),
        );
        expect(outer.property).toEqual(
          expect.objectContaining({ type: 'Identifier', name: 'LegacyTranspiler' }),
        );
      }
    }
  });

  it('passes source as the argument', () => {
    const source = { type: 'Literal' as const, value: './foo.js', start: 5, end: 15 };
    const result = moduleExportsAccess(source, 5, 15);
    expect(result.arguments).toHaveLength(1);
    expect(result.arguments[0]).toBe(source);
  });

  it('sets start and end from parameters', () => {
    const source = { type: 'Literal' as const, value: './x.js', start: 3, end: 7 };
    const result = moduleExportsAccess(source, 3, 7);
    expect(result.start).toBe(3);
    expect(result.end).toBe(7);
  });
});
