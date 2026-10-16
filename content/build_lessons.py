#!/usr/bin/env python3
"""Little Duet curriculum generator.

    python3 content/build_lessons.py [--songs content/songs.json] [--out content/lessons]
    python3 content/build_lessons.py --validate-only

Reads Song[] (see CONTRACT.md) and writes one lesson file per song to
content/lessons/<songId>.json, then validates every file it wrote.

Falls back to content/seed-songs.json when content/songs.json does not exist.

Timing model (shared with video/render.py and the app's interactive mode):
  * A note segment starts with `leadInSec` of count-in (2 beats, >= 1 s).
  * Each note lasts d * 60 / bpm seconds. In `your_turn`, before every note the
    child plays there is a wait of `gapBeats` beats (the countdown dot).
  * Notes with "who": "parent" are the grown-up's (or the video's) notes; all
    others belong to the child. A note may carry "lh": {p, d, f, h:"L"}, a
    left-hand note struck together with it (always the child's).
  * Segment `durationSec` is an integer: ceil(leadIn + notes + 1.5 s tail).
"""
import argparse
import json
import math
import os
import re
import sys
from collections import Counter, OrderedDict

HERE = os.path.dirname(os.path.abspath(__file__))

CLASS_MIN, CLASS_MAX = 180, 300
FILL_TARGET = 214          # aim for ~3.5 min classes
FILL_CEILING = 292         # leave headroom under 300
TAIL_SEC = 1.5
TITLE_SEC = 5
PRAISE_SEC = 5

SEG_KINDS = {"title", "say", "listen", "demo", "your_turn", "together", "beat",
             "high_low", "praise"}
NOTE_KINDS = {"listen", "demo", "your_turn", "together", "beat", "high_low"}
CLASS_TYPES = {"listen", "beat", "high-low", "loud-soft", "fast-slow", "stop-go",
               "together", "special-note", "echo", "hand-position", "phrase",
               "put-together", "play-along", "left-hand", "hands-together", "concert"}
AGE_GROUPS = {"2-3", "3-4", "4-5", "5-6"}

NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]
PITCH_RE = re.compile(r"^([A-G])(#?)(\d)$")


# ---------------------------------------------------------------- pitch utils
def midi(p):
    m = PITCH_RE.match(p)
    if not m:
        raise ValueError("bad pitch %r" % p)
    return NOTE_NAMES.index(m.group(1) + m.group(2)) + 12 * (int(m.group(3)) + 1)


