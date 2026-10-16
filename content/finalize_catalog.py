#!/usr/bin/env python3
"""Final pass on content/songs.json (run after `_src/build_songs.py all`).

1. Difficulty 1-5 is RELATIVE to the whole catalog: every song gets a complexity
   score (distinct pitches, range, leaps, rhythm, hand positions, sharps, length,
   left hand, tempo) and the 100 songs are split into five equal bands of 20.
   Parents compare songs inside the app, so "Easy" must mean easy *here*.
2. Age groups are rebalanced to exactly 25 each without moving any song more
   than one group: surplus songs move to the neighbouring group they fit best.
3. Melody confidence (H/M/L from the batch headers; seed songs = H) is stored as
   `melodyConfidence`, and content/teacher-review.csv lists every song for the
   music-teacher check, low confidence first.
"""
import csv
import glob
import json
import os
import re

from validate_songs import features, midi

HERE = os.path.dirname(os.path.abspath(__file__))
AGES = ["2-3", "3-4", "4-5", "5-6"]


def confidence_map():
    conf = {}
    for path in sorted(glob.glob(os.path.join(HERE, "_src", "b*.txt"))):
        for line in open(path, encoding="utf-8"):
            if line.startswith("== "):
                parts = [p.strip() for p in line[3:].split("|")]
                conf[parts[0]] = parts[-1] if parts[-1] in ("H", "M", "L", "S") else "M"
    for s in json.load(open(os.path.join(HERE, "seed-songs.json"))):
        conf[s["id"]] = "H"
    return conf


def score(song):
    f = features(song)
    notes = [n for ph in song["phrases"] for n in ph["notes"] if not n.get("rest")]
    sharps = sum(1 for n in notes if "#" in n["p"]) / max(1, len(notes))
    off_beat = sum(1 for n in notes if n["d"] not in (1, 2, 3, 4)) / max(1, len(notes))
    return (
        1.0 * f["distinct"]
        + 0.35 * f["span"]
        + 0.30 * f["max_int"]
        + 4.0 * off_beat
        + 1.5 * (f["positions"] - 1)
        + 8.0 * sharps
        + 0.04 * f["count"]
        + 3.0 * f["left_hand"]
        + 0.02 * max(0, f["bpm"] - 90)
    )


def main():
    path = os.path.join(HERE, "songs.json")
    songs = json.load(open(path))
    conf = confidence_map()
    for s in songs:
        s["_score"] = score(s)

    # 1. relative difficulty: five bands of 20
    ranked = sorted(songs, key=lambda s: (s["_score"], s["id"]))
    band = len(ranked) / 5.0
    for i, s in enumerate(ranked):
        s["difficulty"] = min(5, int(i // band) + 1)
        s["difficultyMethod"] = "catalog-relative"

    # 2. rebalance age groups to 25 each, moving songs one step at a time
    order = {a: i for i, a in enumerate(AGES)}
    for _ in range(200):
        counts = {a: sum(1 for s in songs if s["ageGroup"] == a) for a in AGES}
        over = [a for a in AGES if counts[a] > 25]
        if not over:
            break
        a = over[0]
        i = order[a]
        cands = []
        for j in (i - 1, i + 1):
            if 0 <= j < len(AGES) and counts[AGES[j]] < 25:
                tgt = AGES[j]
                pool = [s for s in songs if s["ageGroup"] == a]
                # moving down: pick the easiest; moving up: pick the hardest
                pick = min(pool, key=lambda s: s["_score"]) if j < i else max(pool, key=lambda s: s["_score"])
                cands.append((pick, tgt))
        if not cands:  # neighbour full: shift toward the short group via a neighbour
            j = i + 1 if i + 1 < len(AGES) else i - 1
            pool = [s for s in songs if s["ageGroup"] == a]
            pick = max(pool, key=lambda s: s["_score"]) if j > i else min(pool, key=lambda s: s["_score"])
            cands.append((pick, AGES[j]))
        song, tgt = cands[0]
        print("move %-36s %s -> %s" % (song["id"], song["ageGroup"], tgt))
        song["ageGroup"] = tgt

    # 3. confidence + teacher review sheet
    rows = []
    for s in songs:
        s["melodyConfidence"] = conf.get(s["id"], "M")
        rows.append(s)
    rank = {"L": 0, "S": 1, "M": 2, "H": 3}
    rows.sort(key=lambda s: (rank.get(s["melodyConfidence"], 2), s["ageGroup"], s["title"]))
    with open(os.path.join(HERE, "teacher-review.csv"), "w", newline="", encoding="utf-8") as fh:
        w = csv.writer(fh)
        w.writerow(["priority", "id", "title", "ageGroup", "difficulty", "key", "timeSignature",
                    "bpm", "melodyConfidence", "origin", "publicDomainBasis",
                    "melody (pitch:beats per phrase)", "teacher verdict", "corrections"])
        for n, s in enumerate(rows, 1):
            mel = " / ".join(" ".join(("R" if x.get("rest") else x["p"]) + ":" + str(x["d"]) for x in ph["notes"])
                             for ph in s["phrases"])
            w.writerow([n, s["id"], s["title"], s["ageGroup"], s["difficulty"], s["key"], s["timeSignature"],
                        s["bpm"], s["melodyConfidence"], s.get("origin", ""), s.get("publicDomainBasis", ""),
                        mel, "", ""])

    for s in songs:
        s.pop("_score", None)
    songs.sort(key=lambda s: (order[s["ageGroup"]], s["difficulty"], s["title"]))
    with open(path, "w", encoding="utf-8") as fh:
        json.dump(songs, fh, ensure_ascii=False, indent=1)

    print("\nage  " + "  ".join("d%d" % d for d in range(1, 6)) + "  total")
    for a in AGES:
        c = [sum(1 for s in songs if s["ageGroup"] == a and s["difficulty"] == d) for d in range(1, 6)]
        print("%-4s " % a + "  ".join("%2d" % x for x in c) + "  %5d" % sum(c))
    cc = {k: sum(1 for s in songs if s["melodyConfidence"] == k) for k in "HMLS"}
    print("melody confidence:", cc)


if __name__ == "__main__":
    main()
