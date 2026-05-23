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

function makeAssignment(field: InstanceField): acorn.AssignmentExpression {
  const left: acorn.MemberExpression = {
    type: 'MemberExpression',
    object: { type: 'ThisExpression', start: 0, end: 0 },
    property: field.key,
    // A non-identifier key (numeric/string literal) needs computed access:
    // `this[0]`, not the invalid `this.0`.
    computed: field.computed || field.key.type !== 'Identifier',
    optional: false,
    start: 0,
    end: 0,
  };
  const fallback: acorn.Identifier = { type: 'Identifier', name: 'undefined', start: 0, end: 0 };
  return {
    type: 'AssignmentExpression',
    operator: '=',
    left,
    right: field.value ?? fallback,
    start: 0,
    end: 0,
  };
}

function toStatement(expression: acorn.Expression): acorn.ExpressionStatement {
  return { type: 'ExpressionStatement', expression, start: 0, end: 0 };
}

function findConstructor(classNode: ClassLike): acorn.MethodDefinition | null {
  for (const member of classNode.body.body) {
    if (member.type === 'MethodDefinition' && member.kind === 'constructor') {
      return member;
    }
  }
  return null;
}

function isSuperCall(expr: acorn.Expression): boolean {
  return expr.type === 'CallExpression' && expr.callee.type === 'Super';
}

// Field initializers must run after super() returns (`this` is unbound before
// it). super() may appear as its own statement (`super(); ...`) or, in minified
// code, as the head of a comma sequence (`super(), this.x = ...`).
function insertAfterSuper(ctorBody: acorn.Statement[], inits: acorn.AssignmentExpression[]): void {
  // super(...) as its own statement.
  const stmtIndex = ctorBody.findIndex(
    (stmt) => stmt.type === 'ExpressionStatement' && isSuperCall(stmt.expression),
  );
  if (stmtIndex !== -1) {
    ctorBody.splice(stmtIndex + 1, 0, ...inits.map(toStatement));
    return;
  }

  // super(...) nested inside a comma sequence statement.
  for (const stmt of ctorBody) {
    if (stmt.type === 'ExpressionStatement' && stmt.expression.type === 'SequenceExpression') {
      const seq = stmt.expression.expressions;
      const seqIndex = seq.findIndex(isSuperCall);
      if (seqIndex !== -1) {
        seq.splice(seqIndex + 1, 0, ...inits);
        return;
      }
    }
  }

  // super() is nested somewhere we cannot statically locate (rare). Append the
  // inits so we never emit a `this.*` write before super() has run.
  ctorBody.push(...inits.map(toStatement));
}

function makeConstructor(inits: acorn.AssignmentExpression[], derived: boolean): acorn.MethodDefinition {
  const body: acorn.Statement[] = [];
  const params: acorn.Pattern[] = [];

  if (derived) {
    // constructor(...args) { super(...args); ...inits }
    const args: acorn.Identifier = { type: 'Identifier', name: 'args', start: 0, end: 0 };
    params.push({ type: 'RestElement', argument: args, start: 0, end: 0 });
    const superCall: acorn.CallExpression = {
      type: 'CallExpression',
      callee: { type: 'Super', start: 0, end: 0 },
      arguments: [{ type: 'SpreadElement', argument: args, start: 0, end: 0 }],
      optional: false,
      start: 0,
      end: 0,
    };
    body.push(toStatement(superCall));
  }

  body.push(...inits.map(toStatement));

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
    insertAfterSuper(ctorBody, inits);
  } else {
    ctorBody.unshift(...inits.map(toStatement));
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
