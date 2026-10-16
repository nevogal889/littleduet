# Little Duet lesson videos

Every class in `content/lessons/<songId>.json` becomes one MP4 plus a thumbnail:

```
video/out/<songId>/<classId>.mp4   1280x720, 30 fps, H.264 (yuv420p) + AAC stereo, faststart
video/out/<songId>/<classId>.jpg   640x360 thumbnail (the title card)
```

These are exactly the `video` / `thumb` paths in the lesson files (relative to `video/out/`).

## Render

```bash
python3 content/build_lessons.py                 # songs.json (or seed-songs.json) -> content/lessons/*.json + validation
python3 video/render.py --class twinkle-twinkle-c03          # one class
python3 video/render.py --song twinkle-twinkle               # every class of one song
python3 video/render.py --all                                # everything, one process
video/render_all.sh                                          # everything, all CPU cores, resumable
nohup video/render_all.sh > video/render.log 2>&1 &          # same, in the background
python3 video/render.py --class twinkle-twinkle-c03 --frames 5,30,60   # PNG stills to check layout
python3 video/render.py --samples                            # re-export video/samples/*.mp3
```

### After any restart, re-run this (idempotent, safe to run any time):

```bash
nohup /home/claude/littleduet/video/pipeline.sh >> /home/claude/littleduet/video/render.log 2>&1 &
```

`pipeline.sh` merges the songs that exist (`content/songs.json` once it is there, otherwise
`seed-songs.json` + `content/_src/parts/*.json`), rebuilds and validates `content/lessons/`
(invalid lessons are not written), renders every missing or changed class on all cores, skips
finished videos, then runs `check_videos.py`. A second copy started while one runs exits at once.
Progress is appended to `video/render.log` (one line per class with speed and size). Once
`songs.json` exists, the build also prunes lesson files for songs no longer in it (their old
videos stay in `out/` and can be deleted by hand).

- Existing `.mp4` + `.jpg` pairs are skipped; pass `--force` to redo. A video is written as
  `<classId>.mp4.part.mp4` and renamed when complete, so an interrupted run never leaves a
  half file under the final name. `render_all.sh` can be killed and restarted at any time.
- Each rendered class gets a hidden `out/<songId>/.<classId>.hash` (hash of its lesson data). If the
  lesson changes, `render_all.sh` / `render.py` re-render it automatically. An `.mp4` with no
  `.hash` file is treated as hand-made (e.g. filmed) and is never overwritten except with `--force`.
  `python3 video/render.py --list --todo` shows what still needs rendering; `--stamp` marks existing
  files as matching the current lessons.
- `python3 video/check_videos.py` checks every rendered file (size, codecs, 30 fps, faststart,
  duration = `durationSec`, thumbnail size), counts stale videos (lesson changed, will be re-rendered)
  and missing covers, and prints totals.
- Encoder settings: `--preset veryfast --crf 26 -tune animation`, keyframe every 10 s, AAC 80 kb/s.
  Flat graphics compress to roughly 3–5 MB per 4-minute class.
- Audio is normalised to about -16 LUFS with peaks held at -2.5 dBFS.

Requirements: Python 3 with numpy, scipy, Pillow; ffmpeg with libx264. One-time assets live in
`video/assets/` (fonts, piano samples, the pitch-shifted sample cache `assets/cache/piano_C3_C6.npy`,
rebuilt automatically if deleted). See `CREDITS.md` for licences — the piano needs a CC-BY credit line.

## Song covers

Each song also gets a cover in the lesson-video style (a composed frame, not a separate illustration):

```
video/out/<songId>/cover.jpg          1280x720  icon left, title + age pill right, keyboard strip below
video/out/<songId>/cover-square.jpg   720x720   icon on top, title centred, keyboard strip below
```

Ground colour, the song's flat icon, the title in Bricolage Grotesque (sized to stay readable as a
small tile), an "Ages 2-3 | Tiny Ears" pill, and the keyboard covering the opening's range with the
first notes lit coral (finger numbers) and the next notes falling as bars. No captions or progress bar.

