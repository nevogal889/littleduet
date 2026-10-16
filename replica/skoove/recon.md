# Recon map: Skoove (iOS, Android; web learning platform retired)

Scope: the Skoove lesson loop (Listen / Learn / Play steps on a song excerpt), its note-validation feedback, the course path, and the human-teacher add-ons. Research for Little Duet, not a clone.
For: Little Duet, a parent + child (ages 2 to 6) piano app. Ideas only. No Skoove content, arrangements, video, assets or copy are to be reused.
Date: 2026-10-16
Method: replica-recon (public sources only, no login, no scraping, no bundles or private APIs) plus a light replica-entrepreneur review pass. Every claim has a URL. Inferences are marked **Inference** with a confidence level.

## Sources

| # | source | URL | notes |
| --- | --- | --- | --- |
| 1 | App Store listing (US) | https://apps.apple.com/us/app/-/id1160668178 | Learnfield GmbH, 4.6 from 22K ratings, v2.6.38, 500+ lessons, IAP prices |
| 2 | Help: Premium and prices | https://help.skoove.com/en/articles/5417607-what-is-skoove-premium-and-how-much-does-it-cost | plan prices, 1-on-1 instructor support, lifetime via support |
| 3 | Help: who can use Skoove | https://help.skoove.com/en/articles/5417621-who-can-use-skoove-can-children-learn-with-skoove | adults, kids 7+, parents learning together |
| 4 | Help: onboarding questionnaire | https://help.skoove.com/en/articles/16668705-getting-started-the-onboarding-questionnaire | six questions; how answers are used |
| 5 | Help: which course to start | https://help.skoove.com/en/articles/5417622-which-course-should-i-start-with | placement by questionnaire |
| 6 | Help: tempo | https://help.skoove.com/en/articles/5421914-can-i-adjust-the-tempo-of-the-pieces-on-skoove | tempo locked in "Get to know the song" |
| 7 | Help: metronome | https://help.skoove.com/en/articles/6183392-how-to-use-the-metronome | metronome in "Play in Time" step |
| 8 | Help: hand and sitting position | https://help.skoove.com/en/articles/5421905-what-is-the-correct-hand-and-sitting-position | posture guidance |
| 9 | Help: removed songs | https://help.skoove.com/en/articles/16033769-why-are-some-songs-or-lessons-no-longer-available-in-skoove | licence expiry removals |
| 10 | Help: web platform removal | https://help.skoove.com/en/articles/8170458-why-is-skoove-removing-the-web-learning-platform | iOS and Android only |
| 11 | Help center index | https://help.skoove.com/en/ | 7 collections, 45 articles |
| 12 | Fraunhofer IDMT press release (2016) | https://idmt.fraunhofer.de/en/Press_and_Media/press_releases/2016/skoove.html | "multipitch validation" against reference notes |
| 13 | VentureBeat launch (2015) | https://venturebeat.com/ai/skoove-launches-to-help-you-play-the-piano-backed-by-microsoft-ventures | "Web-based polyphonic real-time pitch validation", curriculum author |
| 14 | Teacher & Musician (2015) | https://www.teacherandmusician.com/2015/11/skoove-listen-learn-play.html | Listen Learn Play explained, animated hand |
| 15 | Skoove job post: Mobile Engineer | https://skoove.jobs.personio.de/job/2528443 | C++ audio engine, note detection, ML inference, Kotlin Multiplatform |
| 16 | Wikipedia | https://en.wikipedia.org/wiki/Skoove | founders, funding, MILES EU grant, platform history, awards |
| 17 | Pianist's Compass review | https://pianistscompass.org/reviews/apps/skoove/ | three steps named, green and red dots, scoring gaps, Kids course, 1-1 Class |
| 18 | Pianodreamers review | https://www.pianodreamers.com/skoove-review/ | Listen/Learn/Play, mic "up to ten notes at once", course list |
| 19 | Pianoers review | https://pianoers.com/skoove-review/ | grades pitch and timing, not duration; instructor messaging |
| 20 | American Songwriter review | https://americansongwriter.com/skoove-review | "gentle red dot", Finger Gym, Skoove Duo, "lacks accountability" |
| 21 | iGeeksBlog review | https://www.igeeksblog.com/skoove-app-review/ | blue and red notes, loop, adaptive next lesson claim |
| 22 | Unstar (sponsored profile) | https://unstar.app/blog/skoove-review-price-free-plan-real-reviews-2026 | prices, home shows next lesson, "Feedback On" toggle. Sponsored |
| 23 | Midder Music review | https://middermusic.com/skoove-review/ | 19 courses, hands separate before together |
| 24 | Skoove blog: kids | https://www.skoove.com/blog/piano-lessons-for-kids/ | "Ad-free and child-safe" positioning |
| 25 | Skoove Live Lessons | https://skoove.com/blog/live-lessons/pay-as-you-go | 30-minute live 1:1 video lessons, $19 |
| 26 | Skoove Duo | https://skoove.com/blog/duo-subscriptions | 45-minute 1:1 lesson subscription tiers |
| 27 | Skoove About | https://skoove.com/en/about | "over 1 million people" |
| 28 | Trustpilot (pt, no locales) | https://pt.trustpilot.com/review/www.skoove.com , https://no.trustpilot.com/review/www.skoove.com | TrustScore 2.6, 73 reviews |
| 29 | JustUseApp (republished App Store reviews) | https://justuseapp.com/en/app/1160668178/skoove-learn-to-play-piano/reviews | 27 reviews, no dates or stars |
| 30 | Grand-Screen (Google Play mirror) | https://grand-screen.com/apps/skoove-learn-piano/reviews/ | 4.4 from 9,994 Play reviews, 3 shown |
| 31 | Thomann | https://www.thomann.co.uk/skoove_subscription_6_months_reviews.htm?rating=5 | 4.3 from 18 ratings, 2 visible |
| 32 | devjobs Learnfield profile | https://en.devjobs.de/team/learnfield-gmb-h | stack: Amplitude, Mixpanel, RevenueCat |

