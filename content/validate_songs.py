#!/usr/bin/env python3
"""Validate content/songs.json against CONTRACT.md (Song schema).

Usage: python3 content/validate_songs.py [path/to/songs.json]
Exit code 0 = no violations (warnings allowed), 1 = violations.

Difficulty rule (CONTRACT.md "Difficulty", applied literally; the lowest level whose
limits the song fits is the expected difficulty):
  1: <=4 distinct pitches, steps only (every interval <=2 semitones), only quarter/half/
     dotted-half/whole notes, bpm <=90, <=16 notes, all pitches C4-G4
  2: <=5 distinct pitches, all pitches C4-G4 (five-finger position), simple rhythm
     (only quarter/half/dotted-half/whole notes)
  3: <=8 distinct pitches, range < an octave (<=11 semitones), small skips (<= a 5th),
     no dotted rhythms (d=1.5), at most one hand-position shift (<=2 positions)
  4: range <= an octave (12 semitones), dotted rhythms, longer song, more shifts
  5: wider range (>12 semitones) or a left-hand part
Seed songs (seed-songs.json, copied as-is per brief) are checked but a difficulty
mismatch on a seed is reported as a WARNING, not a violation.
"""
import json
import os
import re
import sys
from collections import Counter, defaultdict

HERE = os.path.dirname(os.path.abspath(__file__))
TAGS = set("classic animals bedtime counting movement nature vehicles food seasonal silly alphabet family".split())
ICONS = set("""star sheep farm spider boat bus bell duck frog cat dog fish bird sun moon rain flower tree
train car house heart crown apple cake music drum horse pig cow bear monkey elephant mouse bee butterfly
snowflake gift clock ball""".split())
AGES = ["2-3", "3-4", "4-5", "5-6"]
DURS = {0.5, 1, 1.5, 2, 3, 4}
REQUIRED = ["id", "title", "origin", "publicDomainBasis", "ageGroup", "difficulty", "tags",
            "icon", "key", "bpm", "timeSignature", "phrases"]
KEYS = {"C", "G", "F", "Am"}
PITCH_RE = re.compile(r"^([A-G])(#?)(\d)$")
SEMI = {"C": 0, "D": 2, "E": 4, "F": 5, "G": 7, "A": 9, "B": 11}
LETTER_IDX = {"C": 0, "D": 1, "E": 2, "F": 3, "G": 4, "A": 5, "B": 6}


def midi(p):
    m = PITCH_RE.match(p)
    if not m:
        return None
    letter, sharp, octv = m.groups()
    return 12 * (int(octv) + 1) + SEMI[letter] + (1 if sharp else 0)


def diatonic(p):
    m = PITCH_RE.match(p)
    letter, _, octv = m.groups()
    return LETTER_IDX[letter] + 7 * int(octv)


C3, C4, G4, C6 = midi("C3"), midi("C4"), midi("G4"), midi("C6")


def features(song):
    notes = [n for ph in song["phrases"] for n in ph["notes"] if not n.get("rest")]
    ms = [midi(n["p"]) for n in notes]
    durs = {n["d"] for n in notes}
    ints = [abs(a - b) for a, b in zip(ms, ms[1:])]
    rh = [n for n in notes if n.get("h") != "L" and n.get("f")]
    positions = {diatonic(n["p"]) - (n["f"] - 1) for n in rh}
    return {
        "count": len(notes),
        "distinct": len(set(ms)),
        "span": max(ms) - min(ms),
        "lo": min(ms), "hi": max(ms),
        "max_int": max(ints) if ints else 0,
        "durs": durs,
        "dotted": 1.5 in durs,
        "simple_rhythm": durs <= {1, 2, 3, 4},
        "positions": len(positions),
        "left_hand": any(n.get("h") == "L" for n in notes),
        "bpm": song["bpm"],
    }


def expected_difficulty(song):
    f = features(song)
    in_five = f["lo"] >= C4 and f["hi"] <= G4
    if (f["distinct"] <= 4 and f["max_int"] <= 2 and f["simple_rhythm"] and f["bpm"] <= 90
            and f["count"] <= 16 and in_five and not f["left_hand"]):
        return 1
    if f["distinct"] <= 5 and in_five and f["simple_rhythm"] and not f["left_hand"]:
        return 2
    if (f["distinct"] <= 8 and f["span"] <= 11 and f["max_int"] <= 7 and not f["dotted"]
            and f["positions"] <= 2 and not f["left_hand"]):
        return 3
    if f["span"] <= 12 and not f["left_hand"]:
        return 4
    return 5


