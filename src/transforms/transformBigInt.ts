import type * as walk from 'acorn-walk';

// BigInt literals (0n, 123n, 0xFFn) shipped in iOS 14; iOS 13's parser rejects
// the `n` suffix ("No identifiers allowed directly after numeric literal").
// BigInt is a distinct runtime type with no faithful lowering, so we just strip
// the suffix to let the module parse — turning BigInts into ordinary Numbers.
// This is lossy: precision beyond 2^53 and `typeof x === 'bigint'` checks change.
export function createBigIntVisitor(): walk.SimpleVisitors<unknown> {
  return {
    Literal(node) {
      if (node.bigint == null) return;
      const raw = node.raw ?? `${node.bigint}n`;
      node.raw = raw.replace(/n$/, '');
      node.bigint = undefined;
    },
  };
}
