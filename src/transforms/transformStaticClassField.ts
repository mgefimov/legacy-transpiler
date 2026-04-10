import * as acorn from 'acorn';

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

function recurseIntoBlocks(stmt: acorn.Statement): void {
  switch (stmt.type) {
    case 'WhileStatement':
    case 'DoWhileStatement':
    case 'ForStatement':
    case 'ForInStatement':
    case 'ForOfStatement':
    case 'WithStatement':
    case 'LabeledStatement':
      if (stmt.body.type === 'BlockStatement') {
        stmt.body.body = processStatements(stmt.body.body);
      }
      break;
    case 'IfStatement':
      if (stmt.consequent.type === 'BlockStatement') {
        stmt.consequent.body = processStatements(stmt.consequent.body);
      }
      if (stmt.alternate?.type === 'BlockStatement') {
        stmt.alternate.body = processStatements(stmt.alternate.body);
      }
      break;
    case 'TryStatement':
      stmt.block.body = processStatements(stmt.block.body);
      if (stmt.handler?.body) {
        stmt.handler.body.body = processStatements(stmt.handler.body.body);
      }
      if (stmt.finalizer) {
        stmt.finalizer.body = processStatements(stmt.finalizer.body);
      }
      break;
  }
}

function processStatements(stmts: acorn.Statement[]): acorn.Statement[] {
  return stmts.flatMap((stmt): acorn.Statement[] => {
    recurseIntoBlocks(stmt);

    // ClassDeclaration: extract static fields, add assignments after class
    if (stmt.type === 'ClassDeclaration' && stmt.id) {
      const fields = extractStaticFields(stmt);
      if (fields.length === 0) return [stmt];
      return [stmt, ...fields.map(f => makeAssignment(stmt.id!.name, f))];
    }

    // VariableDeclaration with ClassExpression init
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
  });
}

export function transformStaticClassFields(ast: acorn.Program): void {
  ast.body = processStatements(ast.body as acorn.Statement[]);
}
