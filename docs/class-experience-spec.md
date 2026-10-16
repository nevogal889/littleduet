# Little Duet: class experience standard

Owner: class-experience-director. Applies to every class in both modes (real piano video, screen piano live),
and to the two tutorials. Data files: `content/voice/lines.json` (teacher line bank),
`content/tutorial/script-real.json`, `content/tutorial/script-screen.json`.

**The one rule:** the child cannot read. The voice and the picture carry every instruction, one at a time.
On-screen words are for the grown-up. Every screen state answers "what do I do now?" in under a second.

---

## 1. Who does what

| | Child (2-6) | Grown-up | Teacher voice |
|---|---|---|---|
| Job | Plays: taps, presses, sways, freezes | Helper: sits beside, points, guides one finger, cheers. Plays the tune in 2-3 and 3-4 classes | Gives one instruction at a time, waits, celebrates |
| Reads | Nothing. Follows voice, glow, characters, banners | Caption, parent cue, tips | - |
| Addressed as | "you" (first, always) | "Grown-up, ..." (second, by role) | "I", "me" |

The voice never uses the child's name (lines are pre-recorded). The celebration screen may show the name in text.

---

## 2. Moment-by-moment flow of a class

A class is 3-5 minutes. Its segments run in this order: get ready, title, intro lines, then phases in units
(WATCH, YOUR TURN, TOGETHER, or a game), praise between units, and the celebration.

### 2.1 Get ready (before the timeline starts; not part of `durationSec`)

The class never auto-starts. The player opens on a get-ready card and waits.

| | Real piano | Screen piano |
|---|---|---|
| Screen | Song art, "Sit in the middle. Find C." picture: two black keys with C glowing. Big Start button (grown-up), mic status chip | Song art, phone-flat picture, keyboard preview with C glowing. Big Start button (grown-up), sound check chip |
| Voice | `moments.getReadyReal`, then `moments.micCheck` | `moments.getReadyScreen` |
| Child | Finds C and plays it | Taps C on the preview |
| Grown-up | Sits beside the child, stands the phone on the music stand, taps Start (or the child's C starts it) | Lays the phone flat or stands it sideways, turns sound up, taps Start (or the child's C tap starts it) |
| Start trigger | Mic hears C (any octave) -> `moments.micReady`, start. Or Start button. Mic off: Start button only | Tap on C, or Start button |

A resume (class already started) shows the same card with "Pick up where you left off" and plays
`moments.resume` when it starts.

### 2.2 Title (segment `title`)

- Screen: song title, "Class N: title" pill, song icon bouncing. No banner.
- Voice: one `classIntro[age]` line (`{title}` = song title).
- Child: listens, hands on knees. Grown-up: sits beside the child.

### 2.3 Intro and talk (segment `say`)

- Screen: caption band (for the grown-up), GROWN-UP cue pill, song icon breathing; `showKeys` keys glow and pulse
  with finger numbers; the stop sign for freeze lines. No banner.
- Voice: the caption line (see 3. Voice resolution) plus "Grown-up, {cue}."
- Child: does the body instruction (sway, wiggle, freeze, find the key). Grown-up: does the cue.

### 2.4 Phase WATCH (segments `listen`, `demo`)

- Banner: WATCH (eye, indigo). Screen: keys light as the teacher plays; falling blocks; finger numbers in `demo`;
  karaoke lyric.
- Voice: one `kind.listen` or `kind.demo` line (or the caption override), then the music. No talk over notes.
- Child: hands on knees, watches, may sing or sway. Grown-up: points at each lit key.
- Nothing waits, nothing is scored.

### 2.5 Phase YOUR TURN (segments `your_turn`, `high_low`)

- Banner: YOUR TURN (pointing hand, coral). Screen: one glowing key at a time with its finger number and a
  countdown arc during the gap beat; in `high_low`, the bear or the bird and that half of the keyboard tinted.
- Voice: one `kind.your_turn[age]` / `kind.high_low:*` line, then silence. The voice speaks again only through
  the nudge ladder (6.4, 7.4) or the heard line (6.3).
