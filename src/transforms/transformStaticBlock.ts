import * as acorn from 'acorn';
import * as walk from 'acorn-walk';

let counter = 0;

function processClassStaticBlocks(classNode: { body: acorn.ClassBody }): void {
  classNode.body.body = classNode.body.body.map((member): acorn.MethodDefinition | acorn.PropertyDefinition | acorn.StaticBlock => {
    if (member.type !== 'StaticBlock') return member;

    // static { ... } → static #_ = (() => { ... })()
    const prop: acorn.PropertyDefinition = {
      type: 'PropertyDefinition',
      key: {
        type: 'PrivateIdentifier',
        name: `_${counter++}`,
        start: member.start,
        end: member.end,
      },
      value: {
        type: 'CallExpression',
        callee: {
          type: 'ArrowFunctionExpression',
          id: null,
          params: [],
          body: {
            type: 'BlockStatement',
            body: member.body,
            start: member.start,
            end: member.end,
          },
          generator: false,
          expression: false,
          async: false,
          start: member.start,
          end: member.end,
        },
        arguments: [],
        optional: false,
        start: member.start,
        end: member.end,
      },
      computed: false,
      static: true,
      start: member.start,
      end: member.end,
    };

    return prop;
  });
}

export function transformStaticBlocks(ast: acorn.Program): void {
  counter = 0;

  walk.simple(ast, {
    ClassDeclaration(node) {
      processClassStaticBlocks(node);
    },
    ClassExpression(node) {
      processClassStaticBlocks(node);
    },
  });
}