Blocked or unreachable (not retried): Apple customer reviews RSS (https://itunes.apple.com/us/rss/customerreviews/id=1160668178/sortBy=mostRecent/json). Reddit threads did not surface in search. The Trustburn page (https://trustburn.com/reviews/skoove) was read but **excluded**: its 12 reviews have near-identical wording and no ratings.

## Core loop

Follow a fixed course path where each lesson takes a short excerpt of a known song through three steps: listen to it, learn the keys at your own pace (the app waits for each right key), then play it in time with a backing band while the app validates pitch and timing and gives an accuracy score.

## Teaching & video mechanism

### 1. Lesson format: what a lesson is made of

- **A lesson is one song excerpt, split into short sections**, taught with the Listen, Learn, Play method ([18](https://www.pianodreamers.com/skoove-review/), [14](https://www.teacherandmusician.com/2015/11/skoove-listen-learn-play.html)). The current app's step names ([17](https://pianistscompass.org/reviews/apps/skoove/), [6](https://help.skoove.com/en/articles/5421914-can-i-adjust-the-tempo-of-the-pieces-on-skoove), [7](https://help.skoove.com/en/articles/6183392-how-to-use-the-metronome)):
  1. **Get to know the song** (Listen). You hear the passage while the score and on-screen hands or keys play it: "your introduction to the song and a chance to relax and listen" ([17](https://pianistscompass.org/reviews/apps/skoove/)). Tempo cannot be changed in this step ([6](https://help.skoove.com/en/articles/5421914-can-i-adjust-the-tempo-of-the-pieces-on-skoove)).
  2. **Learn the keys** (Learn). Each hand is learned separately. The app checks pitch and ignores rhythm, so "you can take as long as you need" ([18](https://www.pianodreamers.com/skoove-review/)). In 2015, "Skoove waits for the student to press the correct keys", and an animated hand showed fingering and finger transitions ([14](https://www.teacherandmusician.com/2015/11/skoove-listen-learn-play.html)).
  3. **Play in time** (Play). Each hand is played in rhythm, then both together ([18](https://www.pianodreamers.com/skoove-review/)). This step has a metronome option ([7](https://help.skoove.com/en/articles/6183392-how-to-use-the-metronome)), and many lessons add a backing band play-along ([18](https://www.pianodreamers.com/skoove-review/)).
- **American Songwriter's sequence.** One reviewer describes each section being played, then repeated with metronome, then faster, then with the backing track, then the full score unaccompanied. The band section "doesn't score you" in the first lesson ([20](https://americansongwriter.com/skoove-review)).
- **Screen layout.**
  - Notation on top, on-screen keyboard below, with notes lit on both as they play ([17](https://pianistscompass.org/reviews/apps/skoove/), [18](https://www.pianodreamers.com/skoove-review/)).
  - Only one line of music shows at a time, and there is no full-score or print view ([18](https://www.pianodreamers.com/skoove-review/), [11](https://help.skoove.com/en/)).
  - Fingering numbers and lyrics appear under the staff ([22](https://unstar.app/blog/skoove-review-price-free-plan-real-reviews-2026)).
- **Where video appears.**
  - In demo mode "you'll see an instructor's hands performing the correct notes on the piano keyboard" ([17](https://pianistscompass.org/reviews/apps/skoove/)).
  - "Explainer videos" introduce new concepts, and a **Finger Gym** drills techniques before a song ([17](https://pianistscompass.org/reviews/apps/skoove/), [20](https://americansongwriter.com/skoove-review)).
  - The App Store lists "instructional videos" ([1](https://apps.apple.com/us/app/-/id1160668178)).
- **Inference (medium):** unlike flowkey, Skoove's main lesson surface is the score plus an on-screen keyboard driven by note data. Video is used for demos and concept explainers, not as the always-on play-along layer. Evidence: reviews describe the lesson as notation plus keyboard, with hands shown "in demo mode" ([17](https://pianistscompass.org/reviews/apps/skoove/)). The 2015 version used an animated hand ([14](https://www.teacherandmusician.com/2015/11/skoove-listen-learn-play.html)).
- **Controls.**
  - Pause, then change the tempo; loop a hard bar or two ([17](https://pianistscompass.org/reviews/apps/skoove/), [21](https://www.igeeksblog.com/skoove-app-review/)).
  - Restart a lesson to improve the score ([20](https://americansongwriter.com/skoove-review)).
  - A 2019-era review found no tempo, hand or metronome controls ([18](https://www.pianodreamers.com/skoove-review/)), so these were added later. **Inference, high**, given the current help articles [6](https://help.skoove.com/en/articles/5421914-can-i-adjust-the-tempo-of-the-pieces-on-skoove) and [7](https://help.skoove.com/en/articles/6183392-how-to-use-the-metronome).
- **Length.** No source gives minutes per lesson. The App Store says lessons are "split into short sections" ([1](https://apps.apple.com/us/app/-/id1160668178)). Reviewers note songs are excerpts, not full pieces (reviews.csv).

### 2. Input and feedback: how Skoove knows what was played

- **Inputs.** USB MIDI, Bluetooth MIDI, or the device microphone for acoustic pianos ([1](https://apps.apple.com/us/app/-/id1160668178)). Setup asks you to play the lowest and highest keys of your keyboard ([17](https://pianistscompass.org/reviews/apps/skoove/)). The mic is described as detecting "up to ten notes at once" ([18](https://www.pianodreamers.com/skoove-review/)).
- **The recognition method is published, and it is score-informed.**
  - Fraunhofer IDMT co-developed the algorithm. It "executes a polyphonic validation of the notes" ("multipitch validation"), checking "whether the student has actually played the predefined reference notes correctly and in the correct order" ([12](https://idmt.fraunhofer.de/en/Press_and_Media/press_releases/2016/skoove.html)).
  - It was built to cope with air conditioning noise, varying volume and out-of-tune pianos ([12](https://idmt.fraunhofer.de/en/Press_and_Media/press_releases/2016/skoove.html)).
  - At launch it was called "Web-based polyphonic real-time pitch validation", comparing input frequency with the notes that should be played ([13](https://venturebeat.com/ai/skoove-launches-to-help-you-play-the-piano-backed-by-microsoft-ventures)).
- **Today's stack, from a Skoove job post** ([15](https://skoove.jobs.personio.de/job/2528443)):
  - a "cross-platform C++ audio library" reached through an Objective-C++ wrapper;
  - "note detection technology";
  - "Real-time audio processing and analysis";
  - "Experience with ML inference in production systems";
  - Kotlin Multiplatform for shared logic;
  - a "Real-time UI for music performance feedback".
- **Inference (medium):** detection runs on-device in C++ (likely with an ML component), with the expected notes coming from the lesson data. The job post does not state that inference runs on-device; it lists the C++ engine and real-time audio in the mobile role, which points that way.
- **In the Learn step, on a wrong note or a pause:**
  - The app waits. A green dot marks correct notes and a red dot marks wrong ones ([17](https://pianistscompass.org/reviews/apps/skoove/)). iGeeksBlog saw notes go "blue and red accordingly" ([21](https://www.igeeksblog.com/skoove-app-review/)).
  - Mistakes get "just a gentle red dot for correction and a chance to try again" ([20](https://americansongwriter.com/skoove-review)).
  - No source describes a penalty sound.
- **In the Play step.**
  - The music keeps time, and the app scores against it. Earlier you "play along with the instructor without feedback until you're ready to be scored" ([17](https://pianistscompass.org/reviews/apps/skoove/)).
  - There is a "Feedback On" toggle ([22](https://unstar.app/blog/skoove-review-price-free-plan-real-reviews-2026)).
- **Scoring.**
  - An end-of-lesson report counts notes played correctly, and you can work up to 100% ([17](https://pianistscompass.org/reviews/apps/skoove/)).
  - Pitch and timing are graded; duration is not: "It does not grade duration" ([19](https://pianoers.com/skoove-review/)). You could "release each of them early and still earn a perfect score" ([17](https://pianistscompass.org/reviews/apps/skoove/)).
- **Latency.** Nothing published. Fraunhofer says the algorithm had to be "low latency" ([12](https://idmt.fraunhofer.de/en/Press_and_Media/press_releases/2016/skoove.html)), and the job post lists "sample rates, buffers, latency" as required knowledge ([15](https://skoove.jobs.personio.de/job/2528443)). Users report sync problems: "the sounds play at different times" (reviews.csv).
- **Patents.** None found for Skoove or Learnfield. The tech is described as a Fraunhofer collaboration plus the EU-funded MILES project ([16](https://en.wikipedia.org/wiki/Skoove)).

### 3. Curriculum and pacing

- **Path-first, not song-first.** The home screen shows your current course and next lesson ([22](https://unstar.app/blog/skoove-review-price-free-plan-real-reviews-2026)). A separate Songs tab lists repertoire tagged by level.
- **Size.** 400+ lessons on Premium ([2](https://help.skoove.com/en/articles/5417607-what-is-skoove-premium-and-how-much-does-it-cost)), and 500+ on the App Store and in reviews ([1](https://apps.apple.com/us/app/-/id1160668178), [17](https://pianistscompass.org/reviews/apps/skoove/)).
- **Courses** ([18](https://www.pianodreamers.com/skoove-review/), [23](https://middermusic.com/skoove-review/)):
  - Piano Beginner 1 to 3, covering posture, notation, hands together and intervals.
  - Beginner Theory: Sight Reading.
  - Piano Intermediate 1 to 3, covering key signatures, chords, time signatures and scales.
  - Genre courses: Classic, Pop, Blues and Boogie Woogie, Chords and Scales, Keyboard for Producers, Beatles, Queen, Christmas and film.
  - A Kids track ([17](https://pianistscompass.org/reviews/apps/skoove/), [22](https://unstar.app/blog/skoove-review-price-free-plan-real-reviews-2026)).
- **Progression inside a lesson.** Hands separately, then together ([23](https://middermusic.com/skoove-review/)). Rhythm is free in Learn and strict in Play ([18](https://www.pianodreamers.com/skoove-review/)).
- **Placement.** The onboarding questionnaire uses experience level and goals to choose the starting lesson, and nothing else is locked ([4](https://help.skoove.com/en/articles/16668705-getting-started-the-onboarding-questionnaire)). If lessons feel too hard, Skoove suggests trying "an easier course" ([5](https://help.skoove.com/en/articles/5417622-which-course-should-i-start-with)).
- **Adaptivity is claimed but unverified.** iGeeksBlog says the AI "builds up the next lesson plan" from strengths and weaknesses ([21](https://www.igeeksblog.com/skoove-app-review/)). Pianist's Compass and Midder Music describe a fixed path ([17](https://pianistscompass.org/reviews/apps/skoove/), [23](https://middermusic.com/skoove-review/)). **Inference (medium):** progression is a fixed course order with placement at onboarding; adaptive sequencing, if any, is light.
- **Content history.** The curriculum was originally designed by jazz pianist and former LIPA teacher Dominik Schirmer ([13](https://venturebeat.com/ai/skoove-launches-to-help-you-play-the-piano-backed-by-microsoft-ventures)). Songs can disappear when a licence ends ([9](https://help.skoove.com/en/articles/16033769-why-are-some-songs-or-lessons-no-longer-available-in-skoove)).

### 4. Guidance: who teaches

- **In-app guidance.**
  - Demo of an instructor's hands, explainer videos, and the Finger Gym ([17](https://pianistscompass.org/reviews/apps/skoove/)).
  - Forbes, quoted on Skoove's store pages: "Skoove's virtual guide takes the learner through each lesson" (https://appfollow.io/android/skoove-learn-to-play-piano/com.skoove.piano?country=lc).
  - One App Store reviewer: "the audio prompts me to start playing" (reviews.csv). **Inference (low-medium):** there is some spoken or audio cueing in lessons. No source describes a narrating teacher voice in detail.
- **Human teachers, which is Skoove's real differentiator.**
  - Premium includes "1-on-1 support from piano instructors" ([2](https://help.skoove.com/en/articles/5417607-what-is-skoove-premium-and-how-much-does-it-cost)), described as "one-to-one messaging with its music instructors" ([19](https://pianoers.com/skoove-review/)).
  - **Live Lessons:** 30-minute live 1:1 video lessons, pay-as-you-go at $19, with app access for practice in between ([25](https://skoove.com/blog/live-lessons/pay-as-you-go)).
  - **Skoove Duo:** a subscription of 45-minute 1:1 lessons, 1, 2 or 4 a month, from $37.49 a month ([26](https://skoove.com/blog/duo-subscriptions)). The setup uses one device for the call and another for the app.
- **Onboarding** ([4](https://help.skoove.com/en/articles/16668705-getting-started-the-onboarding-questionnaire)) asks six questions:
  1. who is learning (me, me and a family member, or a family member);
  2. age range, which can be skipped, and which for younger ages asks that "a grown-up is nearby";
  3. experience;
  4. goals;
  5. practice frequency;
  6. first song, or no preference.
  - Age sets "tone and pacing".
- **Posture and key-finding.** Beginner 1 covers posture ([18](https://www.pianodreamers.com/skoove-review/)). A help article covers sitting, curved fingers and centring at the keyboard ([8](https://help.skoove.com/en/articles/5421905-what-is-the-correct-hand-and-sitting-position)). Reviews say it does not open with the very basic note names ([21](https://www.igeeksblog.com/skoove-app-review/)).

### 5. Kids and parent angle

- **Official target:** "adult beginners, kids aged 7 and up, and parents who want to learn together as a family" ([3](https://help.skoove.com/en/articles/5417621-who-can-use-skoove-can-children-learn-with-skoove)). An older review said 12 and up, with younger children helped by an adult ([18](https://www.pianodreamers.com/skoove-review/)). The App Store rating is 4+ ([1](https://apps.apple.com/us/app/-/id1160668178)).
- **Kids marketing:** "Ad-free and child-safe"; "Turn screen time into learning time" ([24](https://www.skoove.com/blog/piano-lessons-for-kids/)).
- **Family use.**
  - "Who's learning" in onboarding only changes the wording of some screens. It "does not create separate profiles" ([4](https://help.skoove.com/en/articles/16668705-getting-started-the-onboarding-questionnaire)).
  - Pianist's Compass mentions family accounts ([17](https://pianistscompass.org/reviews/apps/skoove/)), but the help center describes no family plan. **Unverified.**
- **Teachers.** Skoove is its own teacher marketplace (Live Lessons, Duo) rather than a tool for outside teachers. No teacher dashboard was found.

### 6. Motivation

- **Streaks, badges, reminders and goals:** none found. American Songwriter says the structure "lacks accountability" ([20](https://americansongwriter.com/skoove-review)).
- **What exists.**
  - Lesson accuracy scores and retry for a better score ([17](https://pianistscompass.org/reviews/apps/skoove/), [20](https://americansongwriter.com/skoove-review)).
  - A backing band that makes simple parts "a lot of fun to play" ([18](https://www.pianodreamers.com/skoove-review/)).
  - Known songs.
  - A "guided learning path" ([24](https://www.skoove.com/blog/piano-lessons-for-kids/)).
- **Practice frequency** is asked at onboarding, but how it is used (reminders or not) is not stated ([4](https://help.skoove.com/en/articles/16668705-getting-started-the-onboarding-questionnaire)).
- **Analytics stack:** Amplitude and Mixpanel, and RevenueCat for subscriptions ([32](https://en.devjobs.de/team/learnfield-gmb-h)).

## Monetization

- **Skoove Basic** is free: selected lessons, no time limit, no card ([2](https://help.skoove.com/en/articles/5417607-what-is-skoove-premium-and-how-much-does-it-cost), [22](https://unstar.app/blog/skoove-review-price-free-plan-real-reviews-2026)). Older reviews say three lessons ([17](https://pianistscompass.org/reviews/apps/skoove/)).
- **Premium prices** ([2](https://help.skoove.com/en/articles/5417607-what-is-skoove-premium-and-how-much-does-it-cost)):

  | plan | per month | charged | notes |
  | --- | --- | --- | --- |
  | 1 month | $29.99 | monthly | |
  | 3 months | $19.99 | $59.99 every 3 months | |
  | 12 months | $12.49 | $149.99 up front | |
  | Lifetime | not published | one-time | arranged by email or chat |

  The App Store IAP list includes "Free Trial" variants from $4.99 to $119.99 ([1](https://apps.apple.com/us/app/-/id1160668178)). **Inference (medium):** these are intro-priced or discounted trial-to-paid SKUs.
- **Trials.**
  - 7 days on the annual plan, card required ([17](https://pianistscompass.org/reviews/apps/skoove/), [22](https://unstar.app/blog/skoove-review-price-free-plan-real-reviews-2026)).
  - A 14-day trial through a sign-up link ([2](https://help.skoove.com/en/articles/5417607-what-is-skoove-premium-and-how-much-does-it-cost)).
  - 3-month trials bundled with pianos such as Roland and Kawai (help-center trial collection titles at https://help.skoove.com/en/collections/3036813-skoove-trial; Trustpilot reviews).
- **Human-teacher upsells:** Live Lessons at $19 for 30 minutes, and Duo from $37.49 a month ([25](https://skoove.com/blog/live-lessons/pay-as-you-go), [26](https://skoove.com/blog/duo-subscriptions)).
- **Reputation cost.** Trustpilot is 2.6 out of 5 from 73 reviews, and the visible reviews are dominated by trial-to-annual charges and auto-renewal without reminder ([28](https://pt.trustpilot.com/review/www.skoove.com)). The App Store sits at 4.6, so the anger is about billing more than lessons.
- **Platform.** The web platform was retired (article dated 2025-04-24). The product is now iOS and Android only, which angered desktop users ([10](https://help.skoove.com/en/articles/8170458-why-is-skoove-removing-the-web-learning-platform), reviews.csv).

## Screens

Built from reviews, help articles and listings, not from a logged-in session.

| ID | screen | route / how to reach | purpose | key components | states seen |
| --- | --- | --- | --- | --- | --- |
| S01 | Onboarding questionnaire | first launch | place the learner | 6 single-choice steps, skip and not-sure options, grown-up check | child or adult branch ([4](https://help.skoove.com/en/articles/16668705-getting-started-the-onboarding-questionnaire)) |
| S02 | Instrument setup | settings or first run | connect mic or MIDI, set range | input picker, "play lowest and highest key" | connected, not recognised ([17](https://pianistscompass.org/reviews/apps/skoove/), help article 5421948) |
| S03 | Home | tab | current course and next lesson | course card, next-lesson CTA | filled ([22](https://unstar.app/blog/skoove-review-price-free-plan-real-reviews-2026)) |
| S04 | Courses overview | tab | pick a course | colour-coded level cards | locked, unlocked ([17](https://pianistscompass.org/reviews/apps/skoove/), [5](https://help.skoove.com/en/articles/5417622-which-course-should-i-start-with)) |
| S05 | Songs | tab | repertoire by level | level-tagged song list | locked, unlocked ([22](https://unstar.app/blog/skoove-review-price-free-plan-real-reviews-2026)) |
| S06 | Lesson player: Get to know the song | lesson step 1 | listen and watch | one-line score, on-screen keyboard, demo hands, play/pause | tempo locked ([6](https://help.skoove.com/en/articles/5421914-can-i-adjust-the-tempo-of-the-pieces-on-skoove)) |
| S07 | Lesson player: Learn the keys | step 2 | find notes, no rhythm | score, keyboard, green and red dots, hand selection | waiting, wrong note, correct ([17](https://pianistscompass.org/reviews/apps/skoove/)) |
| S08 | Lesson player: Play in time | step 3 | play with rhythm and band | score, keyboard, metronome, band, feedback toggle | scored, unscored ([7](https://help.skoove.com/en/articles/6183392-how-to-use-the-metronome), [22](https://unstar.app/blog/skoove-review-price-free-plan-real-reviews-2026)) |
| S09 | Pause sheet: tempo / metronome | pause in S07 or S08 | change tempo, toggle metronome, loop | tempo control, metronome switch | ([6](https://help.skoove.com/en/articles/5421914-can-i-adjust-the-tempo-of-the-pieces-on-skoove), [7](https://help.skoove.com/en/articles/6183392-how-to-use-the-metronome)) |
| S10 | Lesson result | end of lesson | accuracy report | % correct, retry, next | ([17](https://pianistscompass.org/reviews/apps/skoove/)) |
| S11 | Finger Gym / explainer video | inside courses | technique drill, concept video | video, drill | ([17](https://pianistscompass.org/reviews/apps/skoove/), [20](https://americansongwriter.com/skoove-review)) |
| S12 | Paywall | locked lesson | upgrade | plan cards, trial | shown after free lessons (reviews.csv) |
| S13 | Live lesson booking (web) | skoove.com | book a 1:1 teacher | slot picker, email confirmation | ([25](https://skoove.com/blog/live-lessons/pay-as-you-go)) |

## Flows

```
F01 First run to first note
    S01 (6 questions) -> S02 (connect, play lowest and highest key) -> S03 -> S06
    happy path taps: about 10
    edge: child learner (grown-up check), acoustic piano in a noisy room, keyboard not recognised, transposed keyboard
F02 Complete a lesson
    S06 listen -> S07 right hand, left hand (wait for each key) -> S08 hands separate in time -> hands together -> band -> S10
    edge: mic misses notes (stall in S07), chords not recognised, audio and visual out of sync
F03 Improve a score
    S10 -> retry -> S09 slow tempo and metronome -> S08
F04 Upgrade
    S12 -> trial (card) -> annual auto-renew
    edge: charged at trial end (dominant Trustpilot complaint)
F05 Book a human teacher
    S13 -> pick slot -> email link -> video call plus app on a second device
```

## Components

| component | variants | states | used on |
| --- | --- | --- | --- |
| One-line score | with fingering, lyrics | cursor, note lit, green, red | S06-S08 |
| On-screen keyboard | demo, feedback | lit, correct, wrong | S06-S08 |
| Step indicator | Get to know, Learn keys, Play in time | current, done | S06-S08 |
| Hand selector | L, R, both | selected | S07, S08 |
| Tempo control | slider or stepper (exact control unknown) | locked in S06 | S09 |
| Metronome switch | on, off | Play in Time only | S09 |
| Backing band toggle | on, off (inferred) | | S08 |
| Result card | accuracy % | retry, next | S10 |
| Level colour chip | kids, beginner, intermediate, advanced | | S04, S05 |

## Inferred data model

```
Course       id, title, level (kids | beginner | intermediate | advanced), colour, lessons[]
             evidence: courses overview, colour-coded levels; confidence: high
Lesson       id, course_id, song_excerpt_id, steps[] (get_to_know | learn_keys | play_in_time | finger_gym | explainer)
             evidence: step names in help and reviews; confidence: high (steps), medium (structure)
Section      id, lesson_id, hand (L | R | both), reference_notes[] (pitch, onset, order), tempo, has_band
             evidence: Fraunhofer "predefined reference notes ... in the correct order"; confidence: medium
Attempt      user_id, lesson_id, step, accuracy_pct, played_at
             evidence: result report, retry for score; confidence: medium
Learner      user_id, who_is_learning, age_range, experience, goals, practice_frequency
             evidence: onboarding questionnaire; confidence: high (fields), no separate profiles
Subscription plan (basic | premium 1m | 3m | 12m | lifetime), trial_type, store
             evidence: help pricing, trial collection; confidence: high
TeacherBooking user_id, slot, length (30 | 45), plan (payg | essential | standard | plus)
             evidence: Live Lessons and Duo pages; confidence: high
```

Relationships: Course 1-n Lesson, Lesson 1-n Section, Learner 1-n Attempt, one account = one learner (no profiles).

## Feature matrix

See `features.csv`. Must: 9, should: 10, could: 7, skip: 3.

## Out of scope (cannot or should not be cloned)

- Skoove's licensed song arrangements and recordings.
- The Fraunhofer-developed recognition algorithm and its ML models.
- The teacher network behind Live Lessons and Duo.
- Piano-maker trial bundles with Roland and Kawai.

## Size

Screens 13, flows 5, entities 7.
Hard parts:
- Polyphonic score-informed recognition on mobile.
- Audio and visual sync.
- Authoring every lesson as reference-note data with three step variants.
- A live-teacher marketplace, if wanted.

Size for an equivalent mechanism: L.

## Lessons for Little Duet

Ideas only. No Skoove content, songs, arrangements, video, copy or assets are to be reused.

**Worth learning from**
1. **Three-step class shape.** Listen, then learn the keys with no timing, then play in time with backing music. This maps directly onto a 3 to 5 minute Little Duet class:
   - the teacher video shows the tune;
   - the child finds each key while the app waits;
   - then parent and child play it together over a fun backing track.
   For ages 2 to 6, the "learn the keys" step should carry most of the time.
2. **Rhythm off first, rhythm on later.** Skoove deliberately ignores rhythm in Learn. For toddlers that should be the default for a long time.
3. **Lock tempo while listening; allow slower when playing.** This keeps the demo clean and gives control when it matters.
4. **Validate against the expected notes, in order.** This is the Fraunhofer approach ([12](https://idmt.fraunhofer.de/en/Press_and_Media/press_releases/2016/skoove.html)). Little Duet's single-note mic check is the simplest version of the same idea. Build robustness to room noise and slightly detuned home pianos from day one.
5. **Gentle error marking.** A soft red or green dot plus "try again", with no buzzer, suits small children.
6. **Onboarding that knows a family is there.** Ask who is learning and the age range, and when the learner is young, ask that a grown-up is nearby. Little Duet should go further and make the parent the account owner with per-child profiles, which Skoove lacks.
7. **Backing band.** Pianodreamers' reviewer says it makes simple exercises "a lot of fun to play". This is cheap to produce for public-domain kids' songs.

**What to avoid**
1. **Recognition that blocks progress.** 10 of 40 sampled reviews say notes or chords go unrecognised, and the lesson cannot move on: "it has to hear the notes on the piano in order to move ahead". For ages 2 to 6:
   - auto-advance after a few tries;
   - accept any octave;
   - give the parent a "that was right" override;
   - keep the on-screen piano mode as an always-available fallback.
2. **Trial billing that feels like a trap.** 15 of 40 sampled reviews (all from Trustpilot) are trial-conversion, renewal or refund anger, and Trustpilot sits at 2.6.
   - Send a reminder before Little Duet's 7-day trial converts.
   - Show the renewal date in settings.
   - Make cancelling one tap.
3. **Removing content people practised.** Licence-driven removals ("des morceaux sont supprimés", songs are being removed) hurt trust. Little Duet's public-domain launch catalogue avoids this. Keep licensed songs clearly separate.
4. **No separate profiles.** One account equals one learner in Skoove. Siblings and parents need their own progress.
5. **Snippets labelled as full songs.** A reviewer objected to being told they "played the full song". Be honest about class scope.
6. **Dropping a platform users rely on.** Skoove's web retirement drew 1-star reviews.

## Reviews summary (n = 40, see reviews.csv)

**Sample:**
- 19 from Trustpilot (pt and no locale pages of the same 73-review profile).
- 17 App Store reviews republished on JustUseApp, with no dates or stars.
- 2 Google Play reviews, via the Grand-Screen mirror.
- 2 from Thomann.

The Apple RSS feed was blocked and Reddit did not surface.

**Collection caveat:** excerpts were extracted through WebFetch, which reported them as verbatim and up to 120 characters. Spot-check before quoting.

**Top complaints**
- Billing, trial conversion, auto-renew, or support for those: 15 (all Trustpilot; thin by source count, but 15 independent reviewers, and it matches the 2.6 TrustScore).
- Note or chord recognition misses, wrong-note false positives, audio and visual sync, or lesson stalls: 10 (App Store 9, Google Play 1).
- Pace or structure (too fast, snippets called full songs, can't browse scores): 3 (App Store 3; thin).
- Paywall or locked content: 2 (Trustpilot 1, App Store 1; thin).
- Content or platform removed: 2 (Trustpilot 2; thin).
- Audio prompt with nothing on screen (bug): 1.

**Top praise**
- Clear, systematic lessons that suit beginners: 6 (App Store 2, Trustpilot 1, Google Play 1, Thomann 2).
- Support resolved a renewal refund: 1.
- A 12-year-old picked it up in days: 1 (thin).
