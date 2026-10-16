# Recon map: Hoffman Academy (web app, plus possibly iOS; see Unverified)

Scope: the teaching system — video lesson + Practice Session loop, curriculum and pacing, parent role, motivation, monetization
For: Little Duet (parent + child piano app, ages 2–6), competitor research only. No code, assets or copy are taken.
Date: 2026-10-16
Method: public pages only (no login, no paywall bypass, no bundles/APIs). Most of hoffmanacademy.com renders client-side, so its blog and marketing pages returned only metadata; the public `app.hoffmanacademy.com/lessons/.../practice-session` pages did render and are the main first-party evidence.

## Sources

| # | source | URL | notes |
| --- | --- | --- | --- |
| 1 | Practice Session page, L10 "Frog in the Middle" | https://app.hoffmanacademy.com/lessons/piano/frog-in-the-middle/practice-session | first-party; printables, task-type counts, Premium lock, "365 Practice Sessions" |
| 2 | Practice Session page, L13 "Chocolate" | https://app.hoffmanacademy.com/lessons/piano/chocolate/practice-session/ | first-party; 7 printables incl. songs from L1, L5, L6, L8, L10 |
| 3 | Practice Session page, L25 "Rain Come Wet Me" | https://app.hoffmanacademy.com/lessons/piano/rain-come-wet-me/practice-session/ | first-party; Unit 2 |
| 4 | Practice Session page, L61 "Intervals" | https://app.hoffmanacademy.com/lessons/piano/intervals/practice-session | first-party; Unit 4, adds Sight Reading + Instructions tasks |
| 5 | Practice Session page, L290 "Autumn Moon" | https://app.hoffmanacademy.com/lessons/piano/autumn-moon-artistry/practice-session | first-party; Unit 15, Hanon technique |
| 6 | Unit 1 lesson list (YouTube, via Class Central) | https://classcentral.com/classroom/youtube-beginning-piano-unit-1-48225 | 22 lesson titles, Unit 1 |
| 7 | Solfège blog page | https://stratos.hoffmanacademy.com/blog/solfege-hand-signs | "why we teach solfège to all Hoffman Academy students"; 300+ lessons |
| 8 | /parents and /for-homeschool meta | https://www.hoffmanacademy.com/parents ; https://hoffmanacademy.com/for-homeschool | "kids aged 5+"; homeschool "5-12" |
| 9 | Old Schoolhouse review, Aug 2017 | https://www.theoldschoolhouse.com/product-reviews/?rid=6382 | Practice Sessions, points, games, $15/mo or $149/yr then |
| 10 | Old Schoolhouse reviews, Jul 2014 | https://www.theoldschoolhouse.com/product-reviews/?rid=5431 | listening CD, practice CD, readiness rule, parent guides |
| 11 | The Curriculum Choice, Nov 2015 | https://thecurriculumchoice.com/?p=11236 | 6 units/120 videos, homework per lesson, unit materials $19 |
| 12 | Weird Unsocialized Homeschoolers, 2015 (sponsored) | https://www.weirdunsocializedhomeschoolers.com/free-online-piano-lessons-a-hoffman-academy-review/ | 5–15 min videos, 20 lessons/unit, "Tyrannosaurus arms" |
| 13 | BYU Magazine, Summer 2016 | https://magazine.byu.edu/?p=28101 | origin story, YouTube, Kickstarter "Hoffman Academy 2.0" |
| 14 | homeschool.com listing | https://www.homeschool.com/resource-guide/hoffman-academy/ | ear-first start ("no sheet music!"), $143/yr, $416 lifetime (undated) |
| 15 | Preply blog, Jun 2026 | https://preply.com/en/blog/best-piano-learning-apps-kids/ | Premium $24/mo or $239/yr; "no real-time feedback"; web + iOS |
| 16 | Pianoers, Feb 2026 | https://pianoers.com/best-free-piano-learning-apps/ | $24/mo or $239/yr; "No real-time feedback" |
| 17 | HackerNoon, Feb 2026 | https://hackernoon.com/best-piano-learning-apps-in-2026-an-in-depth-comparison-of-music-education-technology | "no AI recognition or real-time feedback"; says web only |
| 18 | The Learning Basket (undated) | https://thelearningbasket.com/?p=3016 | "One parent should be dedicated to watch and do the lessons with the child" |
| 19 | Hoffman Method page (in-person Portland school) | https://portland.hoffmanacademy.com/about/hoffman-method/ | skill areas; parents attend lessons for age ≤9 (in-person school, not the app) |
| 20 | Trustpilot | https://www.trustpilot.com/review/www.hoffmanacademy.com | 4.7 TrustScore, 161 reviews |
| 21 | Well-Trained Mind forum threads | https://forums.welltrainedmind.com/topic/667630-hoffman-academy ; https://forums.welltrainedmind.com/topic/695370--/ | homeschool parents |

