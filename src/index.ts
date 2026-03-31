import * as acorn from 'acorn';
import * as walk from 'acorn-walk';
import { generate } from 'astring';
import {
  transformStaticImports,
  createDynamicImportsVisitor,
  createImportMetaVisitor,
  createLookbehindVisitor,
  createStaticBlocksVisitor,
  transformExports,
  transformWrapAsyncIIFE,
} from './transforms';
import { mergeVisitors } from './transforms/mergeVisitors';

export interface TranspileOptions {
  BASE_URL: string;
  minify?: boolean;
  runScript: (code: string, src: string) => void;
}

let options: TranspileOptions

const _moduleExports: Record<string, any> = {}
const _importWaitlist: Record<string, (() => void)[]> = {}

const loaded = new Set();

const resolveModule = (source = "") => {
  // const BASE_URL =
  //   "https://assets-proxy.anthropic.com/claude-ai/v2/assets/v1";
  const BASE_URL = options.BASE_URL;
  //console.log('resolveModule', source)
  if (!source.startsWith("./")) {
    return source;
  }
  return `${BASE_URL}/${source.replace(/^\.\//, "")}`;
};

export async function loadCode(src = "") {
  if (src.includes("intercom") || loaded.has(src)) {
    return [];
  }
  loaded.add(src);
  const r = await fetch(src);
  const code = await r.text();

  const patchedScript = transpile(src, code);

  options.runScript(patchedScript, src);
}

export function init(o: TranspileOptions) {
  options = o
}

export function exportModule(source: string, exports: Record<string, any>): void {
  console.log(`[exportModule] ${source} →`, exports);

  _moduleExports[source] = exports;
  if (_importWaitlist[source]) {
    for (const resolve of _importWaitlist[source]) {
      resolve();
    }
    delete _importWaitlist[source];
  }
}

export function importModule(source: string): Promise<any> {
  source = resolveModule(source);
  console.log('[importModule]', source);
  if (_moduleExports[source]) {
    return Promise.resolve(_moduleExports[source]);
  }
  return new Promise((resolve) => {
    if (!_importWaitlist[source]) {
      _importWaitlist[source] = [];
    }
    _importWaitlist[source].push(() => {
      resolve(_moduleExports[source]);
    });

    loadCode(source)
  });
}

export function transpile(src: string, code: string): string {
  const ast = acorn.parse(code, {
    ecmaVersion: 'latest',
    sourceType: 'module',
    allowAwaitOutsideFunction: true,
  });

  transformStaticImports(ast);

  const merged = mergeVisitors(
    createDynamicImportsVisitor(),
    createImportMetaVisitor({ url: src }),
    createLookbehindVisitor(),
    createStaticBlocksVisitor(),
  );
  walk.simple(ast, merged as walk.SimpleVisitors<unknown>);

  transformExports(ast, { src });
  transformWrapAsyncIIFE(ast);

  const result = generate(ast, options.minify ? { indent: '', lineEnd: '' } : undefined);
  return `'use strict';\n${result}`;
}
