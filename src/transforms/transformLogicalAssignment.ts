import * as acorn from 'acorn';
import type * as walk from 'acorn-walk';

// Logical assignment operators shipped in iOS 14. Lower them to forms that
// work on older engines, preserving short-circuit semantics:
//   a ||= b  ->  a || (a = b)
//   a &&= b  ->  a && (a = b)
//   a ??= b  ->  a == null ? a = b : a
// The `??=` form uses `== null` rather than `??` so it does not reintroduce
// nullish coalescing (also an iOS 14 feature).
//
// Known limitation: a member target's object/computed key is evaluated more
// than once (e.g. `obj[k()] ||= b`). That is fine for the simple targets real
// code uses (`x`, `this.x`, `obj.x`) but not for side-effecting objects/keys.

type AssignTarget = acorn.Identifier | acorn.MemberExpression;

function makeAssignment(target: AssignTarget, value: acorn.Expression): acorn.AssignmentExpression {
  return {
    type: 'AssignmentExpression',
    operator: '=',
    left: target,
    right: value,
    start: target.start,
    end: value.end,
  };
}

function makeNullLiteral(): acorn.Literal {
  return { type: 'Literal', value: null, raw: 'null', start: 0, end: 0 };
}

export function createLogicalAssignmentVisitor(): walk.SimpleVisitors<unknown> {
  return {
    AssignmentExpression(node) {
      const op = node.operator;
      if (op !== '||=' && op !== '&&=' && op !== '??=') return;

      const target = node.left;
      // Compound logical assignment targets are always Identifier/MemberExpression,
      // never a destructuring pattern. Narrow so it is usable as an Expression.
      if (target.type !== 'Identifier' && target.type !== 'MemberExpression') return;

      if (op === '??=') {
        const conditional: acorn.ConditionalExpression = {
          type: 'ConditionalExpression',
          test: {
            type: 'BinaryExpression',
            operator: '==',
            left: target,
            right: makeNullLiteral(),
            start: node.start,
            end: node.end,
          },
          consequent: makeAssignment(target, node.right),
          alternate: target,
          start: node.start,
          end: node.end,
        };
        Object.assign(node, conditional);
        return;
      }

      const logical: acorn.LogicalExpression = {
        type: 'LogicalExpression',
        operator: op === '||=' ? '||' : '&&',
        left: target,
        right: makeAssignment(target, node.right),
        start: node.start,
        end: node.end,
      };
      Object.assign(node, logical);
    },
  };
}
