#!/usr/bin/env node
// End-to-end walkthrough on the web build (Playwright + pre-installed Chromium).
//
//   BASE_URL=http://localhost:8081 node e2e/walkthrough.mjs
//
// Works against `npx expo export -p web` served by scripts/serve-static.mjs, or against the
// offline preview (tools/offline-web). Uses testID (data-testid) selectors only.
// Flow: onboarding -> gate -> paywall (keep free) -> home -> song -> class 1 (video) ->
// play a few seconds -> leave -> Continue hero shows the class with progress ->
// locked class -> gate -> paywall -> mock trial -> screen-piano class with your_turn ->
// wrong key (hint) + right keys -> celebration -> stickers, songs, grown-ups.
// Screenshots for every screen at 390x844 and 1180x820 go to screenshots/.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { importTool } from '../tools/resolve-tool.mjs';

process.env.PLAYWRIGHT_BROWSERS_PATH ||= '/opt/pw-browsers';
const { chromium } = await importTool('playwright');
const BASE = process.env.BASE_URL ?? 'http://localhost:8081';
const OUT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'screenshots');
fs.mkdirSync(OUT, { recursive: true });

const WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty'];
function solveGate(q) {
  const nums = (q.toLowerCase().match(/[a-z]+/g) ?? []).map((w) => WORDS.indexOf(w)).filter((n) => n >= 0);
  if (/plus/i.test(q)) return String(nums[0] + nums[1]);
  if (/times/i.test(q)) return String(nums[0] * nums[1]);
  return nums.join('');
}

const results = [];
function check(name, ok, detail = '') {
  results.push({ name, ok, detail });
  console.log(`${ok ? 'PASS' : 'FAIL'} ${name}${detail ? ` (${detail})` : ''}`);
}

