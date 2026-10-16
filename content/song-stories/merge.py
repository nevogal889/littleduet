#!/usr/bin/env python3
"""Merge batch-*.json into content/song-stories.json (app fields) and check every song has a story.
Sources and notes stay in the batch files (the audit trail); the app gets only display fields."""
import glob, json, os, re, sys
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
songs = json.load(open(os.path.join(ROOT, "songs.json")))
ids = [s["id"] for s in songs]
LIMITS = {"aboutKids": 25, "story": 60, "funFact": 25}
BAD = re.compile(r"[\U0001F000-\U0001FFFF☀-➿]")
out, errs, low = {}, [], []
for f in sorted(glob.glob(os.path.join(HERE, "batch-*.json"))):
    for e in json.load(open(f)):
        sid = e.get("id")
        if sid not in ids:
            errs.append("%s: unknown id %r" % (os.path.basename(f), sid)); continue
        for k in ("writtenBy", "year", "origin", "aboutKids", "story"):
            if not e.get(k):
                errs.append("%s: missing %s" % (sid, k))
        for k, n in LIMITS.items():
            if e.get(k) and len(e[k].split()) > n:
                errs.append("%s: %s over %d words" % (sid, k, n))
        if not e.get("sources"):
            errs.append("%s: no sources" % sid)
        if BAD.search(json.dumps(e, ensure_ascii=False)):
            errs.append("%s: emoji" % sid)
        if e.get("confidence") == "low":
            low.append(sid)
        out[sid] = {k: e.get(k) for k in ("writtenBy", "year", "origin", "aboutKids", "story", "funFact", "myth") if e.get(k)}
missing = [i for i in ids if i not in out]
json.dump({i: out[i] for i in ids if i in out}, open(os.path.join(ROOT, "song-stories.json"), "w"), indent=1, ensure_ascii=False)
print("stories: %d/%d  missing: %d  low-confidence: %s" % (len(out), len(ids), len(missing), ", ".join(low) or "none"))
if errs:
    print("PROBLEMS:"); [print("  " + e) for e in errs]
    sys.exit(1)
