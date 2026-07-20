import * as acorn from 'acorn';
import * as walk from 'acorn-walk';
import { moduleExportsAccess } from './moduleExportsAccess';

export const createDynamicImportsVisitor = (src?: string): walk.SimpleVisitors<unknown> => {
  return {
    ImportExpression(node: acorn.ImportExpression) {
      mutateNode(node, moduleExportsAccess(node.source, node.start, node.end, src));
    }
  }
};

function mutateNode(target: object, replacement: object): void {
  for (const key of Object.keys(target)) {
    Reflect.deleteProperty(target, key);
  }
  Object.assign(target, replacement);
}