Blocked or unreadable (not used): hoffmanacademy.com blog body text (client-rendered: getting-started, what-should-practice-time-look-like, when-to-move-on-to-the-next-lesson, live-qa-index, materials-for-lesson-1), www.hoffmanacademy.com/pricing, pianistscompass.org review, an individual lesson page, Apple customer-review RSS (robots-disallowed). The permission requests for these timed out.

## Core loop

Watch a short free video lesson from one teacher (Mr. Hoffman). Then do that lesson's Premium "Practice Session": a fixed, authored checklist of typed tasks that drills the new piece alongside earlier repertoire. Repeat daily, 2–3 new lessons a week.

## Teaching & video mechanism

### 1. Lesson format: what a lesson is made of

- **Two halves per lesson: video (free) + Practice Session (Premium).** "After each video lesson, there is a coordinating practice session" (source 9). The practice page describes "step-by-step practice instructions and tips from Mr. Hoffman" plus "sheet music, worksheets, and audio practice tracks corresponding to each video lesson" (sources 1, 5).
- **Video:** one teacher on camera, 5–15 minutes per video (sources 10, 11, 12), "about 10 minutes" (source 10), and the original 2016 Lesson 1 was a "10-minute video" (source 13). The tone is humorous, with games and jokes. One example is posture taught as "Tyrannosaurus arms" (source 12). Puppets appear: "finger puppets and all" (forum, source 21), and reviewers name "a puppet show at the end of each lesson" as the reward (reviews.csv). Videos are also published on YouTube (sources 6, 13).
- **Practice Session anatomy (first-party, sources 1–5):** a landing page that lists the **Required Printables** (each tied to a unit workbook page) and **"What you'll do in this Practice Session"**: counts by task type, plus **Begin Practice Session / Start over / Skip Practice Session** buttons. Task types seen: *Repertoire, Technique, Music Theory, Super Challenge, Game, Sight Reading, Instructions*.

  | lesson | unit | tasks | mix |
  | --- | --- | --- | --- |
  | L10 Frog in the Middle | 1 | 11 | 7 Repertoire, 1 Technique, 1 Super Challenge, 1 Game, 1 Music Theory |
  | L13 Chocolate | 1 | 12 | 9 Repertoire, 1 Technique, 1 Super Challenge, 1 Game |
  | L25 Rain Come Wet Me | 2 | 10 | 6 Repertoire, 2 Music Theory, 2 Super Challenge |
  | L61 Intervals | 4 | 9 | 1 Instructions, 1 Music Theory, 4 Repertoire, 1 Technique, 1 Sight Reading, 1 Game |
  | L290 Autumn Moon | 15 | 9 | 6 Repertoire, 2 Technique (Hanon), 1 Game |

- **Length of practice:** one reviewer's child took "about twenty minutes or so" per session (source 9). The pages give no timer or duration (sources 1–5).
- **How video and practice alternate:** the video introduces a song or concept. The Practice Session is the "homework" until the next lesson (source 11). The recommended cadence is "two to three lessons per week and practice every day" (source 9). Older (2014) guidance had the child listen to the songs first, watch the video, do the worksheet, then play along with the practice track once the song was mastered (source 10).
- **Unit structure:** about 20 lessons per unit (source 12). Unit 1's titles (source 6) show a deliberate rotation of skill types: L1 play first song (Hot Cross Buns), L2 improvise with that same song, L3 musical alphabet, L4 find C D E, L5 posture, L5 Part 2 to L8 new short pieces, L9 dictate the rhythm of Hot Cross Buns, L10 new song, L11 find A and B, L12 compose your own rhythm, L13 new song (Chocolate) plus L13 Part 2 improvise with it, L15 dictate the rhythm of Frog in the Middle, L16 finger numbers, and so on. **Pattern: learn a song by ear, then improvise on it, then dictate its rhythm.** The same song gets reused across three skill types.
- **Scale over time:** 60 lessons (2014), 120 in 6 units (2015), 160 (2016), 170+ in 9 units (2017), 300+ lessons and 365 Practice Sessions (2026; L290 is in Unit 15). "New Practice Sessions are added every week" (source 1).

### 2. Input and feedback

