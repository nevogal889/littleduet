# Little Duet (app)

Expo + TypeScript + expo-router app where a grown-up and a child aged 2-6 learn kids' songs on the piano.
Two modes per class: **Real piano** (lesson video, expo-video) and **Screen piano** (the same class timeline
played live on an on-screen keyboard that waits for the child at `your_turn`).
Everything works with no keys: guest mode, mock purchases, local progress.

> Built in a sandbox with no npm registry access. The project was scaffolded by hand on **Expo SDK 54**
> (React Native 0.81, expo-router 6). First step on a normal machine: `npm install && npx expo install --fix`.
> To move to the newest SDK: `npx expo install expo@latest --fix`.

## Run

```bash
cd app
npm install
npx expo install --fix          # align native module versions with the SDK
node scripts/sync-content.mjs   # pull songs, lessons, samples, strings, videos from the teammates' folders
npx expo start                  # i = iOS simulator, a = Android, w = web
```

## Test

```bash
npm test                 # jest (jest-expo): progress, timeline engine, entitlement, stickers/badges, catalog, strings, lesson data
npx tsc --noEmit         # type check
npx expo export -p web   # web build -> dist/
node scripts/serve-static.mjs dist 8081 &
BASE_URL=http://localhost:8081 node e2e/walkthrough.mjs   # Playwright, uses the pre-installed Chromium
```

The E2E walks onboarding -> parental gate -> paywall ("Keep playing free classes") -> home -> song -> class 1
video (plays ~4 s) -> leave -> checks the Continue hero shows that class with a progress bar -> taps a locked class
-> gate -> paywall -> mock trial -> screen-piano class with `your_turn` (one wrong key for the hint, then the
glowing keys) -> celebration -> Songs, Stickers, Grown-ups. Screenshots for every screen at 390x844 and
1180x820 land in `screenshots/`. The web build sets `window.__LD_TIME_SCALE = 25` so a 4-minute class runs
in seconds (web only; devices always run at 1x).

### Without npm (how this repo was verified)
- `node tools/run-tests-offline.mjs` runs the same `__tests__` with esbuild and a tiny jest-compatible runner.
- `node <typescript>/bin/tsc -p tools/tsconfig.logic.json` type-checks `src/lib`, types, data and tests.
- `node tools/offline-web/build.mjs` bundles the real screens with small shims for react-native, expo-router,
  react-native-svg and expo-video (React DOM). Serve `tools/offline-web/out/web` and run the same E2E.
  This is a stand-in for `expo export`; it is not shipped.

## Build with EAS

```bash
npm i -g eas-cli && eas login
eas init                                   # fills extra.eas.projectId in app.json
eas build -p ios --profile development     # dev client
eas build -p all --profile preview         # internal testers (Android APK)
eas build -p all --profile production      # store builds (auto-increments build numbers)
eas submit -p ios --profile production
```

`app.json`: name "Little Duet", bundle id / package `com.littleduet.app` (placeholder), phone portrait and
tablet any orientation (iOS via Info.plist, Android via expo-screen-orientation), `ITSAppUsesNonExemptEncryption`
false, a privacy manifest, no tracking, Android advertising ID, location, camera and microphone permissions blocked.
Icons: `node scripts/make-icons.mjs` regenerates `assets/images/*` (needs sharp).

## Environment variables (all optional, see `.env.example`)

