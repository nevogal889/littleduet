# Recon map: Simply Piano (iOS, Android)

Scope: the teaching loop (lesson format, note recognition and feedback, curriculum and pacing, guidance, kids/family, motivation, monetization). Not the song catalogue or the other Simply apps.
For: Little Duet, a kids' piano app for a parent and child (ages 2–6). Research only. No code, assets or copy are taken.
Date: 2026-10-16
Method: replica-recon, plus a light replica-entrepreneur pass. Public sources only, no login, no scraping. Not used: app binaries, bundles or network traffic. Every claim links to a source. Anything marked **Inference** is my reading, with a confidence level.

## Sources

| # | source | URL | notes |
| --- | --- | --- | --- |
| 1 | engineering blog, part 1 (Yoni Tsafir, May 2018) | https://medium.com/joytunes/a-look-under-the-hood-of-simply-piano-part-1-7050d297f611 | UI stack, game engine, notation rendering |
| 2 | engineering blog, part 2 (Yoni Tsafir, 2018) | https://medium.com/hellosimply/a-look-under-the-hood-of-simply-piano-part-2-3ba3cafa1bbf | MusicSense recognition pipeline, on-device ML |
| 3 | patent US 9,492,756 (priority 2009) | https://patents.justia.com/patent/9492756 | audio analysis using expected notes and the known backing track |
| 4 | patent US 11,670,188 | https://patents.justia.com/patent/11670188 · claims: https://image-ppubs.uspto.gov/dirsearch-public/print/downloadPdf/11670188 | skill level, slower pace, simplified arrangement |
| 5 | patent US 11,972,693 | https://image-ppubs.uspto.gov/dirsearch-public/print/downloadPdf/11972693 | recurring vs random errors, generated exercises |
| 6 | patent US 11,900,825 | https://image-ppubs.uspto.gov/dirsearch-public/print/downloadPdf/11900825 | adapting mic / speaker configuration |
| 7 | patent US 12,243,437 (Official Gazette) | https://patentsgazette.uspto.gov/week09/OG/html/1532-1/US12243437-20250304.html | crowd-based device configuration per device model |
| 8 | patent US 11,893,898 | https://patents.justia.com/patent/11893898 | several users playing one piece together |
| 9 | Justia assignee list | https://patents.justia.com/assignee/joytunes-ltd | patent index |
| 10 | help: learning basics (colours, hints) | https://piano-help.hellosimply.com/en/articles/7943490-learning-with-simply-piano-the-basics | feedback mechanism |
| 11 | help: Understanding PLAY | https://piano-help.hellosimply.com/en/articles/7943680-understanding-play | Listen / Teach Me / Play / Auto Scroll |
| 12 | help: star levels | https://piano-help.hellosimply.com/en/articles/7943591-understanding-star-levels | |
| 13 | help: kids experience | https://piano-help.hellosimply.com/en/articles/8053114-is-the-app-experience-different-for-children | ages 4–10 |
| 14 | help: XP and rewards (kids) | https://piano-help.hellosimply.com/en/articles/15913867-how-do-xp-and-rewards-work-kids-profiles | |
| 15 | help: streaks | https://piano-help.hellosimply.com/en/articles/15496066-how-do-streaks-work-in-simply-piano | |
| 16 | help: reminders | https://piano-help.hellosimply.com/en/articles/7939207-can-i-schedule-practice-reminders | |
| 17 | help: 5-minute workouts | https://piano-help.hellosimply.com/en/articles/7939170-what-are-5-minute-workouts | |
| 18 | help: song library | https://piano-help.hellosimply.com/en/articles/7943809-how-does-the-song-library-work | |
| 19 | help: course paths | https://piano-help.hellosimply.com/en/articles/2791299-soloist-and-chords-choosing-a-course-path | |
| 20 | help: pause menu | https://piano-help.hellosimply.com/en/articles/16945681-simply-piano-courses-menu-items | |
| 21 | help: without a piano (touch) | https://piano-help.hellosimply.com/en/articles/14588159-can-i-use-simply-piano-without-a-piano | |
| 22 | help: recognition (acoustic, iOS) | https://piano-help.hellosimply.com/en/articles/6210583-ways-to-improve-note-recognition-in-simply-piano-for-ios-acoustic-piano | headphones |
| 23 | help: recognition (transpose / MIDI) | https://piano-help.hellosimply.com/en/articles/16959483-the-app-isn-t-recognizing-my-notes-correctly | |
| 24 | help: MIDI collection | https://piano-help.hellosimply.com/en/collections/1512479-simply-piano-note-recognition-and-midi-help | |
| 25 | help: family profiles | https://piano-help.hellosimply.com/en/articles/2749747-multiple-profiles-basics-and-pricing | up to 5 |
| 26 | help: challenges | https://piano-help.hellosimply.com/en/articles/12175788-simply-piano-challenges | |
| 27 | help: subscribe | https://piano-help.hellosimply.com/en/articles/2728030-subscribe-to-simply-piano | |
| 28 | App Store listing | https://apps.apple.com/app/id1019442026 | 4.7★ from 841K ratings, 4+, IAP prices |
| 29 | marketing: kids page | https://www.hellosimply.com/family/piano-for-kids | hide songs, "adapts to your child's age" |
| 30 | marketing: why Simply works | https://www.hellosimply.com/family/why-simply-works | family plan, 4 apps |
| 31 | Weizmann Compass profile (Oct 2018) | https://www.weizmann.ac.il/WeizmannCompass/node/1756 | founders, "watch videos, complete exercises, play songs" |
| 32 | MusicRadar review (2022) | https://www.musicradar.com/reviews/simply-piano-review | practice mode, tempos, courses |
| 33 | Learnopoly review (2023, upd. 2026) | https://learnopoly.com/simply-piano-review/ | video intro, slow-down |
| 34 | American Songwriter review (2025) | https://americansongwriter.com/simply-piano-review | "patiently waits", onboarding questions |
| 35 | Pianoers review (2025, upd. 2026) | https://pianoers.com/simply-piano/ | 28 courses, prices |
| 36 | Guest Hollow homeschool blog | https://guesthollow.com/?p=292085 | KIDS profile visual aids, end summary |
| 37 | Pianist magazine (2025) | https://www.pianistmagazine.com/blogs/simply-piano-a-piano-learning-app-for-beginner-pianists-and-above | |
| 38 | Violet Recording review (2026) | https://violetrecording.com/simply-piano-review/ | "cannot see your hands" |
| 39 | teacher critique + developer reply (2019) | https://chiarunpiano.co.uk/blog/2019/response-from-developers-of-simply-piano | |
| 40 | reviews | see `reviews.csv` | 40 rows, 6 sources |

