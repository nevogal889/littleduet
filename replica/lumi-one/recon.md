# Recon map: light-up-key keyboards with companion apps (ROLI LUMI / Piano M + ROLI Learn, and The ONE Smart Piano apps)

Scope: how the lights and the app teach together: lesson format, light guidance, wait/practice modes, video courses, curriculum, kids content, motivation, monetization including hardware cost. Hardware engineering, MPE and music-production features are excluded.
For: Little Duet (parent + child piano app, ages 2–6). Research only. Nothing here is to be copied as content, assets or copy.
Date: 2026-10-16

Method: public sources only. No login, no scraping, no app binaries or network traffic. Every claim has a URL. **Inference** marks my readings, with a confidence level. Short quotes are what the fetch tool returned as verbatim. Spot-check them before reusing.

Naming: LUMI Keys (2019–2024) was renamed **ROLI Piano M**, and the LUMI Music app became **ROLI Learn** in July 2024 ([Wikipedia](https://en.wikipedia.org/wiki/ROLI)). The ONE is made by The ONE Music Group. Its apps are published by Xiaoyezi Beijing Technology Co., Ltd.

## Sources

| # | source | URL | notes |
| --- | --- | --- | --- |
| L1 | Wikipedia: ROLI | https://en.wikipedia.org/wiki/ROLI | timeline: LUMI 2019 (24 RGB keys), rename 2024, Airwave 2024, ROLI Piano 2025, AI Music Coach beta Feb 2026 |
| L2 | MusicTech LUMI Keys review | https://musictech.com/reviews/roli-lumi-keys-1/ | Learn vs Play, Watch/Practice/Challenge, Wait, Cascade, 4 teachers, £299, $79/yr |
| L3 | Gizmodo LUMI review | https://gizmodo.com/the-lumi-keys-is-a-delightful-way-to-learn-piano-basics-1846403964 | good/perfect/late markers, Springboard game, $299 + $50 voucher |
| L4 | Sennep (LUMI app design agency) | https://sennep.com/our-work/lumi | lessons + songs + game combined; "Guitar Hero-like streaming shapes" |
| L5 | ROLI blog: Guided Practice | https://roli.com/blog/new-in-roli-learn-guided-practice-and-new-two-handed-lessons | note by note → slow → medium → full; Stage 1–3 |
| L6 | ROLI blog: practice tips | https://roli.com/blog/top-5-lumi-music-app-practice-tips | Pause and Play, speed, loop, finger numbers, metronome |
| L7 | ROLI blog: 5 beginner frustrations | https://roli.com/blog/5-common-beginner-musical-frustrations | finger-coloured lights, Cascade replaces notation at first |
| L8 | ROLI Learn product page | https://roli.com/experience/piano-learn | Cascade / Rainbow / ColorNote / Classic, video coaches, games, streaks, 1,000+ songs |
| L9 | ROLI Piano M page | https://roli.com/lumi-keys | 2 octaves, Brightkey, "even comfortable for kids", Solo $119.99/yr, Family $179.99/yr |
| L10 | ROLI Piano M + Learn page | https://roli.com/product/piano-m-learn | membership prices, note by note |
| L11 | ROLI Learn App Store US | https://apps.apple.com/us/app/roli-learn/id1481450834 | 4+, 300+ lessons, 450+ exercises, Solo $14.99, Family $24.99 IAP |
| L12 | ROLI blog: AI Music Coach | https://roli.com/blog/introducing-ai-music-coach | voice coach, Airwave hand tracking, 40 languages, beta 2026 |
| L13 | MusicTech ROLI Piano System review, 2026-04-28 | https://musictech.com/reviews/education-courses/roli-piano-learning-system-review/ | finger "strings", scroll slows when you hesitate, £14.99/mo |
| L14 | TechCrunch Airwave | https://techcrunch.com/2024/10/08/roli-airwave-system-uses-ai-and-hand-tracking-to-teach-piano | Airwave $299, Piano M $259 |
| L15 | Gearnews ROLI Piano | https://gearnews.com/roli-piano | 49 keys, $599 ($399 early bird) |
| O1 | AppleInsider first look (2015) | https://appleinsider.com/articles/15/07/25/first-look-the-one-smart-piano | 3 modes; LED-guided practice waits for the right key; voice calls out finger numbers |
| O2 | New Atlas (2015) | https://newatlas.com/one-piano-learning-system/38282/ | Hoffman lessons + LEDs, games, prices |
| O3 | Best Buy Canada review | https://blog.bestbuy.ca/musical-instruments/review-the-one-light-digital-piano | Hoffman Academy first lesson about 8 min synced to LEDs; Music Lab waterfall; first 12 lessons free |
| O4 | The Next Web (2018) | https://thenextweb.com/reviews/2018/06/15/review-the-one-smart-keyboard-pro-uses-rgb-lights-to-help-you-play-piano/ | Sheet Music / Crash Course / Videos / Games; 100+ Hoffman videos; $799 |
| O5 | Mighty Gadget (2019) | https://mightygadget.com/the-one-light-keyboard-review-a-smart-keyboard-that-can-teach-you-to-play/ | Crash Course splits L/R hands; $279.99 |
| O6 | TheONE Smart Piano app (2024–) | https://apps.apple.com/us/app/-/id6472423235 | current app: gamified path (v1.6.0), YouTube tutorials with lights, $19.99/mo |
| O7 | The ONE Smart Piano legacy app | https://apps.apple.com/us/app/the-one-smart-piano-by-the-one/id1267703721 | 100+ free video lessons, blue = left / red = right, 3.0 from 161 ratings |
| O8 | One Pianist by The ONE (kids app) | https://apps.apple.com/us/app/-/id1255389741 | "Made for Ages 6–8", nursery songs, last update 2021 |
| O9 | The ONE Piano Sparring app | https://apps.apple.com/app/id1240104076 | synced with "Smart Piano Classroom" courses; "help your kids to read music" |
| O10 | 24-7 Press Release (2015) | https://www.24-7pressrelease.com/press-release/408974/the-one-music-group-introduces-first-of-its-kind-smart-piano-and-keyboard-to-us-market | 3 ways to learn |
| O11 | Musician Wave (updated 2026-10-08) | https://www.musicianwave.com/best-lighted-keyboard-pianos/ | The ONE COLOR: 61 keys, Bluetooth, content may need payment |
| R* | reviews | see reviews.csv | 40 rows |

Not reachable: Apple customer-reviews RSS (robots disallowed / proxy 403). No official ROLI or The ONE help center page with mode definitions was found. Current The ONE hardware prices were not found on a retailer page (Woodwind & Brasswind redirected).

## Core loop

The app shows a song as falling notes. The same next note lights up on the physical key, and the learner presses the lit key. The app either waits for them (practice) or keeps time and scores them (challenge/game). Short video lessons are interleaved, and their lights are synced to what the on-screen teacher plays.

## Teaching & video mechanism

### 1. Lesson format

**ROLI (LUMI → Piano M / ROLI Learn)**
- **Two pillars plus a game layer.** *Learn* holds "interactive video lessons" and *Play* holds the song library ([L2](https://musictech.com/reviews/roli-lumi-keys-1/)). The design agency's brief was to combine lessons, songs and game, not choose one: "the strength of the app would be in combining all three" ([L4](https://sennep.com/our-work/lumi)). Learn = "short interactive video lessons and chapter challenges" ([L4](https://sennep.com/our-work/lumi)).
- **Per-song playback modes (LUMI era).** *Watch*, then *Practice* (backing slowed to 0.75x or 0.5x, plus a Wait option), then *Challenge* ("a full-on game mode, points and all") ([L2](https://musictech.com/reviews/roli-lumi-keys-1/)).
- **Guided Practice (current default).**
  - The learner works "through the song note by note, then move[s] through slow, medium, and full speeds". The app only moves you on when you're ready.
  - Tools: metronome, looping, and four views.
  - With the Airwave camera on, an overlay draws your hands with "strings" from fingers to notes ([L5](https://roli.com/blog/new-in-roli-learn-guided-practice-and-new-two-handed-lessons), [L13](https://musictech.com/reviews/education-courses/roli-piano-learning-system-review/)).
- **Views (the notation ladder).**
  - *Cascade* (default): notes fall onto the lit keys.
  - *Rainbow*: colour-coded notes scroll horizontally.
  - *ColorNote*: staff notation with colour hints.
  - *Classic*: plain sheet music.
  ([L8](https://roli.com/experience/piano-learn))
- **Games.** Lava escape, alien battles ([L8](https://roli.com/experience/piano-learn)), and Springboard, where an avatar jumps on the song's notes ([L3](https://gizmodo.com/the-lumi-keys-is-a-delightful-way-to-learn-piano-basics-1846403964)).
- **Length.** The video lessons are "short" and "bite-sized" ([L2](https://musictech.com/reviews/roli-lumi-keys-1/), [L4](https://sennep.com/our-work/lumi)). No minute figure was found.

**The ONE**
- **Three ways to learn** since launch: Video Tutorials, LED-guided practice, and the KARA rhythm game ([O1](https://appleinsider.com/articles/15/07/25/first-look-the-one-smart-piano), [O10](https://www.24-7pressrelease.com/press-release/408974/the-one-music-group-introduces-first-of-its-kind-smart-piano-and-keyboard-to-us-market)). The 2018 app had four sections: Sheet Music, Crash Course, Videos, Games ([O4](https://thenextweb.com/reviews/2018/06/15/review-the-one-smart-keyboard-pro-uses-rgb-lights-to-help-you-play-piano/)).
- **Video lessons synced to the lights.** Over 100 Hoffman Academy videos "sync up with the lights on your keyboard" ([O4](https://thenextweb.com/reviews/2018/06/15/review-the-one-smart-keyboard-pro-uses-rgb-lights-to-help-you-play-piano/)). The first lesson teaches "Hot Cross Buns", runs "a little over eight minutes", and the LEDs light up at the right moments ([O3](https://blog.bestbuy.ca/musical-instruments/review-the-one-light-digital-piano)). In video tutorials the teacher plays and breaks down a piece. LEDs show the fingering, then the app turns "off the LEDs so that the student can play unassisted" ([O1](https://appleinsider.com/articles/15/07/25/first-look-the-one-smart-piano)).
- **Crash Course** splits a piece into small left-hand and right-hand segments. Guitar-Hero-like cues show "how long to press the keys", and the app saves your place ([O5](https://mightygadget.com/the-one-light-keyboard-review-a-smart-keyboard-that-can-teach-you-to-play/)). **Music Lab** is a later step-by-step waterfall tutorial ([O3](https://blog.bestbuy.ca/musical-instruments/review-the-one-light-digital-piano)).
- **Current app (2024–).**
  - Structured beginner lessons "from your first notes to playing with both hands".
  - A "gamified learning path" added in v1.6.0.
  - Chord lessons with a "game-inspired approach".
  - Auto Play and A-B Repeat.
  - **Selected YouTube piano tutorials played with lighted keys.**
  ([O6](https://apps.apple.com/us/app/-/id6472423235))

### 2. Input and feedback

- **Input is the keyboard itself**, over MIDI, not a microphone.
  - Piano M/LUMI: Bluetooth or USB, class-compliant MIDI ([L9](https://roli.com/lumi-keys)).
  - The ONE: originally Lightning/USB cable, with no Bluetooth on the 2018 Pro ([O4](https://thenextweb.com/reviews/2018/06/15/review-the-one-smart-keyboard-pro-uses-rgb-lights-to-help-you-play-piano/)). Later models have Bluetooth ([O11](https://www.musicianwave.com/best-lighted-keyboard-pianos/)).
  - **Inference (high):** because input is MIDI, note detection is exact, polyphonic and has no audio-recognition latency. This is why these products can do wait modes and chords cheaply.
- **Wait mechanics.**
  - The ONE's LED-guided practice: "The staff note highlighting and LEDs at the keyboard won't change until the student has played them". Meanwhile a female voice calls out finger numbers ([O1](https://appleinsider.com/articles/15/07/25/first-look-the-one-smart-piano)).
  - ROLI: Wait mode "silences the backing so you can play at your own pace" ([L2](https://musictech.com/reviews/roli-lumi-keys-1/)). "Pause and Play" is described as a "patient virtual instructor" ([L6](https://roli.com/blog/top-5-lumi-music-app-practice-tips)). Guided Practice starts note by note ([L5](https://roli.com/blog/new-in-roli-learn-guided-practice-and-new-two-handed-lessons)).
  - With Airwave, "scrolling speed adjusts to your confidence, slowing down when you hesitate" ([L13](https://musictech.com/reviews/education-courses/roli-piano-learning-system-review/)).
- **Timing feedback.** ROLI shows "good", "perfect" and "late" markers. The Gizmodo reviewer came to "absolutely dread" "late" ([L3](https://gizmodo.com/the-lumi-keys-is-a-delightful-way-to-learn-piano-basics-1846403964)). Challenge and games award points and note streaks ([L2](https://musictech.com/reviews/roli-lumi-keys-1/)). The ONE games score "hitting the right notes at the right time" ([O2](https://newatlas.com/one-piano-learning-system/38282/)).
- **Wrong-note handling.** No source describes what happens visually on a wrong key. **Unverified.**
- **Latency calibration.** Not documented for either product. **Inference (medium):** it is less needed because input is MIDI.
- **Technique feedback (2025–26).**
  - Airwave cameras track hands and fingers ([L14](https://techcrunch.com/2024/10/08/roli-airwave-system-uses-ai-and-hand-tracking-to-teach-piano), [L15](https://gearnews.com/roli-piano)).
  - The AI Music Coach talks to you, with spoken feedback "in 40 languages", and "decides when you're ready to move on". It is in beta and needs Airwave ([L12](https://roli.com/blog/introducing-ai-music-coach)).

### 3. Curriculum and pacing

- **ROLI Learn.**
  - 300+ interactive lessons and 450+ chord and scale exercises ([L11](https://apps.apple.com/us/app/roli-learn/id1481450834)); 1,000+ songs ([L8](https://roli.com/experience/piano-learn)).
  - Linear stages:
    - *Stage 1*: one finger per hand, fixed hand positions.
    - *Stage 2*: three, four and five fingers.
    - *Stage 3*: varied note durations, sharps, flats and key signatures.
    - Recent additions: 48 + 61 + 27 two-handed lessons.
  - "Later stages replay songs you already know in more advanced versions" ([L5](https://roli.com/blog/new-in-roli-learn-guided-practice-and-new-two-handed-lessons)).
  - LUMI-era song difficulty ran from **First Steps** (mostly right-hand melody) to **Expert** ([L2](https://musictech.com/reviews/roli-lumi-keys-1/)).
- **Adaptivity.** ROLI says the app "adapts to your progress" ([L7](https://roli.com/blog/5-common-beginner-musical-frustrations)) and "uses machine learning to adapt to your personal playing style" ([L13](https://musictech.com/reviews/education-courses/roli-piano-learning-system-review/)). How it adapts is not documented. **Inference (low):** mostly speed and recommendations.
- **Placement.** Not found for either. TNW asked for a skill assessment in The ONE app, which "doesn't really tell you where to start" ([O4](https://thenextweb.com/reviews/2018/06/15/review-the-one-smart-keyboard-pro-uses-rgb-lights-to-help-you-play-piano/)).
- **The ONE pieces.** Each piece has a difficulty level. Practice tools: one hand at a time, metronome, recording, repeat sections, fingering guides, and convert sheet music to falling notes ([O4](https://thenextweb.com/reviews/2018/06/15/review-the-one-smart-keyboard-pro-uses-rgb-lights-to-help-you-play-piano/)). The kids app's "Piano Journey" orders nursery songs from easy to hard with "customized learning steps" ([O8](https://apps.apple.com/us/app/-/id1255389741)).

### 4. Guidance: who teaches, and how lights replace notation

- **Teachers.**
  - ROLI: "four teachers" in LUMI ([L2](https://musictech.com/reviews/roli-lumi-keys-1/)); now "friendly coaches" / "expert educators", unnamed ([L8](https://roli.com/experience/piano-learn)). Video covers note names and hand position ([L9](https://roli.com/lumi-keys)). The AI voice coach is in beta ([L12](https://roli.com/blog/introducing-ai-music-coach)).
  - The ONE: Hoffman Academy videos (Joseph Hoffman). They cover posture, technique, reading music and simple tunes ([O2](https://newatlas.com/one-piano-learning-system/38282/), [O4](https://thenextweb.com/reviews/2018/06/15/review-the-one-smart-keyboard-pro-uses-rgb-lights-to-help-you-play-piano/)), plus a voice calling finger numbers in practice ([O1](https://appleinsider.com/articles/15/07/25/first-look-the-one-smart-piano)).
- **How lights replace reading.**
  1. **Place.** The lit key *is* the answer. "All you have to do is press the right key at the right time, just like a video game" ([L7](https://roli.com/blog/5-common-beginner-musical-frustrations)).
  2. **Colour.** In ROLI's Rainbow mode each pitch has a colour (C red, D orange…), so "seeing notes in colour helps you navigate the keyboard" ([L2](https://musictech.com/reviews/roli-lumi-keys-1/)). ROLI also colours lights by **finger** ([L7](https://roli.com/blog/5-common-beginner-musical-frustrations)). The ONE colours by **hand**, red right and blue left ([O1](https://appleinsider.com/articles/15/07/25/first-look-the-one-smart-piano), [O7](https://apps.apple.com/us/app/the-one-smart-piano-by-the-one/id1267703721)).
  3. **Anticipation.** Keys light "as notes approach" ("Brightkey" shows the next note), so the falling note on screen and the light on the key arrive together ([L8](https://roli.com/experience/piano-learn)).
  4. **Fading.** Both products move learners off the crutch.
     - ROLI: the four-view ladder from Cascade to Classic ([L8](https://roli.com/experience/piano-learn)), and Night Mode, which lights only the keys you press ([L2](https://musictech.com/reviews/roli-lumi-keys-1/)).
     - The ONE: LEDs turn off after demonstration ([O1](https://appleinsider.com/articles/15/07/25/first-look-the-one-smart-piano)), and the company itself suggests turning the lights off sometimes ([O4](https://thenextweb.com/reviews/2018/06/15/review-the-one-smart-keyboard-pro-uses-rgb-lights-to-help-you-play-piano/)).
- **Weakness.** On The ONE Light the LED sits where "more often than not the LED is hidden by my hand" ([O3](https://blog.bestbuy.ca/musical-instruments/review-the-one-light-digital-piano)). ROLI lights the whole key ([Feefo review, reviews.csv](reviews.csv)).

### 5. Kids and parent angle

- **ROLI.**
  - No kids mode or age band. The App Store rating is 4+ ([L11](https://apps.apple.com/us/app/roli-learn/id1481450834)). Piano M keys are sized for adults but "even comfortable for kids" ([L9](https://roli.com/lumi-keys)).
  - Family Membership is $179.99/yr ([L9](https://roli.com/lumi-keys)), or a $24.99 IAP ([L11](https://apps.apple.com/us/app/roli-learn/id1481450834)). The number of profiles was not found.
  - A user wrote "my kids love it too" (reviews.csv).
- **The ONE has dedicated kids apps.**
  - *One Pianist by The ONE*: "Made for Ages 6–8", "family use", nursery songs, a "piano practiced game" ([O8](https://apps.apple.com/us/app/-/id1255389741)).
  - *The ONE Piano Sparring*: "help your kids to read music and follow the rhythm", synced with "Smart Piano Classroom" courses ([O9](https://apps.apple.com/app/id1240104076)).
  - The kids app was last updated in **2021** and is iOS-only. An Amazon buyer complained that "the kids app only seems to be available for apple products" (reviews.csv).
  - **Inference (high):** this kids track is effectively unmaintained.
  - An Amazon parent: "It teaches my 6 year old very well!" (reviews.csv).
- **Nobody targets ages 2–6 or the parent-and-child duet.** That is the open gap. **Inference (high).**

### 6. Motivation

- **ROLI.**
  - Points in Challenge and Play, note streaks in Cascade ([L2](https://musictech.com/reviews/roli-lumi-keys-1/)).
  - "maintain streaks", "set and achieve goals", milestone celebrations ([L8](https://roli.com/experience/piano-learn), [L10](https://roli.com/product/piano-m-learn)).
  - Personal-best games ([L3](https://gizmodo.com/the-lumi-keys-is-a-delightful-way-to-learn-piano-basics-1846403964)), and a progress tracker to "pause and reflect" ([L7](https://roli.com/blog/5-common-beginner-musical-frustrations)).
  - 3D game elements in Play ([L4](https://sennep.com/our-work/lumi)).
- **The ONE.** Rhythm games with scores and a two-player mode ([O2](https://newatlas.com/one-piano-learning-system/38282/)), and a gamified learning path from 2026 ([O6](https://apps.apple.com/us/app/-/id6472423235)).
- XP and leagues were not found for either.

## Monetization (software + hardware)

| item | price | source |
| --- | --- | --- |
| LUMI Keys (24 keys) | $299 / £299, with a $50 voucher for 12 months of LUMI Complete | [L2](https://musictech.com/reviews/roli-lumi-keys-1/), [L3](https://gizmodo.com/the-lumi-keys-is-a-delightful-way-to-learn-piano-basics-1846403964) |
| LUMI Complete (old) | $79/yr; about 40 songs free, 400+ with subscription | [L2](https://musictech.com/reviews/roli-lumi-keys-1/) |
| ROLI Piano M (2 octaves) | $259 (Oct 2024) | [L14](https://techcrunch.com/2024/10/08/roli-airwave-system-uses-ai-and-hand-tracking-to-teach-piano) |
| ROLI Piano (49 keys) | $599 regular, $399 early bird; $948 / $648 with Airwave | [L15](https://gearnews.com/roli-piano) |
| Airwave | $299 | [L14](https://techcrunch.com/2024/10/08/roli-airwave-system-uses-ai-and-hand-tracking-to-teach-piano) |
| ROLI Learn Solo / Family | $14.99 and $24.99 IAP; $119.99/yr and $179.99/yr renewal; "from $8.33/month" | [L11](https://apps.apple.com/us/app/roli-learn/id1481450834), [L9](https://roli.com/lumi-keys), [lumi-keys product](https://roli.com/product/lumi-keys) |
| ROLI hardware vs lessons | lessons beyond the first are not included in the hardware: "there's little point in buying the system if you're not going to also have the lessons" | [L13](https://musictech.com/reviews/education-courses/roli-piano-learning-system-review/) |
| The ONE Light (61 keys) | $299 retail, $199 Indiegogo (2015); $279.99 (2019) | [O2](https://newatlas.com/one-piano-learning-system/38282/), [O5](https://mightygadget.com/the-one-light-keyboard-review-a-smart-keyboard-that-can-teach-you-to-play/) |
| The ONE Smart Keyboard Pro | $799 (2018) | [O4](https://thenextweb.com/reviews/2018/06/15/review-the-one-smart-keyboard-pro-uses-rgb-lights-to-help-you-play-piano/) |
| The ONE Smart Piano (upright, 88) | $1,499 retail expected (2015) | [O2](https://newatlas.com/one-piano-learning-system/38282/) |
| The ONE legacy content | first 12 lessons free, then paid; sheet music 99¢ | [O3](https://blog.bestbuy.ca/musical-instruments/review-the-one-light-digital-piano), [O1](https://appleinsider.com/articles/15/07/25/first-look-the-one-smart-piano) |
| TheONE Smart Piano app (2024–) | $19.99/mo, $59.99/3 mo, $119.99/yr; "Max" $23.99/mo, $129.99/yr | [O6](https://apps.apple.com/us/app/-/id6472423235) |

Current The ONE hardware prices: **not verified**.

## Screens (composite; no first-hand app access)

| ID | screen | product | purpose | key components | evidence |
| --- | --- | --- | --- | --- | --- |
| S01 | Connect keyboard onboarding | ROLI | pair over BT in a few steps | pairing steps | [L4](https://sennep.com/our-work/lumi) |
| S02 | Learn: course / stage list | ROLI | linear video lessons + chapter challenges | stage cards | [L4](https://sennep.com/our-work/lumi), [L5](https://roli.com/blog/new-in-roli-learn-guided-practice-and-new-two-handed-lessons) |
| S03 | Video lesson with lit keys | both | teacher plays; keys light in sync | video, light sync | [L2](https://musictech.com/reviews/roli-lumi-keys-1/), [O3](https://blog.bestbuy.ca/musical-instruments/review-the-one-light-digital-piano) |
| S04 | Song player: Guided Practice | ROLI | note by note → slow → medium → full | view switcher (4), metronome, loop | [L5](https://roli.com/blog/new-in-roli-learn-guided-practice-and-new-two-handed-lessons) |
| S05 | Song player: Challenge | ROLI | scored run with good/perfect/late | score, markers | [L2](https://musictech.com/reviews/roli-lumi-keys-1/), [L3](https://gizmodo.com/the-lumi-keys-is-a-delightful-way-to-learn-piano-basics-1846403964) |
| S06 | Play / song library | ROLI | 1,000+ songs by difficulty | cover art, difficulty tags | [L4](https://sennep.com/our-work/lumi), [L8](https://roli.com/experience/piano-learn) |
| S07 | Games | both | lava, aliens, Springboard / KARA | game canvas | [L8](https://roli.com/experience/piano-learn), [O1](https://appleinsider.com/articles/15/07/25/first-look-the-one-smart-piano) |
| S08 | Scales and chords exercises | ROLI | choose a scale or chord, then a challenge | picker | [L8](https://roli.com/experience/piano-learn) |
| S09 | LED-guided sheet music | The ONE | staff with highlighted note; waits | staff, finger numbers, voice | [O1](https://appleinsider.com/articles/15/07/25/first-look-the-one-smart-piano) |
| S10 | Crash Course | The ONE | L/R segments with waterfall cues | segment list, resume | [O5](https://mightygadget.com/the-one-light-keyboard-review-a-smart-keyboard-that-can-teach-you-to-play/) |
| S11 | YouTube tutorial + lights | The ONE (2026) | play along with a selected YouTube video | embedded video, lit keys | [O6](https://apps.apple.com/us/app/-/id6472423235) |
| S12 | Kids Piano Journey | The ONE kids app | nursery songs easy → hard | journey map (inference) | [O8](https://apps.apple.com/us/app/-/id1255389741) |
| S13 | Light settings | ROLI | Rainbow / single colour / piano / night | toggles | [L2](https://musictech.com/reviews/roli-lumi-keys-1/) |
| S14 | AI coach conversation | ROLI (beta) | voice coaching | voice UI | [L12](https://roli.com/blog/introducing-ai-music-coach) |

## Flows

```
F01 ROLI: learn a song
    S06 pick song -> S04 note by note (keys light, app waits) -> slow -> medium -> full -> S05 Challenge for points
F02 The ONE: video lesson with lights
    S03 teacher demonstrates, LEDs show fingering -> LEDs off -> student plays unassisted
F03 The ONE: LED-guided practice
    S09 highlighted note + lit key -> wait for the correct key -> next note (voice calls finger numbers)
edge: Bluetooth drop, activation code expired (Trustpilot), server outage (App Store), hand hides LED
```

## Components

| component | variants | states | used on |
| --- | --- | --- | --- |
| Note lane | Cascade (vertical), Rainbow (horizontal colour), ColorNote, Classic | waiting, scrolling, slowed | S04, S05 |
| Key light | per-pitch colour, per-finger colour, per-hand (red/blue), single colour, night | next, pressed, off | hardware |
| Timing marker | good, perfect, late | — | S05 |
| Speed stepper | note-by-note, slow, medium, full; 0.5x, 0.75x | — | S04 |

## Inferred data model

```
Lesson      id, stage(1-3), video_url, light_track (MIDI-synced cues), challenge_id   evidence: L2 L5 O3 · medium
Song        id, difficulty(First Steps..Expert), arrangements[] (advanced versions)  evidence: L2 L5 · medium
PracticeRun user_id, song_id, step(note|slow|medium|full), score, markers[]           evidence: L3 L5 · guess
LightCue    t, key, colour_rule(pitch|finger|hand), hand                              evidence: L2 L7 O1 · medium
```

## Feature matrix

See `features.csv`. Must: 8, should: 9, could: 6, skip: 6.

## Out of scope

- The hardware (light-up keys, Airwave cameras, MPE). Little Duet has no keyboard of its own.
- Licensed songs, Hoffman Academy videos, and ROLI's coach videos and AI coach.
- **Inference (medium):** syncing to third-party YouTube tutorials raises licensing and terms-of-service questions. Do not copy it.

## Size

If Little Duet built the mechanism (a lit on-screen key synced to the video teacher, a wait-for-note step, a speed ladder): **M**. The hard part for Little Duet is that there is no light on a real home piano. The "light" must live on the phone screen or in the video, and input comes from the microphone, not MIDI.

## Lessons for Little Duet

Ideas only. No copying of their content, assets or copy.

**Worth learning from**
1. **Sync the teacher video to a key highlight.** The ONE's Hoffman lessons light keys exactly when the on-screen teacher plays ([O3](https://blog.bestbuy.ca/musical-instruments/review-the-one-light-digital-piano), [O4](https://thenextweb.com/reviews/2018/06/15/review-the-one-smart-keyboard-pro-uses-rgb-lights-to-help-you-play-piano/)). Little Duet can do the screen version: a timed cue track on each 3–5-minute class video that lights the key on the on-screen piano (or on a picture of the real keys) at the moment the teacher plays it.
2. **Demo → lights on → lights off.** The ONE's video tutorial shows the fingering with LEDs, then turns them off ([O1](https://appleinsider.com/articles/15/07/25/first-look-the-one-smart-piano)). This is a ready-made three-beat structure for each class: "watch me", "play with the glow", "play by yourself".
3. **Wait for the right note in practice.** Both products have it ([O1](https://appleinsider.com/articles/15/07/25/first-look-the-one-smart-piano), [L2](https://musictech.com/reviews/roli-lumi-keys-1/), [L6](https://roli.com/blog/top-5-lumi-music-app-practice-tips)). For ages 2–6 it should be the only mode in the first levels.
4. **A speed ladder as progress.** ROLI's note by note → slow → medium → full ([L5](https://roli.com/blog/new-in-roli-learn-guided-practice-and-new-two-handed-lessons)) gives each song visible steps without a timing score. This fits "progress per song".
5. **Colour by pitch for pre-readers** (C red, D orange…, [L2](https://musictech.com/reviews/roli-lumi-keys-1/)). This is a well-known general teaching approach, not ROLI's property. It could pair with removable colour stickers on the family's real piano (inference: an idea, untested).
6. **Replay a known song in harder versions** ([L5](https://roli.com/blog/new-in-roli-learn-guided-practice-and-new-two-handed-lessons)). This fits public-domain nursery songs across Little Duet's difficulty levels.
7. **A voice that calls out finger numbers** during practice ([O1](https://appleinsider.com/articles/15/07/25/first-look-the-one-smart-piano)). This aligns with Little Duet's teacher-voice decision.

**Avoid**
1. **"Late" markers.** An adult reviewer came to dread them ([L3](https://gizmodo.com/the-lumi-keys-is-a-delightful-way-to-learn-piano-basics-1846403964)).
2. **Abandoning the kids track.** The ONE's kids app is iOS-only and unchanged since 2021 ([O8](https://apps.apple.com/us/app/-/id1255389741), reviews.csv).
3. **Thin content behind a paywall.** Reviews of TheONE's current app repeat "very few songs" and "FEWER songs" (reviews.csv). Little Duet's 100 public-domain songs at launch is a strength. Show the count.
4. **Codes and activation friction.** ROLI Trustpilot reviewers say membership codes expired before the hardware arrived (reviews.csv). Little Duet's trial should start on first open, not on a code.
5. **Hardware dependence.** ROLI says lessons without the subscription are pointless ([L13](https://musictech.com/reviews/education-courses/roli-piano-learning-system-review/)), and a second unit is often recommended ([L2](https://musictech.com/reviews/roli-lumi-keys-1/)). Little Duet's "any piano or the on-screen piano" stance is a positioning advantage. **Inference (high).**
6. **Don't over-promise the mic.** Light-key products get exact MIDI input. Little Duet's mic must handle toy keyboards and noisy living rooms. Design the wait step to accept "close enough" and add a parent "tap to continue" fallback (inference, high).

## Reviews summary (n = 40, see reviews.csv)

Sources:
- ROLI side: App Store US 3, AppsHunter (App Store mirror) 5, Kimola (App Store GB) 6, Reddit r/ROLI via a Redlib mirror 5, Trustpilot 5, Feefo 1.
- The ONE side: App Store US 9 (3 apps), Amazon US via Kimola 6.
- Ratings are mostly not shown, so sentiment is read from the text.

Counts come from reading each excerpt by hand. Run on the excerpts alone, the pack's `reviews.py` matches bugs 4 (3 sources) and price 2. It misses phrasings like "errors", "do not load" and "servers down". Several themes are thin.

- **Top complaints**
  - Bugs, crashes and outages (song restarts, glitching after the rebrand, servers down, wrong Piano M count, songs won't load, purchases not showing): 8 reviews, 3 sources.
  - Too little content / too few songs: 3 reviews (The ONE app), 1 source (thin).
  - Subscription model / lessons not free: 1 negative and 1 neutral, 1 source (thin, mixed: 2 others say it is cheap vs lessons).
  - Activation codes expired / company trust: 3 reviews, 1 source (thin).
  - Hardware failure or missing cord: 3 reviews, 2 sources.
  - Kids app iOS-only: 1 review (thin).
  - Ads in the kids app: 1 review (thin).
- **Top praises**
  - Learning works / teaches well ("never thought I'd be a piano man", "teaches my 6 year old very well", "lesson part is the greatest"): 7 reviews, 3 sources.
  - Lights themselves ("whole key is lighted", "love how the keys light up"): 2 reviews, 2 sources.
  - Value vs piano lessons: 2 reviews, 1 source.

Excluded: 4 reviews on The ONE Piano Sparring app and 2 on One Pianist look low quality or possibly inauthentic (e.g. "Jolynn's fans are coming"), so they were not used.
