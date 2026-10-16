# Recon map: Piano Maestro (iPad only)

Scope: the teaching loop (lesson format, recognition and feedback, Journey curriculum and pacing, guidance, teacher/parent tools, motivation, monetization).
For: Little Duet, a kids' piano app for a parent and child (ages 2–6). Research only. No code, assets or copy are taken.
Date: 2026-10-16
Method: replica-recon, plus a light replica-entrepreneur pass. Public sources only, no login, no scraping. Every claim links to a source. Anything marked **Inference** is my reading, with a confidence level.

## Sources

| # | source | URL | notes |
| --- | --- | --- | --- |
| 1 | App Store listing (US) | https://apps.apple.com/app/id604699751 | 4.6★ from 27K ratings, 4+, prices, version 12.1 |
| 2 | App Store reviews (US, see all) | https://apps.apple.com/us/app/piano-maestro/id604699751?see-all=reviews&platform=ipad | 10 reviews |
| 3 | App Store GB / AU | https://apps.apple.com/gb/app/piano-maestro/id604699751 · https://apps.apple.com/au/app/piano-maestro/id604699751 | 4 + 4 reviews |
| 4 | Help: What is Piano Maestro (Feb 2026) | https://piano-help.hellosimply.com/en/articles/13750687-what-is-piano-maestro | positioning vs Simply Piano, iPad only |
| 5 | Journey curriculum, chapter by chapter | https://teachers.hellosimply.com/assets/guidelines/PM_ChapterByChapter_Curriculumm.pdf | 37 chapters, free zone |
| 6 | Same curriculum (older host) | https://www.hellosimply.com/teachers/resources/sheetmusic/PianoMania_RankCurriculum.pdf | |
| 7 | Teacher's Guideline (hellosimply) | https://teachers.hellosimply.com/assets/guidelines/Piano Maestro – Teacher’s Guideline.pdf | Journey, Library, Learn, "Hold on" |
| 8 | Teacher Guideline (joytunes.com) | https://www.joytunes.com/sheetmusic/PMTeacherGuideline.pdf | Play vs Learn, pause practice options |
| 9 | Podcast ep. 111 transcript (Becki Laurent, JoyTunes, Sep 2021) | https://mpetersonmusic.com/ep-111-transcription | design intent, stars, Learn mode, backing tracks |
| 10 | Podcast ep. 111 page | https://mpetersonmusic.com/podcast/episode111 | |
| 11 | Common Sense Media (parents) | https://www.commonsensemedia.org/app-reviews/piano-maestro-by-joytunes | age 9+, stars, mascot |
| 12 | Common Sense Education | https://www.commonsense.org/education/reviews/piano-maestro-by-joytunes | Pre-K–12, "Guitar Hero-style" |
| 13 | ColorInMyPiano (teacher, 2015/2016) | https://colorinmypiano.com/2015/01/27/ipad-app-review-piano-maestro/ | scoring, Share the Moment, reports |
| 14 | Ensemble Schools (teacher, Apr 2025) | https://www.ensembleschools.com/catoctin-music/music-app-review-piano-maestro-by-joytunes-embracing-technology-and-sparking-motivation/ | Learn/Play points, ranks, prices, ghost notes |
| 15 | hellosimply.com/teachers | https://www.hellosimply.com/teachers | 28,000+ teachers, 2,800 songs |
| 16 | "Why Piano Maestro is now free" (old blog) | https://old.hellosimply.com/blog/?p=234 | free for teachers and students, Share the Moment |
| 17 | Leila Viss, MTNA report (Apr 2014) | https://www.leilaviss.com/blog/music-technology/joytunes-and-mtna-part-two | formerly Piano Mania, weekly emails |
| 18 | Tech & Learning (Feb 2016) | https://techlearning.com/resources/interactive-piano-app-offers-fun-feedback | |
| 19 | Weizmann Compass (Oct 2018) | https://www.weizmann.ac.il/WeizmannCompass/node/1756 | product line, recognition engine |
| 20 | Engineering blog, part 2 | https://medium.com/hellosimply/a-look-under-the-hood-of-simply-piano-part-2-3ba3cafa1bbf | recognition engine; first JoyTunes piano app 2012 |
| 21 | JoyTunes patents | https://patents.justia.com/assignee/joytunes-ltd · https://patents.justia.com/patent/9492756 | see the Simply Piano recon for detail |
| 22 | Vendor-commissioned user review | https://old.hellosimply.com/blog/?p=838 | "Exclusively Written for JoyTunes", so biased |
| 23 | Reviews | see `reviews.csv` | 20 rows |