def pname(n):
    return "%s%d" % (NOTE_NAMES[n % 12], n // 12 - 1)


def white_steps(lo, hi):
    """Number of white keys from lo to hi (lo counted as 0)."""
    return sum(1 for n in range(lo + 1, hi + 1) if "#" not in NOTE_NAMES[n % 12])


# ---------------------------------------------------------------- note utils
def clean_note(n, **extra):
    out = OrderedDict()
    if n.get("rest"):
        out["rest"] = True
        out["d"] = n["d"]
    else:
        out["p"] = n["p"]
        out["d"] = n["d"]
        if "f" in n:
            out["f"] = n["f"]
        if "s" in n:
            out["s"] = n["s"]
        if "h" in n:
            out["h"] = n["h"]
    for k, v in extra.items():
        if v is not None:
            out[k] = v
    return out


def is_child(n):
    return not n.get("rest") and n.get("who") != "parent"


def note_body_sec(notes, bpm, gap_beats=0.0):
    spb = 60.0 / bpm
    t = 0.0
    for n in notes:
        if gap_beats and is_child(n):
            t += gap_beats * spb
        t += n["d"] * spb
    return t


def lead_in_sec(bpm):
    return round(max(1.0, 2 * 60.0 / bpm), 3)


def words(s):
    return len(s.split())


# ---------------------------------------------------------------- segments
def seg_title(song, cls_index, cls_title):
    return OrderedDict([("kind", "title"), ("caption", song.title),
                        ("subcaption", "Class %d: %s" % (cls_index, cls_title)),
                        ("durationSec", TITLE_SEC)])


def seg_say(caption, cue=None, show_keys=None, sec=None):
    s = OrderedDict([("kind", "say"), ("caption", caption)])
    if cue:
        s["parentCue"] = cue
    if show_keys:
        s["showKeys"] = show_keys
    n = words(caption) + (words(cue) * 0.6 if cue else 0)
    s["durationSec"] = sec if sec else int(max(4, math.ceil(2.5 + 0.42 * n)))
    return s


def seg_praise(caption):
    return OrderedDict([("kind", "praise"), ("caption", caption), ("durationSec", PRAISE_SEC)])


def seg_notes(kind, caption, notes, bpm, cue=None, lines=None, gap_beats=None,
              dynamic=None, target=None):
    bpm = int(round(bpm))
    s = OrderedDict([("kind", kind), ("caption", caption)])
    if cue:
        s["parentCue"] = cue
    if target:
        s["target"] = target
    if dynamic:
        s["dynamic"] = dynamic
    s["bpm"] = bpm
    s["leadInSec"] = lead_in_sec(bpm)
    if kind == "your_turn":
        s["gapBeats"] = 1 if gap_beats is None else gap_beats
    s["notes"] = notes
    if lines:
        s["lines"] = lines
    body = note_body_sec(notes, bpm, s.get("gapBeats", 0))
    s["durationSec"] = int(math.ceil(s["leadInSec"] + body + TAIL_SEC))
    return s


def seq_dur(segs):
    return sum(s["durationSec"] for s in segs)


# ---------------------------------------------------------------- song model
class Song:
    def __init__(self, d):
        self.d = d
        self.id = d["id"]
        self.title = d["title"]
        self.bpm = d["bpm"]
        self.age = d["ageGroup"]
        self.difficulty = d.get("difficulty", 1)
        num, den = (int(x) for x in d.get("timeSignature", "4/4").split("/"))
        self.bar_beats = num * 4.0 / den
        self.phrases = [(ph.get("lyric", ""), ph["notes"]) for ph in d["phrases"]]
        self.all_notes = [n for _, ns in self.phrases for n in ns]
        self.total_beats = sum(n["d"] for n in self.all_notes)
        pick = self.total_beats % self.bar_beats
        self.pickup = pick if pick > 1e-6 else 0.0
        pitched = [n for n in self.all_notes if not n.get("rest")]
        cnt = Counter(n["p"] for n in pitched)
        first_seen = {}
        for i, n in enumerate(pitched):
            first_seen.setdefault(n["p"], i)
        self.special = sorted(cnt, key=lambda p: (-cnt[p], first_seen[p]))[0]
        self.special_finger = Counter(n.get("f") for n in pitched if n["p"] == self.special
                                      and n.get("f")).most_common(1)
        self.special_finger = self.special_finger[0][0] if self.special_finger else None
        # hand position: most common pitch per finger
        by_f = {}
        for n in pitched:
            if n.get("f") and n.get("h") != "L":
                by_f.setdefault(n["f"], Counter())[n["p"]] += 1
        self.hand = [OrderedDict([("p", by_f[f].most_common(1)[0][0]), ("f", f)])
                     for f in sorted(by_f)]
        self.thumb = next((k["p"] for k in self.hand if k["f"] == 1), pitched[0]["p"])

    # -- phrase material
    def phrase_notes(self, idxs, who=None, transpose=0):
        notes, lines = [], []
        for i in idxs:
            lyric, ns = self.phrases[i]
            lines.append(OrderedDict([("lyric", lyric), ("from", len(notes))]))
            for n in ns:
                extra = {"who": who}
                if transpose and not n.get("rest"):
                    m = midi(n["p"]) + transpose
                    m = min(max(m, midi("C3")), midi("C6"))
                    nn = dict(n)
                    nn["p"] = pname(m)
                    nn.pop("f", None)
                    notes.append(clean_note(nn, **extra))
                else:
                    notes.append(clean_note(n, **extra))
        return notes, lines

    def whole(self, who=None):
        return self.phrase_notes(range(len(self.phrases)), who=who)

    def unique_phrase_groups(self, max_groups, max_beats=16.0):
        """Unique phrases (by pitch+rhythm), paired into practice groups."""
        seen, uniq = {}, []
        for i, (_, ns) in enumerate(self.phrases):
            sig = tuple((n.get("p", "r"), n["d"]) for n in ns)
            if sig not in seen:
                seen[sig] = i
                uniq.append(i)
        beats = {i: sum(n["d"] for n in self.phrases[i][1]) for i in uniq}
        groups, cur, cur_b = [], [], 0.0
        for i in uniq:
            if cur and (cur_b + beats[i] > max_beats or len(cur) >= 2):
                groups.append(cur)
                cur, cur_b = [], 0.0
            cur.append(i)
            cur_b += beats[i]
        if cur:
            groups.append(cur)
        while len(groups) > max_groups:  # merge the two smallest neighbours
            j = min(range(len(groups) - 1),
                    key=lambda k: sum(beats[i] for i in groups[k] + groups[k + 1]))
            groups[j:j + 2] = [groups[j] + groups[j + 1]]
        return groups, uniq

    def repeats_of(self, idx):
        sig = tuple((n.get("p", "r"), n["d"]) for n in self.phrases[idx][1])
        return sum(1 for _, ns in self.phrases
                   if tuple((n.get("p", "r"), n["d"]) for n in ns) == sig)

    def echo_patterns(self, limit=8):
        pats, seen = [], set()
        for _, ns in self.phrases:
            pitched = [n for n in ns if not n.get("rest")]
            for size in (3, 2):
                for k in range(0, len(pitched) - size + 1, size):
                    chunk = pitched[k:k + size]
                    sig = tuple(n["p"] for n in chunk)
                    if sig in seen:
                        continue
                    if len(set(sig)) == 1 and len(pats) < limit // 2:
                        continue  # prefer patterns that move first
                    seen.add(sig)
                    pats.append([clean_note(dict(n, d=max(1, n["d"]) if n["d"] < 1 else n["d"]))
                                 for n in chunk])
                if len(pats) >= limit:
                    break
            if len(pats) >= limit:
                break
        if not pats:
            pats.append([clean_note(n) for n in self.all_notes if not n.get("rest")][:3])
        # keep echo notes short and even: max 2 beats each
        for p in pats:
            for n in p:
                n["d"] = min(n["d"], 2)
        return pats

    def special_song_notes(self):
        notes, lines = [], []
        for lyric, ns in self.phrases:
            lines.append(OrderedDict([("lyric", lyric), ("from", len(notes))]))
            for n in ns:
                if n.get("rest") or n["p"] == self.special:
                    notes.append(clean_note(n))
                else:
                    notes.append(clean_note(n, who="parent"))
        return notes, lines

    # -- left hand
    def bass_for_key(self):
        key = self.d.get("key", "C").replace("b", "")
        root = NOTE_NAMES.index(key[0] + ("#" if "#" in key else "")) if key else 0
        def bass(semis):
            pc = (root + semis) % 12
            return pname(midi("C3") + pc)   # octave 3, inside C3..B3
        minor = key.endswith("m")
        third, sixth = (3, 8) if minor else (4, 9)
        triads = OrderedDict()
        triads["I"] = ({root % 12, (root + third) % 12, (root + 7) % 12}, bass(0))
        triads["V"] = ({(root + 7) % 12, (root + 11) % 12, (root + 2) % 12, (root + 5) % 12}, bass(7))
        iv_bass = bass(5)
        if "#" not in iv_bass:
            triads["IV"] = ({(root + 5) % 12, (root + sixth) % 12, root % 12}, iv_bass)
        return triads

    def lh_notes(self):
        """Returns (list of lh notes one per bar, list of onset beats)."""
        triads = self.bass_for_key()
        t, onsets = 0.0, []
        for n in self.all_notes:
            onsets.append((t, n))
            t += n["d"]
        bars = []
        start = 0.0
        if self.pickup:
            bars.append((0.0, self.pickup, None))
            start = self.pickup
        b = start
        while b < self.total_beats - 1e-6:
            bars.append((b, min(self.bar_beats, self.total_beats - b), True))
            b += self.bar_beats
        out = []
        for (b0, blen, real) in bars:
            if not real:
                out.append((b0, blen, None))
                continue
            score = {k: 0.0 for k in triads}
            for (on, n) in onsets:
                if n.get("rest"):
                    continue
                end = on + n["d"]
                ov = min(end, b0 + blen) - max(on, b0)
                if ov <= 0:
                    continue
                w = ov * (2.0 if abs(on - b0) < 1e-6 else 1.0) * (1.5 if n["d"] >= 2 else 1.0)
                pc = midi(n["p"]) % 12
                for k, (pcs, _) in triads.items():
                    if pc in pcs:
                        score[k] += w
            order = list(triads.keys())
            best = max(order, key=lambda k: (score[k], -order.index(k)))
            out.append((b0, blen, triads[best][1]))
        used = sorted({p for _, _, p in out if p}, key=midi)
        lo = midi(used[0]) if used else midi("C3")
        fingers = {p: max(1, 5 - white_steps(lo, midi(p))) for p in used}
        return out, fingers, onsets

    def with_left_hand(self, melody_who=None):
        bars, fingers, onsets = self.lh_notes()
        bar_at = {round(b0, 4): (blen, p) for b0, blen, p in bars if p}
        notes, lines, t = [], [], 0.0
        for lyric, ns in self.phrases:
            lines.append(OrderedDict([("lyric", lyric), ("from", len(notes))]))
            for n in ns:
                hit = bar_at.get(round(t, 4))
                lh = None
                if hit:
                    blen, p = hit
                    lh = OrderedDict([("p", p), ("d", blen), ("f", fingers[p]), ("h", "L")])
                notes.append(clean_note(n, who=melody_who, lh=lh))
                t += n["d"]
        return notes, lines

    def left_hand_only(self):
        bars, fingers, _ = self.lh_notes()
        out = []
        for b0, blen, p in bars:
            if p:
                out.append(OrderedDict([("p", p), ("d", blen), ("f", fingers[p]), ("h", "L")]))
            else:
                out.append(OrderedDict([("rest", True), ("d", blen)]))
        return out, fingers


# ---------------------------------------------------------------- class builder
def finish_class(song, idx, ctype, title, goal, tip, intro, required, extras,
                 outro_praise="Wonderful playing!"):
    """intro + required units + repeated extras until FILL_TARGET, then praise."""
    cid = "%s-c%02d" % (song.id, idx)
    segs = [seg_title(song, idx, title)] + intro
    praise = seg_praise(outro_praise)
    for unit in required:
        if seq_dur(segs) + seq_dur(unit) + PRAISE_SEC <= FILL_CEILING:
            segs += unit
    k = 0
    stalls = 0
    while extras and seq_dur(segs) < FILL_TARGET and stalls < len(extras):
        unit = extras[k % len(extras)]
        k += 1
        if seq_dur(segs) + seq_dur(unit) + PRAISE_SEC <= FILL_CEILING:
            segs += unit
            stalls = 0
        else:
            stalls += 1
    # still short? add the smallest extra units that fit
    pool = sorted(extras + required, key=seq_dur)
    guard = 0
    while seq_dur(segs) + PRAISE_SEC < CLASS_MIN and guard < 40:
        guard += 1
        fit = [u for u in pool if seq_dur(segs) + seq_dur(u) + PRAISE_SEC <= FILL_CEILING]
        if not fit:
            break
        segs += fit[guard % len(fit)]
    # long songs: units may be too big to repeat; fill with the longest opening part that fits
    guard = 0
    while seq_dur(segs) + PRAISE_SEC < CLASS_MIN and guard < 8:
        guard += 1
        unit = filler_unit(song, FILL_CEILING - seq_dur(segs) - PRAISE_SEC, guard)
        if not unit:
            break
        segs += unit
    if segs[-1]["kind"] == "praise":
        segs[-1] = praise          # never two praise cards in a row at the end
    else:
        segs.append(praise)
    total = seq_dur(segs)
    return OrderedDict([
        ("id", cid), ("index", idx), ("title", title), ("goal", goal), ("type", ctype),
        ("durationSec", total), ("parentTip", tip),
        ("video", "%s/%s.mp4" % (song.id, cid)), ("thumb", "%s/%s.jpg" % (song.id, cid)),
        ("segments", segs)])


def filler_unit(song, budget, k):
    """The longest run of opening phrases (as an age-appropriate segment) fitting in budget seconds."""
    say = seg_say("Let's practise the first part", "Just the opening lines")
    for n in range(len(song.phrases), 0, -1):
        idxs = range(n)
        if song.age == "2-3":
            ns, ls = song.phrase_notes(idxs, who="parent")
            seg = seg_notes("beat", "Tap the beat", ns, song.bpm, cue="You play, your child taps", lines=ls)
        elif song.age == "3-4":
            ns, ls = song.phrase_notes(idxs)
            ns = [clean_note(x) if x.get("rest") or x["p"] == song.special else dict(x, who="parent") for x in ns]
            seg = seg_notes("together", "Play it together", ns, song.bpm, cue="Your child plays the special note",
                            lines=ls)
        else:
            ns, ls = song.phrase_notes(idxs)
            kind = "your_turn" if k % 2 else "together"
            seg = seg_notes(kind, "Your turn!" if kind == "your_turn" else "Play along", ns,
                            slow(song.bpm, 0.8), cue="The first part again", lines=ls)
        if say["durationSec"] + seg["durationSec"] <= budget:
            return [say, seg]
    return None


AGAIN = ["One more time", "Again, nice and easy", "Let's do it again", "And again!",
         "Can you do it once more?", "Again, with a big smile"]
PRAISES = ["Great job!", "You did it!", "Lovely!", "Super listening!", "Well done!", "Yes, that's it!"]


def again(i):
    return AGAIN[i % len(AGAIN)]


def praise_word(i):
    return PRAISES[i % len(PRAISES)]


def slow(bpm, f=0.8):
    return max(50, bpm * f)


# ---------- shared class makers
def cls_concert(song, idx, mode):
    """mode: 'beat' (2-3), 'special' (3-4), 'melody' (4-5), 'lh' (5-6)."""
    bpm = song.bpm
    if mode == "beat":
        notes, lines = song.whole(who="parent")
        perf = lambda c, cue: [seg_notes("beat", c, notes, bpm, cue=cue, lines=lines)]
        cue1 = "You play the tune, your child taps the beat"
    elif mode == "special":
        notes, lines = song.special_song_notes()
        perf = lambda c, cue: [seg_notes("together", c, notes, bpm, cue=cue, lines=lines)]
        cue1 = "You play the tune, your child plays the special note"
    elif mode == "lh":
        notes, lines = song.with_left_hand()
        perf = lambda c, cue: [seg_notes("together", c, notes, bpm, cue=cue, lines=lines)]
        cue1 = "Both hands, nice and steady"
    else:
        notes, lines = song.whole()
        perf = lambda c, cue: [seg_notes("together", c, notes, bpm, cue=cue, lines=lines)]
        cue1 = "Sit tall and play along"
    intro = [seg_say("Concert time!", "Clap for your little pianist"),
             seg_say("Take a bow, then hands ready", "Bow together, then sit at the piano")]
    required = [perf("Play the whole song!", cue1), [seg_praise("Bravo! Take a bow!")]]
    encores = [("Encore! Play it again", "Clap, then play once more", "Encore!"),
               ("Play it for a teddy bear", "Sit a toy on the piano to listen", "A song for teddy"),
               ("Play it for someone you love", "Call a family member to listen", "A song for you"),
               ("One more, big finish!", "Cheer at the last note", "Big finish!")]
    extras = [[seg_say(a, b)] + perf(c, cue1) + [seg_praise(PRAISES[i % len(PRAISES)])]
              for i, (a, b, c) in enumerate(encores)]
    return finish_class(song, idx, "concert", "Concert time",
                        "Play the whole song from start to end and celebrate",
                        "Clap, cheer and bow together. Mistakes are fine. The fun is playing to someone.",
                        intro, required, extras, outro_praise="You are a star pianist!")


def cls_listen(song, idx, title="Listen and sway", ctype="listen",
               goal="Hear the whole song and move to the beat",
               tip="Sit together at the piano. Sway side to side while the song plays.",
               who="parent", show_hand=False):
    notes, lines = song.whole(who=who)
    intro = [seg_say("Let's listen together", "Sit side by side")]
    if show_hand:
        intro.append(seg_say("Thumb on %s, fingers curved" % song.thumb[:-1].replace("#", " sharp"),
                             "Help place one finger on each lit key", show_keys=song.hand))
    required = [[seg_notes("listen", "Listen and sway", notes, song.bpm,
                           cue="Sway side to side", lines=lines)]]
    extras = [[seg_say("Sing along this time", "Sing the words softly"),
               seg_notes("listen", "Sing along", notes, song.bpm, cue="Sing with your child", lines=lines)],
              [seg_say("Now clap along", "Clap gently on each beat"),
               seg_notes("listen", "Clap clap clap", notes, song.bpm, cue="Clap with the beat", lines=lines)],
              [seg_say("Watch the keys light up", "Point at each lit key"),
               seg_notes("listen", "Watch the lights", notes, song.bpm, cue="Point to the lit key", lines=lines),
               seg_praise(praise_word(idx))]]
    return finish_class(song, idx, ctype, title, goal, tip, intro, required, extras)


def cls_beat(song, idx):
    notes, lines = song.whole(who="parent")
    intro = [seg_say("Tap any key on the beat", "You play the tune, your child taps the beat"),
             seg_say("Tap, tap, tap, like a heartbeat", "Tap with your child first")]
    required = [[seg_notes("beat", "Tap with the circle", notes, song.bpm,
                           cue="You play the lit keys", lines=lines)]]
    extras = []
    for i in range(6):
        extras.append([seg_say(again(i), "Keep the taps steady"),
                       seg_notes("beat", ["Tap on every beat", "Tap with the big circle",
                                          "Tap, tap, tap"][i % 3], notes, song.bpm,
                                 cue="You play, your child taps", lines=lines),
                       seg_praise(praise_word(i))])
    return finish_class(song, idx, "beat", "Find the beat",
                        "Tap a steady beat while the grown-up plays the tune",
                        "Any key is fine. Tap with your child's hand at first, then let go.",
                        intro, required, extras)


# ---------- 2-3 Tiny Ears
def cls_high_low(song, idx):
    p_low, l_low = song.phrase_notes([0], who="parent", transpose=-12 if midi(song.thumb) >= midi("C4") else 0)
    p_hi, l_hi = song.phrase_notes([0], who="parent", transpose=12)
    intro = [seg_say("Low keys sound like a big bear", "Show the low end of the piano"),
             seg_say("High keys sound like a little bird", "Show the high end of the piano")]
    bear = lambda c: seg_notes("high_low", c, p_low, song.bpm, cue="Tap any low key", lines=l_low, target="low")
    bird = lambda c: seg_notes("high_low", c, p_hi, song.bpm, cue="Tap any high key", lines=l_hi, target="high")
    required = [[bear("Bear! Tap down low")], [bird("Bird! Tap up high")]]
    extras = [[bear("Here comes the bear")], [bird("Here comes the bird")],
              [seg_say("Is it the bear or the bird?", "Let your child guess first"), bear("The bear!")],
              [bird("The bird!"), seg_praise("Great listening!")],
              [bear("Big bear steps")], [bird("Little bird song"), seg_praise("You know high and low!")]]
    return finish_class(song, idx, "high-low", "Bear low, bird high",
                        "Hear the difference between low and high sounds",
                        "Low keys are on the left, high keys on the right. Any key on the correct side counts.",
                        intro, required, extras)


def cls_loud_soft(song, idx):
    notes, lines = song.whole(who="parent")
    half = max(1, len(song.phrases) // 2)
    n1, l1 = song.phrase_notes(range(half), who="parent")
    loud = lambda c, ns, ls: seg_notes("beat", c, ns, song.bpm, cue="Tap strong, not hard", lines=ls, dynamic="loud")
    soft = lambda c, ns, ls: seg_notes("beat", c, ns, song.bpm, cue="Tap gently, tiny fingers", lines=ls, dynamic="soft")
    intro = [seg_say("Let's play loud and soft", "Show a big tap and a tiny tap"),
             seg_say("Loud like a drum, soft like a whisper", "Whisper the word soft")]
    required = [[loud("Loud taps!", n1, l1)], [soft("Soft taps", n1, l1)]]
    extras = [[seg_say("Now loud for the whole song", "Play strong together"), loud("Big loud taps", notes, lines)],
              [seg_say("Now soft and sleepy", "Play quietly together"), soft("Tiny soft taps", notes, lines),
               seg_praise("Lovely and soft!")],
              [loud("Loud!", n1, l1), soft("Soft...", n1, l1), seg_praise(praise_word(idx))]]
    return finish_class(song, idx, "loud-soft", "Loud and soft",
                        "Tap the beat loudly, then softly",
                        "Loud means strong, not banging. Whisper when it's time to play soft.",
                        intro, required, extras)


def cls_fast_slow(song, idx):
    half = max(1, len(song.phrases) // 2)
    n1, l1 = song.phrase_notes(range(half), who="parent")
    notes, lines = song.whole(who="parent")
    s_bpm, f_bpm = slow(song.bpm, 0.65), min(150, song.bpm * 1.3)
    sl = lambda c, ns, ls: seg_notes("beat", c, ns, s_bpm, cue="Slow, like a sleepy turtle", lines=ls)
    fa = lambda c, ns, ls: seg_notes("beat", c, ns, f_bpm, cue="Quick, like a running bunny", lines=ls)
    intro = [seg_say("Songs can go slow or fast", "Move your arms slowly, then quickly"),
             seg_say("Slow like a turtle, fast like a bunny", "Walk your fingers slowly, then fast")]
    required = [[sl("Slow taps", n1, l1)], [fa("Fast taps!", n1, l1)]]
    extras = [[seg_say("Whole song, slow", "Play the song slowly"), sl("Slow, slow, slow", notes, lines)],
              [seg_say("Whole song, fast!", "Play it a bit faster"), fa("Fast, fast, fast!", notes, lines),
               seg_praise("Speedy fingers!")],
              [sl("Turtle time", n1, l1), fa("Bunny time!", n1, l1), seg_praise(praise_word(idx + 1))]]
    return finish_class(song, idx, "fast-slow", "Slow and fast",
                        "Follow the music when it goes slow and fast",
                        "Let the tempo lead your child. Slow down if taps get wild, then try fast again.",
                        intro, required, extras)


def cls_stop_go(song, idx):
    units = []
    for i in range(len(song.phrases)):
        ns, ls = song.phrase_notes([i], who="parent")
        units.append([seg_notes("beat", "Go! Tap the beat", ns, song.bpm, cue="Play this line", lines=ls),
                      seg_say("Stop! Freeze!", "Stop playing and freeze together", sec=4)])
    intro = [seg_say("When the music stops, we freeze!", "Freeze like a statue together"),
             seg_say("Go means tap, stop means freeze", "Practice one freeze now")]
    return finish_class(song, idx, "stop-go", "Stop and go",
                        "Tap when the music plays and freeze when it stops",
                        "Make freezing silly and fun. Holding still is a big skill for little ones.",
                        intro, units[:2], units[2:] + units[:2] + [[seg_praise("Great freezing!")]])


def cls_together_tiny(song, idx):
    notes, lines = song.whole(who="parent")
    intro = [seg_say("Let's play together", "You play the tune, your child taps along"),
             seg_say("Sing, tap and smile", "Sing the words while you play")]
    required = [[seg_notes("together", "Play it together", notes, song.bpm,
                           cue="Your child taps any key on the beat", lines=lines)]]
    extras = [[seg_say(again(i), "Swap: let your child choose loud or soft"),
               seg_notes("beat", "Tap the beat with me", notes, song.bpm, cue="Keep it steady", lines=lines),
               seg_praise(praise_word(i))] for i in range(4)] + \
             [[seg_notes("together", "Play it together", notes, song.bpm,
                         cue="Your child taps along", lines=lines)]]
    return finish_class(song, idx, "together", "Play together",
                        "Play the song together, grown-up on the tune, child on the beat",
                        "Follow your child's lead. If they stop to listen, keep playing and smile.",
                        intro, required, extras)


def build_tiny(song):
    makers = [cls_listen, cls_beat, cls_high_low, cls_loud_soft, cls_fast_slow,
              cls_stop_go, cls_together_tiny]
    classes = [m(song, i + 1) for i, m in enumerate(makers)]
    classes.append(cls_concert(song, len(classes) + 1, "beat"))
    return classes


# ---------- 3-4 Little Explorer
def special_label(song):
    return song.special[:-1].replace("#", " sharp")


def cls_find_special(song, idx):
    sp = song.special
    f = song.special_finger
    nt = lambda d=1: clean_note({"p": sp, "d": d, **({"f": f} if f else {})})
    keys = [OrderedDict([("p", sp)] + ([("f", f)] if f else []))]
    lab = special_label(song)
    intro = [seg_say("Meet our special note: %s" % lab, "Find the lit key together", show_keys=keys),
             seg_say("It comes back again and again", "Count how often you hear it")]
    four = [nt(), nt(), nt(), nt(2)]
    required = [[seg_notes("demo", "Watch: %s, %s, %s" % (lab, lab, lab), four, slow(song.bpm, 0.75),
                           cue="Point to the lit key")],
                [seg_notes("your_turn", "Your turn!", four, slow(song.bpm, 0.75),
                           cue="Help one finger press the key")]]
    extras = []
    for i in range(6):
        pat = [nt(), nt(1), nt(2)] if i % 2 else [nt(2), nt(2)]
        extras.append([seg_say(again(i), "Use the finger number shown"),
                       seg_notes("demo", "Listen first", pat, slow(song.bpm, 0.8), cue="Watch the key"),
                       seg_notes("your_turn", "Your turn!", pat, slow(song.bpm, 0.8), cue="Let your child press it"),
                       seg_praise(praise_word(i))])
    return finish_class(song, idx, "special-note", "Find the special note",
                        "Find and play the song's special note: %s" % lab,
                        "Help your child find %s. Use one finger and press gently, like a button." % lab,
                        intro, required, extras)


def cls_echo(song, idx, patterns, part):
    bpm = slow(song.bpm, 0.8)
    intro = [seg_say("Echo me! I play, then you play", "Listen first, then copy"),
             seg_say("Just like an echo in a cave", "Say hello and echo it back")]
    units = []
    for i, p in enumerate(patterns):
        units.append([seg_notes("demo", "Listen", p, bpm, cue="Watch which keys light"),
                      seg_notes("your_turn", "Your turn! Echo me", p, bpm, cue="Help with the first key only")])
        if i % 2 == 1:
            units[-1].append(seg_praise(praise_word(i)))
    title = "Echo me" if part == 1 else "Echo me again"
    return finish_class(song, idx, "echo", title,
                        "Copy short 2 and 3 note patterns from the song",
                        "Watch first, then copy. If it's tricky, play just the first key together.",
                        intro, units[:2], units[2:] + units[:2])


def cls_special_in_song(song, idx):
    notes, lines = song.special_song_notes()
    lab = special_label(song)
    intro = [seg_say("Now the special note in the song", "You play the other notes"),
             seg_say("When %s lights up, it's your turn" % lab, "Your child plays only the coral key")]
    half = max(1, len(song.phrases) // 2)
    h_notes, h_lines = [], []
    for i in range(half):
        lyric, ns = song.phrases[i]
        h_lines.append(OrderedDict([("lyric", lyric), ("from", len(h_notes))]))
        h_notes += [clean_note(n) if n.get("rest") or n["p"] == song.special
                    else clean_note(n, who="parent") for n in ns]
    bpm_s = slow(song.bpm, 0.75)
    required = [[seg_notes("demo", "Listen for %s" % lab, h_notes, bpm_s, cue="Point when %s lights" % lab,
                           lines=h_lines)],
                [seg_notes("your_turn", "Your turn on %s!" % lab, h_notes, bpm_s,
                           cue="You play the blue keys", lines=h_lines)]]
    extras = [[seg_say("The whole song now", "You play, your child plays %s" % lab),
               seg_notes("your_turn", "Your turn on %s!" % lab, notes, bpm_s, cue="Wait for the coral key",
                         lines=lines), seg_praise("Perfect timing!")],
              [seg_notes("together", "Play it together", notes, song.bpm, cue="Keep going, even after a miss",
                         lines=lines)],
              [seg_notes("your_turn", "Your turn!", h_notes, bpm_s, cue="You play the blue keys",
                         lines=h_lines), seg_praise(praise_word(idx))]]
    return finish_class(song, idx, "special-note", "Special note in the song",
                        "Play the special note at the right moments in the song",
                        "You play the blue keys, your child plays the coral one. Waiting is part of the game.",
                        intro, required, extras)


def cls_together_explorer(song, idx):
    notes, lines = song.special_song_notes()
    intro = [seg_say("Let's play the song together", "You on the tune, your child on %s" % special_label(song)),
             seg_say("Ready, set, play!", "Count four beats out loud")]
    required = [[seg_notes("together", "Play it together", notes, song.bpm, cue="Keep the beat steady",
                           lines=lines)]]
    extras = [[seg_say(again(i), "Swap seats if your child wants"),
               seg_notes("together", "Together again", notes, song.bpm if i % 2 else slow(song.bpm, 0.85),
                         cue="Smile and keep going", lines=lines), seg_praise(praise_word(i))]
              for i in range(5)]
    return finish_class(song, idx, "together", "Play together",
                        "Play the whole song together at full speed",
                        "Keep playing even if your child misses a note. The beat matters more than being perfect.",
                        intro, required, extras)


def build_explorer(song):
    pats = song.echo_patterns(limit=8)
    classes = [cls_listen(song, 1), cls_beat(song, 2), cls_find_special(song, 3)]
    if len(pats) >= 6 and song.total_beats > 40:
        classes.append(cls_echo(song, len(classes) + 1, pats[:4], 1))
        classes.append(cls_echo(song, len(classes) + 1, pats[4:] + pats[:2], 2))
    else:
        classes.append(cls_echo(song, len(classes) + 1, pats, 1))
    classes.append(cls_special_in_song(song, len(classes) + 1))
    classes.append(cls_together_explorer(song, len(classes) + 1))
    classes.append(cls_concert(song, len(classes) + 1, "special"))
    return classes


# ---------- 4-5 First Songs / 5-6 Little Pianist
def cls_phrase(song, idx, group, label, first=False, bpm_f=0.75):
    notes, lines = song.phrase_notes(group)
    bpm_s = slow(song.bpm, bpm_f)
    lyric = song.phrases[group[0]][0]
    short = " ".join(lyric.split()[:5])
    intro = []
    if first:
        intro.append(seg_say("Thumb on %s, fingers curved" % song.thumb[:-1].replace("#", " sharp"),
                             "Help place one finger on each lit key", show_keys=song.hand))
    intro.append(seg_say("Today: %s" % short if short else "Today: a new part", "Listen first, then copy"))
    rep = max(song.repeats_of(i) for i in group)
    if rep > 1:
        intro.append(seg_say("This part comes back %d times!" % rep, "Point it out when you hear it"))
    required = [[seg_notes("demo", "Watch the lights", notes, bpm_s, cue="Watch the finger numbers", lines=lines)],
                [seg_notes("your_turn", "Your turn!", notes, bpm_s, cue="Point to each key if needed", lines=lines)]]
    extras = []
    if len(group) > 1:
        for gi in group:
            n1, l1 = song.phrase_notes([gi])
            extras.append([seg_say("Just this line", "Practice one line at a time"),
                           seg_notes("demo", "Watch", n1, bpm_s, cue="Watch the fingers", lines=l1),
                           seg_notes("your_turn", "Your turn!", n1, bpm_s, cue="Slow is fine", lines=l1),
                           seg_praise(praise_word(gi))])
    for i in range(5):
        extras.append([seg_say(again(i), "Fingers ready on the lit keys"),
                       seg_notes("your_turn", "Your turn!", notes, bpm_s, cue="Let your child try alone",
                                 lines=lines)] +
                      ([seg_notes("together", "Now together, a bit faster", notes, slow(song.bpm, 0.9),
                                  cue="Play the same keys an octave up", lines=lines)] if i % 2 else []) +
                      [seg_praise(praise_word(i + idx))])
    return finish_class(song, idx, "phrase", label, "Learn %s, one finger per key" % (
        "the first part" if first else "the next part"),
        "Say the finger numbers out loud together. Slow and even is better than fast.",
        intro, required, extras)


def cls_put_together(song, idx):
    notes, lines = song.whole()
    bpm_s = slow(song.bpm, 0.75)
    intro = [seg_say("Let's put all the parts together", "Remind your child of each part"),
             seg_say("Fingers on the lit keys", "Check the thumb is on %s" % song.thumb[:-1], show_keys=song.hand)]
    required = [[seg_notes("demo", "Watch the whole song", notes, bpm_s, cue="Watch together", lines=lines)],
                [seg_notes("your_turn", "Your turn! The whole song", notes, bpm_s, cue="Help only if stuck",
                           lines=lines)]]
    extras = [[seg_say(again(i), "Take a breath between lines"),
               seg_notes("your_turn" if i % 2 == 0 else "together",
                         "Your turn!" if i % 2 == 0 else "Play along", notes,
                         bpm_s if i % 2 == 0 else slow(song.bpm, 0.85), cue="Keep going after a slip",
                         lines=lines), seg_praise(praise_word(i))] for i in range(5)]
    return finish_class(song, idx, "put-together", "Put it together",
                        "Play the whole song slowly, all parts in order",
                        "If your child gets stuck, sing the next word. Do not fix every note.",
                        intro, required, extras)


def cls_play_along(song, idx):
    notes, lines = song.whole()
    intro = [seg_say("Play along at full speed!", "Count in: one, two, ready, go"),
             seg_say("Keep going, even after a slip", "Cheer for keeping the beat")]
    required = [[seg_notes("together", "Play along", notes, slow(song.bpm, 0.9), cue="A little slower first",
                           lines=lines)],
                [seg_notes("together", "Full speed!", notes, song.bpm, cue="Full speed now", lines=lines)]]
    extras = [[seg_say(again(i), "Sing the words together"),
               seg_notes("together", "Play along", notes, song.bpm, cue="Sing while you play", lines=lines),
               seg_praise(praise_word(i))] for i in range(5)]
    return finish_class(song, idx, "play-along", "Play along",
                        "Play the whole song along with the music at full speed",
                        "Keeping up with the music is the goal. Missed notes are fine, just keep going.",
                        intro, required, extras)


def cls_practice(song, idx):
    notes, lines = song.whole()
    bpm_s = slow(song.bpm, 0.7)
    intro = [seg_say("Slow and steady practice", "Go slowly, no rush")]
    units = [[seg_notes("demo", "Watch", notes, bpm_s, cue="Watch the finger numbers", lines=lines),
              seg_notes("your_turn", "Your turn!", notes, bpm_s, cue="Help only if stuck", lines=lines),
              seg_praise(praise_word(i))] for i in range(4)]
    return finish_class(song, idx, "phrase", "Slow and steady",
                        "Play the whole song slowly and evenly",
                        "Slow playing builds sure fingers. Praise the effort, not the speed.",
                        intro, units[:1], units[1:])


def cls_first_half(song, idx, half_groups):
    idxs = [i for g in half_groups for i in g]
    c = cls_phrase(song, idx, idxs, "Hands ready, first half", first=True)
    c["type"] = "hand-position"
    c["goal"] = "Find the hand position and learn the first half"
    return c


def cls_left_hand(song, idx):
    lh, fingers = song.left_hand_only()
    notes, lines = song.with_left_hand(melody_who="parent")
    keys = [OrderedDict([("p", p), ("f", f)]) for p, f in sorted(fingers.items(), key=lambda x: midi(x[0]))]
    lows = " and ".join(p[:-1] for p in [k["p"] for k in keys])
    bpm_s = slow(song.bpm, 0.75)
    intro = [seg_say("Meet your left hand!", "Left hand sits low on the left side", show_keys=keys),
             seg_say("One low note at the start of each bar", "The low notes are %s" % lows, show_keys=keys)]
    required = [[seg_notes("demo", "Watch the low notes", lh, bpm_s, cue="Count one, two, three, four")],
                [seg_notes("your_turn", "Your turn! Left hand", lh, bpm_s, cue="Left hand only")]]
    extras = [[seg_say(again(i), "You play the tune, child plays low notes"),
               seg_notes("together", "Low notes with the tune", notes, bpm_s if i % 2 == 0 else song.bpm,
                         cue="You play the blue keys", lines=lines), seg_praise(praise_word(i))]
              for i in range(3)] + \
             [[seg_notes("your_turn", "Your turn! Left hand", lh, bpm_s, cue="Say the bar count out loud")]]
    return finish_class(song, idx, "left-hand", "Left hand helper",
                        "Play one low left hand note at the start of each bar",
                        "You play the tune, your child plays the low notes. Count bars out loud to help.",
                        intro, required, extras)


def cls_hands_together(song, idx):
    notes, lines = song.with_left_hand()
    bpm_s = slow(song.bpm, 0.65)
    half = max(1, len(song.phrases) // 2)
    first = []
    first_lines = []
    cnt = sum(len(song.phrases[i][1]) for i in range(half))
    first = notes[:cnt]
    first_lines = [l for l in lines if l["from"] < cnt]
    intro = [seg_say("Both hands together, very slowly", "Left hand low, right hand ready",
                     show_keys=song.hand)]
    required = [[seg_notes("demo", "Watch both hands", first, bpm_s, cue="Low note and tune start together",
                           lines=first_lines)],
                [seg_notes("your_turn", "Your turn! Both hands", first, bpm_s, cue="Slow is perfect",
                           lines=first_lines)]]
    extras = [[seg_say("The whole song, both hands", "Help with the left hand if needed"),
               seg_notes("your_turn", "Your turn! Both hands", notes, bpm_s, cue="Keep it slow", lines=lines),
               seg_praise("Two hands, wow!")],
              [seg_notes("together", "Together, slowly", notes, bpm_s, cue="Play along slowly", lines=lines),
               seg_praise(praise_word(idx))],
              [seg_notes("your_turn", "Your turn!", first, bpm_s, cue="First half again", lines=first_lines)]]
    return finish_class(song, idx, "hands-together", "Hands together, slowly",
                        "Play the tune with a low left hand note on each bar",
                        "Two hands is hard work. Go very slowly and stop while it's still fun.",
                        intro, required, extras)


def build_first_songs(song):
    groups, uniq = song.unique_phrase_groups(max_groups=8)
    if len(groups) + 4 < 6 and len(uniq) > len(groups):
        groups = [[i] for i in uniq][:8]   # short song: one class per phrase instead of pairs
    classes = [cls_listen(song, 1, title="Listen and find your hand", ctype="listen",
                          goal="Hear the song and place the right hand",
                          tip="Help your child put one finger on each lit key. Curved fingers, like holding a ball.",
                          who=None, show_hand=True)]
    for gi, g in enumerate(groups):
        classes.append(cls_phrase(song, len(classes) + 1, g, "Part %d" % (gi + 1)))
    classes.append(cls_put_together(song, len(classes) + 1))
    while len(classes) < 4:
        classes.append(cls_practice(song, len(classes) + 1))
    classes.append(cls_play_along(song, len(classes) + 1))
    classes.append(cls_concert(song, len(classes) + 1, "melody"))
    return classes


def build_pianist(song):
    groups, _ = song.unique_phrase_groups(max_groups=12, max_beats=24.0)
    n_first = max(1, (len(groups) + 1) // 2)
    while len(groups) - n_first > 6:  # 6 fixed classes + phrase classes <= 12
        n_first += 1
    classes = [cls_first_half(song, 1, groups[:n_first])]
    for gi, g in enumerate(groups[n_first:]):
        classes.append(cls_phrase(song, len(classes) + 1, g, "Part %d" % (gi + 2), bpm_f=0.8))
    classes.append(cls_put_together(song, len(classes) + 1))
    classes.append(cls_left_hand(song, len(classes) + 1))
    classes.append(cls_hands_together(song, len(classes) + 1))
    classes.append(cls_play_along(song, len(classes) + 1))
    classes.append(cls_concert(song, len(classes) + 1, "lh"))
    return classes


BUILDERS = {"2-3": build_tiny, "3-4": build_explorer, "4-5": build_first_songs, "5-6": build_pianist}


def build_lesson(song_dict):
    song = Song(song_dict)
    classes = BUILDERS[song.age](song)
    for i, c in enumerate(classes):  # renumber (fallback inserts) and rebuild ids/paths
        idx = i + 1
        c["index"] = idx
        c["id"] = "%s-c%02d" % (song.id, idx)
        c["video"] = "%s/%s.mp4" % (song.id, c["id"])
        c["thumb"] = "%s/%s.jpg" % (song.id, c["id"])
        c["segments"][0]["subcaption"] = "Class %d: %s" % (idx, c["title"])
    return OrderedDict([("songId", song.id), ("title", song.title), ("ageGroup", song.age),
                        ("icon", song_dict.get("icon", "music")), ("key", song_dict.get("key", "C")),
                        ("timeSignature", song_dict.get("timeSignature", "4/4")),
                        ("classes", classes)])


# ---------------------------------------------------------------- validator
def validate_lesson(lesson, song=None):
    errs = []
    sid = lesson.get("songId")
    if not sid or not re.match(r"^[a-z0-9]+(-[a-z0-9]+)*$", sid):
        errs.append("songId missing or not kebab-case: %r" % sid)
    if song is not None and song["id"] != sid:
        errs.append("songId %r != song id %r" % (sid, song["id"]))
    classes = lesson.get("classes", [])
    if not 6 <= len(classes) <= 12:
        errs.append("%s: %d classes (need 6-12)" % (sid, len(classes)))
    seen = set()
    for i, c in enumerate(classes):
        where = "%s class %d" % (sid, i + 1)
        exp_id = "%s-c%02d" % (sid, i + 1)
        if c.get("id") != exp_id:
            errs.append("%s: id %r != %r" % (where, c.get("id"), exp_id))
        if c.get("id") in seen:
            errs.append("%s: duplicate id" % where)
        seen.add(c.get("id"))
        if c.get("index") != i + 1:
            errs.append("%s: index %r" % (where, c.get("index")))
        for k in ("title", "goal", "type", "durationSec", "parentTip", "video", "thumb", "segments"):
            if k not in c:
                errs.append("%s: missing %s" % (where, k))
        if c.get("type") not in CLASS_TYPES:
            errs.append("%s: unknown type %r" % (where, c.get("type")))
        if c.get("video") != "%s/%s.mp4" % (sid, exp_id):
            errs.append("%s: video path %r" % (where, c.get("video")))
        if c.get("thumb") != "%s/%s.jpg" % (sid, exp_id):
            errs.append("%s: thumb path %r" % (where, c.get("thumb")))
        if words(c.get("parentTip", "")) > 25:
            errs.append("%s: parentTip > 25 words" % where)
        segs = c.get("segments", [])
        total = sum(s.get("durationSec", 0) for s in segs)
        if total != c.get("durationSec"):
            errs.append("%s: segments sum %s != durationSec %s" % (where, total, c.get("durationSec")))
        if not CLASS_MIN <= c.get("durationSec", 0) <= CLASS_MAX:
            errs.append("%s: durationSec %s outside 180-300" % (where, c.get("durationSec")))
        if not segs or segs[0].get("kind") != "title":
            errs.append("%s: first segment must be title" % where)
        for j, s in enumerate(segs):
            sw = "%s seg %d" % (where, j)
            if s.get("kind") not in SEG_KINDS:
                errs.append("%s: bad kind %r" % (sw, s.get("kind")))
            if not isinstance(s.get("durationSec"), int) or s["durationSec"] <= 0:
                errs.append("%s: durationSec must be positive int" % sw)
            cap = s.get("caption", "")
            if not cap or words(cap) > 12:
                errs.append("%s: caption empty or > 12 words: %r" % (sw, cap))
            if re.search(u"[\U0001F000-\U0001FFFF☀-➿]", json.dumps(s, ensure_ascii=False)):
                errs.append("%s: emoji found" % sw)
            if s.get("kind") in NOTE_KINDS:
                ns = s.get("notes") or []
                if not ns or not s.get("bpm"):
                    errs.append("%s: note segment needs notes and bpm" % sw)
                    continue
                for n in ns + [n["lh"] for n in ns if "lh" in n]:
                    if n.get("rest"):
                        continue
                    try:
                        m = midi(n["p"])
                    except Exception:
                        errs.append("%s: bad pitch %r" % (sw, n.get("p")))
                        continue
                    if not midi("C3") <= m <= midi("C6"):
                        errs.append("%s: pitch %s outside C3-C6" % (sw, n["p"]))
                    if n.get("d", 0) <= 0:
                        errs.append("%s: bad duration" % sw)
                    if "f" in n and n["f"] not in (1, 2, 3, 4, 5):
                        errs.append("%s: bad finger" % sw)
                need = math.ceil(s.get("leadInSec", 0) + note_body_sec(ns, s["bpm"], s.get("gapBeats", 0)) + TAIL_SEC)
                if s["durationSec"] != need:
                    errs.append("%s: durationSec %s != computed %s" % (sw, s["durationSec"], need))
                if s.get("kind") == "high_low" and s.get("target") not in ("low", "high"):
                    errs.append("%s: high_low needs target low|high" % sw)
                for ln in s.get("lines", []):
                    if not 0 <= ln.get("from", -1) < len(ns):
                        errs.append("%s: line index out of range" % sw)
    if classes and classes[-1].get("type") != "concert":
        errs.append("%s: last class must be concert" % sid)
    return errs


def load_songs(path):
    with open(path) as f:
        songs = json.load(f)
    if isinstance(songs, dict) and "songs" in songs:
        songs = songs["songs"]
    return songs


def main():
    ap = argparse.ArgumentParser()
    default = os.path.join(HERE, "songs.json")
    if not os.path.exists(default):
        default = os.path.join(HERE, "seed-songs.json")
    ap.add_argument("--songs", nargs="+", default=[default],
                    help="one or more Song[] files; later files win on duplicate ids")
    ap.add_argument("--out", default=os.path.join(HERE, "lessons"))
    ap.add_argument("--validate-only", action="store_true")
    ap.add_argument("--prune", action="store_true",
                    help="delete lesson files whose song is not in --songs (e.g. seed songs dropped from songs.json)")
    a = ap.parse_args()
    merged = OrderedDict()
    for sp in a.songs:
        for sd in load_songs(sp):
            merged[sd["id"]] = sd
    songs = list(merged.values())
    os.makedirs(a.out, exist_ok=True)
    all_errs, n_classes, durs = [], 0, []
    for sd in songs:
        path = os.path.join(a.out, sd["id"] + ".json")
        if not a.validate_only:
            try:
                lesson = build_lesson(sd)
            except Exception as e:  # report per song, keep going
                all_errs.append("%s: build failed: %r" % (sd.get("id"), e))
                continue
            # validate before writing; only valid lessons reach content/lessons (atomic replace)
            lesson = json.loads(json.dumps(lesson))
            errs = validate_lesson(lesson, sd)
            if errs:
                all_errs += errs
                if os.path.exists(path):
                    os.remove(path)
                continue
            tmp = path + ".tmp"
            with open(tmp, "w") as f:
                json.dump(lesson, f, indent=1, ensure_ascii=False)
                f.write("\n")
            os.replace(tmp, path)
        if not os.path.exists(path):
            all_errs.append("%s: no lesson file" % sd["id"])
            continue
        with open(path) as f:
            lesson = json.load(f)
        errs = validate_lesson(lesson, sd)
        all_errs += errs
        n_classes += len(lesson["classes"])
        durs += [c["durationSec"] for c in lesson["classes"]]
    if a.prune:
        keep = {sd["id"] + ".json" for sd in songs}
        for fn in os.listdir(a.out):
            if fn.endswith(".json") and fn not in keep:
                os.remove(os.path.join(a.out, fn))
                print("pruned stale lesson file %s" % fn)
    print("songs: %d  classes: %d  class duration min/avg/max: %d/%.0f/%d s  total video: %.1f h"
          % (len(songs), n_classes, min(durs) if durs else 0, sum(durs) / max(1, len(durs)),
             max(durs) if durs else 0, sum(durs) / 3600.0))
    if all_errs:
        print("VALIDATION FAILED: %d problems (invalid lessons were not written)" % len(all_errs))
        for e in all_errs[:200]:
            print("  " + e)
        sys.exit(1)
    print("VALIDATION OK: every lesson file matches the contract")


if __name__ == "__main__":
    main()