async function run(viewport, tag) {
  const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: 1, hasTouch: false });
  await ctx.addInitScript(() => {
    window.__LD_TIME_SCALE = 25;
  });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  const id = (t) => page.locator(`[data-testid="${t}"]`).first();
  let n = 0;
  // full=true: also capture the rest of the main scroll view, one screen at a time (max 4).
  const shot = async (name, full = false) => {
    n++;
    await page.waitForTimeout(350);
    const base = path.join(OUT, `${tag}-${String(n).padStart(2, '0')}-${name}`);
    if (!full) return page.screenshot({ path: `${base}.png` });
    for (let i = 0; i < 4; i++) {
      const more = await page.evaluate((step) => {
        const els = [...document.querySelectorAll('*')].filter((e) => {
          const st = getComputedStyle(e);
          return /auto|scroll/.test(st.overflowY) && e.scrollHeight > e.clientHeight + 8;
        });
        const el = els.sort((a, b) => b.clientHeight - a.clientHeight)[0];
        if (!el) return step === 0;
        el.scrollTop = step * (el.clientHeight - 80);
        return step === 0 || el.scrollTop + el.clientHeight <= el.scrollHeight + 1 && el.scrollTop > (step - 1) * (el.clientHeight - 80);
      }, i);
      if (!more) break;
      await page.waitForTimeout(250);
      await page.screenshot({ path: `${base}-${i + 1}.png` });
    }
    await page.evaluate(() => document.querySelectorAll('*').forEach((e) => e.scrollTop && (e.scrollTop = 0)));
  };
  // Gate = written math question only (no hold step).
  const passGate = async () => {
    await id('gate-question').waitFor();
    check(`${tag}: gate has no hold step`, (await page.getByText(/hold to unlock|press and hold|hold for 3/i).count()) === 0);
    const q = await id('gate-question').innerText();
    await id('gate-answer').fill(solveGate(q));
    return q;
  };

  await page.goto(BASE + '/');
  await id('onboarding-step-1').waitFor({ timeout: 15000 });
  await page.waitForTimeout(600);
  await shot('onboarding-welcome');
  await id('onb-start').click();
  await id('onb-name').fill('Maya');
  // Birthday today, 3 years ago: exercises the birthday banner on Home.
  const today = new Date();
  await id(`bday-y-${today.getFullYear() - 3}`).click();
  await id(`bday-m-${today.getMonth() + 1}`).click();
  await id(`bday-d-${today.getDate()}`).click();
  await shot('onboarding-child', true);
  await id('onb-next').click();
  await id('onb-mode-real').waitFor();
  await shot('onboarding-piano');
  await id('onb-mode-real').click();
  await id('gate').waitFor();
  const wordy = await page.getByText(/Ask your grown-up|A grown-up needs to check/).count();
  check(`${tag}: onboarding gate is compact`, wordy === 0);
  const q = await passGate();
  await shot('onboarding-gate');
  await id('gate-submit').click();
  await id('paywall').waitFor();
  check(`${tag}: gate question is written in words`, /^[A-Za-z ,:?]+$/.test(q), q);
  await shot('paywall', true);
  const prices = await page.evaluate(() =>
    [...document.querySelectorAll('div')]
      .filter((d) => d.children.length === 0 && /\$\d/.test(d.textContent ?? ''))
      .map((d) => ({ text: d.textContent, size: parseFloat(getComputedStyle(d).fontSize) })),
  );
  const billed = prices.find((p) => /^\$59\.99 per year$/.test(p.text));
  const biggest = Math.max(...prices.map((p) => p.size));
  check(`${tag}: paywall billed price is the largest price text`, !!billed && billed.size === biggest, `${billed?.size}px vs max ${biggest}px`);
  check(`${tag}: paywall shows restore + terms + privacy`, (await id('paywall-restore').count()) === 1 && (await page.getByText('Terms of Use').count()) > 0 && (await page.getByText('Privacy Policy').count()) > 0);
  await id('paywall-later').click();

  // Home, brand new
  await id('home').waitFor();
  await id('start-first').waitFor();
  check(`${tag}: birthday banner on the birthday`, (await id('birthday-banner').count()) === 1);
  check(`${tag}: home has no piano-mode switch, has settings gear`, (await id('home-mode').count()) === 0 && (await id('home-settings').count()) === 1);
  await shot('home-empty', true);
  await id('start-first-song').click();
  await id('song-page').waitFor();
  const songTitle = await id('song-title').innerText();
  await shot('song', true);

  // Real piano: class 1 video
  check(`${tag}: song page shows the skill map`, (await id('skill-map').count()) === 1);
  check(`${tag}: About this song sits near the top`, (await id('song-story').count()) === 1);
  const mapTxt = await id('skill-map').innerText();
  const counts = [...mapTxt.matchAll(/(\d+) of (\d+)/g)];
  const sum = counts.reduce((a, m) => a + Number(m[1]), 0);
  check(`${tag}: skill counts add up to the class count`, counts.length > 0 && sum === Number(counts[0][2]), `${sum} of ${counts[0]?.[2]}`);
  await id('song-primary').click();
  await id('class-brief').waitFor();
  const briefChips = await page.locator('[data-testid="class-brief"] [data-testid^="skill-chip-"]').count();
  check(`${tag}: class brief shows skills + thinking game`, briefChips >= 1 && (await id('brief-target').count()) === 1, `${briefChips} chips`);
  await shot('class-brief', true);
  await id('brief-start').click();
  await id('player-real').waitFor();
  const playing = await page
    .waitForFunction(() => window.__video && window.__video.currentTime > 3, null, { timeout: 20000 })
    .then(() => true)
    .catch(() => false);
  check(`${tag}: lesson video plays`, playing, playing ? '' : 'video did not reach 3 s');
  const ctrl = ['player-exit', 'player-playpause', 'player-back10', 'player-scrubber'];
  const visible = await Promise.all(ctrl.map((c) => id(c).isVisible()));
  check(`${tag}: video controls always visible (no hold to unlock)`, visible.every(Boolean) && (await page.getByText(/hold to unlock|press and hold|hold for 3/i).count()) === 0);
  await shot('player-video');
  await id('player-exit').click();
  await id('song-page').waitFor();
  await id('back').click();
  await id('continue-hero').waitFor();
  const heroSong = await id('hero-song').innerText();
  const heroClass = await id('hero-class').innerText();
  const heroProgress = await id('hero-progress').count();
  const heroPct = await id('hero-pct').innerText();
  check(`${tag}: Continue hero shows the class with progress`, heroSong === songTitle && /^Class 1 of \d+$/i.test(heroClass) && heroProgress === 1 && /^\d+%$/.test(heroPct.trim()), `${heroSong} / ${heroClass} / ${heroPct}`);
  check(`${tag}: home stats (streak, stars, songs learned)`, (await id('stat-streak').count()) + (await id('stat-stars').count()) + (await id('stat-songs').count()) === 3);
  await shot('home-continue');

  // Locked class -> gate -> paywall -> mock trial
  await id('start-first').count(); // no-op
  await page.locator('[data-testid^="song-card-"]').first().click();
  await id('song-page').waitFor();
  const yourTurnClass = Number(process.env.YOUR_TURN_CLASS ?? 3);
  await id(`class-node-${yourTurnClass}`).click();
  await id('brief-start').click();
  const gateShown = await id('gate').isVisible().catch(() => false);
  check(`${tag}: locked class opens the parental gate first`, gateShown);
  await shot('locked-gate');
  await passGate();
  await id('gate-submit').click();
  await id('paywall').waitFor();
  await id('plan-yearly').click();
  await id('paywall-buy').click();
  await id('song-page').waitFor();
  await id('song-mode-screen').click();
  await shot('song-unlocked-screen-mode');

  // Screen piano with a your_turn
  await id(`class-node-${yourTurnClass}`).click();
  await id('brief-start').click();
  await id('stage').waitFor();
  check(`${tag}: screen piano close button always visible`, (await id('player-exit').isVisible()) && (await page.getByText(/hold to unlock|press and hold|hold for 3/i).count()) === 0);
  await shot('screen-piano-start');
  let sawWaiting = false;
  let hinted = false;
  let taps = 0;
  const t0 = Date.now();
  while (!(await id('celebrate').count()) && Date.now() - t0 < 120000) {
    const glowing = page.locator('[data-testid^="key-"][aria-label*="glowing"]');
    const prompt = (await id('stage-prompt').count()) ? await id('stage-prompt').innerText() : '';
    if (/glowing/i.test(prompt) && (await glowing.count())) {
      sawWaiting = true;
      if (!hinted) {
        // a wrong key first: plays its sound + gentle hint, never a fail
        const wrong = page.locator('[data-testid^="key-"]:not([aria-label*="glowing"])').first();
        await wrong.click();
        hinted = true;
        await page.waitForTimeout(150);
        await shot('screen-piano-hint');
        continue;
      }
      await glowing.first().click();
      taps++;
    } else if (/beat|note/i.test(prompt)) {
      await page.locator('[data-testid^="key-"]').first().click();
    }
    await page.waitForTimeout(40);
  }
  check(`${tag}: your_turn waited for the right key`, sawWaiting && taps > 0, `${taps} correct taps`);
  await id('celebrate').waitFor({ timeout: 5000 });
  await page.waitForTimeout(900);
  const stars = await id('celebrate-stars').getAttribute('aria-label');
  check(`${tag}: celebration with stars`, /earned \d stars?/.test(stars ?? ''), stars ?? '');
  await shot('celebration');

  // Tabs
  const plus = await id('celebrate-plus').innerText();
  check(`${tag}: celebration counts +stars and shows the streak`, /^\+[1-3] stars?$/.test(plus.trim()) && (await id('celebrate-streak').count()) === 1, plus);
  check(`${tag}: celebration shows what was practiced`, (await id('practiced-today').count()) === 1);
  await id('celebrate-continue').click();
  await id('song-page').waitFor();
  check(`${tag}: song page shows the lesson path`, (await id('lesson-path').count()) === 1 && (await id('song-primary').count()) === 1);
  const rowDone = (await id(`class-node-${yourTurnClass}`).getAttribute('aria-label')) ?? '';
  const songPct = (await id('song-pct').count()) ? await id('song-pct').innerText() : '';
  check(`${tag}: class row shows Done + song shows %`, /Done/.test(rowDone) && /\d+%/.test(songPct), `${songPct.trim()}`);
  await shot('song-progress', true);
  await id('back').click();
  await id('home').waitFor();
  await shot('home-progress', true);
  const streakLabel = (await id('stat-streak').getAttribute('aria-label')) ?? '';
  check(`${tag}: streak is 1 after the first class today`, /: 1$/.test(streakLabel), streakLabel);
  await id('stat-streak').click();
  await id('streak-sheet').waitFor();
  await shot('streak-sheet');
  await id('streak-close').click();
  check(`${tag}: song cards show song %`, (await page.locator('[data-testid^="song-pct-"]').count()) > 0);
  await id('tab-songs').click();
  await id('songs').waitFor();
  await shot('songs');
  await id('age-all').click();
  await shot('songs-all');
  await id('tab-stickers').click();
  await id('stickers').waitFor();
  const questTxt = await id('quest-classes').innerText();
  check(`${tag}: progress tab shows level + weekly quests`, (await id('level-card').count()) === 1 && /1\/3/.test(questTxt), questTxt.replace(/\s+/g, ' '));
  await shot('stickers', true);
  await id('tab-grownups').click();
  await id('grownups').waitFor();
  await shot('grownups', true);
  check(`${tag}: grown-ups shows progress (minutes, songs, skills)`, (await id('minutes-week').count()) === 1 && (await id('learning-list').count()) === 1 && (await id('skills-practiced').count()) === 1);
  await id('open-settings').click();
  await page.waitForTimeout(300);
  if (await id('gate').count()) {
    await shot('settings-gate');
    await passGate();
    await id('gate-submit').click();
  }
  await id('settings').waitFor();
  await shot('settings', true);
  check(`${tag}: settings has piano mode + birthday`, (await id('gu-mode').count()) === 1 && /Birthday:/.test(await page.locator('[data-testid^="child-age-"]').first().innerText()));
  check(`${tag}: public-domain note lives in Settings`, (await id('public-domain-note').count()) === 1);
  check(`${tag}: About shows CC BY piano credit`, /CC BY 3\.0/.test(await id('audio-credit').innerText()));

  const real = errors.filter((e) => !/favicon|Failed to load resource/.test(e));
  check(`${tag}: no page errors`, real.length === 0, real.slice(0, 3).join(' | '));
  await browser.close();
}

await run({ width: 390, height: 844 }, 'phone');
await run({ width: 1180, height: 820 }, 'tablet');
const failed = results.filter((r) => !r.ok);
console.log(`\nE2E: ${results.length - failed.length}/${results.length} checks passed`);
process.exit(failed.length ? 1 : 0);