- **The app does not hear the child.** Three independent 2026 reviews say so: "no real-time feedback on your child's playing" (15), "No real-time feedback" (16), "no AI recognition or real-time feedback; the value is in the teaching itself" (17). No first-party page mentions mic or MIDI input.
- **Feedback comes from the parent and the child's own judgment.** A forum parent says "a parent really does need to supervise the child's progress" (reviews.csv). Another describes the parent's job as "just making sure they're listening and practicing correctly" (source 21, thread 667630). One undated review says parents could send videos to the Hoffmans for posture feedback (source 18). Current availability is unverified.
- **Self-check criterion:** 2014 guidance said a child "should be able to play a song from start to finish without missing a note" before moving on to the play-along track (source 10).
- **Completion is self-reported:** the practice page includes an "Activity successfully completed!" + "Continue" state and a "+ 9,999" points-style counter (sources 1, 2). *Inference (high): the child or parent taps to mark each task done; nothing is graded automatically.*

### 3. Curriculum and pacing

- **Ear-first, sound before symbol.** "Students begin by learning music by ear… no sheet music!" (source 14). Daily listening to the unit's songs was encouraged: "listen to the CD in its entirety daily if possible" (source 10). "Kids are more confident in their piano playing if they really know the music" (source 11).
- **Solfège with hand signs from Unit 1.** A "Solfège Hand Signs – Reference" printable is required in the L10 and L13 sessions (sources 1, 2). Hoffman says it teaches solfège "to all Hoffman Academy students" (source 7).
- **Kodály lineage:** *inference, medium confidence.* Solfège with hand signs, folk-song repertoire (Hot Cross Buns, Rain Come Wet Me, Oranges & Lemons, Love Somebody), rhythm dictation and improvisation all match Kodály-style practice. No fetched source names Kodály.
- **Rhythm syllables (ta / ti-ti):** **unverified.** Rhythm dictation and composition lessons exist (L9, L12, L15; source 6), but no readable source names the syllable system.
- **Skill strands:** "ear-training, rhythm, sight reading, technique, improvisation, and music theory" (source 9), plus composition and solfège (source 19).
- **What comes next is a fixed linear sequence**, self-paced. Learners "progress at their own pace" (source 9) and can rewatch any video. The dashboard shows "what's completed and what's next" (source 9). Families skip ahead with **Skip Practice Session** (source 1).
- **Built-in review (strong finding).** Each Practice Session reassigns earlier repertoire. The L13 session requires sheet music for Chocolate (L13), Frog in the Middle (L10), Hot Cross Buns (L1), D Journey (L5), C Boogie (L6) and Five Woodpeckers (L8) (source 2). L10 requires Hot Cross Buns (L1) (source 1). L61 requires a Unit 3 piece (source 4). *Inference (high): this is authored cumulative review baked into each lesson's checklist, the same for every student, not an adaptive spaced-repetition algorithm.* The 2015 routine also included "reviews songs from earlier lessons" (source 11).
- **Difficulty ramps by adding task types:** Sight Reading and "Instructions" tasks appear by Unit 4, and Hanon technique appears by Unit 15 (sources 4, 5).

### 4. Guidance: teacher voice and parent coaching

- **The teacher's voice carries the instruction.** Mr. Hoffman speaks directly to the child on video, and Practice Sessions carry "tips from Mr. Hoffman" (source 1).
- **Parent coaching:** a downloadable **Parent's Guide** introduces the program and offers "tips on managing piano lessons with kids" (sources 10, 11). The parent's practical jobs are printing workbook pages (source 9: the daughter "does need me to download and print" them), keeping a schedule, and supervising. "One parent should be dedicated to watch and do the lessons with the child" (source 18). A non-musician parent can run it: "makes teaching piano easy even for parents who don't know how to play the piano themselves" (source 10).
- **Posture and finding keys** are their own early lessons: L3 musical alphabet, L4 find C D E, L5 posture, L7 find F and G, L11 find A and B, L16 finger numbers (source 6).
- **Onboarding:** a "getting started" blog article and a "materials for lesson 1" article exist, but their bodies could not be read (client-rendered).

### 5. Kids and parent angle

- **Minimum age 5** ("kids aged 5+", source 8). The homeschool page targets "5-12" (source 8). Third-party sources say 5–10 (15, 16) and 5–12 (17). One Trustpilot parent claims use "since our children were babies" (single, unverified claim).
- **High parent involvement for young children:** the parent prints, schedules, supervises and checks correctness. Siblings sometimes had to be separated to reduce competition (source 10).
- **Homeschool is a core channel:** a dedicated /for-homeschool page, a homeschool.com listing, an ESA vendor listing (NH scholarship fund; seen in search results only), and a homeschool reviewer base.
- **Multi-child:** "I pay $33/mo for three kids" (forum). *Inference (medium): Premium is priced per student, with a multi-student discount.* "Lifetime membership for both of our children" (Trustpilot).
- **Skews young:** "it does stay 'young' for at least the first several units, finger puppets and all" (forum).

