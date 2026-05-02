import * as acorn from 'acorn';
import type * as walk from 'acorn-walk';

let counter = 0;

const STATIC_BLOCK_METHOD_PREFIX = '_static_block__';

function makeCall(className: string, methodName: string): acorn.ExpressionStatement {
  return {
    type: 'ExpressionStatement',
    expression: {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: className, start: 0, end: 0 },
        property: { type: 'Identifier', name: methodName, start: 0, end: 0 },
        computed: false,
        optional: false,
        start: 0,
        end: 0,
      },
      arguments: [],
      optional: false,
      start: 0,
      end: 0,
    },
    start: 0,
    end: 0,
  };
}

function convertStaticBlocks(
  classNode: acorn.ClassDeclaration | acorn.ClassExpression,
  className: string,
): acorn.ExpressionStatement[] {
  const calls: acorn.ExpressionStatement[] = [];

  classNode.body.body = classNode.body.body.map((member) => {
    if (member.type !== 'StaticBlock') return member;

    const methodName = `${STATIC_BLOCK_METHOD_PREFIX}${counter++}`;

    // static { ... } → static _static_block__N() { ... } + ClassName._static_block__N();
    const method: acorn.MethodDefinition = {
      type: 'MethodDefinition',
      key: { type: 'Identifier', name: methodName, start: member.start, end: member.end },
      value: {
        type: 'FunctionExpression',
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
      kind: 'method',
      computed: false,
      static: true,
      start: member.start,
      end: member.end,
    };

    calls.push(makeCall(className, methodName));
    return method;
  });

  return calls;
}

function processStmt(stmt: acorn.Statement): acorn.Statement[] {
  if (stmt.type === 'ClassDeclaration' && stmt.id) {
    const calls = convertStaticBlocks(stmt, stmt.id.name);
    return calls.length > 0 ? [stmt, ...calls] : [stmt];
  }

  if (stmt.type === 'VariableDeclaration') {
    const extra: acorn.ExpressionStatement[] = [];
    for (const decl of stmt.declarations) {
      if (decl.init?.type === 'ClassExpression' && decl.id.type === 'Identifier') {
        extra.push(...convertStaticBlocks(decl.init, decl.id.name));
      }
    }
    if (extra.length > 0) return [stmt, ...extra];
  }

  return [stmt];
}

export function createStaticBlocksVisitor(): walk.SimpleVisitors<unknown> {
  counter = 0;
  return {
    Program(node) {
      node.body = node.body.flatMap((stmt): (acorn.Statement | acorn.ModuleDeclaration)[] => {
        if (stmt.type === 'ClassDeclaration' || stmt.type === 'VariableDeclaration') {
          return processStmt(stmt);
        }
        return [stmt];
      });
    },
    BlockStatement(node) {
      node.body = node.body.flatMap(processStmt);
    },
  };
}
