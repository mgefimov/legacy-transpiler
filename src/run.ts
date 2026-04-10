import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { resolve, join } from 'path';
import { performance } from 'perf_hooks';
import * as acorn from 'acorn';
import { generate } from 'astring';
import { init } from './index';
import * as walk from 'acorn-walk';
import {
  transformStaticImports,
  createDynamicImportsVisitor,
  createImportMetaVisitor,
  createLookbehindVisitor,
  createStaticBlocksVisitor,
  transformExports,
  transformStaticClassFields,
  transformWrapAsyncIIFE,
  mergeVisitors,
} from './transforms';

const BASE_URL = 'https://assets-proxy.anthropic.com/claude-ai/v2/assets/v1';

const inputDir = resolve(__dirname, '../assets/input');
const outputDir = resolve(__dirname, '../assets/output');

const files = readdirSync(inputDir).filter(f => f.endsWith('.js'));

const transforms = [
  { name: 'transformStaticImports',  fn: (ast: acorn.Program, _src: string) => transformStaticImports(ast) },
  { name: 'combinedWalk',            fn: (ast: acorn.Program, src: string) => {
    const merged = mergeVisitors(
      createDynamicImportsVisitor(),
      createImportMetaVisitor({ url: src }),
      createLookbehindVisitor(),
      createStaticBlocksVisitor(),
    );
    walk.simple(ast, merged);
  }},
  { name: 'transformExports',            fn: (ast: acorn.Program, src: string) => transformExports(ast, { src }) },
  { name: 'transformStaticClassFields', fn: (ast: acorn.Program, _src: string) => transformStaticClassFields(ast) },
  { name: 'transformWrapAsyncIIFE',     fn: (ast: acorn.Program, _src: string) => transformWrapAsyncIIFE(ast) },
];

function transpileWithProfile(src: string, code: string): string {
  const timings: { name: string; ms: number }[] = [];

  const t0 = performance.now();
  const ast = acorn.parse(code, {
    ecmaVersion: 'latest',
    sourceType: 'module',
    allowAwaitOutsideFunction: true,
  });
  timings.push({ name: 'acorn.parse', ms: performance.now() - t0 });

  for (const { name, fn } of transforms) {
    const start = performance.now();
    fn(ast, src);
    timings.push({ name, ms: performance.now() - start });
  }

  const t1 = performance.now();
  const result = generate(ast);
  timings.push({ name: 'astring.generate', ms: performance.now() - t1 });

  console.log(`  ${'transform'.padEnd(30)} time`);
  console.log('  ' + '-'.repeat(42));
  for (const { name, ms } of timings) {
    console.log(`  ${name.padEnd(30)} ${ms.toFixed(3)} ms`);
  }
  const total = timings.reduce((s, t) => s + t.ms, 0);
  console.log('  ' + '-'.repeat(42));
  console.log(`  ${'TOTAL'.padEnd(30)} ${total.toFixed(3)} ms\n`);

  return `'use strict';\n${result}`;
}

(async () => {
  init({ BASE_URL, minify: false, runScript: () => {} });

  for (const file of files) {
    const inputPath = join(inputDir, file);
    const outputPath = join(outputDir, file);

    const inputCode = readFileSync(inputPath, 'utf-8');
    const src = `${BASE_URL}/${file}`;
    console.log(`\n${file} -> assets/output/${file}`);
    const result = transpileWithProfile(src, inputCode);

    writeFileSync(outputPath, result);
  }

  console.log(`Transpiled ${files.length} file(s)`);
})();
