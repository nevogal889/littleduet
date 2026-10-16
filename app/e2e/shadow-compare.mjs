#!/usr/bin/env node
// Renders Home and the Song page at 390x844 with both card-shadow variants so the founder can
// compare the designer's exact values (spec) with the stronger variant (strong).
//   BASE_URL=http://localhost:8081 node e2e/shadow-compare.mjs
// Output: screenshots/compare-home-spec.png, compare-home-strong.png, compare-song-spec.png, compare-song-strong.png
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { importTool } from '../tools/resolve-tool.mjs';

process.env.PLAYWRIGHT_BROWSERS_PATH ||= '/opt/pw-browsers';
const { chromium } = await importTool('playwright');
const BASE = process.env.BASE_URL ?? 'http://localhost:8081';
const OUT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'screenshots');
fs.mkdirSync(OUT, { recursive: true });

const now = Date.now();
const day = (t) => {
  const d = new Date(t);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
const SONG = process.env.SONG ?? 'my-little-ducklings';
const state = {
  version: 1,
  onboarded: true,
  children: [{ id: 'c1', name: 'Maya', age: 3, playMode: 'real', createdAt: now - 86400000 * 3 }],
  activeChildId: 'c1',
  childData: {
    c1: {
      progress: {
        [`${SONG}-c01`]: { positionSec: 220, completed: true, stars: 3, lastWatchedAt: now - 86400000, completedAt: now - 86400000 },
        [`${SONG}-c02`]: { positionSec: 230, completed: true, stars: 2, lastWatchedAt: now - 3600000, completedAt: now - 3600000 },
        [`${SONG}-c03`]: { positionSec: 95, completed: false, stars: 0, lastWatchedAt: now - 600000 },
      },
      activityDays: [day(now - 86400000), day(now)],
      stickers: [],
      goalDays: [day(now - 86400000), day(now)],
      completions: [now - 86400000, now - 3600000],
    },
  },
};

const browser = await chromium.launch();
for (const variant of ['spec', 'strong']) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  await ctx.addInitScript(
    ([v, s]) => {
      window.__LD_SHADOW = v;
      localStorage.setItem('littleduet:state:v1', s);
    },
    [variant, JSON.stringify(state)],
  );
  const page = await ctx.newPage();
  await page.goto(BASE + '/');
  await page.locator('[data-testid="home"]').waitFor({ timeout: 15000 });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: path.join(OUT, `compare-home-${variant}.png`) });
  await page.goto(`${BASE}/song/${SONG}`);
  await page.locator('[data-testid="song-page"]').waitFor();
  await page.waitForTimeout(1200);
  await page.screenshot({ path: path.join(OUT, `compare-song-${variant}.png`) });
  await ctx.close();
}
await browser.close();
console.log('wrote screenshots/compare-{home,song}-{spec,strong}.png');
