import { describe, it, expect, vi } from 'vitest';
import { mergeVisitors } from '../src/transforms/mergeVisitors';

describe('mergeVisitors', () => {
  it('returns empty object for no visitors', () => {
    expect(mergeVisitors()).toEqual({});
  });

  it('returns single visitor as-is', () => {
    const handler = vi.fn();
    const result = mergeVisitors({ Literal: handler });
    result.Literal({}, null);
    expect(handler).toHaveBeenCalledOnce();
  });

  it('merges different node types from multiple visitors', () => {
    const a = vi.fn();
    const b = vi.fn();
    const result = mergeVisitors({ Literal: a }, { Identifier: b });

    expect(result).toHaveProperty('Literal');
    expect(result).toHaveProperty('Identifier');

    result.Literal('node', 'state');
    result.Identifier('node', 'state');
    expect(a).toHaveBeenCalledOnce();
    expect(b).toHaveBeenCalledOnce();
  });

  it('chains handlers for the same node type', () => {
    const order: number[] = [];
    const a = vi.fn(() => order.push(1));
    const b = vi.fn(() => order.push(2));
    const result = mergeVisitors({ Literal: a }, { Literal: b });

    result.Literal('node', 'state');
    expect(a).toHaveBeenCalledOnce();
    expect(b).toHaveBeenCalledOnce();
    expect(order).toEqual([1, 2]);
  });

  it('chains three handlers in order', () => {
    const order: number[] = [];
    const result = mergeVisitors(
      { Literal: () => order.push(1) },
      { Literal: () => order.push(2) },
      { Literal: () => order.push(3) },
    );

    result.Literal('node', 'state');
    expect(order).toEqual([1, 2, 3]);
  });

  it('passes node and state to all chained handlers', () => {
    const a = vi.fn();
    const b = vi.fn();
    const result = mergeVisitors({ Literal: a }, { Literal: b });

    const node = { type: 'Literal', value: 42 };
    const state = { depth: 1 };
    result.Literal(node, state);

    expect(a).toHaveBeenCalledWith(node, state);
    expect(b).toHaveBeenCalledWith(node, state);
  });
});
