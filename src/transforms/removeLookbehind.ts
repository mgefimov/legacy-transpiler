import * as acorn from 'acorn';
import * as walk from 'acorn-walk';

// Stands in for a ${...} interpolation while we scan a template-literal pattern.
// A Unicode noncharacter that never appears in real regex source, so the scanner
// treats it as opaque content and never mistakes it for regex syntax.
const EXPR_PLACEHOLDER = '￿';

// Index of the ) closing the group that opens at `start` (a '('), honoring nested
// parens, character classes, and escapes. -1 if unbalanced.
function findGroupEnd(source: string, start: number): number {
  let depth = 0;
  let inClass = false;
  for (let i = start; i < source.length; i++) {
    const c = source[i];
    if (c === '\\') { i++; continue; }
    if (inClass) { if (c === ']') inClass = false; continue; }
    if (c === '[') { inClass = true; continue; }
    if (c === '(') { depth++; continue; }
    if (c === ')') { depth--; if (depth === 0) return i; }
  }
  return -1;
}

// Mark every code unit of regex `source` that belongs to a lookbehind group —
// (?<=...) or (?<!...) — as false (to be dropped). Handles arbitrary nesting,
// character classes, and escapes. Lookbehind is unsupported on older Safari;
// dropping the (zero-width) assertion lets the pattern parse and match more
// loosely, the best we can do without a real polyfill. Named groups (?<name>...)
// are left intact since they don't start with = or !.
function lookbehindKeepMask(source: string): boolean[] {
  const keep = new Array<boolean>(source.length).fill(true);
  let inClass = false;
  let i = 0;
  while (i < source.length) {
    const c = source[i];
    if (c === '\\') { i += 2; continue; }
    if (inClass) { if (c === ']') inClass = false; i++; continue; }
    if (c === '[') { inClass = true; i++; continue; }
    if (c === '(' && source[i + 1] === '?' && source[i + 2] === '<' &&
        (source[i + 3] === '=' || source[i + 3] === '!')) {
      const end = findGroupEnd(source, i);
      if (end === -1) { i++; continue; }
      for (let j = i; j <= end; j++) keep[j] = false;
      i = end + 1;
      continue;
    }
    i++;
  }
  return keep;
}

function applyMask(source: string, keep: boolean[]): string {
  let out = '';
  for (let i = 0; i < source.length; i++) if (keep[i]) out += source[i];
  return out;
}

// Escape a cooked string so it round-trips as template-literal raw text: doubling
// backslashes (and escaping ` and ${) yields raw that cooks back to the input.
function rawFromCooked(cooked: string): string {
  return cooked.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${');
}

function stripLiteralPattern(node: acorn.Literal): void {
  if (typeof node.value !== 'string') return;
  const keep = lookbehindKeepMask(node.value);
  if (keep.every(Boolean)) return;
  node.value = applyMask(node.value, keep);
  node.raw = JSON.stringify(node.value);
}

// Flatten the template (each ${...} becomes one placeholder char), strip lookbehind
// across the whole pattern, then rebuild quasis/expressions from the survivors. This
// handles a lookbehind that spans interpolations, e.g.
// `(?<!(?:(?![${a}${b}])x)[${b}]{0,31})[${b}]+` -> `[${b}]+`. Interpolations falling
// inside a removed lookbehind are dropped along with it; ones that produce a
// lookbehind purely at runtime can't be seen statically and are left as-is.
function stripTemplatePattern(tpl: acorn.TemplateLiteral): void {
  let flat = '';
  const exprAt: number[] = [];
  for (let q = 0; q < tpl.quasis.length; q++) {
    const cooked = tpl.quasis[q].value.cooked ?? tpl.quasis[q].value.raw;
    for (let k = 0; k < cooked.length; k++) { flat += cooked[k]; exprAt.push(-1); }
    if (q < tpl.expressions.length) { flat += EXPR_PLACEHOLDER; exprAt.push(q); }
  }

  const keep = lookbehindKeepMask(flat);
  if (keep.every(Boolean)) return;

  const cookedParts: string[] = [];
  const expressions: acorn.Expression[] = [];
  let current = '';
  for (let i = 0; i < flat.length; i++) {
    if (!keep[i]) continue;
    if (exprAt[i] === -1) {
      current += flat[i];
    } else {
      cookedParts.push(current);
      current = '';
      expressions.push(tpl.expressions[exprAt[i]]);
    }
  }
  cookedParts.push(current);

  const quasis: acorn.TemplateElement[] = cookedParts.map((cooked, idx) => ({
    type: 'TemplateElement',
    tail: idx === cookedParts.length - 1,
    value: { raw: rawFromCooked(cooked), cooked },
    start: tpl.start,
    end: tpl.end,
  }));
  tpl.quasis = quasis;
  tpl.expressions = expressions;
}

function stripRegExpArg(arg: acorn.Expression | acorn.SpreadElement | undefined): void {
  if (!arg) return;
  if (arg.type === 'Literal') stripLiteralPattern(arg);
  else if (arg.type === 'TemplateLiteral') stripTemplatePattern(arg);
}

function isRegExpCallee(callee: acorn.Expression | acorn.Super): boolean {
  return callee.type === 'Identifier' && callee.name === 'RegExp';
}

export const createLookbehindVisitor = (): walk.SimpleVisitors<unknown> => {
  return {
    Literal(node: acorn.Literal) {
      if (node.regex) {
        node.regex.pattern = applyMask(node.regex.pattern, lookbehindKeepMask(node.regex.pattern));
        node.raw = `/${node.regex.pattern}/${node.regex.flags}`;
        return;
      }
      // Lookbehind also hides in plain string literals that reach RegExp(...)
      // indirectly — via a variable, concatenation, or object property — which
      // the RegExp-call handlers below can't follow, e.g.
      // `var p = "(?<![A-Za-z0-9_-])"; new RegExp(p)`. `(?<=` / `(?<!` are
      // regex-specific and essentially never appear in non-regex text, so
      // stripping them from any string literal is safe in practice and matches
      // the lossy, best-effort lookbehind removal already done here.
      stripLiteralPattern(node);
    },
    CallExpression(node: acorn.CallExpression) {
      if (isRegExpCallee(node.callee)) stripRegExpArg(node.arguments[0]);
    },
    NewExpression(node: acorn.NewExpression) {
      if (isRegExpCallee(node.callee)) stripRegExpArg(node.arguments[0]);
    }
  }
};
