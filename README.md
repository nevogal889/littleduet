# Little Duet

A kids' piano app (iOS + Android) where a parent and a child aged 2–6 learn 100 famous public-domain songs together. Every song is split into 6–12 classes of 3–5 minutes, each playable two ways:

- **Real piano:** an animated lesson video the family copies on their own piano.
- **Screen piano:** the same lesson live on an on-screen keyboard that waits for the child.

$9.99/month or $59.99/year with a 7-day free trial; class 1 of every song is free.

## What's where

| Folder | What it holds |
| --- | --- |
| `content/` | `songs.json` (100 songs), `lessons/` (723 classes), the validators and `build_lessons.py`, `teacher-review.csv` for the melody check, `licensing-needed.json` |
| `video/` | The lesson-video renderer (Python + ffmpeg), piano samples, credits |
| `app/` | The Expo app (SDK 54, expo-router, TypeScript). See `app/README.md` |
| `copy/` | All in-app text, App Store and Google Play listings, privacy policy, terms, release checklist |
| `CONTRACT.md` | The shared data format for songs, classes and lesson segments |

## Automatic workflows (GitHub Actions)

| Workflow | When | What it does | Setup |
| --- | --- | --- | --- |
| **CI** | Every push | Validates songs and lessons, installs the app, type-checks, runs the unit tests, builds the web export | None |
| **Render lesson videos** | Run by hand | Renders all 723 videos on 8 machines in parallel (about 2 hours) and uploads them to Cloudflare R2 | R2 secrets, see the file header |
| **EAS build** | Run by hand | Builds the iPhone/iPad and Android apps on Expo's cloud | `EXPO_TOKEN` secret, see the file header |

## Changing a song

1. Edit the song in `content/_src/b*.txt` (or `content/songs.json` for the three seed songs).
2. `python3 content/_src/build_songs.py all && python3 content/finalize_catalog.py`
3. `python3 content/build_lessons.py --songs content/songs.json`
4. Commit. CI checks everything; re-run **Render lesson videos** for the changed songs (`only: song-id`).

## Before release

See `copy/release-checklist.md`. Open items: music-teacher check of every melody, lawyer review of the policies and the public-domain list, trademark search on the name, and device testing of purchases.
