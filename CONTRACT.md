# Little Duet — shared contract (every teammate reads this first)

Little Duet is a subscription app (iOS + Android) where a parent and a child aged 2–6 learn
famous kids' songs on the piano together. Each song is split into classes (lessons) of 3–5
minutes. Every class runs in two modes built from the SAME data:

- **Real piano mode:** a lesson VIDEO (MP4). A top-down animated keyboard lights the keys,
  shows finger numbers and big captions, with piano audio. The family copies it on their own piano.
- **Interactive mode (no piano):** the app plays the same class timeline live on an on-screen
  keyboard; at `your_turn` segments it waits for the child to tap the lit keys.

Repo root: `/home/claude/littleduet`

```
content/songs.json          100 songs (Song[])            — content teammate
content/build_lessons.py    songs.json -> lessons/*.json  — curriculum/video teammate
content/lessons/<songId>.json  Lesson file per song       — generated
video/                      renderer: lessons -> MP4      — curriculum/video teammate
video/out/<songId>/<classId>.mp4 + <classId>.jpg (thumbnail)
app/                        Expo app                      — app teammate
copy/                       copy, store listing, policy   — copy teammate
```

Rules for everyone: no network calls to paid services, no API keys, no installing system
packages; npm and pip (with --break-system-packages) are fine. Don't edit another teammate's
folder; if you need something from it, read it, or write a note in `NOTES-<yourrole>.md` at the root.
No emoji anywhere in the product. English only. No "makes kids smarter" claims.

## Age groups (fixed ids)

| id | label | what the child does | classes lean on |
|---|---|---|---|
| `2-3` | Tiny Ears | taps the beat, low vs high, stop/go; the PARENT plays the melody | listen, beat, high-low, loud-soft, fast-slow, together |
| `3-4` | Little Explorer | plays one "special note" on cue, copies 2–3 note echoes | listen, beat, special-note, echo, together |
| `4-5` | First Songs | plays the melody one hand, phrase by phrase | listen, hand-position, phrase, put-together, play-along |
| `5-6` | Little Pianist | plays whole songs, faster, wider range, simple left-hand notes | phrase, put-together, play-along, left-hand, concert |

Every song has ONE `ageGroup` (where it fits best). Spread: 25 songs per age group.

## Difficulty (1–5, independent of age but correlated)

1 = 3–4 different notes, steps only, quarter/half notes, slow (<=90 bpm), <=16 notes
2 = up to 5 notes C4–G4 (five-finger position), simple rhythm
3 = up to 6–8 notes, small skips, one hand-position shift or eighth notes
4 = octave range, dotted rhythms, longer song
5 = wider range or a simple left-hand part, faster

## Song (content/songs.json is `Song[]`)

```json
{
  "id": "twinkle-twinkle",              // kebab-case, unique
  "title": "Twinkle Twinkle Little Star",
  "origin": "French melody 'Ah! vous dirai-je, maman' (1761); lyrics Jane Taylor (1806)",
  "publicDomainBasis": "Melody 1761, lyrics 1806; author died 1824",
  "ageGroup": "2-3",
  "difficulty": 1,
  "tags": ["bedtime", "classic"],       // from TAGS below
  "icon": "star",                       // from ICONS below
  "key": "C",
  "bpm": 80,
  "timeSignature": "4/4",
  "phrases": [
    { "lyric": "Twinkle twinkle little star",
      "notes": [ {"p":"C4","d":1,"f":1,"s":"Twin"}, {"p":"C4","d":1,"f":1,"s":"kle"} ] }
  ]
}
```

Note: `p` = scientific pitch (C4 = middle C; sharps as `F#4`, never flats), `d` = beats
(0.5, 1, 1.5, 2, 3, 4), `f` = right-hand finger 1–5 (optional; left-hand notes use `"h":"L"`),
`s` = syllable (optional), `{"rest":true,"d":1}` for rests. Keep melodies inside C3–C6.
Transpose to the key that keeps the child's part on white keys where possible (C, G or F).

TAGS: classic, animals, bedtime, counting, movement, nature, vehicles, food, seasonal, silly, alphabet, family
ICONS: star, sheep, farm, spider, boat, bus, bell, duck, frog, cat, dog, fish, bird, sun, moon,
rain, flower, tree, train, car, house, heart, crown, apple, cake, music, drum, horse, pig, cow,
bear, monkey, elephant, mouse, bee, butterfly, snowflake, gift, clock, ball

## Lesson file (content/lessons/<songId>.json)

```json
{
  "songId": "twinkle-twinkle",
  "classes": [
    {
      "id": "twinkle-twinkle-c01",
      "index": 1,
      "title": "Listen and sway",
      "goal": "Hear the whole song and move to the beat",
      "type": "listen",
      "durationSec": 214,
      "parentTip": "Sit together at the piano. Sway side to side while the song plays.",
      "video": "twinkle-twinkle/twinkle-twinkle-c01.mp4",
      "thumb": "twinkle-twinkle/twinkle-twinkle-c01.jpg",
      "segments": [
        { "kind": "title", "caption": "Twinkle Twinkle Little Star", "durationSec": 5 },
        { "kind": "say", "caption": "Let's listen together", "parentCue": "Sit side by side", "durationSec": 6 },
        { "kind": "demo", "caption": "Watch the lights", "notes": [ ... ], "bpm": 80, "durationSec": 24 },
        { "kind": "your_turn", "caption": "Your turn!", "notes": [ ... ], "bpm": 70, "durationSec": 26 },
        { "kind": "together", "caption": "Play it together", "notes": [ ... ], "bpm": 80, "durationSec": 24 },
        { "kind": "praise", "caption": "Wonderful playing!", "durationSec": 6 }
      ]
    }
  ]
}
```

Segment kinds: `title`, `say` (caption only), `listen` (notes play, keys light, no input),
`demo` (teacher plays slowly, keys light with finger numbers), `your_turn` (keys light
one at a time; video pauses ~1 beat per note; interactive mode WAITS for the correct tap,
any tap counts in beat/high-low games), `together` (full speed, child plays along),
`beat` (child taps any key on each beat; notes give the melody the parent plays),
`high_low` (prompt `"target":"low"|"high"`), `praise`.
`durationSec` on segments must sum to the class `durationSec`, and the class must be
180–300 seconds (3–5 min). Classes per song: 6–12, depending on song length and difficulty.
Every song's last class is type `concert` (play the whole song, celebration).

## Progress model (app-side, for reference)

Per child profile: `{ classId: { positionSec, completed, stars(0-3), lastWatchedAt } }`.
"Continue" row = classes with 0 < positionSec < duration-10s, or the next class of any
started song, newest first. A class counts complete at >= 90% watched (video) or all
`your_turn` segments done (interactive).
