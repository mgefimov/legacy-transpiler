import * as acorn from 'acorn';
import type * as walk from 'acorn-walk';

interface InstanceField {
  key: acorn.Expression;
  value: acorn.Expression | null | undefined;
  computed: boolean;
}

// Structural type covering ClassDeclaration, ClassExpression and the anonymous
// class declaration (`export default class {}`). We only touch body/superClass.
interface ClassLike {
  body: acorn.ClassBody;
  superClass?: acorn.Expression | null;
}

function extractInstanceFields(classNode: ClassLike): InstanceField[] {
  const fields: InstanceField[] = [];

  classNode.body.body = classNode.body.body.filter((member) => {
    if (
      member.type === 'PropertyDefinition' &&
      !member.static &&
      member.key.type !== 'PrivateIdentifier'
    ) {
      fields.push({ key: member.key, value: member.value, computed: member.computed });
      return false;
    }
    return true;
  });

  return fields;
}

function makeAssignment(field: InstanceField): acorn.ExpressionStatement {
  const left: acorn.MemberExpression = {
    type: 'MemberExpression',
    object: { type: 'ThisExpression', start: 0, end: 0 },
    property: field.key,
    computed: field.computed,
    optional: false,
    start: 0,
    end: 0,
  };
  const fallback: acorn.Identifier = { type: 'Identifier', name: 'undefined', start: 0, end: 0 };
  return {
    type: 'ExpressionStatement',
    expression: {
      type: 'AssignmentExpression',
      operator: '=',
      left,
      right: field.value ?? fallback,
      start: 0,
      end: 0,
    },
    start: 0,
    end: 0,
  };
}

function findConstructor(classNode: ClassLike): acorn.MethodDefinition | null {
  for (const member of classNode.body.body) {
    if (member.type === 'MethodDefinition' && member.kind === 'constructor') {
      return member;
    }
  }
  return null;
}

// Index of the first top-level `super(...)` statement, or -1 if none is found.
function findSuperCallIndex(body: acorn.Statement[]): number {
  return body.findIndex(
    (stmt) =>
      stmt.type === 'ExpressionStatement' &&
      stmt.expression.type === 'CallExpression' &&
      stmt.expression.callee.type === 'Super',
  );
}

function makeConstructor(inits: acorn.ExpressionStatement[], derived: boolean): acorn.MethodDefinition {
  const body: acorn.Statement[] = [];
  const params: acorn.Pattern[] = [];

  if (derived) {
    // constructor(...args) { super(...args); ...inits }
    const args: acorn.Identifier = { type: 'Identifier', name: 'args', start: 0, end: 0 };
    params.push({ type: 'RestElement', argument: args, start: 0, end: 0 });
    body.push({
      type: 'ExpressionStatement',
      expression: {
        type: 'CallExpression',
        callee: { type: 'Super', start: 0, end: 0 },
        arguments: [{ type: 'SpreadElement', argument: args, start: 0, end: 0 }],
        optional: false,
        start: 0,
        end: 0,
      },
      start: 0,
      end: 0,
    });
  }

  body.push(...inits);

  return {
    type: 'MethodDefinition',
    key: { type: 'Identifier', name: 'constructor', start: 0, end: 0 },
    value: {
      type: 'FunctionExpression',
      id: null,
      params,
      body: { type: 'BlockStatement', body, start: 0, end: 0 },
      generator: false,
      expression: false,
      async: false,
      start: 0,
      end: 0,
    },
    kind: 'constructor',
    computed: false,
    static: false,
    start: 0,
    end: 0,
  };
}

function processClass(classNode: ClassLike): void {
  const fields = extractInstanceFields(classNode);
  if (fields.length === 0) return;

  const inits = fields.map(makeAssignment);
  const derived = classNode.superClass != null;
  const ctor = findConstructor(classNode);

  if (!ctor) {
    classNode.body.body.unshift(makeConstructor(inits, derived));
    return;
  }

  const ctorBody = ctor.value.body.body;
  if (derived) {
    // Field initializers must run after super() returns (`this` is unbound before it).
    // Falls back to prepending if no top-level super() call is present.
    const superIndex = findSuperCallIndex(ctorBody);
    ctorBody.splice(superIndex + 1, 0, ...inits);
  } else {
    ctorBody.unshift(...inits);
  }
}

export function createInstanceClassFieldsVisitor(): walk.SimpleVisitors<unknown> {
  return {
    ClassDeclaration(node) {
      processClass(node);
    },
    ClassExpression(node) {
      processClass(node);
    },
  };
}