| Variable | Effect when set | When empty |
|---|---|---|
| `EXPO_PUBLIC_VIDEO_BASE_URL` | Videos/thumbs from `<base>/<songId>/<classId>.mp4/.jpg` | Web uses `/media` (public/media); native falls back to the on-screen lesson |
| `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Accounts on: email 6-digit code + Sign in with Apple (iOS), progress sync, in-app account deletion | Guest only, accounts hidden |
| `EXPO_PUBLIC_REVENUECAT_IOS_KEY`, `..._ANDROID_KEY` | RevenueCat on that platform (anonymous app user id) | MockPayments (also always on web) |
| `EXPO_PUBLIC_REVENUECAT_ENTITLEMENT` | Entitlement id that unlocks all classes (default `premium`) | |

Supabase: run `supabase/schema.sql` (profiles, children, progress, activity_days, RLS on every table,
`delete_my_account()`). Children are synced as random ids + age + mode only: the nickname never leaves the device.
Set the email template to include `{{ .Token }}` so the sign-in email carries the 6-digit code.

RevenueCat: products `littleduet_monthly` ($9.99) and `littleduet_annual` ($59.99), 7-day trial, in the
current offering's monthly and annual packages. Prices on the paywall come from the store; the mock uses the same values.

## How content and videos are wired

| Source (teammates) | Copied by `scripts/sync-content.mjs` to | Used by |
|---|---|---|
| `content/songs.json` (falls back to `seed-songs.json`) | `src/data/songs.json` | `src/data/catalog.ts` |
| `content/lessons/<songId>.json` | `src/data/lessons/*.json` + generated `index.ts` (static imports) | catalog, engine |
| `video/samples/<Note>.mp3` | `assets/samples/<Note>.mp3` (`#` -> `s`) + generated `src/data/samples.ts` | piano (bundled, instant, offline) |
| `video/out/<songId>/<classId>.mp4/.jpg` | `public/media/<songId>/` (web dev only; `--webm` adds VP8 copies) | `src/services/media.ts` |
| `copy/strings.en.json` | `src/data/strings.en.json` | `src/i18n.ts` (app-only keys in `strings.app.json`) |

Swapping in the real files is a copy step: re-run `node scripts/sync-content.mjs` (`--prune` drops lessons of
removed songs). Before the curriculum exists, `node scripts/make-standins.mjs [--videos]` writes contract-shaped
stand-in lessons and labelled stand-in videos for any class that has no real video yet.
Song art is the video teammate's icon set imported as vectors: `python3 scripts/import-icons.py`.

## Architecture

```
app/                      expo-router routes
  _layout.tsx             fonts, providers (state, parental gate), stack
  (tabs)/                 Home, Songs, Stickers, Grown-ups (+ big custom tab bar)
  onboarding.tsx          welcome -> child (nickname optional, age 2-6) -> piano? -> gate -> paywall
  song/[id].tsx           song page, mode switch, class list
  play/[classId].tsx      real-piano video or screen-piano stage; saves every 5 s and on exit
  celebrate.tsx paywall.tsx account.tsx licenses.tsx
src/lib/                  pure logic (unit tested): progress, timeline engine, entitlement, stickers/badges, catalog, music
src/state/store.tsx       local-first state (AsyncStorage), per-child progress, optional sync
src/services/             payments (Mock | RevenueCat), auth+sync (off | Supabase), audio, media, storage
src/components/           UI kit, keyboard, lesson stage, video lesson, gate, paywall, art
```

Rules in code: class complete at >= 90 % watched (video) or all `your_turn` done (screen); resume at the saved
second (video) or segment (screen); stars: video 1 at 90 %, 2 to the end; screen 1 finished, 2 played along,
3 perfect `your_turn`; listen-only classes give full stars for staying to the end; every completed class has at
least 1 star. Free tier = class 1 of every song. Continue row = in-progress classes plus the class after the most
recently finished one, newest first. Wrong keys play their own sound and the right key glows; nothing fails.

## Known gaps
- Dependencies were never installed here, so `npm test` (jest) and the full `npx tsc --noEmit` have not run on
  this code; the logic tests and logic type-check ran via the offline tools above. Expect a short fix-up pass.
- Native-only paths (RevenueCat, Supabase, Sign in with Apple, expo-audio multi-touch keyboard) are untested on devices.
- Light theme only (`userInterfaceStyle: light`).
- Placeholder URLs/emails in `src/config.ts`; RevenueCat and EAS ids in `.env` / `app.json`.
