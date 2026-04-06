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
  return {
    type: 'ExpressionStatement',
    expression: {
      type: 'AssignmentExpression',
      operator: '=',
      left: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: className, start: 0, end: 0 },
        property: field.key,
        computed: field.computed,
        optional: false,
        start: 0,
        end: 0,
      } as acorn.MemberExpression,
      right: field.value ?? ({ type: 'Identifier', name: 'undefined', start: 0, end: 0 } as acorn.Identifier),
      start: 0,
      end: 0,
    } as acorn.AssignmentExpression,
    start: 0,
    end: 0,
  };
}

function processStatements(stmts: acorn.Statement[]): acorn.Statement[] {
  return stmts.flatMap((stmt): acorn.Statement[] => {
    // Recurse into nested statement containers
    const s = stmt as any;
    if (s.body?.type === 'BlockStatement') {
      s.body.body = processStatements(s.body.body);
    }
    if (s.consequent?.type === 'BlockStatement') {
      s.consequent.body = processStatements(s.consequent.body);
    }
    if (s.alternate?.type === 'BlockStatement') {
      s.alternate.body = processStatements(s.alternate.body);
    }
    if (s.block?.type === 'BlockStatement') {
      s.block.body = processStatements(s.block.body);
    }
    if (s.handler?.body?.type === 'BlockStatement') {
      s.handler.body.body = processStatements(s.handler.body.body);
    }
    if (s.finalizer?.type === 'BlockStatement') {
      s.finalizer.body = processStatements(s.finalizer.body);
    }

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
          const fields = extractStaticFields(decl.init);
          extra.push(...fields.map(f => makeAssignment((decl.id as acorn.Identifier).name, f)));
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
