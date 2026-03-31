type Visitor = Record<string, (node: any, state: any) => void>;

export function mergeVisitors(...visitors: Visitor[]): Visitor {
  const merged: Visitor = {};
  for (const visitor of visitors) {
    for (const [nodeType, handler] of Object.entries(visitor)) {
      if (merged[nodeType]) {
        const prev = merged[nodeType];
        merged[nodeType] = (node, state) => { prev(node, state); handler(node, state); };
      } else {
        merged[nodeType] = handler;
      }
    }
  }
  return merged;
}
