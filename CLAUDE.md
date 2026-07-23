# CLAUDE.md

## What this is

A TypeScript library that **transpiles modern JS/ESM down to code an old iOS
Safari can run**, at runtime, in the browser. Its real-world use is patching
claude.ai's own asset bundles: a userscript loads the built IIFE
(`window.LegacyTranspiler`), intercepts each chunk fetch, runs it through
`transpile()`, and injects the result as a classic `<script>`. So the output
must parse and run on the **target iOS Safari**, not just modern V8 — a feature
that's valid in Node can still throw a `SyntaxError` on the device.

## Pipeline (`src/index.ts` → `transpile(src, code)`)

1. `acorn.parse` (module, `allowAwaitOutsideFunction`)
2. `transformStaticImports(ast, src)` — **separate pass, before the walk**
3. **One merged `walk.simple`** (`mergeVisitors(...)`) — all node-visitors run in
   a single traversal for perf. Which visitors run is gated by `options.target`
   (see below).
4. `transformExports(ast, { src })` — separate pass
5. `transformWrapAsyncIIFE(ast)` — wraps everything in `(async function(){…})()`
6. `astring.generate` (minified iff `options.minify`), prefixed with `'use strict';`

`acorn-walk`'s `simple` is **post-order** (children before parent) — this matters
whenever two visitors touch the same subtree (e.g. static blocks vs. static
fields, or the `import.meta` MetaProperty vs. its parent MemberExpression).

## Module runtime (also in `src/index.ts`)

ESM is emulated at runtime:
- `import …` → `await window.LegacyTranspiler.importModule(src, importer)`
- `export …` → `window.LegacyTranspiler.exportModule(src, {…})`
- Whole module wrapped in an async IIFE.

Key pieces:
- `loadCode(src)` — fetch → `transpile` → `runScript`, with a **Cache Storage**
  layer keyed `transpiled-v{package.json version}`. Stale cache is a recurring
  footgun when iterating; the test site (`site/circular_import`) clears it on load.
- **Circular imports** (`isCircular` walks the `_blockedOn` chain): a cycle gets
  an in-progress placeholder exports object instead of deadlocking (Node-style
  `require`). The `importer` arg is what makes detection possible.
- **Live bindings**: destructured imports emit `let {x} = …` **plus** an
  `onExportsUpdated(src, () => ({x} = getModuleExports(src)))` resync, so a
  binding captured as `undefined` mid-cycle refreshes once the source finishes
  exporting (fixes the `X is not a function` / prod `pe is not a function` bug).
  Namespace imports stay `const` (live reference to the mutated exports object).

## Transforms (`src/transforms/`)

Each is an acorn visitor (or a pre/post pass). All merged into one walk except
static imports and exports.

| transform | purpose | gate |
|---|---|---|
| `staticImportToDynamic` | `import` → `importModule` + live-binding resync | always |
| `resolveDynamicImport` | `import(x)` → `importModule(x)` | always |
| `removeExport` | `export` → `exportModule(src, {…})` | always |
| `replaceImportMeta` | any `import.meta` → `{ url }` object (not just `.url`) | always |
| `removeLookbehind` | strip `(?<=)`/`(?<!)` from regex literals, `RegExp()` args, **and plain string literals** | always |
| `transformStaticBlock` | `static {}` → method+call (declarations) or self-contained IIFE (class **expressions**) | always |
| `transformStaticClassField` | `static x = …` → `Class.x = …` | iOS < 15 |
| `transformPrivateFields` | `#x` → `_private_field__x` | iOS < 15 |
| `transformInstanceClassField` | instance fields → constructor assignment | iOS < 14 |
| `transformLogicalAssignment` | `??=`/`||=`/`&&=` | iOS < 14 |
| `transformBigInt` | `1n` → `1` (**lossy**, intentional — see memory) | iOS < 14 |
| `wrapAsyncIIFE` | wrap module body | always |

`target` defaults to undefined (all transforms on); `run.ts` uses iOS 14.0.
Two transforms only handle class **declarations** + `const X = class`;
`transformStaticBlock` additionally handles bare class expressions via IIFE, but
the field transforms do **not** — that's fine on iOS 14 where class fields are
natively supported.

Several transforms are **lossy by design** (lookbehind dropped not polyfilled,
BigInt→Number). Don't "fix" that; it's the best-effort tradeoff.

## Common workflow when a claude.ai chunk breaks on-device

The error is a runtime `SyntaxError` from injected code. To reproduce: download
the exact chunk (its filename is a content hash, so anon `curl` gets identical
bytes), `transpile()` it, then **re-parse the output with acorn at a low
`ecmaVersion`** (ES2021 ≈ iOS 14, ES2022 allows class fields+static blocks) to
find syntax the device rejects — `new Function()`/modern V8 is too lenient to
catch it. Then extend the relevant transform, add the case to its test, and
re-scan all chunks for residue.

## Rules

- No `any` — use `unknown`. No `as` type conversions — narrow with `typeof` /
  `.type` checks / `in`. (acorn ESTree types are precise; check
  `node_modules/acorn/dist/acorn.d.ts` before reaching for a cast.)
- Each acorn walk is expensive — merge node-visitors into the single
  `mergeVisitors` walk; don't add standalone walks.
- After changes: fix/add tests and run all tests (`yarn test` / `npx vitest run`),
  then `yarn typecheck` — it should be **fully clean** (no known pre-existing errors).
- Only commit when explicitly asked.

## Commands

- `yarn build` — esbuild → `dist/legacy-transpiler.js` (IIFE, `--target=ios12`,
  `--global-name=LegacyTranspiler`)
- `yarn test` / `yarn test:watch` — vitest
- `yarn typecheck` — `tsc --noEmit`
- `yarn start` — `tsx src/run.ts`: transpiles `assets/input/*.js` → `assets/output/`
- `yarn serve` — `npx serve site` (demo pages; `site/circular_import` runs the
  real pipeline in-browser)
