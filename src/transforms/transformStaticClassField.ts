import * as acorn from 'acorn';
import type * as walk from 'acorn-walk';

interface StaticField {
  key: acorn.Expression | acorn.PrivateIdentifier;
  value: acorn.Expression | null | undefined;
  computed: boolean;
}

function extractStaticFields(classNode: { body: acorn.ClassBody }): StaticField[] {
  const fields: StaticField[] = [];

  classNode.body.body = classNode.body.body.filter((member) => {
    if (
      member.type === 'PropertyDefinition' &&
      member.static &&
      member.key.type !== 'PrivateIdentifier'
    ) {
      fields.push({ key: member.key, value: member.value, computed: member.computed });
      return false;
    }
    return true;
  });

  return fields;
}

function makeAssignment(className: string, field: StaticField): acorn.ExpressionStatement {
  const object: acorn.Identifier = { type: 'Identifier', name: className, start: 0, end: 0 };
  const left: acorn.MemberExpression = {
    type: 'MemberExpression',
    object,
    property: field.key,
    computed: field.computed,
    optional: false,
    start: 0,
    end: 0,
  };
  const fallback: acorn.Identifier = { type: 'Identifier', name: 'undefined', start: 0, end: 0 };
  const right: acorn.Expression = field.value ?? fallback;
  const expression: acorn.AssignmentExpression = {
    type: 'AssignmentExpression',
    operator: '=',
    left,
    right,
    start: 0,
    end: 0,
  };
  return {
    type: 'ExpressionStatement',
    expression,
    start: 0,
    end: 0,
  };
}

function processStmt(stmt: acorn.Statement): acorn.Statement[] {
  if (stmt.type === 'ClassDeclaration' && stmt.id) {
    const fields = extractStaticFields(stmt);
    if (fields.length === 0) return [stmt];
    return [stmt, ...fields.map(f => makeAssignment(stmt.id!.name, f))];
  }

  if (stmt.type === 'VariableDeclaration') {
    const extra: acorn.ExpressionStatement[] = [];
    for (const decl of stmt.declarations) {
      if (decl.init?.type === 'ClassExpression' && decl.id.type === 'Identifier') {
        const className = decl.id.name;
        const fields = extractStaticFields(decl.init);
        extra.push(...fields.map(f => makeAssignment(className, f)));
      }
    }
    if (extra.length > 0) return [stmt, ...extra];
  }

  return [stmt];
}

export function createStaticClassFieldsVisitor(): walk.SimpleVisitors<unknown> {
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