### 6. Motivation

- **The character and puppet payoff at the end of each lesson** is the most-praised reward (4 of 40 sampled reviews mention puppets, stories or characters).
- **Points:** students earn points for lessons and practices. In 2017 "points did not 'earn' anything" (source 9). The 2026 practice pages show a "+ 9,999" counter (sources 1, 2).
- **Games tab:** Alphabet Towers, Mystery Melodies, Staff Crawler (2017, source 9). One Game task sits inside most Practice Sessions (sources 1–5).
- **Progress dashboard:** shows completed and next items (source 9). Premium adds "progress tracking" (15).
- **Recital page** where students post performance videos (source 13, 2016). Current status is unverified.
- **Offline rewards** suggested by Mr. Hoffman: "When he would complete a song I would give him a small reward" (source 10).
- No evidence of badges or streaks in readable sources.

### 7. Monetization

- **Free:** all video lessons (300+), on the site and on YouTube (sources 6, 7, 15).
- **Premium:** Practice Sessions ("Get Premium to unlock all 365 Practice Sessions"), printables, audio tracks, games, progress tracking (sources 1, 9, 15).
  - 2026 third-party prices: **$24/month or $239/year** (15, 16), with a range of $18–24/month and $179–239/year (17).
  - 2017: $15/month or $149/year (9).
  - Undated: $143/year, $416 lifetime (14).
- **Lifetime memberships** exist: the original Kickstarter backers, plus Trustpilot mentions of holiday-sale lifetime offers.
- **Unit materials** were historically sold per unit for $19–20 (sources 11, 12, 18). "In their store, you can buy the materials for some units individually" (forum, 2021).
- The official pricing page could not be read, so **current prices are unverified first-party.**

## Screens

| ID | screen | route / how to reach | purpose | key components | states seen |
| --- | --- | --- | --- | --- | --- |
| S01 | Lesson video | /lessons/piano/{slug} | watch free video | video player, lesson number/title, link to Practice Session | not read (blocked) |
| S02 | Practice Session overview | /lessons/piano/{slug}/practice-session | show what today's practice contains | Required Printables list (title, unit, page), task-type counts, Begin / Start over / Skip | locked (Premium badge, Get Premium CTA) |
| S03 | Practice task runner | from S02 "Begin" | step through tasks | *guess:* instruction text, audio track, done button | not seen (Premium) |
| S04 | Task complete | inside S03 | confirm completion, award points | "Activity successfully completed!", Continue, points counter | markup present on S02 |
| S05 | Games tab | nav | standalone theory/ear games | game tiles | 2017 description only |
| S06 | Dashboard / progress | nav | what's done, what's next | lesson list with status | 2017 description only |
| S07 | Printables / store | nav | download or buy unit workbooks | unit list | described only |
| S08 | Get Premium | from S02 | upsell | plan options | CTA seen, page not read |

## Flows

```
F01 Child does today's lesson
    S01 watch video (5–15 min) -> S02 overview -> print listed pages -> S03 tasks 1..n -> S04 per task -> next lesson
    happy path clicks: ~3 + one per task (9–12 tasks)
    edge: printables not printed; free user hits Premium lock at S02; skip session
F02 Parent checks progress
    S06 -> see completed / next
```

## Components

| component | variants | states | used on |
| --- | --- | --- | --- |
| Printable row | sheet music, theory, reference, guide | — | S02 |
| Task-type chip with count | Repertoire, Technique, Music Theory, Super Challenge, Game, Sight Reading, Instructions | — | S02 |
| Premium lock badge + CTA | — | locked | S02 |
| Completion toast/modal | — | success | S04 |

## Inferred data model

```
Unit          number, title, workbook (pages)                 evidence: printables "Unit 1, page 23"      confidence: high
Lesson        number (1..300+), part (e.g. 5 Part 2), slug, title, unit, video_url, free=true
              evidence: URLs, Unit 1 titles                    confidence: high
PracticeSession  lesson_id (1:1), tasks[], printables[], premium=true
              evidence: S02 pages, "365 Practice Sessions"     confidence: high
Task          session_id, type (repertoire|technique|music_theory|super_challenge|game|sight_reading|instructions),
              piece_ref (may point to an EARLIER lesson's piece), order
              evidence: task counts + printables list           confidence: medium (fields are guesses)
Printable     title, kind, unit, page                          confidence: high
StudentProgress  student_id, task/session completed, points    evidence: 2017 review, completion markup   confidence: medium
Student       account has multiple students (family)           evidence: "$33/mo for three kids"          confidence: guess
```