- Child: plays the glowing key (your_turn) or any key on the shown side (high_low).
- Grown-up: waits first; points; guides one finger only after the grown-up nudge.
- `your_turn` waits for the child in both modes (6.2, 7.2). `high_low` does not wait; any key on the right side counts.

### 2.6 Phase TOGETHER (segments `together`, `beat`)

- Banner: TOGETHER (two friends, marigold). Screen: full-speed blocks and keys; the beat circle when the child
  has no notes (all `beat` segments, and `together` segments with no child notes).
- Voice: one `kind.together` / `kind.beat` line, then music. No talk over notes.
- Child: plays along (own notes, or any key on the beat). Grown-up: plays the tune where the class says so
  (blue keys), sings, keeps going after slips.
- Nothing waits. Taps near the right moment sparkle; misses are silent.

### 2.7 Games

Games are note segments with a twist; they keep the phase banner of their kind.

| Game | Segment | Picture | Child does |
|---|---|---|---|
| Bear low, bird high | `high_low` target low/high | Target character big and bouncing on each note, the other small and dim; target half of keyboard tinted | Taps any key on that side |
| Loud and soft | `beat` + `dynamic` | Beat circle big (loud) or small (soft), icon bounce bigger or smaller | Strong taps / tiny taps |
| Fast and slow | `beat` at changed bpm | Turtle or bunny picture in the right slot (new art, see 4) | Taps with the circle |
| Stop and go | `beat` then `say` "Stop" | Beat circle, then the coral stop sign | Taps, then freezes |
| Echo | `demo` then `your_turn` | WATCH then YOUR TURN on the same 2-3 keys | Copies |
| Special note | `your_turn` with parent notes | Child key coral, parent keys blue | Plays only the coral key |

### 2.8 Praise (segment `praise`)

- Screen: confetti over the top half, song icon jumping. No banner.
- Voice: the caption override when the praise is specific ("You know high and low now."), else a `kind.praise`
  variant. Praise effort and togetherness. Never the same line twice in a row within a class.

### 2.9 Celebration (after the last segment)

- Screen: stars 0-3 filling one by one, child praise line, then the grown-up card (what we practiced, next class).
- Voice: one `moments.classEnd` line, spoken over the stars.
- Child: high five. Grown-up: Next class, Play again or Back.
- Stars reward finishing and playing along, never accuracy alone; a class always ends with at least one star.

---

## 3. Voice resolution (how a player picks a line)

For each segment, at segment start:

1. `title`: a `classIntro[ageGroup]` variant, `{title}` = song title.
2. Any other kind: if `captions[caption]` exists, use it. Else, if a `captionPatterns` regex matches the caption,
   use its `say` with `{1}`, `{2}` = the regex groups. Else, if the caption is in `useKindBank` (or anything
   else), use a variant of `kind[kind]` (`your_turn` by age; `high_low` by `target`: `high_low:low` /
   `high_low:high`; the rest by `all`).
3. `say` segments wrap the line: strip trailing `.!?` from it, then `say.template` with `{cue}` = the parent cue
   with its first letter lower-cased (`say.noCue` when there is no cue). Example: "Let's listen together.
   Grown-up, sit side by side."
4. Note segments speak only the child line (parent cue stays on screen). Praise speaks only the line.

