import type * as walk from 'acorn-walk';

export function mergeVisitors(...visitors: walk.SimpleVisitors<unknown>[]): walk.SimpleVisitors<unknown> {
  const merged: walk.SimpleVisitors<unknown> = {};
  for (const visitor of visitors) {
    const entries: [string, unknown][] = Object.entries(visitor);
    for (const [nodeType, handler] of entries) {
      if (typeof handler !== 'function') continue;
      const prev: unknown = Reflect.get(merged, nodeType);
      if (typeof prev === 'function') {
        Reflect.set(merged, nodeType, (node: unknown, state: unknown) => {
          prev.call(undefined, node, state);
          handler.call(undefined, node, state);
        });
      } else {
        Reflect.set(merged, nodeType, handler);
      }
    }
  }
  return merged;
}
