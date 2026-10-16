#!/usr/bin/env node
// Builds the OFFLINE web preview into tools/offline-web/out/web using esbuild and small
// shims for react-native / expo-router / react-native-svg / expo-video.
// Only for sandboxes without npm registry access. With dependencies installed, use
// `npx expo export -p web` (the real Expo web build) instead.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { importTool, resolveTool } from '../resolve-tool.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const app = path.resolve(here, '..', '..');
const PREVIEW = process.argv.includes('--preview');
const out = path.join(here, 'out', PREVIEW ? 'preview' : 'web');
const S = (f) => path.join(here, 'shims', f);
const esbuild = await importTool('esbuild');
const reactDir = path.dirname(resolveTool('react/package.json'));
const reactDomDir = path.dirname(resolveTool('react-dom/package.json'));

fs.rmSync(path.join(out, 'assets'), { recursive: true, force: true });
fs.mkdirSync(path.join(out, 'fonts'), { recursive: true });

const alias = {
  react: reactDir,
  'react-dom': reactDomDir,
  'react-native': S('react-native.tsx'),
  'react-native-svg': S('svg.tsx'),
  'react-native-safe-area-context': S('misc.tsx'),
  'expo-router': S('expo-router.tsx'),
  'expo-video': S('expo-video.tsx'),
  expo: S('misc.tsx'),
  'expo-splash-screen': S('misc.tsx'),
  'expo-screen-orientation': S('misc.tsx'),
  'expo-status-bar': S('misc.tsx'),
  'expo-keep-awake': S('misc.tsx'),
  'expo-asset': S('misc.tsx'),
  'expo-constants': S('constants.ts'),
  '@expo-google-fonts/bricolage-grotesque': S('misc.tsx'),
  '@expo-google-fonts/dm-sans': S('misc.tsx'),
  '@expo-google-fonts/nunito': S('misc.tsx'),
  '@react-native-async-storage/async-storage': S('async-storage.ts'),
  '@supabase/supabase-js': S('empty.ts'),
  'react-native-url-polyfill/auto': S('empty.ts'),
  'expo-apple-authentication': S('empty.ts'),
  'expo-audio': S('empty.ts'),
  'react-native-purchases': S('empty.ts'),
};

const t0 = Date.now();
const result = await esbuild.build({
  entryPoints: [path.join(here, 'entry.tsx')],
  bundle: true,
  format: 'iife',
  platform: 'browser',
  target: 'es2020',
  outfile: path.join(out, 'app.js'),
  jsx: 'automatic',
  alias,
  loader: { '.mp3': 'file', '.wav': 'file', '.png': 'file', '.jpg': 'file', '.ttf': 'file' },
  assetNames: 'assets/[name]-[hash]',
  publicPath: PREVIEW ? './' : '/',
  define: {
    'process.env.NODE_ENV': '"production"',
    'process.env.EXPO_PUBLIC_VIDEO_BASE_URL': '""',
    'process.env.EXPO_PUBLIC_SUPABASE_URL': '""',
    'process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY': '""',
    // The preview has no server: demo accounts let reviewers walk sign-up and log in.
    'process.env.EXPO_PUBLIC_DEMO_AUTH': '"1"',
    'process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY': '""',
    'process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY': '""',
    'process.env.EXPO_PUBLIC_REVENUECAT_ENTITLEMENT': '"premium"',
  },
  minify: PREVIEW,
  sourcemap: false,
  logLevel: 'warning',
  metafile: true,
});

const gf = path.join(app, '..', 'video', 'assets', 'gfonts', 'ofl');
fs.copyFileSync(path.join(gf, 'bricolagegrotesque', 'BricolageGrotesque[opsz,wdth,wght].ttf'), path.join(out, 'fonts', 'bricolage.ttf'));
fs.copyFileSync(path.join(gf, 'dmsans', 'DMSans[opsz,wght].ttf'), path.join(out, 'fonts', 'dmsans.ttf'));

const media = path.join(out, 'media');
if (!PREVIEW && !fs.existsSync(media)) fs.symlinkSync(path.join(app, 'public', 'media'), media);

fs.writeFileSync(
  path.join(out, 'index.html'),
  `<!doctype html>
<html lang="en"><head><meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"/>
<title>Little Duet</title>
<style>
@font-face{font-family:'Bricolage Grotesque';src:url(${PREVIEW ? '' : '/'}fonts/bricolage.ttf) format('truetype');font-weight:100 900;font-display:block}
@font-face{font-family:'Nunito';src:url(${PREVIEW ? '' : '/'}fonts/dmsans.ttf) format('truetype');font-weight:100 1000;font-display:block}
@font-face{font-family:'DM Sans';src:url(${PREVIEW ? '' : '/'}fonts/dmsans.ttf) format('truetype');font-weight:100 1000;font-display:block}
html,body,#root{height:100%;margin:0;background:#FFFFFF}
body{overflow:hidden;-webkit-tap-highlight-color:transparent}
#root{display:flex;flex-direction:column}
.rn-view{display:flex;flex-direction:column;align-items:stretch;flex-shrink:0;position:relative;box-sizing:border-box;border:0 solid #000;margin:0;padding:0;min-width:0;min-height:0;z-index:0;text-decoration:none;list-style:none}
.rn-text{display:block;box-sizing:border-box;border:0 solid #000;margin:0;padding:0;white-space:pre-wrap;overflow-wrap:break-word;font-family:'DM Sans',system-ui,sans-serif;font-size:14px;color:#000;position:relative;min-width:0}
.rn-text-nested{display:inline;font:inherit;white-space:inherit}
.rn-pressable{user-select:none;-webkit-user-select:none;touch-action:manipulation;outline-offset:2px}
.rn-pressable:focus-visible{outline:3px solid #1CB0F6}
.rn-input{box-sizing:border-box;border:0 solid #000;margin:0;outline-offset:2px;font-family:'DM Sans',system-ui,sans-serif}
.rn-input:focus-visible{outline:3px solid #1CB0F6}
.rn-noscrollbar{scrollbar-width:none}.rn-noscrollbar::-webkit-scrollbar{display:none}
.rn-spinner{width:28px;height:28px;border:4px solid;border-radius:50%;animation:spin 0.9s linear infinite;align-self:center;box-sizing:border-box}
@keyframes spin{to{transform:rotate(360deg)}}
</style></head>
<body><div id="root"></div>${PREVIEW ? '<script>window.__LD_MEMORY_ROUTER=true;window.__LD_BASE=new URL(".",location.href).href;</script><script src="app.js"></script>' : '<script src="/app.js"></script>'}</body></html>
`,
);
const kb = Math.round(fs.statSync(path.join(out, 'app.js')).size / 1024);
console.log(`offline web preview built in ${Date.now() - t0} ms -> ${path.relative(app, out)} (app.js ${kb} KB, ${result.warnings.length} warnings)`);
