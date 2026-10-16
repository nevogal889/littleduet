# Notes from the app teammate

## For the content teammate (songs.json)
- Optional field `addedAt` (ISO date, e.g. "2026-10-14") on a song drives the Home row "New this week".
  Without it the row shows a stable weekly rotation.
- After `content/songs.json` lands: `node app/scripts/sync-content.mjs --prune` (copies songs, lessons, samples,
  strings; videos too). The app only lists songs that have a lesson file.

## For the curriculum / video teammate
- The app's interactive engine follows the timing model in build_lessons.py exactly: `leadInSec`, `gapBeats`
  before each child note in `your_turn`, `who: "parent"` notes auto-played, `lh` companions, `lines[].from`
  as an index into `notes`. `app/__tests__/lessons.test.ts` plays every class of every lesson file through the
  engine and checks it ends within the video length. Run it after regenerating lessons.
- Web dev in browsers without H.264 uses a `.webm` sibling (`sync-content.mjs --webm` makes them locally).
  Real builds stream `<EXPO_PUBLIC_VIDEO_BASE_URL>/<songId>/<classId>.mp4` and `.jpg` as per the contract.
- Classes without a video yet fall back to the on-screen lesson (no crash, a short notice to the grown-up).

## For the copy teammate (strings the app needs that are not in strings.en.json yet)
They live in `app/src/data/strings.app.json`; your file always wins when it defines the same key.
- `tabs.home|songs|stickers|grownups`
- `home.pickedFor` "Picked for {name} (age {age})", `home.easyTitle`, `home.newThisWeek`, `home.continueWatching`,
  `home.startFirstTitle|startFirstBody|startFirstCta`, `home.seeAll` (yours says "See all 100 songs"; the count
  is wrong until all 100 ship)
- `difficultyWords.Easy|Medium|Harder` (spec filter words), `song.stats`, `song.classMinutes`, `song.recommended`
- `player.holdToUnlock|holdToUnlockHint|lock|videoFallback`
- `celebration.headline` "Amazing playing, {name}!", `celebration.parentHeadline` "Great teaching, grown-up!",
  `celebration.pickNewSong`, `celebration.unlockNext`
- `stickers.milestones.first|half|concert`, `stickers.songsFinished|classesThisWeek|musicDays|musicDaysHint`,
  `stickers.levelUpTitle|levelUpBody|levelUpTopBody`, `badges.grad.name|description` (age-group graduates)
- `gate.holdTitle|holdHint` (the gate is: hold 3 s, then your written math question)
- `paywall.save` "Save 50%", `grownups.lock`, `grownups.children.switch|active|ageButton`,
  `grownups.reset.*`, `grownups.account.offBody`, `onboarding.stepOf`, `onboarding.paywallGateNote`

## For the release manager
- Grown-ups is the 4th bottom tab ("Grown-ups"), always behind the gate. The mode toggle is on Home under the Continue card.
- Streak copy never says "lost"; weekends are protected; no streak notifications. No hearts, leagues or currency.
- Gate: a written math question typed as digits (no hold step) (sums 10-20, products up to 50, or
  "type these numbers in order"). It guards: paywall (from a locked class AND in onboarding), every external link
  (privacy, terms, support email, manage subscription), account sign-in/out/delete, and the Grown-ups area.
  A pass unlocks for 2 minutes; leaving the Grown-ups tab relocks. Players have no lock (founder decision):
  controls are always visible at the top/bottom, away from the keyboard.
- Paywall: billed price ("$59.99 per year") is the largest price text (30 px); per-month and trial lines are 17 px.
  Restore, Terms of Use, Privacy Policy, full auto-renew disclosure and "Keep playing free classes" are on it.
- No analytics/crash/ad SDKs. RevenueCat is configured with the API key only (anonymous app user id, no attributes).
  Supabase sync never sends the child's nickname (schema has no name column). In-app Delete account calls
  `delete_my_account()` (supabase/schema.sql). Android blocks AD_ID, location, camera, mic permissions.
- Credits: Grown-ups > About shows the Salamander CC BY 3.0 and OFL font lines; "Open-source licenses" screen too.
- Placeholder URLs in `app/src/config.ts` (littleduet.app/privacy, /terms, support@littleduet.app) need the real ones.

## For the founder (covers)
- Drop real photos at content/covers/<songId>.jpg, run `node app/scripts/sync-content.mjs`, and upload
  `<songId>/photo.jpg` next to the videos. Until then the lesson-style covers (or icon art) show.
## New app strings (overlay, please review)
streak.*, progress.*, quests.*, path.*, celebration.plusStars/continue/trophy/streakUp, home.stats.streak,
gate.compactTitle "For grown-ups", grownups.minutesThisWeek*, song.done/percent, tabs.stickers is now "Progress".

## Principal-designer overhaul + cover change (2026-10-16)
- Tokens in app/src/theme.ts: cream #FAF8F5, white cards radius 24, `shadow.card` boxShadow, no grey borders, spacing +24%, `type.meta` uppercase labels, Nunito.
- `SHADOW_VARIANT` ('spec' | 'strong'); on web `window.__LD_SHADOW` overrides. `node e2e/shadow-compare.mjs` -> screenshots/compare-{home,song}-{spec,strong}.png. The spec values are close to invisible on cream; founder to pick.
- Tactile buttons (coral face, 4 px #CC452D edge, 2 px / 150 ms press); `Field` inputs (no border, coral 40% focus ring); capsule toggle with a sliding pill (jumps under Reduce Motion).
- Covers: square/squircle slots use video/out/<id>/cover-square.jpg first; wide slots use content/covers/<id>.jpg (photo.jpg) then cover.jpg. Titles are baked in and never overlaid. There was no Pixabay credit to remove.
- Preview: DM Sans stands in for Nunito offline; the native build loads Nunito via @expo-google-fonts/nunito.
- Checks: 116/116 unit, tsc logic clean, E2E 44/44 at 390x844 and 1180x820.
