#!/usr/bin/env node
// Generates the brand icon PNGs from SVG (bear + bird over a little keyboard, coral ground):
//   assets/images/icon.png (1024, iOS + store), adaptive-icon.png (1024 foreground, Android),
//   splash-icon.png (1024, transparent), favicon.png (48)
// Uses sharp (devDependency). Character shapes come from src/components/art/iconShapes.ts.
import fs from 'node:fs';
import path from 'node:path';
import { APP } from './lib/paths.mjs';
import { importTool } from '../tools/resolve-tool.mjs';

const sharp = await importTool('sharp');
const src = fs.readFileSync(path.join(APP, 'src', 'components', 'art', 'iconShapes.ts'), 'utf8');
const decl = src.indexOf('ICON_SHAPES');
const SHAPES = JSON.parse(src.slice(src.indexOf('= ', decl) + 2).trim().replace(/;$/, ''));

const rad = (a) => (a * Math.PI) / 180;
function arc(op, pie) {
  const cx = (op.x0 + op.x1) / 2, cy = (op.y0 + op.y1) / 2, rx = (op.x1 - op.x0) / 2, ry = (op.y1 - op.y0) / 2;
  let a1 = op.a1;
  while (a1 < op.a0) a1 += 360;
  const p = (a) => `${(cx + rx * Math.cos(rad(a))).toFixed(2)} ${(cy + ry * Math.sin(rad(a))).toFixed(2)}`;
  const d = `A ${rx} ${ry} 0 ${a1 - op.a0 > 180 ? 1 : 0} 1 ${p(a1)}`;
  return pie ? `M ${cx} ${cy} L ${p(op.a0)} ${d} Z` : `M ${p(op.a0)} ${d}`;
}
function art(name) {
  return SHAPES[name]
    .map((op) => {
      const c = op.c;
      switch (op.t) {
        case 'e':
          return `<ellipse cx="${(op.x0 + op.x1) / 2}" cy="${(op.y0 + op.y1) / 2}" rx="${(op.x1 - op.x0) / 2}" ry="${(op.y1 - op.y0) / 2}" fill="${c}"/>`;
        case 'r':
          return `<rect x="${op.x0}" y="${op.y0}" width="${op.x1 - op.x0}" height="${op.y1 - op.y0}" rx="${op.r || 0}" fill="${c}"/>`;
        case 'p':
          return `<polygon points="${op.pts.map((q) => q.join(',')).join(' ')}" fill="${c}"/>`;
        case 'l':
          return `<polyline points="${op.pts.map((q) => q.join(',')).join(' ')}" fill="none" stroke="${c}" stroke-width="${op.w}" stroke-linecap="round" stroke-linejoin="round"/>`;
        case 'a':
          return `<path d="${arc(op, false)}" fill="none" stroke="${c}" stroke-width="${op.w}" stroke-linecap="round"/>`;
        case 'pie':
          return `<path d="${arc(op, true)}" fill="${c}"/>`;
        default:
          return '';
      }
    })
    .join('');
}

function keyboard(x, y, w, h) {
  const n = 7;
  const kw = w / n;
  let s = `<rect x="${x - 10}" y="${y - 10}" width="${w + 20}" height="${h + 20}" rx="28" fill="#1E2A3A"/>`;
  for (let i = 0; i < n; i++) s += `<rect x="${x + i * kw + 3}" y="${y}" width="${kw - 6}" height="${h}" rx="12" fill="${i === 2 ? '#F5B83D' : '#FFFFFF'}"/>`;
  for (const i of [1, 2, 4, 5, 6]) s += `<rect x="${x + i * kw - kw * 0.28}" y="${y}" width="${kw * 0.56}" height="${h * 0.58}" rx="8" fill="#1E2A3A"/>`;
  return s;
}

function scene({ bg }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
${bg ? `<rect width="1024" height="1024" fill="${bg}"/>` : ''}
<rect x="112" y="112" width="800" height="800" rx="200" fill="#FFFFFF"/>
<g transform="translate(190 210) scale(3.1)">${art('bear')}</g>
<g transform="translate(520 190) scale(3.1)">${art('bird')}</g>
${keyboard(262, 580, 500, 190)}
</svg>`;
}

const out = path.join(APP, 'assets', 'images');
fs.mkdirSync(out, { recursive: true });
const icon = Buffer.from(scene({ bg: '#F26B4F' }));
await sharp(icon).png().toFile(path.join(out, 'icon.png'));
// Android adaptive: keep the art inside the 66% safe zone on a transparent foreground.
const fg = await sharp(Buffer.from(scene({ bg: null }))).resize(640, 640).png().toBuffer();
await sharp({ create: { width: 1024, height: 1024, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
  .composite([{ input: fg, left: 192, top: 192 }])
  .png()
  .toFile(path.join(out, 'adaptive-icon.png'));
await sharp(Buffer.from(scene({ bg: null }))).png().toFile(path.join(out, 'splash-icon.png'));
await sharp(icon).resize(48, 48).png().toFile(path.join(out, 'favicon.png'));
console.log('icons written to assets/images: icon.png, adaptive-icon.png, splash-icon.png, favicon.png');