## Core loop

The teacher assigns a song, or the student picks the next Journey chapter. The student plays scrolling sheet music on a real piano over a full live-musician backing track. The app scores note and rhythm accuracy for up to 3 stars, then the student levels up, unlocks the next chapter, and the teacher sees it in the weekly report.

## Teaching & video mechanism

### 1. Lesson format

- **Practice game, not a course with videos.** Piano Maestro "was developed to be a sight reading app" ([ep. 111](https://mpetersonmusic.com/ep-111-transcription)). It is positioned for "piano teachers and their students" ([help 13750687](https://piano-help.hellosimply.com/en/articles/13750687-what-is-piano-maestro)). I found no source describing teaching videos in Piano Maestro. **Inference (medium):** concepts are taught by the human teacher, and the app supplies practice and feedback. This is the key contrast with Simply Piano's video-led lessons.
- **Unit of play: a short piece of scrolling notation.** Common Sense Media describes "a scrolling Guitar Hero-style interface" where "users have to play the right notes as they scroll by" ([Common Sense Media](https://www.commonsensemedia.org/app-reviews/piano-maestro-by-joytunes)). It is real staff notation: the app helps "make sheet music come to life" ([App Store](https://apps.apple.com/app/id604699751)).
- **Backing tracks are central.** "Backing tracks are recorded in-house by live musicians", and they sound full even at beginner level, so students feel part of an ensemble ([ep. 111](https://mpetersonmusic.com/ep-111-transcription)). Playing with the track "helps reinforce a sense of steady beat and good rhythm" ([ColorInMyPiano](https://colorinmypiano.com/2015/01/27/ipad-app-review-piano-maestro/)).
- **Two modes per song** ([PMTeacherGuideline](https://www.joytunes.com/sheetmusic/PMTeacherGuideline.pdf)):
  - **Play:** "play the full song in full speed".
  - **Learn:** "a step-by-step 'hand made' learning process designed to prepare him/her for the full version". It breaks the song into sections ([Teacher's Guideline](https://teachers.hellosimply.com/assets/guidelines/Piano%20Maestro%20%E2%80%93%20Teacher%E2%80%99s%20Guideline.pdf)), and students "perfect each section before moving onto the next".
  - Becki Laurent's description of Learn mode: one hand, then the other, then both together, then with a metronome or backing track, gradually speeding up ([ep. 111](https://mpetersonmusic.com/ep-111-transcription)).
- **Length.** Journey has about 130 titles across 37 chapters, 3–4 pieces each ([curriculum PDF](https://teachers.hellosimply.com/assets/guidelines/PM_ChapterByChapter_Curriculumm.pdf), [ColorInMyPiano](https://colorinmypiano.com/2015/01/27/ipad-app-review-piano-maestro/)). **Inference (medium):** early pieces last well under a minute. No source gives durations.

### 2. Input and feedback

- **Listening.** The iPad microphone listens to an acoustic piano or keyboard, "as long as your piano is in tune" ([ep. 111](https://mpetersonmusic.com/ep-111-transcription), [ColorInMyPiano](https://colorinmypiano.com/2015/01/27/ipad-app-review-piano-maestro/)). MIDI is available over a USB adaptor, including group lessons on several iPads ([PMTeacherGuideline](https://www.joytunes.com/sheetmusic/PMTeacherGuideline.pdf)). There is a touch mode with an in-app keyboard ([App Store](https://apps.apple.com/app/id604699751), [Common Sense Media](https://www.commonsensemedia.org/app-reviews/piano-maestro-by-joytunes)).
- **Engine.** **Inference (high):** this is the same JoyTunes acoustic recognition engine as Simply Piano. Weizmann describes one "acoustic recognition engine" behind the company's apps ([Weizmann](https://www.weizmann.ac.il/WeizmannCompass/node/1756)). The first JoyTunes piano app launched on iOS in 2012 on an Accelerate-framework engine ([Medium pt 2](https://medium.com/hellosimply/a-look-under-the-hood-of-simply-piano-part-2-3ba3cafa1bbf)). The patents describe expected-note thresholds, backing-track subtraction and timing windows (see the Simply Piano recon and [US 9,492,756](https://patents.justia.com/patent/9492756)).
- **Scoring.** "Students are rated on note and rhythm accuracy and awarded points for accuracy." ([Ensemble Schools](https://www.ensembleschools.com/catoctin-music/music-app-review-piano-maestro-by-joytunes-embracing-technology-and-sparking-motivation/)). Stars are based on "accuracy and other measures such as technique, rhythm, and sight reading" ([Common Sense Education](https://www.commonsense.org/education/reviews/piano-maestro-by-joytunes)).
  - Up to 3 stars per song, like Angry Birds' "get your three stars" ([ep. 111](https://mpetersonmusic.com/ep-111-transcription)).
  - Transposable songs show "zero out of 12 stars", 3 stars per key (same source).
- **Wrong note or pause.** The default Play mode keeps scrolling with the track. **Inference (medium):** misses lower the score and the music does not stop. On pause, practice options appear ([PMTeacherGuideline](https://www.joytunes.com/sheetmusic/PMTeacherGuideline.pdf), [Teacher's Guideline](https://teachers.hellosimply.com/assets/guidelines/Piano%20Maestro%20%E2%80%93%20Teacher%E2%80%99s%20Guideline.pdf)):
  - change the tempo;
  - show or hide note names;
  - choose which hand to practise;
  - **"Hold on"**, where notes "wait until played correctly" (a wait mode).
- **Feedback limits.**
  - It covers only notes and rhythm: it "does not help students learn other elements of good playing" ([ColorInMyPiano](https://colorinmypiano.com/2015/01/27/ipad-app-review-piano-maestro/)).
  - It is not detailed enough for "tricky passages or tough fingerings" ([Common Sense Media](https://www.commonsensemedia.org/app-reviews/piano-maestro-by-joytunes)).
  - Room noise can produce "ghost notes", so MIDI is recommended ([Ensemble Schools](https://www.ensembleschools.com/catoctin-music/music-app-review-piano-maestro-by-joytunes-embracing-technology-and-sparking-motivation/)).
- **Latency.** No Piano Maestro-specific information. The engine runs on device (inference from [Medium pt 2](https://medium.com/hellosimply/a-look-under-the-hood-of-simply-piano-part-2-3ba3cafa1bbf), medium confidence).

### 3. Curriculum and pacing

The Journey adds one variable at a time. Each chapter header names the hand, the note range and the rhythm ([curriculum PDF](https://teachers.hellosimply.com/assets/guidelines/PM_ChapterByChapter_Curriculumm.pdf)):

| chapters | focus |
| --- | --- |
| 1 | "Right hand, Middle C only (C4), quarters and half notes" |
| 2–4 | right hand C–D, then C–E with steps, then skips |
| 5–6 | hands "not simultaneously", one or two notes per hand. **End of free zone** |
| 7–13 | left hand G3–C4; hands alternating; right-hand C position |
| 14–16 | eighth notes |
| 17 | first hands together |
| 18–23 | F3, dotted quarter, coordination and mirror challenges, syncopation |
| 24–34 | C / F / G positions, B♭, F♯, shifting positions |
| 35–37 | intermediate |

- **Chapter count.** Other sources say 38 chapters ([Common Sense](https://www.commonsensemedia.org/app-reviews/piano-maestro-by-joytunes)) and the v5.0 notes mention "50-chapter Journey" ([App Store](https://apps.apple.com/app/id604699751)). The count has changed over time.
- **Unlocking.** Students "need to level up and unlock new sections by mastering the chapter's content" ([Teacher's Guideline](https://teachers.hellosimply.com/assets/guidelines/Piano%20Maestro%20%E2%80%93%20Teacher%E2%80%99s%20Guideline.pdf)).
- **Library.** 2,800+ songs and exercises ([App Store](https://apps.apple.com/app/id604699751), [hellosimply teachers](https://www.hellosimply.com/teachers)). Popular songs come in several versions: primer, late elementary, melody only, and intermediate with full chords ([ep. 111](https://mpetersonmusic.com/ep-111-transcription)). The Library also has method books (Alfred, Piano Pronto, Hal Leonard and others) and technique (scales, Hanon, Czerny).
- **Adaptivity.** It is teacher-driven, through the order the teacher assigns, plus student-chosen tempo and hand options. I found no evidence of automatic adaptivity in Piano Maestro. **Inference (low):** the adaptive patents may apply, but nothing confirms it.
- **Placement.** None documented. Teachers unlock Journey chapters for students ([Teacher's Guideline](https://teachers.hellosimply.com/assets/guidelines/Piano%20Maestro%20%E2%80%93%20Teacher%E2%80%99s%20Guideline.pdf), "Unlocked Journey chapters" listed as a free teacher resource).

### 4. Guidance

- **The human teacher teaches. The app is "your eyes and ears throughout the week"** ([hellosimply teachers](https://www.hellosimply.com/teachers)).
- **In-app guidance:**
  - an animated "maestro" character in the corner cheers students on ([ep. 111](https://mpetersonmusic.com/ep-111-transcription));
  - a ticking metronome;
  - note names on screen and on the keyboard as an option.

  Common Sense describes "A dancing mascot, a ticking metronome, and background music", and lists them as possibly distracting, though some can be turned off ([Common Sense Media](https://www.commonsensemedia.org/app-reviews/piano-maestro-by-joytunes)).
- **Posture and finding keys.** No documented tutorials. Common Sense says the app is "probably not ideal for little kids just learning how to play" because a device doesn't reinforce hand position ([Common Sense Media](https://www.commonsensemedia.org/app-reviews/piano-maestro-by-joytunes)).

### 5. Kids, parent and teacher angle

- **Ages, by source:**
  - Common Sense Media: 9+ ([CSM](https://www.commonsensemedia.org/app-reviews/piano-maestro-by-joytunes)).
  - Common Sense Education: Pre-K–12, with humour that "might only appeal to younger kids" ([CSE](https://www.commonsense.org/education/reviews/piano-maestro-by-joytunes)).
  - A vendor-commissioned review: "made for ages 9 to 11" ([old blog 838](https://old.hellosimply.com/blog/?p=838)).
  - The help center: the interface is "child-friendly" but used by all ages ([help 13750687](https://piano-help.hellosimply.com/en/articles/13750687-what-is-piano-maestro)).
  - JoyTunes once had a separate intro app for kids, Piano Dust Buster ([Weizmann](https://www.weizmann.ac.il/WeizmannCompass/node/1756)).
- **Teacher tools:**
  - unlimited student profiles under one teacher account;
  - assigning songs and **Home Challenges** (homework);
  - progress tracking ([help 13750687](https://piano-help.hellosimply.com/en/articles/13750687-what-is-piano-maestro));
  - weekly emails on minutes and songs played ([ColorInMyPiano](https://colorinmypiano.com/2015/01/27/ipad-app-review-piano-maestro/), [Leila Viss](https://www.leilaviss.com/blog/music-technology/joytunes-and-mtna-part-two));
  - a teacher report that counts playing time only, not app-open time ([ep. 111](https://mpetersonmusic.com/ep-111-transcription));
  - printable sheet music for teachers ([PMTeacherGuideline](https://www.joytunes.com/sheetmusic/PMTeacherGuideline.pdf)).
- **Parent role.** Parents watch and receive. **"Share the Moment"**: after a high score, the student records a selfie video and emails it to a parent ([ColorInMyPiano](https://colorinmypiano.com/2015/01/27/ipad-app-review-piano-maestro/), [old blog 234](https://old.hellosimply.com/blog/?p=234)). Marketing: "Share highlights and videos so the parents can see first hand how their child is progressing" ([hellosimply teachers](https://www.hellosimply.com/teachers)). There are family profiles for each child ([Leila Viss](https://www.leilaviss.com/blog/music-technology/joytunes-and-mtna-part-two)). Profiles are shared with Simply Piano ([help 13750687](https://piano-help.hellosimply.com/en/articles/13750687-what-is-piano-maestro)).
- **Reach.** "Recommended and used by over 28,000 teachers worldwide" ([hellosimply teachers](https://www.hellosimply.com/teachers)).

### 6. Motivation

- **Game layer.** 3-star scoring, points and ranks with nicknamed levels ([ep. 111](https://mpetersonmusic.com/ep-111-transcription), [Ensemble Schools](https://www.ensembleschools.com/catoctin-music/music-app-review-piano-maestro-by-joytunes-embracing-technology-and-sparking-motivation/)), plus 50+ avatars ([Teacher's Guideline](https://teachers.hellosimply.com/assets/guidelines/Piano%20Maestro%20%E2%80%93%20Teacher%E2%80%99s%20Guideline.pdf)).
- **Social and seasonal.** Share the Moment selfie videos, seasonal content such as Summer Camp (same source), and a monthly prize drawing for 3-star scores on select songs ([Ensemble Schools](https://www.ensembleschools.com/catoctin-music/music-app-review-piano-maestro-by-joytunes-embracing-technology-and-sparking-motivation/)).
- **Teacher-run competitions.** Studio-wide competitions run on the play-time report ([ep. 111](https://mpetersonmusic.com/ep-111-transcription)).
- **Not found.** I found no documentation of streaks or push reminders in Piano Maestro.

### 7. Monetization

- **Price.** Free download. Journey chapters 1–6 are free ([curriculum PDF](https://teachers.hellosimply.com/assets/guidelines/PM_ChapterByChapter_Curriculumm.pdf)).
- **Family / student.** $9.99/month or $59.99/year ([App Store](https://apps.apple.com/app/id604699751)).
- **Teachers** ([App Store](https://apps.apple.com/app/id604699751), [Ensemble Schools 2025](https://www.ensembleschools.com/catoctin-music/music-app-review-piano-maestro-by-joytunes-embracing-technology-and-sparking-motivation/)):
  - My Studio: $12.99/month, or $9.99/month billed annually;
  - Studio + Home: $19.99/month, or $14.99/month billed annually. Linked students get full home access at no extra cost ([help 13750687](https://piano-help.hellosimply.com/en/articles/13750687-what-is-piano-maestro)).
- **History.** It used to be free for registered teachers and their students ([old blog 234](https://old.hellosimply.com/blog/?p=234), [ColorInMyPiano](https://colorinmypiano.com/2015/01/27/ipad-app-review-piano-maestro/)).
- **Bundle with Simply Piano.** A Simply Piano subscription includes "Piano Maestro Premium Home" but not the studio plans ([help 13750687](https://piano-help.hellosimply.com/en/articles/13750687-what-is-piano-maestro)).
- **Not found.** No free trial is documented.

### 8. Reviews (light replica-entrepreneur pass)

I collected 20 verbatim excerpts:

- 18 from App Store pages: US 10, GB 4, AU 4. Stars are not visible in the extracted text.
- 2 Reddit quotes via GummySearch.

**Not reached:** the Apple RSS feed (robots or proxy blocked), Common Sense parent reviews (permission prompt timed out), and Reddit threads directly. **This is a thin sample**, and many reviews are from 2014–2018. The themes are my hand coding.

**Complaints**

1. **Recognition is unreliable, especially on acoustic pianos.** 4 reviews. "It doesn't reliably pick up the notes of an acoustic piano" (2025). "I am stuck on a song for a 4 months now cause it doesn't react to my keyboard like all the other songs".
2. **Paywall and subscription problems.** 3 reviews. "But you have to become a member just to continue the journey which is completely unfair!!" and "When I cancelled, suddenly a bunch of the content was locked!"
3. **Support is hard to reach.** 1 review, thin.

**Praise**

1. **Sight reading actually improves.** 4 reviews. "This app has helped all of us so much with our sight reading, and it truly makes it fun and very game-like."
2. **Kids want to practise.** 4 reviews. "The transition to the use of the actual piano has been smooth and the girls look forward to practicing every day!"
3. **Variety of songs and genres.** 3 reviews. Also a request: "I just wish the songs were harder."
4. **Works alongside a teacher.** 2 reviews. "I do recommend that PM is used to supplement regular lessons with a piano teacher".

## Screens

Reconstructed from public sources. No screenshots were taken.

| ID | screen | route / how to reach | purpose | key components | states seen |
| --- | --- | --- | --- | --- | --- |
| S01 | Profile select / Teachers & Parents zone | launch | choose student, teacher zone | avatar list, red Teacher Zone button | — |
| S02 | Journey map | home | chapters in order | chapter nodes, lock, stars | free zone end (Ch 6) |
| S03 | Library | menu | Songs / Exercises / Methods | categories, levels | premium locked |
| S04 | Song start | pick a song | Play vs Learn | two buttons, star count | 3 or 12 stars |
| S05 | Play stage | Play | scrolling staff with backing track and maestro character | staff, metronome, mascot | playing, paused |
| S06 | Practice options | pause in Play | tempo, note names, hand, Hold on | toggles, slider | — |
| S07 | Learn stage | Learn | section by section | section progress | section not perfected |
| S08 | Results | end of song | score and stars, Share the Moment | stars, points, selfie prompt | high score |
| S09 | Home Challenge | from teacher | assigned songs | list | — |
| S10 | Teacher dashboard and reports | teacher account | progress, play time | tables | — |
| S11 | Paywall | locked chapter or song | subscribe | plan cards | — |

## Flows

```
F01 Teacher assigns homework
    S10 -> pick songs -> S09 appears on the student's device -> student plays (S04 -> S07 Learn -> S05 Play) -> weekly report
F02 Student learns a new piece
    S04 Learn -> sections: one hand, other hand, both, with track, faster -> Play full speed -> S08 three stars
    edge: piano out of tune, room noise ("ghost notes"), mic needs re-plugging (GB review)
F03 Struggling passage
    S05 pause -> S06 slower tempo, hand on, note names on, Hold on -> resume
F04 Parent sees progress
    S08 high score -> Share the Moment selfie -> email to parent
```

## Components

| component | variants | states | used on |
| --- | --- | --- | --- |
| Scrolling staff | Play, Learn | correct / miss, Hold on waiting | S05, S07 |
| Maestro character | on / off | cheering | S05 |
| Practice options panel | tempo, note names, hand, Hold on | on / off | S06 |
| Star display | 3, or 12 for transposable songs | 0–3 per key | S04, S08 |
| Chapter node | free, locked, done | — | S02 |

## Inferred data model

```
Teacher        id, plan (my_studio | studio_home), students[]       evidence: help 13750687. confidence: high
Student        id, teacher_id?, avatar, rank, points                 evidence: Teacher's Guideline, ep. 111. confidence: high
Chapter        id, order, hand, note_range, rhythm, free             evidence: curriculum PDF. confidence: high
Piece          id, chapter_id|library, versions[], transposable, backing_track
               evidence: curriculum PDF, ep. 111. confidence: medium
Attempt        student_id, piece_id, mode (learn|play), tempo, hand, hold_on, note_acc, rhythm_acc, stars, play_seconds
               evidence: ColorInMyPiano, Ensemble Schools, ep. 111. confidence: medium
HomeChallenge  teacher_id, student_id, pieces[], due                 evidence: PMTeacherGuideline. confidence: medium
```

## Feature matrix

See `features.csv`. 29 rows. Must: 11, should: 6, could: 12, of which 2 are marked skip (licensed method books and songs).

## Out of scope (cannot or should not be cloned)

- Licensed songs and method books.
- Live-musician recordings.
- The teacher network: 28,000+ teachers.
- JoyTunes' recognition models and patents. See the Simply Piano recon for the patent list and the freedom-to-operate note.

## Size

Screens 11, flows 4, entities 6. Hard parts: recognition with a backing track playing, scrolling notation rendering, and the teacher/student sync. Size for an equivalent slice: L.

## Lessons for Little Duet

Ideas only. Nothing of their content, assets or copy.

**Worth learning from**

1. **One variable per step.** The Journey starts with one note (middle C, right hand). It adds one note or one rhythm per chapter, plays hands separately ("not simultaneously") long before hands together, and doesn't bring hands together until chapter 17. For ages 2–6 that pacing is even more important. Little Duet's age and difficulty groups can follow the same rule: each class introduces exactly one new thing.
2. **The Learn-mode ladder.** Section, then one hand, then the other, then both, then with the track, then faster. It is a clean, reusable template for structuring each class around a song.
3. **"Hold on" (wait for the correct note) as a toggle.** For 2–6 year olds it should be the default, with "play along with the music" unlocked later, ideally as a parent-plus-child duet.
4. **Live, full-sounding backing tracks make beginners feel like musicians.** Little Duet can record its own arrangements of public-domain songs. A parent playing the accompaniment part is an even stronger version.
5. **Report actual play time, not app-open time, and send a weekly digest.** Piano Maestro does this for teachers. The Little Duet analogue is a weekly parent summary.
6. **Share the Moment.** A celebratory clip after a good play, sent to the family, rewards the child socially. For Little Duet it could become "send to Grandma" with the parent's consent. Child privacy needs care: keep it on device by default.

**Avoid**

1. **No teaching layer.** Piano Maestro assumes a human teacher. Without one, kids get practice without explanation. Little Duet's teacher voice and video fill that gap.
2. **Mascot plus metronome plus scrolling, all at once.** Common Sense calls the combination distracting. For toddlers, use one focus at a time.
3. **Hiding the Journey behind membership after chapter 6.** Reviewers call it "completely unfair". Say clearly what is free.
4. **Recognition failures with no way forward.** "stuck on a song for a 4 months". Always provide a parent override.
5. **iPad-only.** Families with phones are excluded. Little Duet's phone and tablet support plus its on-screen piano mode is broader.
