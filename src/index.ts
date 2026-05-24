import * as acorn from 'acorn';
import * as walk from 'acorn-walk';
import { generate } from 'astring';
import { patchFetch, patchAnimate } from './utils'
import {
  transformStaticImports,
  createDynamicImportsVisitor,
  createImportMetaVisitor,
  createLookbehindVisitor,
  createStaticBlocksVisitor,
  createStaticClassFieldsVisitor,
  createInstanceClassFieldsVisitor,
  createLogicalAssignmentVisitor,
  createBigIntVisitor,
  createPrivateFieldsVisitor,
  transformExports,
  transformWrapAsyncIIFE,
} from './transforms';
import { mergeVisitors } from './transforms/mergeVisitors';
import { version as pkgVersion } from '../package.json';

export interface Target {
  platform: 'iOS';
  version: string;
}

export interface TranspileOptions {
  BASE_URL: string;
  minify?: boolean;
  target?: Target;
  runScript: (code: string, src: string) => void;
}

let options: TranspileOptions

function targetAtLeast(platform: Target['platform'], min: [number, number]): boolean {
  if (!options.target || options.target.platform !== platform) return false;
  const parts = options.target.version.split('.');
  const major = Number(parts[0]);
  const minor = Number(parts[1] ?? 0);
  if (Number.isNaN(major) || Number.isNaN(minor)) return false;
  if (major !== min[0]) return major > min[0];
  return minor >= min[1];
}

const _moduleExports: Record<string, unknown> = {}
const _importWaitlist: Record<string, (() => void)[]> = {}

const loaded = new Set();

if (typeof window !== 'undefined') {
  patchFetch()
  patchAnimate()
}

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

const CACHE_NAME = `transpiled-v${pkgVersion}`;

async function openCache(): Promise<Cache | null> {
  if (typeof caches === 'undefined') return null;
  try { return await caches.open(CACHE_NAME); } catch { return null; }
}

export async function loadCode(src = "") {
  if (src.includes("intercom") || loaded.has(src)) {
    return;
  }
  loaded.add(src);

  const cache = await openCache();
  if (cache) {
    const cached = await cache.match(src);
    if (cached) {
      console.log('[cache hit]', src);
      options.runScript(await cached.text(), src);
      return;
    }
  }

  console.warn('[cache miss]', src);

  const r = await fetch(src);
  const code = await r.text();
  const patchedScript = transpile(src, code);

  if (cache) {
    cache.put(src, new Response(patchedScript));
  }

  options.runScript(patchedScript, src);
}

export function init(o: TranspileOptions) {
  options = o
}

export function exportModule(source: string, exports: Record<string, unknown>): void {
  console.log(`[exportModule] ${source} →`, exports);

  _moduleExports[source] = exports;
  if (_importWaitlist[source]) {
    for (const resolve of _importWaitlist[source]) {
      resolve();
    }
    delete _importWaitlist[source];
  }
}

export function importModule(source: string): Promise<unknown> {
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

  const visitors: walk.SimpleVisitors<unknown>[] = [
    createDynamicImportsVisitor(),
    createImportMetaVisitor({ url: src }),
    createLookbehindVisitor(),
  ];
  if (!targetAtLeast('iOS', [15, 0])) {
    visitors.push(createPrivateFieldsVisitor());
  }
  visitors.push(createStaticBlocksVisitor());
  if (!targetAtLeast('iOS', [15, 0])) {
    visitors.push(createStaticClassFieldsVisitor());
  }
  if (!targetAtLeast('iOS', [14, 0])) {
    visitors.push(createInstanceClassFieldsVisitor());
  }
  if (!targetAtLeast('iOS', [14, 0])) {
    visitors.push(createLogicalAssignmentVisitor());
  }
  if (!targetAtLeast('iOS', [14, 0])) {
    visitors.push(createBigIntVisitor());
  }
  walk.simple(ast, mergeVisitors(...visitors));

  transformExports(ast, { src });
  transformWrapAsyncIIFE(ast);

  const result = generate(ast, options.minify ? { indent: '', lineEnd: '' } : undefined);
  return `'use strict';\n${result}`;
}
