import * as acorn from 'acorn';
import * as walk from 'acorn-walk';

const PREFIX = '_private_field__';

function renamePrivate(node: acorn.PrivateIdentifier): acorn.Identifier {
  return {
    type: 'Identifier',
    name: PREFIX + node.name,
    start: node.start,
    end: node.end,
  };
}

function processClass(classNode: { body: acorn.ClassBody }): void {
  for (const member of classNode.body.body) {
    if (member.type === 'PropertyDefinition' && member.key.type === 'PrivateIdentifier') {
      member.key = renamePrivate(member.key);
      member.computed = false;
    } else if (member.type === 'MethodDefinition' && member.key.type === 'PrivateIdentifier') {
      member.key = renamePrivate(member.key);
      member.computed = false;
    }
  }
}

export function createPrivateFieldsVisitor(): walk.SimpleVisitors<unknown> {
  return {
    ClassDeclaration(node) {
      processClass(node);
    },
    ClassExpression(node) {
      processClass(node);
    },
    MemberExpression(node) {
      if (node.property.type === 'PrivateIdentifier') {
        node.property = renamePrivate(node.property);
        node.computed = false;
      }
    },
    BinaryExpression(node) {
      if (node.operator === 'in' && node.left.type === 'PrivateIdentifier') {
        node.left = renamePrivate(node.left);
      }
    },
  };
}