def main(path):
    songs = json.load(open(path))
    seeds = {s["id"] for s in json.load(open(os.path.join(HERE, "seed-songs.json")))}
    viol, warn = [], []

    def V(sid, msg):
        viol.append((sid, msg))

    if not isinstance(songs, list):
        print("songs.json must be a list")
        return 1
    if len(songs) != 100:
        V("*", "expected 100 songs, found %d" % len(songs))
    ids = Counter(s.get("id") for s in songs)
    for sid, c in ids.items():
        if c > 1:
            V(sid, "duplicate id (%d times)" % c)
    titles = Counter(s.get("title", "").lower() for s in songs)
    for t, c in titles.items():
        if c > 1:
            V(t, "duplicate title")
    ages = Counter(s.get("ageGroup") for s in songs)
    for a in AGES:
        if ages.get(a, 0) != 25:
            V("*", "ageGroup %s has %d songs (need 25)" % (a, ages.get(a, 0)))

    for s in songs:
        sid = s.get("id", "?")
        for k in REQUIRED:
            if k not in s or s[k] in ("", None, []):
                V(sid, "missing field %s" % k)
        if any(k not in s for k in REQUIRED):
            continue
        if not re.match(r"^[a-z0-9]+(-[a-z0-9]+)*$", sid):
            V(sid, "id not kebab-case")
        if s["ageGroup"] not in AGES:
            V(sid, "bad ageGroup %r" % s["ageGroup"])
        if s["difficulty"] not in (1, 2, 3, 4, 5):
            V(sid, "bad difficulty %r" % s["difficulty"])
        for t in s["tags"]:
            if t not in TAGS:
                V(sid, "tag not allowed: %s" % t)
        if s["icon"] not in ICONS:
            V(sid, "icon not allowed: %s" % s["icon"])
        if s["key"] not in KEYS:
            V(sid, "key %r not C/G/F/Am" % s["key"])
        if not (70 <= s["bpm"] <= 120):
            V(sid, "bpm %r outside 70-120" % s["bpm"])
        if s["timeSignature"] not in ("2/4", "3/4", "4/4", "6/8"):
            V(sid, "timeSignature %r" % s["timeSignature"])
        for i, ph in enumerate(s["phrases"]):
            where = "phrase %d" % (i + 1)
            if not ph.get("lyric"):
                V(sid, where + ": empty lyric")
            pitched = [n for n in ph.get("notes", []) if not n.get("rest")]
            if not (3 <= len(pitched) <= 12):
                V(sid, where + ": %d notes (need 3-12)" % len(pitched))
            for n in ph.get("notes", []):
                if n.get("d") not in DURS:
                    V(sid, where + ": bad d %r" % n.get("d"))
                if n.get("rest"):
                    continue
                p = n.get("p", "")
                mm = midi(p)
                if mm is None:
                    V(sid, where + ": unparsable pitch %r" % p)
                    continue
                if "b" in p[1:]:
                    V(sid, where + ": flat used %r" % p)
                if not (C3 <= mm <= C6):
                    V(sid, where + ": pitch %s outside C3-C6" % p)
                if "f" in n and n["f"] not in (1, 2, 3, 4, 5):
                    V(sid, where + ": finger %r" % n["f"])
                if n.get("h") not in (None, "L"):
                    V(sid, where + ": bad h %r" % n.get("h"))
                if "f" not in n and n.get("h") != "L":
                    V(sid, where + ": right-hand note without finger")
        if any(midi(n.get("p", "")) is None for ph in s["phrases"] for n in ph["notes"] if not n.get("rest")):
            continue
        exp = expected_difficulty(s)
        if s.get("difficultyMethod") == "catalog-relative":
            if s["difficulty"] not in (1, 2, 3, 4, 5):
                V(sid, "difficulty out of range")
        elif exp != s["difficulty"]:
            f = features(s)
            msg = ("difficulty %d but rule gives %d (distinct=%d span=%d dotted=%s simple=%s positions=%d)"
                   % (s["difficulty"], exp, f["distinct"], f["span"], f["dotted"], f["simple_rhythm"], f["positions"]))
            (warn if sid in seeds else viol).append((sid, msg + (" [seed kept as-is]" if sid in seeds else "")))
        if s["difficulty"] <= 2 and features(s)["hi"] > midi("A4") and s.get("difficultyMethod") != "catalog-relative":
            V(sid, "difficulty 1-2 but goes above A4")

    if viol:
        print("VIOLATIONS (%d)" % len(viol))
        print("%-34s %s" % ("song", "problem"))
        for sid, msg in viol:
            print("%-34s %s" % (sid, msg))
    else:
        print("VIOLATIONS: none")
    if warn:
        print("\nWARNINGS (%d)" % len(warn))
        for sid, msg in warn:
            print("%-34s %s" % (sid, msg))

    dist = defaultdict(Counter)
    for s in songs:
        dist[s.get("ageGroup")][s.get("difficulty")] += 1
    print("\nDifficulty per age group")
    print("age   " + "".join("  d%d" % d for d in range(1, 6)) + "  total")
    for a in AGES:
        print("%-5s " % a + "".join("%4d" % dist[a][d] for d in range(1, 6)) + "  %5d" % sum(dist[a].values()))
    print("\nsongs: %d   unique ids: %d" % (len(songs), len(ids)))
    return 1 if viol else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, "songs.json")))