## Core loop

Watch a short concept video. Play a few notes on your real piano while the app listens through the mic and waits for the right note. Play the same material on a moving stage over a backing track. Earn progress or stars, and unlock the next lesson or songs.

## Teaching & video mechanism

### 1. Lesson format

- **Hierarchy.** Course → "mini-journey" of lessons → stages (help 20 names the "mini-journey"; the pause menu restarts a "stage"). There are 27–28 courses: Piano Basics, then Essentials I–III, then two parallel paths, Soloist (blue: melody, wider range, technique) and Chords (pink: accompaniment, chord fundamentals, styles), with Lead Sheet courses between them that need both paths ([MusicRadar](https://www.musicradar.com/reviews/simply-piano-review), [Pianoers](https://pianoers.com/simply-piano/), [help: paths](https://piano-help.hellosimply.com/en/articles/2791299-soloist-and-chords-choosing-a-course-path)).
- **Inside a lesson: video, then exercises, then the song.** "A lesson typically starts with the introduction of a concept in video form", then notes are shown to play, and the lesson ends "with you playing what you just practised, but with a backing track" ([Learnopoly](https://learnopoly.com/simply-piano-review/)). The founders describe it the same way: "watch videos, complete exercises, play songs" ([Weizmann](https://www.weizmann.ac.il/WeizmannCompass/node/1756)). The intro video "explains what you will be learning in the unit" ([American Songwriter](https://americansongwriter.com/simply-piano-review)).
- **Video is framing, not the teaching surface.** No source describes a teacher playing along on video. The teaching happens in the interactive stages. **Inference (medium):** the videos are short, roughly 30–90 seconds. No source states a length. I could not verify who presents them (a real teacher, an animation or hands only).
- **Kids get more video.** Kids' profiles (ages 4–10) get "More videos throughout the first few courses", up to Essentials II ([help: kids](https://piano-help.hellosimply.com/en/articles/8053114-is-the-app-experience-different-for-children)). One App Store reviewer complained of "way to many videos and ads" ([Kimola preview](https://kimola.com/reports/unlock-insights-simply-piano-user-feedback-analysis-app-store-us-148133)). That is one review, so it is thin.
- **Two kinds of interactive stage.**
  - *Static stages* show a few notes on a staff and wait. The app "kind of just patiently waits for you to hit the right note" ([American Songwriter](https://americansongwriter.com/simply-piano-review)). The help center says red (wrong) appears "in moving stages only", which implies that a static stage simply does not advance on a wrong note ([help: basics](https://piano-help.hellosimply.com/en/articles/7943490-learning-with-simply-piano-the-basics)).
  - *Moving stages* scroll the notation past a cursor while a pre-recorded backing track plays. In the engineering blog's words, levels are "a static sequence of notes or a song where notes move along with background music" ([Medium pt 1](https://medium.com/joytunes/a-look-under-the-hood-of-simply-piano-part-1-7050d297f611)). The song player follows "a blue cursor" ([help: PLAY](https://piano-help.hellosimply.com/en/articles/7943680-understanding-play)).
- **Display.** Standard staff notation, with a visual keyboard graphic below it. It is not a falling-note waterfall ([American Songwriter](https://americansongwriter.com/simply-piano-review), [Learnopoly](https://learnopoly.com/simply-piano-review/)). Notation is drawn in a 2D game engine (Sparrow on iOS, libgdx on Android) at 60 fps, and "The entire on-screen piano is rendered in a single draw call" ([Medium pt 1](https://medium.com/joytunes/a-look-under-the-hood-of-simply-piano-part-1-7050d297f611)).
- **Early song parts.** Beginner play-along parts ask for "a single note roughly every bar" over the backing track ([MusicRadar](https://www.musicradar.com/reviews/simply-piano-review)). A first simple song comes about 30 seconds after learning three notes, and a two-hand version about an hour in ([Weizmann](https://www.weizmann.ac.il/WeizmannCompass/node/1756)).
- **Song player (PLAY / Sheet Music).** Listen (hear the song or a section), Teach Me ("a series of exercises designed to help you learn each stage of the song", then the full song as a moving stage), Play, Auto Scroll, and tempo controls inside moving stages ([help: PLAY](https://piano-help.hellosimply.com/en/articles/7943680-understanding-play)). Songs come in "Essentials, Intermediate and Pre-Advanced" arrangement levels (same source). Tempo is fixed at 60, 80 or 100% ([MusicRadar, 2022](https://www.musicradar.com/reviews/simply-piano-review)).

### 2. Input and feedback

- **Microphone recognition (MusicSense).** "we sample the device's built-in mic and get a stream of PCM audio data". The engine converts the audio into a vector of 88 piano keys showing which keys sounded in the latest frame. The game engine compares that vector with the expected notes and advances the game state ([Medium pt 2](https://medium.com/hellosimply/a-look-under-the-hood-of-simply-piano-part-2-3ba3cafa1bbf)). The blog calls it "basically a deep learning problem" because of harmonics, polyphony (chords of up to 5 notes), room noise and the app's own backing track leaking into the mic.
- **Latency.** Inference runs **on device**, not in the cloud. That keeps latency low, allows offline play with downloaded tracks, costs nothing per user, and keeps audio private. Models are trained offline in TensorFlow. On Android they moved to the C++ TensorFlow API over JNI and got about 4× faster inference ([Medium pt 2](https://medium.com/hellosimply/a-look-under-the-hood-of-simply-piano-part-2-3ba3cafa1bbf)). No numeric latency target is published.
- **What the 2009 patent adds** ([US 9,492,756](https://patents.justia.com/patent/9492756)). This is the earliest JoyTunes design. The shipped engine has since moved to deep learning, so treat these as design ideas:
  - *Prior knowledge.* The system knows which note is expected at each moment, and it "dynamically lowers the detection threshold" for that note.
  - *Backing-track subtraction.* It correlates the captured audio with the known backing track to reduce its effect.
  - *Stability.* A tone must appear in several consecutive frames before it is accepted, and switching away from a triggered note needs stronger evidence.
  - *Timing.* The timing window is adjustable: "The skew can be adjusted (e.g., 20 ms, 50 ms, 100 ms)". Scoring is differential, so precise timing earns more.
- **Device tuning.**
  - Mic and speaker configuration is set per session and adapted when recognition is poor; the patent also covers choosing among several mics and speakers ([US 11,900,825](https://image-ppubs.uspto.gov/dirsearch-public/print/downloadPdf/11900825)).
  - Data from many devices of the same model picks the best configuration for each model, using the background music and the captured sound ([US 12,243,437](https://patentsgazette.uspto.gov/week09/OG/html/1532-1/US12243437-20250304.html)).
  - **Inference (medium):** this is how they cope with Android fragmentation.
- **User-side mitigations.** Headphones are "highly recommend[ed]" so the mic doesn't hear the backing track. The piano should be tuned to A = 440 Hz ([help 6210583](https://piano-help.hellosimply.com/en/articles/6210583-ways-to-improve-note-recognition-in-simply-piano-for-ios-acoustic-piano)). A keyboard's transpose setting breaks mic recognition but not MIDI ([help 16959483](https://piano-help.hellosimply.com/en/articles/16959483-the-app-isn-t-recognizing-my-notes-correctly)). MIDI works over USB or Bluetooth ([help collection](https://piano-help.hellosimply.com/en/collections/1512479-simply-piano-note-recognition-and-midi-help)).
- **Touch input.** An on-screen keyboard is available only in two touch courses (Touch Intro is free, Stay in Touch is paid). Everything else needs a real instrument ([help 14588159](https://piano-help.hellosimply.com/en/articles/14588159-can-i-use-simply-piano-without-a-piano)).
- **Per-note colour feedback** ([help: basics](https://piano-help.hellosimply.com/en/articles/7943490-learning-with-simply-piano-the-basics)):
  - Blue: correct with no hint.
  - Yellow: correct after the app gave a hint on the visual keyboard.
  - Red: wrong, in moving stages only.
- **Hint escalation.** When you struggle, a visual keyboard appears at the bottom of the screen. Grey keys show what the app heard, and the correct key is highlighted in yellow (same source).
- **Slow-down on repeated misses.** After more than a couple of misses in a section, the app enters "Practice Mode", which slows the music and adds a metronome click ([MusicRadar](https://www.musicradar.com/reviews/simply-piano-review)). It will "slow down the tempo and have you play it right a few more times until you progress" ([Learnopoly](https://learnopoly.com/simply-piano-review/)). This matches patent [US 11,670,188](https://image-ppubs.uspto.gov/dirsearch-public/print/downloadPdf/11670188):
  - a stored skill level is updated from the count of mismatched notes;
  - the displayed pace is lower than the piece's base pace;
  - a "simplified version" arrangement can be generated from the skill level;
  - the skill level rises below a mismatch threshold and falls above it (claims 1–11).
  - **Inference (high):** the shipped slow-down is a product version of this patent.
- **Leniency.** Timing is loosely judged. An off-beat performance "still marked my playing as correct" ([Learnopoly](https://learnopoly.com/simply-piano-review/)), and the app is "very forgiving" ([Guest Hollow](https://guesthollow.com/?p=292085)). Dynamics are not assessed ([MusicRadar](https://www.musicradar.com/reviews/simply-piano-review)). Posture is not assessed either: "The app can't see you" ([Pianoers](https://pianoers.com/simply-piano/)).
- **Results.** An end-of-song summary shows "how many notes you played correctly, the timing, etc." ([Guest Hollow](https://guesthollow.com/?p=292085)). A tick appears when a passage is completed ([Learnopoly](https://learnopoly.com/simply-piano-review/)). Songs give up to 3 stars, and star levels gate progress with a fraction such as 0/6 ([help: stars](https://piano-help.hellosimply.com/en/articles/7943591-understanding-star-levels)).
- **Pause menu.** Play (resume), Restart stage, Listen (plays the notes currently on screen, iOS only) and Exit ([help 16945681](https://piano-help.hellosimply.com/en/articles/16945681-simply-piano-courses-menu-items)).

### 3. Curriculum and pacing

- **Linear, gated path.** Learners "must complete each section before being allowed to move on" ([Guest Hollow](https://guesthollow.com/?p=292085)). Advanced players can only skip by moving fast through the early levels ([MusicRadar](https://www.musicradar.com/reviews/simply-piano-review)). Reviewers complain: "SimplyPiano does not let you skip ahead." (`reviews.csv`).
- **No placement test.** Onboarding asks about age, music taste and goals ([American Songwriter](https://americansongwriter.com/simply-piano-review)). Pianist magazine says users pick beginner, intermediate or advanced ([Pianist](https://www.pianistmagazine.com/blogs/simply-piano-a-piano-learning-app-for-beginner-pianists-and-above)). No source describes an audio placement test.
- **Hands.** Piano Basics is right hand first. Chord courses add the left hand, and Soloist teaches melody in the right hand with accompaniment in the left ([Learnopoly](https://learnopoly.com/simply-piano-review/)).
- **Song unlocking follows the curriculum.** Songs unlock after the first two lessons of Essentials I. Adults start with "Reminder" and "Rhythm I", while kids start with "The Notes F & G" and "Circle of Life". "kids can only play songs that match the courses they've already unlocked" ([help 7943809](https://piano-help.hellosimply.com/en/articles/7943809-how-does-the-song-library-work)). The full PLAY library unlocks at 80% of Essentials III ([help: PLAY](https://piano-help.hellosimply.com/en/articles/7943680-understanding-play)).
- **Arrangements.** Three difficulty levels per song, all simplified, "Sometimes heavily" ([Pianoers](https://pianoers.com/simply-piano/)).
- **Adaptivity.** In the shipped app this is real-time slow-down and hints. The patents go further:
  - per-user skill levels drive tempo and simplified arrangements ([US 11,670,188](https://image-ppubs.uspto.gov/dirsearch-public/print/downloadPdf/11670188));
  - recurring errors (pitch, timing, or note "cleanliness") are told apart from random ones, and targeted exercises are generated, then removed once the error is fixed ([US 11,972,693](https://image-ppubs.uspto.gov/dirsearch-public/print/downloadPdf/11972693)).
  - Workouts are "personalized 5-minute workouts" ([App Store](https://apps.apple.com/app/id1019442026)), with a new set each week ([help 7939170](https://piano-help.hellosimply.com/en/articles/7939170-what-are-5-minute-workouts)).
  - **Inference (medium):** the weekly workouts are where the recurring-error exercises surface. No public source confirms this.

### 4. Guidance

- Teaching combines short video, on-screen notation with a keyboard graphic, the hint keyboard and colour coding. The "Listen" buttons model how the passage should sound ([help: basics](https://piano-help.hellosimply.com/en/articles/7943490-learning-with-simply-piano-the-basics), [help: PLAY](https://piano-help.hellosimply.com/en/articles/7943680-understanding-play)).
- **No mascot.** I found no evidence of a mascot or character in Simply Piano. **Inference (medium):** it has a neutral, adult-friendly UI with a kids layer on top.
- **Kids' visual aids.** Kids lessons use hand icons instead of finger numbers ([help: kids](https://piano-help.hellosimply.com/en/articles/8053114-is-the-app-experience-different-for-children)). There is "a visual representation of fingering", a hand diagram with finger numbers ([Guest Hollow](https://guesthollow.com/?p=292085)).
- **Posture and habits.** The developers say there are "lessons on rhythm, posture, and other important habits and techniques" ([developer reply, 2019](https://chiarunpiano.co.uk/blog/2019/response-from-developers-of-simply-piano)). The app cannot check posture.
- **Onboarding.** Pick the instrument and answer the profile questions, then grant the mic and choose a first song early ([MusicRadar](https://www.musicradar.com/reviews/simply-piano-review), [Learnopoly](https://learnopoly.com/simply-piano-review/)). Pianoers calls the onboarding "genuinely well done" ([Pianoers](https://pianoers.com/simply-piano/)).

### 5. Kids and parent angle

- **Kids version.** For ages 4–10, the first courses up to Essentials II are customised: songs kids know, more videos, and hand icons ([help: kids](https://piano-help.hellosimply.com/en/articles/8053114-is-the-app-experience-different-for-children)). Kids profiles also get XP, levels and rewards ([help: XP](https://piano-help.hellosimply.com/en/articles/15913867-how-do-xp-and-rewards-work-kids-profiles)). The App Store age rating is 4+, "Suitable for all ages" ([App Store](https://apps.apple.com/app/id1019442026)).
- **Testimonial ages.** The marketing testimonials feature children aged 7–12 ([why-simply-works](https://www.hellosimply.com/family/why-simply-works)). **Inference (high):** Simply's real kids target is about 6–12. No source describes a parent and child playing together, and under-4s are not addressed. One reviewer's 3-year-old played along "on his bells" ([Kimola](https://kimola.com/reports/unlock-insights-simply-piano-user-feedback-analysis-app-store-us-148133)), which is anecdotal.
- **Parent role.** The parent is a manager, not a co-player:
  - a Family plan with up to 5 profiles ([help 2749747](https://piano-help.hellosimply.com/en/articles/2749747-multiple-profiles-basics-and-pricing));
  - "hide songs that don't feel right for your home" ([kids page](https://www.hellosimply.com/family/piano-for-kids));
  - checking a child's XP progress bar ([help: XP](https://piano-help.hellosimply.com/en/articles/15913867-how-do-xp-and-rewards-work-kids-profiles)).
- **Co-play.** Simply holds a patent on several users "cooperatively" playing one piece, with adapted sequences for each player ([US 11,893,898](https://patents.justia.com/patent/11893898)). I found no evidence that this ships in Simply Piano.
- **No teacher or classroom mode.** That role belongs to Piano Maestro ([help 13750687](https://piano-help.hellosimply.com/en/articles/13750687-what-is-piano-maestro)).

### 6. Motivation

- **Streaks.** Streaks are weekly. One practice session a week keeps the streak, you start with 2 freezes and earn 1 more every 5 weeks, and freezes apply automatically ([help 15496066](https://piano-help.hellosimply.com/en/articles/15496066-how-do-streaks-work-in-simply-piano)).
- **Stars.** Up to 3 per song, with star gates in courses ([help: stars](https://piano-help.hellosimply.com/en/articles/7943591-understanding-star-levels)).
- **Kids XP.** XP is shown before each song, levels unlock rewards such as "Tempo Rush" (up to 200% speed) and "Song Mix" medleys, and a celebration screen appears on unlock (iOS only) ([help: XP](https://piano-help.hellosimply.com/en/articles/15913867-how-do-xp-and-rewards-work-kids-profiles)).
- **Challenges and reminders.**
  - Time-limited challenges drop new songs weekly and award stars, badges and surprise rewards ([help 12175788](https://piano-help.hellosimply.com/en/articles/12175788-simply-piano-challenges)).
  - Practice reminders take chosen days and a time, and are stored locally on each device ([help 7939207](https://piano-help.hellosimply.com/en/articles/7939207-can-i-schedule-practice-reminders)).
  - Weekly 5-minute workouts ([help 7939170](https://piano-help.hellosimply.com/en/articles/7939170-what-are-5-minute-workouts)).
- **Overall.** Pianoers sums it up as "the Duolingo playbook" ([Pianoers](https://pianoers.com/simply-piano/)).

### 7. Monetization

- **Free tier.** "All app users can play two free courses." ([App Store](https://apps.apple.com/app/id1019442026)). Piano Basics is free ([MusicRadar](https://www.musicradar.com/reviews/simply-piano-review)), and so is Touch Intro ([help 14588159](https://piano-help.hellosimply.com/en/articles/14588159-can-i-use-simply-piano-without-a-piano)). Songs need a subscription ([help 7943809](https://piano-help.hellosimply.com/en/articles/7943809-how-does-the-song-library-work)).
- **Plans.** Individual, Duo and Family, monthly or yearly. Prices vary by country and by offer ([help 2728030](https://piano-help.hellosimply.com/en/articles/2728030-subscribe-to-simply-piano), [Learnopoly](https://learnopoly.com/simply-piano-review/)). The Family plan covers 5 profiles across 4 apps: Piano, Guitar, Sing and Draw ([why-simply-works](https://www.hellosimply.com/family/why-simply-works)).
- **US price points seen.**
  - App Store IAPs: $119.99–$149.99 for 12 months, Family $179.99, 3 months $74.99 ([App Store](https://apps.apple.com/app/id1019442026)).
  - Pianoers: Individual $17.90/mo or $169.90/yr, Family $23.90/mo or $209.90/yr ([Pianoers](https://pianoers.com/simply-piano/)).
- **Trial.** 7 days ([MusicRadar](https://www.musicradar.com/reviews/simply-piano-review)) or 14 days on annual plans ([Pianoers](https://pianoers.com/simply-piano/)). **Inference (high):** trial length is A/B-tested or varies by plan.
- **Other channels.** US ESA (school funding) eligibility in select states ([kids page](https://www.hellosimply.com/family/piano-for-kids)).

### 8. Reviews (light replica-entrepreneur pass)

I collected 40 verbatim excerpts from 6 source types (`reviews.csv`):

- 25 from JustUseApp's App Store mirror (no dates or stars);
- 3 from the App Store CA page;
- 3 from Kimola's App Store US preview;
- 5 from Trustpilot for joytunes.com;
- 3 from Trustpilot for hellosimply.com;
- 1 Reddit quote via GummySearch.

Only 11 rows have a rating. **Not reached:**

- Apple's RSS feed: refused by WebFetch (robots) and blocked at the shell proxy.
- Google Play.
- Reddit threads directly.

These are excerpts, not full reviews, so the sample is small and skewed. The theme counts below are my own hand coding. `reviews.py` with its default themes only caught the price theme (6) and marked the rest thin.

**Top complaints**

1. **The paywall arrives after the first lesson or two, so "free" feels misleading.** 12 reviews, 4 sources. "I just think that they should say before you download that you only get one lesson." and "All they want to do is teach you a little bit so you want to keep going then they charge you..."
2. **Note recognition mishears or misses notes and blocks progress.** 5 reviews, 2 sources. "it kept saying I was wrong, even when I was playing it correctly". "The program just cannot hear certain notes and refuses to let you advance." "it constantly does not pick up some notes (mostly eighth notes".
3. **Price relative to reliability.** 3 reviews. "at 120 dollars a year for a premium membership SimplyPiano should be flawless when it comes to functionality".
4. **Billing and trial surprises.** 3 reviews, Trustpilot only, brand-level, so thin. "Offered a 7 day trial and charged £89.99 immediately."
5. **Pedagogy gaps (rhythm, "how", pace at the start of a level).** 3 reviews. This theme is thin.
6. **Rigid gating, can't skip.** 2 reviews. This theme is thin.

**Requests:** printable sheet music, adding your own songs, skipping reminders, PC support (one each, thin).

**Top praise**

1. **Fast, visible progress for beginners.** 6 reviews. "With in 2 months I was able to play simple arrangements that I have never seen before."
2. **Motivating and fun.** 5 reviews. "SimplyPiano is simply a motivating tool to learn piano and it works pretty good."
3. **Cheap compared with lessons.** 2 reviews. "At 1/20th the cost of in-person lessons, I'm not sure we'll ever go back."

## Screens

These are reconstructed from help articles and reviews. I did not capture screenshots.

| ID | screen | route / how to reach | purpose | key components | states seen |
| --- | --- | --- | --- | --- | --- |
| S01 | Onboarding questions | first launch | age, goals, music taste, has a piano | choice cards | filled |
| S02 | Mic permission / setup | first launch, or on failure | listening setup | OS prompt, troubleshooting link | permission denied ([help 12647864](https://piano-help.hellosimply.com/en/articles/12647864-enable-microphone-access-for-simply-piano)) |
| S03 | Course path / mini-journey | home | linear lesson list | course nodes, lock, star fraction | locked, in progress, Premium lock |
| S04 | Concept video | lesson start | introduce the concept | video player | — |
| S05 | Static stage | inside a lesson | play shown notes, app waits | staff, key graphic, hint keyboard | waiting, hint shown (yellow), correct (blue) |
| S06 | Moving stage | inside a lesson or song | play over a backing track | scrolling staff, cursor, tempo control | wrong (red), practice mode (slowed, metronome) |
| S07 | Pause menu | pause button, top left | resume / restart / listen / exit | modal | iOS vs Android variants |
| S08 | Results / summary | end of stage or song | accuracy, timing, stars | stars, tick | — |
| S09 | Songs library | menu | browse by section, search, favourites | list, search, heart | locked sections, kids filtered |
| S10 | PLAY sheet-music player | menu | Listen / Teach Me / Play / Auto Scroll | sheet, level picker, speed bar | iOS-only features |
| S11 | 5-minute workout picker | Menu > 5-Min Workout | 3 weekly options | 3 cards | — |
| S12 | Streak | flame icon | weekly streak, freezes | counter | reset, freeze used |
| S13 | Reminders | Menu > Settings > Reminders | days and time | day chips, time picker | — |
| S14 | Profiles | Menu > Switch Profiles | family profiles | avatar list, add | up to 5 |
| S15 | Kids XP and rewards | XP bar, top right of Songs | level, XP, rewards | progress bar, reward tiles | locked reward |
| S16 | Paywall | Menu > Join Simply, or locked content | subscribe | plan cards, trial | — |
| S17 | Touch course | Touch Intro | on-screen keyboard | piano keys | — |

## Flows

```
F01 New kid profile reaches a first song
    S01 -> S02 -> S03 -> S04 video -> S05 static stage x n -> S06 moving stage with backing track -> S08
    happy path: about 30 seconds of play after 3 notes are learned (Weizmann)
    edge: mic denied (S02), app mishears, keyboard transposed, backing track bleeds into the mic (needs headphones)
F02 Struggling learner
    S06 misses -> practice mode slows the music and adds a metronome -> replay until correct -> continue
    edge: a note is never recognised, so the learner is stuck (review complaint)
F03 Learn a library song
    S09 -> S10 Listen -> Teach Me stages -> full moving stage -> stars
F04 Parent sets up the family
    S16 Family plan -> S14 add profile (age decides kids vs adult) -> hide songs
F05 Weekly habit
    reminder push -> S03 or S11 -> session counts for the weekly streak (S12)
```

## Components

| component | variants | states | used on |
| --- | --- | --- | --- |
| Staff notation renderer | static, scrolling | note colours blue / yellow / red, cursor | S05, S06, S10 |
| Hint keyboard | bottom keyboard | grey (heard), yellow (target) | S05, S06 |
| Backing-track player | pre-recorded, tempo 60 / 80 / 100% | playing, paused | S06, S10 |
| Video player | lesson intro | — | S04 |
| Course node | lesson, star level, course | locked, premium, done, fraction | S03 |
| Reward celebration | modal | claim | S15 |

## Inferred data model

```
Profile        id, account_id, name, age_band (kid 4-10 | adult), path_choice, hidden_songs[]
               evidence: help 2749747, 8053114; kids page. confidence: high
Course         id, path (basics|essentials|soloist|chords|lead_sheet), order, premium
               evidence: help 2791299, MusicRadar. confidence: high
Lesson/Stage   id, course_id, type (video|static|moving|star_level), expected_notes[], backing_track_id, base_tempo
               evidence: Medium pt 1, help 16945681, 7943591. confidence: medium
StageAttempt   profile_id, stage_id, notes_correct, notes_hinted, notes_wrong, tempo_used, stars
               evidence: help 7943490 colours, Guest Hollow summary. confidence: medium
SkillLevel     profile_id, value, updated_from_mismatch_count
               evidence: patent US 11,670,188. confidence: guess (patent, not confirmed as shipped)
Streak         profile_id, start_week, freezes_left
               evidence: help 15496066. confidence: high
XP/Reward      profile_id, xp, level, rewards_unlocked[]
               evidence: help 15913867. confidence: high
```

Relationships: Account 1–5 Profile. Course 1–n Lesson 1–n Stage. Profile 1–n StageAttempt.

## Feature matrix

See `features.csv`. 37 rows. Must: 19, should: 11, could: 7, of which 4 are marked skip (licensed or partner content, their models, patented crowd configuration).

## Out of scope (cannot or should not be cloned)

- The licensed song catalogue: pop and Disney songs, 5,000+ titles.
- The Trinity College partnership.
- Their trained polyphonic models and the crowd-sourced device configuration data.
- Their videos, copy and art.
- **Patents.** JoyTunes/Simply hold US patents on:
  - adapting tempo and generating simplified arrangements from a skill level computed from mismatches (11,670,188);
  - recurring-error exercise generation (11,972,693);
  - adapting mic and speaker configuration (11,900,825; 12,243,437);
  - **multiple users cooperatively playing a piece with per-player adaptation (11,893,898)**, which is close to a parent-and-child duet.

  Little Duet should get a freedom-to-operate review from a patent attorney before building adaptive-tempo or duet-adaptation features. This is not legal advice.

## Size

Screens 17, flows 5, entities 7. The equivalent Little Duet slice uses single-note recognition, a wait mode, video plus stages, kids rewards and streaks. Hard parts:

- reliable mic recognition while a backing track plays on the same device (no headphones with toddlers);
- the video and stage sequencing engine;
- avoiding the patented adaptivity designs.

Size: L. Size: M if recognition stays monophonic and backing tracks are ducked while listening.

## Lessons for Little Duet

Ideas only. Nothing of Simply's content, assets or copy.

**Worth learning from**

1. **Video frames, interaction teaches.** A short video introduces the concept, then the child plays immediately. Simply's split of video, then static wait stage, then moving stage over a backing track maps onto Little Duet's 3–5 minute classes. Split each class into short clips of under about 60 seconds, each followed by a play moment. **Inference (medium):** 3–5 minutes of continuous video is too long for 2–6 year olds without play breaks.
2. **Wait mode as the default for little kids.** The static stage that simply waits is the right primitive for ages 2–6. Keep moving or backing-track play for "perform with Mum or Dad" moments only.
3. **A hint ladder instead of failure.** Simply goes from no hint, to a highlighted key on an on-screen keyboard, to a slower tempo. Little Duet can go further: after one miss, glow the key on the on-screen piano; after two, the teacher voice names the colour or animal of the key. Credit "played with a hint" differently, the way Simply's yellow does, but never show red to a toddler.
4. **Expected-note listening.** This is from the 2009 patent's public description; check FTO for anything close to the claims. Because only one note is expected at a time, the listener can be biased toward that note: require a few stable frames, and pause or duck the backing track while listening. That suits Little Duet's single-note mic plan, and is the cheap version of their deep-learning engine.
5. **Kids-specific first courses.** Simply's kids layer (hand icons instead of finger numbers, familiar songs, more video) shows that a kids track must differ in the first hours, not just in theme.
6. **Weekly streak with freezes.** Weekly is friendlier for families than a daily streak and avoids guilt. A good fit for parents.
7. **Song unlocks follow the skills taught.** Kids only see songs their courses support, so no song is ever too hard. Use this with Little Duet's age and difficulty grouping.
8. **On-device listening.** It keeps latency low, works offline and keeps the child's audio private. That is also a strong privacy message for parents of young children.

**Avoid**

1. **The paywall surprise after lesson 1–2.** This is the top complaint, with 12 of 40 excerpts. Little Duet already has a 7-day trial. Say clearly up front what is free, and don't interrupt a child mid-lesson with an offer.
2. **Recognition that blocks progress.** Always give the parent an "it was right, continue" override, and let the class continue after N tries.
3. **Trial and billing confusion.** This is brand-level but loud on Trustpilot. Use plain renewal reminders before the trial ends.
4. **Adult-first design with a kids skin.** Simply's kids layer starts at age 4 and ends at Essentials II, and the parent never plays. Little Duet's parent-plus-child co-play is the gap. Beware that co-op play with per-player adaptation is patented (11,893,898).
5. **Treating the touchscreen as a demo.** Simply restricts the on-screen keyboard to two courses. Little Duet's on-screen piano mode is a first-class path for families without a piano, which is a positioning angle.
