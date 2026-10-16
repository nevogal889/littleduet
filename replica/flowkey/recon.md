# Recon map: flowkey (iOS, Android, web)

Scope: the song-lesson loop (pianist video + synced score + wait mode) and the course lessons that teach basics. Research for Little Duet, not a clone.
For: Little Duet, a parent + child (ages 2 to 6) piano app. Ideas only. No flowkey content, assets, video, arrangements or copy are to be reused.
Date: 2026-10-16
Method: replica-recon (public sources only, no login, no scraping, no bundles or private APIs) plus a light replica-entrepreneur review pass. Every claim has a URL. Inferences are marked **Inference** with a confidence level.

## Sources

| # | source | URL | notes |
| --- | --- | --- | --- |
| 1 | App Store listing (US) | https://apps.apple.com/app/flowkey/id1020357408 | feature list (Loop, Select a Hand, Wait Mode, Video, Just Play, Full Sheet Music View), IAP prices, 4.7 from ~66K ratings, v2.117.0 |
| 2 | Google Play listing | https://play.google.com/store/apps/details?id=com.flowkey.app&hl=en_GB | 4.6, 45.8K reviews, 5M+ downloads, 3 visible reviews |
| 3 | Help: subscription plans | https://help.flowkey.com/articles/4466337 | Free / Classic / Premium / Family, US prices, trial, refund window |
| 4 | Help: acoustic piano | https://help.flowkey.com/en/articles/651003-can-i-use-an-acoustic-piano-with-flowkey | mic recognition, 440 Hz tuning, noise, placement |
| 5 | Help: Android connection | https://help.flowkey.com/en/articles/412902-connect-your-instrument-to-your-android-device | USB OTG, Bluetooth MIDI, "nearly perfect" MIDI recognition |
| 6 | Help: Piano & MIDI setup collection | https://help.flowkey.com/en/collections/34718-piano-midi-setup | list of setup articles |
| 7 | flowkey magazine: technology | https://www.flowkey.com/en/piano-learning-technology | founder story, "waits until you play the notes correctly" |
| 8 | flowkey About | https://www.flowkey.com/en/about | founders, Berlin, 15M+ registered users |
| 9 | flowkey Teachers | https://www.flowkey.com/en/teachers | teacher partner revenue share, schools contact |
| 10 | Computerwoche (DE) | https://www.computerwoche.de/article/2830533/dank-ki-keine-schraegen-toene-unterm-weihnachtsbaum.html | AI recognition trained on 500+ hours of piano recordings; pauses video on wrong notes |
| 11 | Startbase interview with Jonas Gössling | https://www.startbase.com/interviews/je-aelter-ich-werde-umso-mehr-begeistert-mich-bach/ | neural networks trained on piano recordings; video adapts "to their speed" |
| 12 | deutsche-startups.de | https://www.deutsche-startups.de/2022/11/04/flowkey-klavier-app/ | ~50 staff, 8-figure revenue, 7-figure profit, 10M registered users (2022) |
| 13 | Yamaha Hub: flowkey + Clavinova | https://hub.yamaha.com/flowkey-and-the-yamaha-clavinova | orange key highlight + note names in video, missed note shown on keyboard and score, Stream Lights |
| 14 | Pianodreamers review | https://www.pianodreamers.com/flowkey-review/ | split screen, 50/75% tempo, no metronome, course content, pricing |
| 15 | MusicRadar review | https://www.musicradar.com/reviews/flowkey-review | "synchronised interactive score", 4 levels with colour dots, less gamified |
| 16 | Pianist magazine | https://pianistmagazine.com/blogs/learn-all-the-songs-that-you-love-with-flowkey | filmed from above, tick on correct note, screen pauses on wrong note |
| 17 | ePianos | https://www.epianos.co.uk/how-does-flowkey-work/ | courses "in video format with sections for you to play along" |
| 18 | ifanr (CN, 2019) | https://www.ifanr.com/app/1242509 | timeline only advances on correct note; 7 to 10 new arrangements a month |
| 19 | Inverse | https://www.inverse.com/article/10478-this-heavy-metal-pianist-is-quietly-changing-the-way-the-world-learns-piano | arrangements recorded at the flowkey office by a guest pianist |
| 20 | Pianoers review | https://pianoers.com/flowkey-review/ | onboarding questions, "might still move on" after errors |
| 21 | Top Ten Reviews | https://www.toptenreviews.com/services/home/best-learn-piano-online/flowkey-review | beginner path (posture, RH, LH, chords), onboarding questions |
| 22 | Educational App Store | https://www.educationalappstore.com/app/flowkey | lists age 6 to 18; two-bar sections |
| 23 | Welcome to the Jungle | https://app.welcometothejungle.com/companies/Flowkey | 21 to 100 staff, founded 2014, no open jobs |
| 24 | Dan Hon substack review | https://danhon.substack.com/p/flowkey-review?open=false | pricing, "too much reading" for kids. Lower-quality source |
| 25 | APKMirror release notes | https://www.apkmirror.com/?p=14851594 | generic release notes (v2.113.0, 2026-07-15) |
| 26 | Trustpilot p3, p9 | https://www.trustpilot.com/review/flowkey.com?page=3 , https://www.trustpilot.com/review/flowkey.com?page=9 | TrustScore 4.0, 410 reviews |
| 27 | JustUseApp (republished App Store reviews) | https://justuseapp.com/en/app/1020357408/flowkey-learn-piano/reviews | 29 reviews, no individual dates or stars |

