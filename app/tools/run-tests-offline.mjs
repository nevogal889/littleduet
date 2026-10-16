// Offline test runner: bundles __tests__/*.test.ts with esbuild and runs them with a
// small jest-compatible API (describe/it/test/expect/beforeEach). Used only where
// `npm install` is impossible; `npm test` (jest + jest-expo) is the real runner.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { importTool } from './resolve-tool.mjs';

const esbuild = await importTool('esbuild');
const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(appRoot, 'tools', 'offline-web', 'out', 'tests');
fs.mkdirSync(outDir, { recursive: true });

const filter = process.argv[2];
const files = fs
  .readdirSync(path.join(appRoot, '__tests__'))
  .filter((f) => f.endsWith('.test.ts') && (!filter || f.includes(filter)));

// ---- mini jest -----------------------------------------------------------
const results = { pass: 0, fail: 0, failures: [] };
let suite = [];
let beforeEachFns = [];
const queue = [];

function fmt(v) {
  try { return JSON.stringify(v); } catch { return String(v); }
}
function deepEqual(a, b) {
  if (Object.is(a, b)) return true;
  if (typeof a !== typeof b || a === null || b === null || typeof a !== 'object') return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  const ka = Object.keys(a).filter((k) => a[k] !== undefined);
  const kb = Object.keys(b).filter((k) => b[k] !== undefined);
  if (ka.length !== kb.length) return false;
  return ka.every((k) => deepEqual(a[k], b[k]));
}
function matchObject(a, b) {
  if (typeof b !== 'object' || b === null) return Object.is(a, b);
  if (typeof a !== 'object' || a === null) return false;
  return Object.keys(b).every((k) => matchObject(a[k], b[k]));
}
function makeExpect(actual, negate = false) {
  const check = (ok, msg) => {
    if (negate ? ok : !ok) throw new Error((negate ? 'NOT ' : '') + msg);
  };
  const m = {
    toBe: (e) => check(Object.is(actual, e), `expected ${fmt(actual)} to be ${fmt(e)}`),
    toEqual: (e) => check(deepEqual(actual, e), `expected ${fmt(actual)} to equal ${fmt(e)}`),
    toMatchObject: (e) => check(matchObject(actual, e), `expected ${fmt(actual)} to match ${fmt(e)}`),
    toBeCloseTo: (e, d = 2) => check(Math.abs(actual - e) < Math.pow(10, -d) / 2, `expected ${actual} ~ ${e}`),
    toBeGreaterThan: (e) => check(actual > e, `expected ${actual} > ${e}`),
    toBeGreaterThanOrEqual: (e) => check(actual >= e, `expected ${actual} >= ${e}`),
    toBeLessThan: (e) => check(actual < e, `expected ${actual} < ${e}`),
    toBeLessThanOrEqual: (e) => check(actual <= e, `expected ${actual} <= ${e}`),
    toMatch: (re) => check(typeof actual === 'string' && (re instanceof RegExp ? re.test(actual) : actual.includes(re)), `expected ${fmt(actual)} to match ${re}`),
    toHaveLength: (n) => check(actual?.length === n, `expected length ${actual?.length} to be ${n}`),
    toContain: (e) => check(actual?.includes?.(e), `expected ${fmt(actual)} to contain ${fmt(e)}`),
    toBeTruthy: () => check(!!actual, `expected ${fmt(actual)} to be truthy`),
    toBeFalsy: () => check(!actual, `expected ${fmt(actual)} to be falsy`),
    toBeNull: () => check(actual === null, `expected ${fmt(actual)} to be null`),
    toBeUndefined: () => check(actual === undefined, `expected ${fmt(actual)} to be undefined`),
    toBeDefined: () => check(actual !== undefined, `expected value to be defined`),
    toThrow: () => {
      let threw = false;
      try { actual(); } catch { threw = true; }
      check(threw, 'expected function to throw');
    },
  };
  if (!negate) m.not = makeExpect(actual, true);
  return m;
}
globalThis.expect = (a) => makeExpect(a);
globalThis.describe = (name, fn) => {
  const prevBE = beforeEachFns.slice();
  suite.push(name);
  fn();
  suite.pop();
  beforeEachFns = prevBE;
};
globalThis.beforeEach = (fn) => beforeEachFns.push(fn);
globalThis.it = globalThis.test = (name, fn) => {
  queue.push({ name: [...suite, name].join(' > '), fn, be: beforeEachFns.slice() });
};

for (const f of files) {
  const outfile = path.join(outDir, f.replace(/\.ts$/, '.mjs'));
  await esbuild.build({
    entryPoints: [path.join(appRoot, '__tests__', f)],
    bundle: true,
    platform: 'node',
    format: 'esm',
    outfile,
    alias: { '@': path.join(appRoot, 'src') },
    logLevel: 'error',
  });
  queue.length = 0;
  await import(pathToFileURL(outfile).href + `?t=${Date.now()}`);
  console.log(`\n${f}`);
  for (const t of queue) {
    try {
      for (const be of t.be) await be();
      await t.fn();
      results.pass++;
      console.log(`  PASS ${t.name}`);
    } catch (e) {
      results.fail++;
      results.failures.push(`${f}: ${t.name}\n    ${e.message}`);
      console.log(`  FAIL ${t.name}\n       ${e.message}`);
    }
  }
}
console.log(`\nTests: ${results.pass} passed, ${results.fail} failed, ${results.pass + results.fail} total`);
if (results.fail) {
  console.log('\nFailures:\n' + results.failures.join('\n'));
  process.exit(1);
}