Variant choice is deterministic: index = hash(classId + segmentIndex) mod list length, stepping forward one if it
equals the previous pick in the same class. The renderer and the screen player then say the same line, so a
family switching modes hears the same class. `{note}` uses `noteWords` (F# -> "F sharp"). Note letters are
spoken as letter names; the TTS lexicon must read a lone "A" as the letter, not the article.

Timing (needs a timing-model change, see 9): every segment gets `voiceSec` (spoken length, at 2.3 words per
second for the offline voice, measured from the audio for the human voice). In note segments the count-in starts
0.4 s after the line ends. `say` and `praise` last at least `voiceSec + 1 s`. The title lasts at least
`voiceSec + 1 s` (today it is a fixed 5 s, too short for most intros).

---

## 4. Visual language

One meaning per colour: coral = the child's key / now; indigo = the teacher or grown-up; marigold = shared
time (beat, together). Same art, colours and positions in the video and on the screen piano.

| Element | Looks like | Appears | Disappears |
|---|---|---|---|
| Phase banner WATCH | Pill, top left of the stage: eye icon + "WATCH", indigo on indigo-soft | Start of `listen`, `demo` (300 ms pop-in) | End of segment |
| Phase banner YOUR TURN | Pointing-hand icon + "YOUR TURN", coral on coral-soft | Start of `your_turn`, `high_low` | End of segment |
| Phase banner TOGETHER | Two-friends icon (two round heads) + "TOGETHER", marigold on marigold-soft | Start of `together`, `beat` | End of segment |
| No banner | - | `title`, `say`, `praise`, celebration | - |
| Glowing key | Key filled coral with a soft glow above it; pulses (1.2 s) while waiting | The child's note is now (or waiting); `showKeys` in `say` | Note ends, or the child plays it |
| Teacher / grown-up key | Key filled indigo-soft, no glow | Parent notes and teacher notes sound | Note ends |
| Countdown arc | Coral arc shrinking around the finger circle | `your_turn` gap beat before each child note | Note onset |
| Falling blocks | Rounded bars falling to the hit line on the keys; coral = child, indigo-soft = grown-up / teacher; finger number inside child blocks | Note segments except `high_low` | Block lands and its note ends |
| Finger numbers 1-5 | White circle, ink number, on the lit key and in child blocks; left-hand notes add a small "L" | `demo`, `your_turn`, `together`, `showKeys` in 3-6 classes. Never on parent notes | With the key light |
| Bear (low) | Bear art, left slot, indigo ring | `high_low` low (big, bouncing on each note); `high_low` high (small, dim); bear-bird tutorial scene | End of `high_low` segment. Never shown otherwise |
| Bird (high) | Bird art, right slot, marigold ring | Same as bear, mirrored | Same as bear |
| Beat circle | Marigold disc in the right slot, beat number 1-4 inside, swells on each beat; outline circle during count-in | `beat`, and `together` with no child notes | End of segment |
| Turtle / bunny | Small art in the right slot above the beat circle | `beat` segments of fast-slow games | End of segment |
| Stop sign | Coral disc with two white pause bars | `say` freeze lines ("Stop", "Freeze") | End of segment |
| Karaoke lyric | Current word coral and underlined; sung words ink; next words light | Note segments with lyrics | End of segment |
| Letter name | Big note name ("E") in the lyric slot | Note segments without lyrics (echo, special note) | End of segment |
| Caption band + GROWN-UP pill | Caption for the grown-up, cue after an indigo GROWN-UP pill | Every segment | - |
| Confetti | Coloured shapes over the top half | `praise` | End of segment |
| Stars | 3 star slots filling | Celebration only | - |

The bird must not bounce on beat pulses or hits (today it does); characters move only with their own game.

---

## 5. Real piano and screen piano: shared rules

- A wrong key is never a fail: no buzz, no red, no shake, no lost star. The right key keeps glowing.
- The piano sound is the reward. The app adds a small sparkle on the key, never a chime over the music.
- Parent controls (Close, Pause) stay at the top, away from the keys, always visible.
- Pause stops voice and music at once. Resume replays the current line from its start, then continues.

## 6. Real piano specifics

### 6.1 Finding the keys
- Get-ready picture: the two black keys in the middle, C just to their left, glowing.
- `showKeys` cards in `say` segments use the same picture with finger numbers.
- The keyboard in the video spans the class range; C4 is always labelled "C" under the key in hand-position
  cards so a grown-up can match it on any keyboard.

### 6.2 Waiting for the child
- The video is rendered with one gap beat before each child note in `your_turn`.
- With the microphone on, the player pauses the video at each child note onset (times from `noteSchedule`) until
  it hears the note, then resumes. A note heard during the gap beat counts (early is fine); the player seeks to
  the onset and resumes.
- With the microphone off or denied, `your_turn` plays straight through, then the video holds on the segment's
  last frame with two grown-up buttons: **We played it** (continue) and **Play again** (replay the segment).
- `listen`, `demo`, `together`, `beat`, `high_low` never wait and are never scored by the microphone (the phone
  speaker is playing; listening would hear the app itself).

### 6.3 Listening
- Monophonic pitch detection on the device, only while the app's audio is silent (the paused waiting window).
  Nothing is recorded or sent.
- Accept the target pitch class at the target octave or one octave either side (small keyboards, small hands),
  held for at least 80 ms within 50 cents.
- On a hit: the key sparkles and an "I heard C" chip shows for the grown-up. The voice says a `moments.heard`
  line only on the first hit of a segment with at most 4 child notes (special note, echo), never mid-phrase.
- Duck the video's soft guide note for 0.6 s after resume so it does not double the child's note.

### 6.4 When nothing is heard, or a different note
- Different note heard: the on-screen keyboard shows it in soft grey for 400 ms; the target keeps glowing. After
  two different notes in a row, one `moments.otherKey` line.
- Nothing heard: nudge ladder from the moment the note is due: 3 s target glow grows; 6 s `moments.waitNudge`;
  12 s `moments.waitNudgeGrownUp` plus a hand pointer on the target; 15 s `moments.notHearing` and a
  **We played it** chip. At most two voice nudges per note, never the same one twice in a row.
- Microphone denied at get-ready: one line (`moments.micOff`) and the class runs in the mic-off model (6.2).

## 7. Screen piano specifics

### 7.1 Holding the phone
- Flat on a table (best for 2-4) or standing sideways in a stand. Rotate to landscape when the class range is
  more than 8 white keys (show `piano.rotateHint` once). White keys at least 44 pt wide on phones.
- Sound check at get-ready: if the device is muted, show `piano.soundOffTitle` before the class starts.

### 7.2 Tapping
- A key sounds on touch-down. "Tap gently" is the instruction; force is not measured.
- More than 3 touches at once (a palm) are ignored; the same key re-triggers after 80 ms at the earliest.
- `your_turn` waits at each child note (the engine already does this). A tap of the right key during the gap
  beat counts.

### 7.3 Wrong taps
- A wrong key plays its own sound at normal volume. The target glows brighter (hint). After the second wrong tap,
  a hand pointer bounces on the target. After the third in a row, one `moments.otherKey` line.
- `high_low` wrong side: the target character bounces and its half of the keyboard flashes; after two wrong-side
  taps, the matching `moments.sideHint` line. The tap still sounds.
- `beat`: every tap counts; a tap within 150 ms of a beat makes the circle sparkle.

### 7.4 Idle nudges
Same ladder as 6.4, without the microphone lines: 3 s glow grows; 6 s `moments.waitNudge`; 12 s
`moments.waitNudgeGrownUp` plus hand pointer; 20 s a small grown-up "Skip" chip (counts the note as played,
no star loss).

---

## 8. Pacing rules

| Rule | Value |
|---|---|
| Voice speed | 2.3 words per second (child-directed). Lines before notes: max 14 words. Say and intro lines: max 22 words including "Grown-up, {cue}" |
| Gap after a voice line, before the count-in | 0.4 s |
| Silence after "your turn" | No voice for at least 6 s while the child is trying |
| Max talk before the child first plays | 20 s from the end of get-ready (title + at most two `say` lines) |
| Max consecutive talk between note segments | Two `say` lines, 12 s of speech |
| The child acts (plays, taps, moves) at least every | 30 s |
| Repeat an instruction | Only through the nudge ladder, or once on resume after a pause |
| Praise | At most 5 s; never two praise segments in a row; never the same praise line twice in a row |
| Celebration | Starts within 1 s of the last segment; stars fill in under 3 s |
| Class length | 180-300 s of timeline (CONTRACT.md), plus waiting time in `your_turn` |

---

## 9. Data contract additions requested (for the curriculum/video and app teammates)

- `segments[].voiceSec`: spoken length of the resolved line; `build_lessons.py` adds it to the segment before the
  count-in (note segments) or as the minimum duration (title, say, praise). Video and engine keep sharing one
  timing model.
- `segments[].voiceLine`: the resolved line text (so the renderer, the engine and QA read the same sentence).
- Phase banner from kind (no new data): `listen`, `demo` -> watch; `your_turn`, `high_low` -> your_turn;
  `together`, `beat` -> together.
- Tutorial step fields: `sec` (planned seconds on screen; players use `max(sec, voice length + 1 s)`), `banner`
  (the banner shown with the step), `voiceMicOff` (alternative line when the microphone is off), and for
  playing steps `bpm`, `leadInSec`, `gapBeats` and `who: "parent"` on notes the app plays, as in lesson files.

---

## 10. Audit checklist (apply to any class, either mode)

Start
- [ ] The class does not start until the grown-up taps Start or the child plays C.
- [ ] The intro line names the song and fits the title card without being cut off.

Every segment
- [ ] A voice line plays at the start of every segment and finishes before any note sounds.
- [ ] The line has one instruction, talks to the child first, then "Grown-up, ...".
- [ ] The line is within its word limit and has no emoji, ALL CAPS, "!!" or "F#".
- [ ] The phase banner matches the kind (WATCH / YOUR TURN / TOGETHER), and there is none on title, say, praise.
- [ ] With the sound off, a grown-up can still tell what to do from the picture and the caption band.
- [ ] With the screen covered, a child can still tell what to do from the voice.

Playing
- [ ] In YOUR TURN the glowing key is the only coral key, with its finger number (ages 3-6).
- [ ] `your_turn` waits for the child (screen piano: tap; real piano: microphone, or We played it).
- [ ] A wrong key never makes a fail sound, never turns red, never takes a star.
- [ ] Nudges follow the ladder: glow, child line, grown-up line plus pointer, then Skip / We played it.
- [ ] The bear and bird appear only in bear-and-bird games; the beat circle only in beat and tune-only together.
- [ ] Blocks are coral for the child, blue for the grown-up; the grown-up's part matches the parent cue.

Pacing
- [ ] The child plays something within 20 s of the start, and acts at least every 30 s.
- [ ] No more than two talk segments in a row.
- [ ] Praise varies; no line repeats back to back.

End
- [ ] The class ends with a celebration: stars, a praise line, the classEnd voice line, then the grown-up card.
- [ ] Pause and Close work at any moment and Close saves the place.
- [ ] Resume replays the current line and continues from the same segment.

Mode specifics
- [ ] Real: the get-ready card checks the microphone with C, and the mic-off path shows We played it.
- [ ] Real: no listening while the app's own audio plays.
- [ ] Screen: the keyboard fits; keys are at least 44 pt; landscape is offered for wide ranges.
- [ ] Screen: palm touches do not play a cluster of keys.

---

## 11. Current players against this standard (2026-10-16)

Read from `app/src/components/LessonStage.tsx`, `VideoLesson.tsx`, `app/src/lib/timeline.ts`, `video/render.py`.

| Area | Today | Standard |
|---|---|---|
| Teacher voice | None in either player or the video. Note segments start 1.0-2.4 s (the count-in) after the caption appears | A line at every segment, before the notes (3, 8, 9) |
| Real piano | Passive video; never waits; no listening code (app.json declares the mic permission, but the `expo-audio` plugin has `microphonePermission: false`); complete at 90% watched | Pause at child notes, listen, I heard, We played it (6) |
| Start | Video autoplays when ready; the screen stage starts ticking on mount | Get-ready card, start on Start or on C (2.1) |
| Phase banners | None. The caption band always has the same coral stripe, in app and video | WATCH / YOUR TURN / TOGETHER (4) |
| Characters | Bear and bird always on the screen-piano stage; the bird bounces on every beat and hit | Only in `high_low` (4) |
| Beat circle | Marigold in the app, coral in the video | Marigold in both |
| Waiting | Hint only after a wrong tap; `piano.waitingHint1/2`, `otherKeyNudge`, `parentHelpHint` strings are unused | Nudge ladder (7.4) |
| Video fallback | `LessonStage watch` never waits and gives 2 stars | Fallback follows the screen-piano rules, with waiting |
