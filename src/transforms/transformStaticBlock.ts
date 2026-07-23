import * as acorn from 'acorn';
import type * as walk from 'acorn-walk';

let counter = 0;

const STATIC_BLOCK_METHOD_PREFIX = '_static_block__';
// Temp binding for the class inside the IIFE we wrap class *expressions* in.
// Scoped to that IIFE, so a fixed name is safe (each wrap has its own scope).
const STATIC_BLOCK_CLASS_TEMP = '_static_block_class__';

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

// Convert `static { ... }` members of a class *declaration* into a static
// method plus a `ClassName._static_block__N()` call emitted after the class.
// Only works when the class has an outer name to call through (declarations,
// and `const X = class` — see processStmt).
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

function tempId(): acorn.Identifier {
  return { type: 'Identifier', name: STATIC_BLOCK_CLASS_TEMP, start: 0, end: 0 };
}

// A class *expression* in arbitrary position (call arg, return, parenthesized)
// has no outer name to hang a post-class call on, so the declaration strategy
// can't reach it. Wrap the whole thing in an IIFE that binds the class to a
// temp and runs each block's body with `this` set to that temp:
//
//   (class E { static { BODY } })
//   →
//   (function () {
//     const _static_block_class__ = class E {};
//     (function () { BODY }).call(_static_block_class__);
//     return _static_block_class__;
//   })()
//
// Self-contained (no static field, no external binding), so it needs no help
// from the other transforms and is safe on old iOS.
function wrapClassExpression(node: acorn.ClassExpression): acorn.CallExpression {
  const blocks: acorn.StaticBlock[] = [];
  const kept = node.body.body.filter((member): member is Exclude<typeof member, acorn.StaticBlock> => {
    if (member.type === 'StaticBlock') {
      blocks.push(member);
      return false;
    }
    return true;
  });

  const innerClass: acorn.ClassExpression = {
    type: 'ClassExpression',
    id: node.id,
    superClass: node.superClass,
    body: { type: 'ClassBody', body: kept, start: node.body.start, end: node.body.end },
    start: node.start,
    end: node.end,
  };

  const stmts: acorn.Statement[] = [
    {
      type: 'VariableDeclaration',
      kind: 'const',
      declarations: [{
        type: 'VariableDeclarator',
        id: tempId(),
        init: innerClass,
        start: 0,
        end: 0,
      }],
      start: 0,
      end: 0,
    },
    ...blocks.map((block): acorn.ExpressionStatement => ({
      type: 'ExpressionStatement',
      expression: {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'FunctionExpression',
            id: null,
            params: [],
            body: { type: 'BlockStatement', body: block.body, start: block.start, end: block.end },
            generator: false,
            expression: false,
            async: false,
            start: block.start,
            end: block.end,
          },
          property: { type: 'Identifier', name: 'call', start: 0, end: 0 },
          computed: false,
          optional: false,
          start: 0,
          end: 0,
        },
        arguments: [tempId()],
        optional: false,
        start: 0,
        end: 0,
      },
      start: 0,
      end: 0,
    })),
    { type: 'ReturnStatement', argument: tempId(), start: 0, end: 0 },
  ];

  return {
    type: 'CallExpression',
    callee: {
      type: 'FunctionExpression',
      id: null,
      params: [],
      body: { type: 'BlockStatement', body: stmts, start: node.start, end: node.end },
      generator: false,
      expression: false,
      async: false,
      start: node.start,
      end: node.end,
    },
    arguments: [],
    optional: false,
    start: node.start,
    end: node.end,
  };
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
    // Class *expressions* in any position (call arg, return, parenthesized,
    // and `const X = class`). Post-order visits this before the enclosing
    // Program/BlockStatement, so the IIFE wrap here takes over any class
    // expression with static blocks — including `const X = class`, for which
    // it's equally correct — leaving processStmt to only ever handle class
    // *declarations*.
    ClassExpression(node) {
      const hasStaticBlock = node.body.body.some((m) => m.type === 'StaticBlock');
      if (hasStaticBlock) {
        Object.assign(node, wrapClassExpression(node));
      }
    },
  };
}