Relationships: Unit 1-n Lesson; Lesson 1-1 PracticeSession; PracticeSession 1-n Task; Task n-1 Piece (from any earlier lesson); Account 1-n Student.

## Feature matrix

See `features.csv`. Must: 9, should: 8, could: 5, skip: 3 (priority = relevance to Little Duet).

## Reviews summary (40 sampled, 2 sources: Trustpilot 30, Well-Trained Mind forum 10)

Caveats: the Trustpilot sample is dominated by a burst of 5-star reviews dated 2–4 August 2022. *Inference (high): a solicited review campaign.* Two identical July 2025 reviews ("Hoffman is the Best!") look suspicious and were excluded. All text is a verbatim excerpt, not the full review. The Apple RSS feed was robots-blocked, so no App Store reviews were collected.

Top praises (count of 40):
- Practice Sessions give structure and accountability: 6 ("accountability built into the practice sessions is exactly what we need")
- Kids motivated / practice without fights: 6 ("piano practice is a treat instead of a fight!")
- Teacher quality, patient and funny: 5
- Puppets, stories, characters: 4 (puppet show at end of lesson; overlaps with "young")
- Real musicianship (solfège, theory, reading): 3
- Self-pace / independence: 4

Top complaints (thin; mostly from 1–3 star reviews):
- Billing, charges, lifetime transition: 3 (Trustpilot only), plus 1 lost purchased materials
- Paywall needed after Unit 1 / can't afford Premium: 2 (forum only)
- Parent must supervise: 1 explicit, plus 2 related parent-role mentions
- Feels too young for older kids: 2 (forum only)
- Web app buggy: 1; wants a technique unit: 1

## Out of scope (cannot or should not be cloned)

- Mr. Hoffman's videos, persona, puppets, song arrangements, workbooks and audio tracks (their content).
- Their curriculum sequence and song list as authored. Little Duet uses public-domain folk tunes chosen on its own.
- The YouTube audience and the homeschool/ESA vendor relationships.

## Size

Screens 8, flows 2, entities 7. Hard parts: authoring 300+ videos and checklist sessions (content, not code); keeping printables in sync with sessions. The engineering is small. A Hoffman-style system is S–M to build and XL to fill with content.

## Unverified

- Whether a native iOS app exists. Preply (2026) says "Web and iOS app"; HackerNoon (2026) says "no native mobile app". No App Store listing was found.
- Current official prices; whether Premium is per student; family plan terms.
- What a task screen (S03) looks like inside: timers, audio playback, repetition counts.
- The rhythm syllable system; Kodály named explicitly.
- Whether video feedback from teachers still exists.

## Lessons for Little Duet

Ideas only. Do not copy their videos, songs-as-arranged, characters or wording.

Worth learning from:
1. **Split "learn" from "practice" and make practice a short, typed checklist.** A Hoffman session has 9–12 small tasks of named types. For ages 2–6, use 3–5 micro-tasks (sing it, tap the rhythm, find the key, play together, bonus challenge). *Inference: their 9–12 tasks and roughly 20 minutes are too long for 2–4-year-olds.*
2. **Bake review into every session as authored content.** Earlier songs come back inside today's checklist. This gives spaced review without an algorithm, and it is cheap to build.
3. **One song, three skills.** Learn it by ear, then improvise on it, then clap or dictate its rhythm. This multiplies a small song library into many lessons, which fits a toddler repertoire of 5–10 folk tunes.
4. **Ear-first.** Daily listening before playing, solfège-style singing, no notation at the start. This suits pre-readers even better than Hoffman's 5+ audience.
5. **An end-of-lesson character payoff** is the most-loved reward in reviews. Build an original character moment as the "finish" beat.
6. **Give the parent a simple pass rule** ("plays it start to finish without a mistake") in place of listening tech. If Little Duet adds mic detection, keep the parent's check as the fallback.
7. **Teach finding keys and posture as named, playful mini-lessons early** (they spend about 5 of the first 16 lessons on this).

Avoid:
1. **Depending on printing.** Parents have to print workbook pages. Little Duet should keep everything on screen.
2. **Long videos for toddlers.** Theirs run 5–15 min. Aim for 1–3 min clips (*inference*).
3. **Billing friction:** surprise renewals after trials, a messy switch from annual to lifetime, purchased materials disappearing. Use clear trial-end reminders and keep purchases permanently in the library.
4. **A free tier that strands families after the first unit.** The value is in practice, so gate it gently (for example, the first N sessions free).
5. **No feedback at all.** A parent who is not a musician cannot judge correctness. Give them concrete look-fors per task.
