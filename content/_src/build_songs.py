#!/usr/bin/env python3
"""Build content/songs.json from compact batch sources in content/_src/b*.txt.

  python3 content/_src/build_songs.py part b03   -> writes content/_src/parts/b03.json
  python3 content/_src/build_songs.py all        -> rebuilds every part + merges songs.json

Batch format (one song):
  == id | Title | ageGroup | key | timeSignature | bpm | tag,tag | icon | confidence(H/M/L)
  origin: ...
  basis: ...
  source: https://...            (optional)
  > lyric line | C4 D4:0.5 R:1 ... | syl syl ~ syl
Note tokens: pitch with octave (default octave 4 if omitted), ':dur' (default 1), R = rest.
Syllables are matched to pitched notes in order; '~' = no syllable (melisma).
Fingers are assigned automatically: five-finger positions, shifting only when a note
falls outside the current position, choosing the position that covers the most upcoming notes.
"""
import json
import os
import re
import sys

SRC = os.path.dirname(os.path.abspath(__file__))
CONTENT = os.path.dirname(SRC)
sys.path.insert(0, CONTENT)
from validate_songs import expected_difficulty, diatonic  # noqa: E402

TOK = re.compile(r"^([A-G]#?)(\d)?(?::([\d.]+))?$")


def parse_notes(spec):
    out = []
    for t in spec.split():
        if t.startswith("R"):
            d = float(t.split(":")[1]) if ":" in t else 1.0
            out.append({"rest": True, "d": d})
            continue
        m = TOK.match(t)
        if not m:
            raise ValueError("bad token %r" % t)
        name, octv, d = m.groups()
        out.append({"p": "%s%s" % (name, octv or "4"), "d": float(d) if d else 1.0})
    for n in out:
        if n["d"] == int(n["d"]):
            n["d"] = int(n["d"])
    return out


def finger(notes):
    pitched = [n for n in notes if not n.get("rest")]
    idx = [diatonic(n["p"]) for n in pitched]
    t = None
    for i, x in enumerate(idx):
        if t is not None and t <= x <= t + 4:
            pitched[i]["f"] = x - t + 1
            continue
        best = None
        for cand in range(x - 4, x + 1):
            k = 0
            lo = None
            for y in idx[i:]:
                if cand <= y <= cand + 4:
                    k += 1
                    lo = y if lo is None else min(lo, y)
                else:
                    break
            score = (k, -(abs(cand - t) if t is not None else 0), -abs(cand - lo))
            if best is None or score > best[0]:
                best = (score, cand)
        t = best[1]
        pitched[i]["f"] = x - t + 1


def parse_batch(path):
    songs, cur = [], None
    for raw in open(path, encoding="utf-8"):
        line = raw.rstrip("\n")
        if not line.strip() or line.lstrip().startswith("#"):
            continue
        if line.startswith("=="):
            parts = [p.strip() for p in line[2:].split("|")]
            sid, title, age, key, ts, bpm, tags, icon, conf = parts
            cur = {"id": sid, "title": title, "origin": "", "publicDomainBasis": "", "ageGroup": age,
                   "difficulty": 0, "tags": [t.strip() for t in tags.split(",")], "icon": icon,
                   "key": key, "bpm": int(bpm), "timeSignature": ts, "phrases": [], "_conf": conf}
            songs.append(cur)
        elif line.startswith("origin:"):
            cur["origin"] = line[7:].strip()
        elif line.startswith("basis:"):
            cur["publicDomainBasis"] = line[6:].strip()
        elif line.startswith("source:"):
            cur["source_url"] = line[7:].strip()
        elif line.startswith(">"):
            lyric, spec, syl = [p.strip() for p in line[1:].split("|")]
            notes = parse_notes(spec)
            sy = syl.split()
            pitched = [n for n in notes if not n.get("rest")]
            if len(sy) != len(pitched):
                raise ValueError("%s: '%s' has %d notes but %d syllables" % (cur["id"], lyric, len(pitched), len(sy)))
            for n, s in zip(pitched, sy):
                if s != "~":
                    n["s"] = s
            cur["phrases"].append({"lyric": lyric, "notes": notes})
        else:
            raise ValueError("%s: unparsed line %r" % (path, line))
    for s in songs:
        finger([n for ph in s["phrases"] for n in ph["notes"]])
        # key order: put f before s like the seeds
        for ph in s["phrases"]:
            ph["notes"] = [({"p": n["p"], "d": n["d"], "f": n["f"], **({"s": n["s"]} if "s" in n else {})}
                            if not n.get("rest") else n) for n in ph["notes"]]
        s["difficulty"] = expected_difficulty(s)
    return songs


def write_part(name):
    songs = parse_batch(os.path.join(SRC, name + ".txt"))
    os.makedirs(os.path.join(SRC, "parts"), exist_ok=True)
    out = os.path.join(SRC, "parts", name + ".json")
    json.dump(songs, open(out, "w"), indent=1, ensure_ascii=False)
    print("%s: %d songs -> %s" % (name, len(songs), out))
    return songs


def merge():
    seeds = json.load(open(os.path.join(CONTENT, "seed-songs.json")))
    allsongs = list(seeds)
    conf = {}
    for name in sorted(f[:-4] for f in os.listdir(SRC) if re.match(r"^b\d+\.txt$", f)):
        for s in write_part(name):
            conf[s["id"]] = s.pop("_conf")
            allsongs.append(s)
    order = {"2-3": 0, "3-4": 1, "4-5": 2, "5-6": 3}
    allsongs.sort(key=lambda s: order[s["ageGroup"]])
    json.dump(allsongs, open(os.path.join(CONTENT, "songs.json"), "w"), indent=1, ensure_ascii=False)
    json.dump(conf, open(os.path.join(SRC, "parts", "confidence.json"), "w"), indent=1)
    print("songs.json: %d songs" % len(allsongs))


if __name__ == "__main__":
    if sys.argv[1] == "part":
        write_part(sys.argv[2])
    else:
        merge()