Blocked or unreachable (not retried, per tool policy): Apple customer reviews RSS (https://itunes.apple.com/us/rss/customerreviews/id=1020357408/sortBy=mostRecent/json), flowkey.com home page, help.flowkey.com root, pianistscompass.org flowkey review. Reddit threads did not surface in search.

## Core loop

Pick a song at your level, watch a real pianist's hands from above while a synced score scrolls underneath, and play along in Wait Mode: the video and score stop at each next note until the app hears it (mic or MIDI), with loop, hand selection and 50/75% tempo to break it down.

## Teaching & video mechanism

### 1. Lesson format: what a lesson is made of

**Song lessons (the core product)**
- **Split screen: video on top, score below.** "sheet music appears at the bottom while a video of the song being played displays at the top" ([14](https://www.pianodreamers.com/flowkey-review/)). MusicRadar calls the bottom half a "synchronised interactive score" ([15](https://www.musicradar.com/reviews/flowkey-review)). Tablets also get a full-page portrait score ("Full Sheet Music View", [1](https://apps.apple.com/app/flowkey/id1020357408)).
- **The video is a real pianist filmed from above.** Pianist magazine says it is filmed from above the keyboard, showing "the pianist's hands and fingers" ([16](https://pianistmagazine.com/blogs/learn-all-the-songs-that-you-love-with-flowkey)). The App Store calls it a professional performance with highlighted keys and fingering ([1](https://apps.apple.com/app/flowkey/id1020357408)). Yamaha's write-up says the video "highlights the pressed keys" in orange and shows note names above each key ([13](https://hub.yamaha.com/flowkey-and-the-yamaha-clavinova)).
- **Content production.** Arrangements are recorded by pianists, sometimes at the flowkey office. A guest pianist said "I made lots of arrangements and recorded some of them at the FlowKey office", and some were simplified for beginners ([19](https://www.inverse.com/article/10478-this-heavy-metal-pianist-is-quietly-changing-the-way-the-world-learns-piano)). In 2019 ifanr reported 7 to 10 new arrangements a month ([18](https://www.ifanr.com/app/1242509)).
- **One song, up to four arrangements.** Levels are beginner, intermediate, advanced and pro, and colour dots on each song card show which exist ([15](https://www.musicradar.com/reviews/flowkey-review)).
- **Practice tools** ([1](https://apps.apple.com/app/flowkey/id1020357408), [14](https://www.pianodreamers.com/flowkey-review/), [15](https://www.musicradar.com/reviews/flowkey-review)):
  - Loop any section.
  - Select a hand (mute the other hand's part).
  - Tempo at 50% or 75%, or full speed.
  - Wait Mode (see 2).
  - Just Play: the score keeps going even when notes are missed.
  - The Educational App Store describes songs split into two-bar sections ([22](https://www.educationalappstore.com/app/flowkey)).
- **No built-in metronome** according to Pianodreamers ([14](https://www.pianodreamers.com/flowkey-review/)). Dan Hon's substack mentions a "metronome overlay" ([24](https://danhon.substack.com/p/flowkey-review?open=false)). **Conflict, unresolved.**
- **Length.** No source gives song-lesson or course-lesson durations. Reviews say beginner and intermediate levels often give "only ... snippets of songs" (see reviews.csv).

**How video and notation are synced**
- flowkey does not publish this. The evidence:
  - Yamaha: in Wait ("Flow") Mode the Stream Lights "stop advancing when a note is missed", and the missed notes blink ([13](https://hub.yamaha.com/flowkey-and-the-yamaha-clavinova)).
  - ifanr: "the timeline only advances once you play correctly" ([18](https://www.ifanr.com/app/1242509)).
  - Gössling: YouTube video "just keeps playing", while flowkey adapts the video "to their speed" ([11](https://www.startbase.com/interviews/je-aelter-ich-werde-umso-mehr-begeistert-mich-bach/)).
- **Inference (high):** each song is a note-event timeline (pitch, hand, time) aligned to the video's timestamps. One clock drives the video, the score cursor, the on-screen key highlights and the Clavinova lights. Wait Mode holds that clock at the next note event until the expected notes are detected.
- **Inference (medium):** the orange key highlights and note names are drawn by the app from the same note-event data, not burned into the video. Evidence: the same data drives external key lights over USB ([13](https://hub.yamaha.com/flowkey-and-the-yamaha-clavinova)). It is still possible that they are baked into the video.
- **Inference (medium):** the 50% and 75% tempos slow the video itself, keeping hands and score in step. No source says how audio pitch is handled at slow speed.

**Course lessons (basics, theory)**
- Courses are "presented in video format with sections for you to play along": an instructor demonstrates each step, then you try it ([17](https://www.epianos.co.uk/how-does-flowkey-work/)).
- Theory content is "short video tutorials, concise readings, and rhythm modules" ([14](https://www.pianodreamers.com/flowkey-review/)).
- Named courses include "Introduction to the Piano", "Music Reading Training", "Chords and Improvisation" and "Playing with Both Hands" ([14](https://www.pianodreamers.com/flowkey-review/), [15](https://www.musicradar.com/reviews/flowkey-review)).
- **Inference (medium):** a course lesson alternates a short explainer video with an interactive play-along step that uses the same Wait Mode player. No source gives the exact sequence or timing.

### 2. Input and feedback: how flowkey knows what was played

- **Two inputs.** The device microphone works with acoustic or digital pianos ([4](https://help.flowkey.com/en/articles/651003-can-i-use-an-acoustic-piano-with-flowkey)). MIDI works over USB (OTG on Android) or Bluetooth MIDI ([5](https://help.flowkey.com/en/articles/412902-connect-your-instrument-to-your-android-device)). flowkey: "A MIDI connection ensures nearly perfect note recognition" ([5](https://help.flowkey.com/en/articles/412902-connect-your-instrument-to-your-android-device)).
- **How mic recognition works.**
  - Computerwoche: flowkey uses AI sound recognition trained on "über 500 Stunden Klavieraufnahmen" (over 500 hours of piano recordings). When off notes are detected, "pausiert die KI die Lernvideos" (the AI pauses the lesson videos) ([10](https://www.computerwoche.de/article/2830533/dank-ki-keine-schraegen-toene-unterm-weihnachtsbaum.html)).
  - Gössling confirms neural networks "trained with piano recordings", and says an audio engineer who wrote his master's thesis on the topic helped build it ([11](https://www.startbase.com/interviews/je-aelter-ich-werde-umso-mehr-begeistert-mich-bach/)).
  - The magazine page likens it to voice recognition. The algorithms "process the audio signal from an instrument" to identify notes or chords ([7](https://www.flowkey.com/en/piano-learning-technology)).
- **Mic limitations flowkey states** ([4](https://help.flowkey.com/en/articles/651003-can-i-use-an-acoustic-piano-with-flowkey)):
  - It is tuned to standard pitch (440 Hz), so a detuned piano lowers accuracy. Users are told to check A4 with an online tuner.
  - Background noise interferes.
  - Not every note is always detected. Fixes: move the device, or open the piano lid.
- **Inference (medium-high):** recognition is score-informed. It checks whether the expected notes were played, rather than transcribing freely. Evidence:
  - Gössling: "The app recognizes whether you are playing them correctly" ([11](https://www.startbase.com/interviews/je-aelter-ich-werde-umso-mehr-begeistert-mich-bach/)).
  - A user: "flowkey requires you to be in the same octave and won't move along unless you hit the correct notes" ([27](https://justuseapp.com/en/app/1020357408/flowkey-learn-piano/reviews)).
- **Wait Mode on a correct note:** a tick appears on the correct note and the song moves on ([16](https://pianistmagazine.com/blogs/learn-all-the-songs-that-you-love-with-flowkey)).
- **Wait Mode on a wrong note:**
  - The screen pauses until the right key is played ([16](https://pianistmagazine.com/blogs/learn-all-the-songs-that-you-love-with-flowkey)).
  - The missed note is shown on both the on-screen keyboard and the score, and on a Clavinova the missed keys blink ([13](https://hub.yamaha.com/flowkey-and-the-yamaha-clavinova)).
  - There is no penalty sound or score deduction in any source.
- **On a pause by the player:** in Wait Mode nothing advances, so a pause is the same as a wait (**Inference, high**, follows from [7](https://www.flowkey.com/en/piano-learning-technology) "waits until you play the notes correctly").
- **Just Play** is the opposite: the score keeps time even when notes are missed ([1](https://apps.apple.com/app/flowkey/id1020357408)).
- **Scoring.** No source describes a points, stars or accuracy score. Reviews describe "progress tracking and practice history" ([24](https://danhon.substack.com/p/flowkey-review?open=false)). MusicRadar: "considerably less 'gamified' than some of its rival services" ([15](https://www.musicradar.com/reviews/flowkey-review)).
- **Latency.** No published figures. Reviewers say MIDI reacts "much better" and the mic needs firmer key presses ([14](https://www.pianodreamers.com/flowkey-review/)).
- **MIDI note audio.** One App Store reviewer: "flowkey doesn't play back any audio of the notes I'm playing" ([27](https://justuseapp.com/en/app/1020357408/flowkey-learn-piano/reviews)).
- **Hardware partnership.** On Yamaha CSP Clavinovas, Stream Lights (four per key) show upcoming notes over a wired iPad connection ([13](https://hub.yamaha.com/flowkey-and-the-yamaha-clavinova)).
- **Patents.** None found assigned to flowkey GmbH. A USPTO note-detection patent surfaced in search (US 8,008,566, continuation of US 7,598,447), but its original assignee is Zenph Studios with a 2004 priority date (https://patents.google.com/patent/US7598447), so it is **not** flowkey's.

### 3. Curriculum and pacing

- **Song-first, not path-first.** You pick a level (beginner to pro; you can pick more than one) and browse songs by genre ([14](https://www.pianodreamers.com/flowkey-review/), [15](https://www.musicradar.com/reviews/flowkey-review)).
- **Library size.** 1,500+ songs on Premium and 8 free songs ([7](https://www.flowkey.com/en/piano-learning-technology)).
- **Beginner progression** per Top Ten Reviews: posture and hand position, then easy right-hand songs, then easy left-hand songs, then two-handed chords ([21](https://www.toptenreviews.com/services/home/best-learn-piano-online/flowkey-review)). Intermediate covers four-chord songs and accompaniment patterns. Advanced covers improvisation and 7th and add9 chords.
- **Adaptivity.** No evidence of adaptive difficulty. Onboarding sets the level (see 4), and from there the learner chooses.
- **Criticism.** Reviewers say the path is "a bit loose" ([20](https://pianoers.com/flowkey-review/)) and that past the first lessons it is "basically 'here's another song - good luck.'" ([24](https://danhon.substack.com/p/flowkey-review?open=false)). Trustpilot reviewers say lessons "fall off pretty quickly as one advances" (reviews.csv).

### 4. Guidance: who teaches

- **The pianist video is the teacher.** No reviewed source mentions a narrating voice in song lessons. Course lessons use instructor video demonstrations ([17](https://www.epianos.co.uk/how-does-flowkey-work/)) and short readings ([14](https://www.pianodreamers.com/flowkey-review/)).
- **Inference (medium):** guidance is visual-first (hands, highlighted keys, note names, fingering numbers) with little spoken coaching.
- **Onboarding.** A few questions about prior experience and access to a piano, then setup ([21](https://www.toptenreviews.com/services/home/best-learn-piano-online/flowkey-review)). Pianoers adds that it asks beginner or intermediate and MIDI or acoustic, then starts the first lesson, in about five minutes ([20](https://pianoers.com/flowkey-review/)).
- **Posture and key-finding.** Covered in beginner courses ([21](https://www.toptenreviews.com/services/home/best-learn-piano-online/flowkey-review)); Gössling says beginners first learn "how to hold their hands" ([11](https://www.startbase.com/interviews/je-aelter-ich-werde-umso-mehr-begeistert-mich-bach/)). Reviewers rate technique and posture guidance weaker than a teacher's ([14](https://www.pianodreamers.com/flowkey-review/)).
- **No live human teacher in the product.**
  - Support is by email and chat ([4](https://help.flowkey.com/en/articles/651003-can-i-use-an-acoustic-piano-with-flowkey)).
  - The teacher programme is a revenue-share referral code, presented as a practice aid next to real lessons ([9](https://www.flowkey.com/en/teachers)). The page shows no teacher dashboard.

### 5. Kids and parent angle

- **No kids product.** There is a "Kids" song category ([14](https://www.pianodreamers.com/flowkey-review/)).
- **No official age guidance.** The App Store rating is 4+ ([1](https://apps.apple.com/app/flowkey/id1020357408)). The Educational App Store lists 6 to 18 ([22](https://www.educationalappstore.com/app/flowkey)).
- **Reviewers on kids:**
  - Some say it struggles with kids because of "too much reading required" ([24](https://danhon.substack.com/p/flowkey-review?open=false)).
  - Pianoers lists "Kids who need accountability and real-time correction" as people who should skip it ([20](https://pianoers.com/flowkey-review/)).
  - An App Store reviewer: "It would be fine for young kids with support from a knowledgeable adult" ([27](https://justuseapp.com/en/app/1020357408/flowkey-learn-piano/reviews)).
- **Family plan.**
  - Up to 5 user profiles or accounts, with everything in Premium.
  - Sold only on the web, not in the app stores ([3](https://help.flowkey.com/articles/4466337)).
  - The help article does not say whether progress is tracked per profile.
- **Teachers.** A piano teacher testimonial calls it "an excellent tool to introduce children to the world of piano playing" ([9](https://www.flowkey.com/en/teachers)).

### 6. Motivation

- **Streaks, badges, reminders and daily goals:** none found in any source. MusicRadar notes it is less gamified than rivals ([15](https://www.musicradar.com/reviews/flowkey-review)).
- **What exists.**
  - Progress tracking and practice history ([24](https://danhon.substack.com/p/flowkey-review?open=false)).
  - A tick on correct notes ([16](https://pianistmagazine.com/blogs/learn-all-the-songs-that-you-love-with-flowkey)).
  - "My Songs" saved list ([17](https://www.epianos.co.uk/how-does-flowkey-work/)).
- **Motivation is the repertoire itself:** real songs people know (pop, film, classical).
- **Not verified:** push reminders or practice notifications. The App Store listing does not list them.

## Monetization

- **Free account.** No time limit, a few free songs and course lessons, all learning features ([3](https://help.flowkey.com/articles/4466337)). The magazine page says the free tier has 8 songs ([7](https://www.flowkey.com/en/piano-learning-technology)).
- **Paid plans, US prices from the help center** ([3](https://help.flowkey.com/articles/4466337)):

  | plan | monthly | yearly | what it adds | where sold |
  | --- | --- | --- | --- | --- |
  | Classic | $16.49 | $99.99 | all courses, classical and public-domain songs | web only |
  | Premium | $24.99 | $149.99 | adds pop, rock, jazz, film and game music | web and app stores |
  | Family | $37.49 | $224.99 | everything in Premium, up to 5 profiles | web only |

  - The App Store IAP list shows other price points ($19.99 to $179.99) with no periods given ([1](https://apps.apple.com/app/flowkey/id1020357408)).
  - Reviews from 2025 quote $19.99 a month, $83.94 for six months and $119.88 a year ([15](https://www.musicradar.com/reviews/flowkey-review)), so prices have risen or vary by channel.
- **Trial and refunds.** A 7-day free Premium trial comes only with yearly plans, discounted offers get no trial, there is a 14-day money-back guarantee, and there is no lifetime plan ([3](https://help.flowkey.com/articles/4466337)).
- **Gating is by genre.** The Classic/Premium split puts licensed pop music behind the higher tier. Free users keep every tool, so the only gate is content.
- **Business.**
  - Profitable, with 8-figure revenue and about 50 people in 2022 ([12](https://www.deutsche-startups.de/2022/11/04/flowkey-klavier-app/)).
  - Grew through affiliate YouTubers paid per subscription ([11](https://www.startbase.com/interviews/je-aelter-ich-werde-umso-mehr-begeistert-mich-bach/)) and a long-running Yamaha bundle (free Premium months with Yamaha pianos, [17](https://www.epianos.co.uk/how-does-flowkey-work/)).

## Screens

Built from reviews and listings, not from a logged-in session (no account was used).

| ID | screen | route / how to reach | purpose | key components | states seen |
| --- | --- | --- | --- | --- | --- |
| S01 | Onboarding questions | first launch | set level and input type | single-choice cards (experience, piano access, MIDI or acoustic) | filled ([20](https://pianoers.com/flowkey-review/), [21](https://www.toptenreviews.com/services/home/best-learn-piano-online/flowkey-review)) |
| S02 | Home / browse | tab | discover songs | song cards with level dots, genre rows | filled ([15](https://www.musicradar.com/reviews/flowkey-review)) |
| S03 | Search | tab | find songs by title, level, genre | search field, level filter | filled ([21](https://www.toptenreviews.com/services/home/best-learn-piano-online/flowkey-review)) |
| S04 | My Songs | tab | saved songs | list | empty and filled (inferred) ([17](https://www.epianos.co.uk/how-does-flowkey-work/)) |
| S05 | Courses | tab | course list and lessons | course cards, lesson list, progress | filled ([21](https://www.toptenreviews.com/services/home/best-learn-piano-online/flowkey-review)) |
| S06 | Song player | song card | the core loop | video pane, synced score, cursor, on-screen key highlights, mode toggle (Wait / Just Play), hand selector, tempo 50/75/100, loop handles | playing, waiting on note, missed note, looping ([13](https://hub.yamaha.com/flowkey-and-the-yamaha-clavinova), [14](https://www.pianodreamers.com/flowkey-review/)) |
| S07 | Course lesson player | course lesson | explainer video plus play-along | video, text and reading panels, play-along step | (inferred, medium) ([14](https://www.pianodreamers.com/flowkey-review/)) |
| S08 | Settings: MIDI/USB | gear icon in player | connect input | device list, Bluetooth MIDI config | connected, not found ([5](https://help.flowkey.com/en/articles/412902-connect-your-instrument-to-your-android-device)) |
| S09 | Paywall | locked song or course | upgrade | plan cards, trial | shown on locked content (reviews.csv) |
| S10 | Full sheet music view | tablet portrait | read the whole score | full-page score | tablet only ([1](https://apps.apple.com/app/flowkey/id1020357408)) |

## Flows

```
F01 Learn a song section in Wait Mode
    S02 -> S06 pick level -> choose hand -> Wait Mode -> play notes as the video stops on each
    happy path taps: about 4 to start playing
    edge: mic misses a note (stall), wrong octave (stall), noisy room, piano detuned from 440 Hz, MIDI not detected
F02 Drill a hard passage
    S06 -> set loop -> tempo 50% -> repeat -> 75% -> 100% -> Just Play
F03 First run
    S01 -> first lesson (course "Introduction to the Piano") -> S06 or S07
F04 Upgrade
    S06 locked song -> S09 -> store purchase (Premium only) or web (Classic / Family)
```

## Components

| component | variants | states | used on |
| --- | --- | --- | --- |
| Video pane | song performance, course explainer | playing, paused-waiting, slowed | S06, S07 |
| Scrolling score | horizontal scroll, full page | cursor at note, correct tick, missed note marked | S06, S10 |
| On-screen keyboard highlight | upcoming, pressed, missed | lit, blinking | S06 |
| Mode toggle | Wait Mode, Just Play | on, off | S06 |
| Hand selector | right, left, both | selected | S06 |
| Tempo selector | 50%, 75%, 100% | selected | S06 |
| Loop handles | start, end | set, cleared | S06 |
| Song card | with level dots | locked, unlocked | S02, S03, S04 |
| Input setup | mic, USB, Bluetooth MIDI | connected, not found | S08 |

## Inferred data model

```
Song         id, title, genre, licence_tier (classic | premium)
             evidence: help plans article (Classic vs Premium by genre); confidence: high
Arrangement  id, song_id, level (beginner | intermediate | advanced | pro), video_id, note_events[]
             evidence: MusicRadar level dots, Yamaha lights; confidence: high (level), medium (structure)
NoteEvent    t_video_ms, pitch, hand (L|R), finger, duration
             evidence: highlighted keys + note names + fingering + Stream Lights sync; confidence: guess (fields), high (existence)
Course       id, title, lessons[]   evidence: Courses tab; confidence: high
CourseLesson id, course_id, video_id, readings, exercises (play-along)   confidence: medium
UserProgress user_id, arrangement_id or lesson_id, completed, practice_time
             evidence: "progress tracking and practice history"; confidence: medium
Subscription plan (free | classic | premium | family), period, store (web | app store | play)
             evidence: help plans article; confidence: high
```

Relationships: Song 1-n Arrangement, Arrangement 1-n NoteEvent, Course 1-n CourseLesson, Family account 1-5 profiles.

## Feature matrix

See `features.csv`. Must: 9, should: 10, could: 6, skip: 3.

## Out of scope (cannot or should not be cloned)

- flowkey's licensed catalogue, arrangements and pianist video recordings.
- Its trained recognition model and training data.
- The Yamaha Stream Lights integration and the Yamaha bundle deal.
- The affiliate YouTuber network.

## Size

Screens 10, flows 4, entities 7.
Hard parts:
- Mic note recognition that is reliable on real pianos.
- Frame-accurate sync of the video, score, key highlights and wait points.
- Producing one top-down video per arrangement (content cost, not code).

Size for an equivalent mechanism: L.

## Lessons for Little Duet

Ideas only. No flowkey content, video, arrangements, UI copy or assets are to be reused.

**Worth learning from**
1. **Make the teacher video wait for the child.** flowkey's founding insight is that tutorial videos "just keep playing" ([11](https://www.startbase.com/interviews/je-aelter-ich-werde-umso-mehr-begeistert-mich-bach/)). For Little Duet's 3 to 5 minute classes, the play-along parts should stop on each target note until it is heard, then continue.
2. **One timeline drives everything.** Store each class's target notes as timestamped events against the video. The same events then drive the wait points, the on-screen key glow and the progress bar. This also makes the on-screen piano mode free: the same events, just tapped.
3. **Score-informed checking, not transcription.** flowkey checks for the expected notes. For single-note toddler songs this is the right and much easier problem: listen only for "is it the pitch we are waiting for?".
4. **Hands separate, slow tempos, loop.** These three tools are what users praise most (7 of 40 reviews praise own pace, patience or loop). For ages 2 to 6, a "slower" button the parent controls fits better than tempo percentages.
5. **Video from above with highlighted keys.** The top-down hands view plus a key glow is the clearest "which key now" signal, and it needs no reading.
6. **Tell parents how to set up the mic.** flowkey's help tells users to check 440 Hz tuning, reduce noise, move the device and open the lid. Little Duet should give the same kind of setup check in plain words for parents.

**What to avoid**
1. **Strict recognition that stalls the lesson.** 9 of 40 sampled reviews complain about missed or false detection or wait-mode strictness, including octave strictness. For toddlers:
   - accept the right note in any octave;
   - auto-advance after a few tries with a gentle "let's keep going";
   - give the parent a "that was right" override.
2. **Reading-heavy UI.** Reviewers say flowkey has "too much reading" for kids.
3. **No kid layer.** flowkey has no kids product, no rewards and no streaks, and its family plan is web-only with up to 5 profiles. Little Duet's per-child profiles and praise for both kid and parent are the gap.
4. **Snippets sold as songs.** Reviewers dislike getting "only ... snippets of songs". If a class teaches part of a song, say so.
5. **Gating that feels like a bait.** Price, catalogue size and trial complaints make up a large share of the low ratings (see reviews.csv). Keep Little Duet's 7-day trial clearly signposted, with a reminder before it converts.

## Reviews summary (n = 40, see reviews.csv)

**Sample:**
- 23 from Trustpilot (pages 3 and 9).
- 14 App Store reviews republished on JustUseApp, which shows no dates or stars.
- 3 from Google Play.

The Apple RSS feed was blocked and Reddit did not surface, so the sample covers only these three sources.

**Collection caveat:** excerpts were extracted through the WebFetch tool, which reported them as verbatim and up to 120 characters. Spot-check before quoting.

**Top complaints**
- Note recognition misses or false reads, or wait-mode strictness: 9 (Trustpilot 4, App Store 5).
- Catalogue too small or wrong genres: 6 (Trustpilot 6, thin: one source).
- Price, trial and billing: 5 (Trustpilot 3, Google Play 2).
- Curriculum thins out past beginner, or snippets instead of full songs: 3 (Trustpilot 2, App Store 1; thin).
- Also seen once each:
  - not all pieces show fingering;
  - no audio playback of MIDI notes;
  - wants a skip-the-demo option;
  - login problem.
- Video becomes a crutch ("mimicking two hands"): 2 (thin).

**Top praise**
- Own pace, patience, wait mode, loop and slow-down: 7 (Trustpilot 5, App Store 2).
- Clear, methodical, easy to follow: 5 (Trustpilot 3, App Store 1, Google Play 1).
- Helped a family member or kid with adult support: 2 (thin).
