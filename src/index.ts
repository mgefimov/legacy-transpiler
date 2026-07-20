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

const _moduleExports: Record<string, Record<string, unknown>> = {}
const _moduleFinalized = new Set<string>();
const _importWaitlist: Record<string, (() => void)[]> = {}
// importer src -> source it is currently blocked awaiting; used to detect import cycles
const _blockedOn: Record<string, string> = {}

const loaded = new Set();

// Is `importer` reachable from `source` by following the current chain of
// in-flight imports? If so, `importer` awaiting `source` would deadlock:
// `source` is (transitively) already waiting on `importer` to finish.
function isCircular(source: string, importer: string): boolean {
  const seen = new Set<string>();
  let current: string | undefined = source;
  while (current !== undefined) {
    if (current === importer) return true;
    if (seen.has(current)) return false;
    seen.add(current);
    current = _blockedOn[current];
  }
  return false;
}

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

  // A circular importer may already hold a reference to this module's
  // placeholder exports object (see importModule below) — mutate it in
  // place rather than replacing it, so that reference stays live.
  if (_moduleExports[source]) {
    Object.assign(_moduleExports[source], exports);
  } else {
    _moduleExports[source] = exports;
  }
  _moduleFinalized.add(source);
  delete _blockedOn[source];

  if (_importWaitlist[source]) {
    for (const resolve of _importWaitlist[source]) {
      resolve();
    }
    delete _importWaitlist[source];
  }
}

export function importModule(source: string, importer?: string): Promise<unknown> {
  source = resolveModule(source);
  console.log('[importModule]', source);

  if (_moduleFinalized.has(source)) {
    return Promise.resolve(_moduleExports[source]);
  }

  // `importer` is already (transitively) what `source` is waiting on, so
  // waiting here would deadlock. Hand back source's in-progress exports
  // (possibly incomplete) instead, same as Node's circular require().
  if (importer !== undefined && isCircular(source, importer)) {
    if (!_moduleExports[source]) {
      _moduleExports[source] = {};
    }
    return Promise.resolve(_moduleExports[source]);
  }

  if (importer !== undefined) {
    _blockedOn[importer] = source;
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

  transformStaticImports(ast, src);

  const visitors: walk.SimpleVisitors<unknown>[] = [
    createDynamicImportsVisitor(src),
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
