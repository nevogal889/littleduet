#!/usr/bin/env python3
"""Build the two required tutorials from the class-experience-director's scripts.

    python3 content/build_tutorials.py

content/tutorial/script-<mode>.json -> content/tutorial/tutorial-<mode>.json (one timed, voiced class).
Scene steps become `say` segments with a `scene` picture; playing steps become note segments.
Timing uses the same model as lessons, sized to the real voice lengths once rendered.
"""
import json
import math
import os
import sys
from collections import OrderedDict

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
sys.path.insert(0, os.path.join(HERE, "voice"))
import build_lessons as BL  # noqa: E402
import teacher  # noqa: E402

SCENES = {"sit", "roles", "middle-c", "black-keys", "hand-home", "phone-flat", "glow", "falling", "fingers",
          "bear-bird", "watch", "your-turn", "together", "listening", "controls", "stars", "mistakes-ok", "ready"}
PLAY_KINDS = {"listen", "demo", "your_turn", "beat", "high_low"}


def voiced(seg, text):
    if not text:
        return seg
    seg["voice"] = text
    seg["voiceId"] = teacher.voice_id(text)
    seg["voiceSec"] = teacher.voice_sec(text)
    return seg


def build(mode):
    script = json.load(open(os.path.join(HERE, "tutorial", "script-%s.json" % mode)))
    segs, errs = [], []
    for i, st in enumerate(script["steps"]):
        where = "%s step %d" % (mode, i + 1)
        kind = st.get("kind")
        if kind:
            if kind not in PLAY_KINDS:
                errs.append("%s: bad kind %r" % (where, kind))
                continue
            who = None if kind == "your_turn" else "parent"
            notes = [BL.clean_note(n) if n.get("rest") else BL.clean_note(n, who=who) for n in st.get("notes", [])]
            if not notes:
                errs.append("%s: playing step without notes" % where)
                continue
            bpm = int(st.get("bpm") or (60 if kind in ("your_turn", "demo") else 72))
            s = OrderedDict([("kind", kind), ("caption", st["caption"])])
            if st.get("parentCue"):
                s["parentCue"] = st["parentCue"]
            if st.get("scene"):
                s["scene"] = st["scene"]
            if kind == "high_low":
                s["target"] = st.get("target", "low")
            s["bpm"] = bpm
            s["leadInSec"] = BL.lead_in_sec(bpm)
            if kind == "your_turn":
                s["gapBeats"] = st.get("gapBeats", 1)
            s["notes"] = notes
            voiced(s, st.get("voice"))
            if s.get("voiceSec"):
                s["leadInSec"] = max(s["leadInSec"], round(s["voiceSec"] + teacher.LEAD_PAD, 3))
            s["durationSec"] = int(math.ceil(s["leadInSec"] + BL.note_body_sec(notes, bpm, s.get("gapBeats", 0)) + BL.TAIL_SEC))
        else:
            if st.get("scene") not in SCENES:
                errs.append("%s: unknown scene %r" % (where, st.get("scene")))
            s = OrderedDict([("kind", "say"), ("caption", st["caption"]), ("scene", st.get("scene"))])
            if st.get("parentCue"):
                s["parentCue"] = st["parentCue"]
            if st.get("showKeys"):
                s["showKeys"] = [k if isinstance(k, dict) else {"p": k} for k in st["showKeys"]]
            voiced(s, st.get("voice"))
            s["durationSec"] = max(4, int(math.ceil(s.get("voiceSec", 3) + teacher.SAY_PAD + 0.5)))
        segs.append(s)
    sid = "tutorial-%s" % mode
    total = sum(s["durationSec"] for s in segs)
    cls = OrderedDict([("id", sid + "-c01"), ("index", 1), ("title", script.get("title", "How Little Duet works")),
                       ("goal", "Learn how a class works"), ("type", "tutorial"), ("durationSec", total),
                       ("parentTip", "Watch together once before your first class."),
                       ("video", "%s/%s-c01.mp4" % (sid, sid)), ("thumb", "%s/%s-c01.jpg" % (sid, sid)), ("segments", segs)])
    lesson = OrderedDict([("songId", sid), ("title", cls["title"]), ("mode", mode), ("ageGroup", "3-4"), ("icon", "music"),
                          ("key", "C"), ("timeSignature", "4/4"), ("totalSec", total), ("classes", [cls])])
    return lesson, errs


def main():
    all_errs = []
    for mode in ("real", "screen"):
        lesson, errs = build(mode)
        all_errs += errs
        out = os.path.join(HERE, "tutorial", "tutorial-%s.json" % mode)
        json.dump(lesson, open(out, "w"), indent=1, ensure_ascii=False)
        print("%s: %d steps, %.1f min" % (mode, len(lesson["classes"][0]["segments"]), lesson["totalSec"] / 60.0))
    if all_errs:
        print("PROBLEMS:")
        for e in all_errs:
            print("  " + e)
        sys.exit(1)


if __name__ == "__main__":
    main()
