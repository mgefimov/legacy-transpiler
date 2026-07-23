import * as acorn from 'acorn';
import { moduleExportsAccess, moduleGetExportsAccess, onExportsUpdatedAccess } from './moduleExportsAccess';


export function transformStaticImports(ast: acorn.Program, src?: string): void {
  ast.body = ast.body.flatMap((node): (acorn.Statement | acorn.ModuleDeclaration)[] => {
    if (node.type !== 'ImportDeclaration') return [node];

    // Side-effect import: import 'module' → strip
    if (node.specifiers.length === 0) return [];

    const moduleCall = moduleExportsAccess(node.source, node.start, node.end, src);
    const moduleAccess: acorn.AwaitExpression = {
      type: 'AwaitExpression',
      argument: moduleCall,
      start: node.start,
      end: node.end,
    };

    const properties: acorn.AssignmentProperty[] = [];

    for (const spec of node.specifiers) {
      if (spec.type === 'ImportNamespaceSpecifier') {
        // Namespace import holds a live reference to the (possibly still
        // mutating) exports object, so `mod.x` is always current — no resync
        // needed, and `const` is safe.
        const decl: acorn.VariableDeclaration = {
          type: 'VariableDeclaration',
          kind: 'const',
          declarations: [{
            type: 'VariableDeclarator',
            id: spec.local,
            init: moduleAccess,
            start: node.start,
            end: node.end,
          }],
          start: node.start,
          end: node.end,
        };
        return [decl];
      }

      if (spec.type === 'ImportDefaultSpecifier') {
        properties.push({
          type: 'Property',
          key: { type: 'Identifier', name: 'default', start: spec.start, end: spec.end },
          value: spec.local,
          kind: 'init',
          computed: false,
          method: false,
          shorthand: false,
          start: spec.start,
          end: spec.end,
        });
      } else if (spec.type === 'ImportSpecifier') {
        const imported = spec.imported;
        const shorthand = imported.type === 'Identifier' && imported.name === spec.local.name;
        properties.push({
          type: 'Property',
          key: spec.imported,
          value: spec.local,
          kind: 'init',
          computed: false,
          method: false,
          shorthand,
          start: spec.start,
          end: spec.end,
        });
      }
    }

    // A destructuring binds a *snapshot*. In a circular import the source
    // module may not have exported anything yet, so the snapshot freezes
    // `undefined` and calling it later throws "x is not a function". Declare
    // with `let` and re-destructure once the source publishes its exports.
    const decl: acorn.VariableDeclaration = {
      type: 'VariableDeclaration',
      kind: 'let',
      declarations: [{
        type: 'VariableDeclarator',
        id: {
          type: 'ObjectPattern',
          properties,
          start: node.start,
          end: node.end,
        },
        init: moduleAccess,
        start: node.start,
        end: node.end,
      }],
      start: node.start,
      end: node.end,
    };
    return [decl, buildResyncStatement(node.source, properties, node.start, node.end)];
  });
}

// Emits:
//   window.LegacyTranspiler.onExportsUpdated(<source>, () => {
//     ({ ...pattern } = window.LegacyTranspiler.getModuleExports(<source>));
//   });
// The pattern is rebuilt from fresh nodes so it doesn't share identity with
// the `let` declaration's ObjectPattern.
function buildResyncStatement(source: acorn.Literal, properties: acorn.AssignmentProperty[], start: number, end: number): acorn.ExpressionStatement {
  const patternClone: acorn.ObjectPattern = {
    type: 'ObjectPattern',
    properties: properties.map(cloneAssignmentProperty),
    start,
    end,
  };

  const assignment: acorn.AssignmentExpression = {
    type: 'AssignmentExpression',
    operator: '=',
    left: patternClone,
    right: moduleGetExportsAccess(cloneLiteral(source), start, end),
    start,
    end,
  };

  const arrow: acorn.ArrowFunctionExpression = {
    type: 'ArrowFunctionExpression',
    id: null,
    params: [],
    generator: false,
    async: false,
    expression: false,
    body: {
      type: 'BlockStatement',
      body: [{ type: 'ExpressionStatement', expression: assignment, start, end }],
      start,
      end,
    },
    start,
    end,
  };

  return {
    type: 'ExpressionStatement',
    expression: onExportsUpdatedAccess(cloneLiteral(source), arrow, start, end),
    start,
    end,
  };
}

function cloneLiteral(lit: acorn.Literal): acorn.Literal {
  return { type: 'Literal', value: lit.value, start: lit.start, end: lit.end };
}

// Import specifiers only ever produce Identifier (or, rarely, string-Literal)
// keys and Identifier value bindings, so a shallow rebuild is enough.
function cloneAssignmentProperty(p: acorn.AssignmentProperty): acorn.AssignmentProperty {
  const value: acorn.Identifier = p.value.type === 'Identifier'
    ? { type: 'Identifier', name: p.value.name, start: p.value.start, end: p.value.end }
    : { type: 'Identifier', name: 'default', start: p.start, end: p.end };
  return {
    type: 'Property',
    key: cloneKey(p.key),
    value,
    kind: 'init',
    computed: p.computed,
    method: false,
    shorthand: p.shorthand,
    start: p.start,
    end: p.end,
  };
}

function cloneKey(key: acorn.Expression): acorn.Expression {
  if (key.type === 'Identifier') {
    return { type: 'Identifier', name: key.name, start: key.start, end: key.end };
  }
  if (key.type === 'Literal') {
    return { type: 'Literal', value: key.value, start: key.start, end: key.end };
  }
  return key;
}
