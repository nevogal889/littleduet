// Resolves a dev tool from the app's node_modules first, then from globally available
// locations (the sandbox this was built in had no npm registry access, only /opt/npm-tools).
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const roots = [
  path.join(here, '..'),
  ...(process.env.NODE_PATH ? process.env.NODE_PATH.split(':') : []),
  '/opt/npm-tools',
  '/opt/npm-tools/node_modules',
];

export function resolveTool(name) {
  for (const root of roots) {
    try {
      const req = createRequire(path.join(root, 'noop.js'));
      return req.resolve(name);
    } catch {}
  }
  throw new Error(`Cannot find ${name}. Run npm install in app/.`);
}

export async function importTool(name, subpath) {
  const p = resolveTool(subpath ? `${name}/${subpath}` : name);
  const mod = await import(p);
  return mod.default ?? mod;
}