```bash
python3 video/render.py --covers --all            # all songs, about 10 s; existing covers skipped
python3 video/render.py --covers --song bingo --force
```

`render_all.sh` (and so `pipeline.sh`) renders missing or outdated covers first. Covers carry a hidden
`.cover.hash`; a cover without it (hand-made) is never overwritten unless `--force`.

## Lesson lengths

Each song has 8-10 classes of 3-5 minutes; song totals are spread evenly over 30-40 minutes
(see CONTRACT.md and `content/build_lessons.py`, which prints the distribution on every build).
When lessons change, the affected classes are re-rendered automatically (hash check), so after a
curriculum change just re-run the pipeline.

## What is on screen

| Area | Content |
|---|---|
| Top band | Big caption (48–60 px, Bricolage Grotesque) and a GROWN-UP cue line (DM Sans) |
| Middle | The song's icon bouncing on the beat (left), karaoke lyric line with the current syllable in coral; with no lyric, the letter name of the key. Right side: pulsing beat circle (`beat`), bird (`high_low`) |
| Roll lane | Upcoming notes fall onto their keys as rounded bars (coral = child, light indigo = grown-up) |
| Keyboard | Top-down piano covering the octaves the class uses, middle C marked with a dot. The key to play turns coral with its finger number in a big circle. Grown-up keys turn light indigo |
| Bottom | Thin coral progress bar |

Segment looks: `title` = song title + "Class N: ..." card; `your_turn` = key lit pale coral with a
shrinking countdown ring during the wait beat, then full coral (the video plays a soft guide note);
`high_low` = bear + low half of the keyboard in indigo, or bird + high half in marigold;
`praise` = confetti and a little arpeggio; `beat` = soft metronome tick (only here).

## Swapping in filmed videos later

The app only knows the paths in the lesson files. To replace an animated class with a filmed one,
export it as `video/out/<songId>/<classId>.mp4` (same name, H.264 + AAC, faststart) plus
`<classId>.jpg`, delete `out/<songId>/.<classId>.hash`, and keep `durationSec` in the lesson in
step with the real length (progress, "Continue" and the 90% completion rule use it). Without the
hash file the renderer treats the video as hand-made and never overwrites it unless you run
`render.py --force`.
For interactive mode the app keeps using the segment timeline, so a filmed class should follow
the same segment order and timing (render the animated version once and film along with it).

## Lesson file extensions (optional fields the renderer and app can use)

All are additive; the contract fields are unchanged.

| Field | Where | Meaning |
|---|---|---|
| `leadInSec` | note segment | Count-in before the first note (2 beats, at least 1 s) |
| `gapBeats` | `your_turn` | Wait in beats before each note the child plays (countdown ring). Note time = d x 60 / bpm |
| `who: "parent"` | note | The grown-up (or the video) plays this note; the app should auto-play it, not wait for it |
| `lh: {p, d, f, h:"L"}` | note | Left-hand note struck together with this note (child's); lasts until the next `lh` |
| `lines: [{lyric, from}]` | note segment | Lyric lines; `from` = index of the first note of the line (karaoke) |
| `showKeys: [{p, f}]` | `say` | Keys to light with finger numbers (hand position) |
| `dynamic: "loud" / "soft"` | `beat` | Loud/soft game; the video plays louder or softer |
| `subcaption` | `title` | "Class N: <title>" |
| `totalSec` | lesson root | Sum of the classes' `durationSec` (1800-2400) |
| `title`, `ageGroup`, `icon`, `key` | lesson root | Copied from the song so the renderer needs only the lesson file |

Segment `durationSec` = ceil(leadInSec + note time (+ gaps) + 1.5 s tail); class types used:
listen, beat, high-low, loud-soft, fast-slow, stop-go, together, special-note, echo,
hand-position, phrase, put-together, play-along, left-hand, hands-together, concert.
