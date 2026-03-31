import * as acorn from 'acorn';
import * as walk from 'acorn-walk';
import { moduleExportsAccess } from './moduleExportsAccess';

export const createDynamicImportsVisitor = (): walk.SimpleVisitors<unknown> => {
  return {
    ImportExpression(node: acorn.ImportExpression) {
      mutateNode(node, moduleExportsAccess(node.source, node.start, node.end));
    }
  }
};

function mutateNode(target: any, replacement: any): void {
  for (const key of Object.keys(target)) {
    delete target[key];
  }
  Object.assign(target, replacement);
}
