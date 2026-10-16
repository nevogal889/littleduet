#!/usr/bin/env python3
"""Class audit: checks every lesson class against the machine-checkable rules of
docs/class-experience-spec.md (sections 8 and 10).

    python3 content/audit_classes.py [--json out.json] [--song ID]

Prints a summary by rule and writes every finding (song, class, segment, rule, detail) to JSON so the
class-experience-director can review and fix them. Exit code 0 always (it is a report, not a gate);
--strict exits 1 when any finding has severity "error".
"""
import argparse
import glob
import json
import os
import re
import sys
from collections import Counter, defaultdict

HERE = os.path.dirname(os.path.abspath(__file__))
NOTE_KINDS = {"listen", "demo", "your_turn", "together", "beat", "high_low"}
CHILD_ACTS = {"your_turn", "together", "beat", "high_low"}
TALK = {"say"}
EMOJI = re.compile(u"[\U0001F000-\U0001FFFF☀-➿]")
WORDS_PER_SEC = 2.3


def words(s):
    return len((s or "").split())


MOVES = re.compile(r"\b(sway|clap|pat|march|dance|rock|stomp|tap your|wiggle|bounce|nod|move|swing|shake|hop|jump|bow|sing|point|hum|count)", re.I)


def child_plays(seg):
    if seg["kind"] in ("beat", "high_low"):
        return True
    if seg["kind"] == "listen" and MOVES.search(" ".join([seg.get("caption", ""), seg.get("parentCue", ""), seg.get("voice") or ""])):
        return True     # listening with movement counts as acting (spec 8)
    if seg["kind"] == "together":
        ns = seg.get("notes", [])
        # tune-only together: the child taps along with the beat circle (spec 2.6); left-hand parts are the child's
        return True
    if seg["kind"] == "your_turn":
        return any(n.get("who") != "parent" and not n.get("rest") for n in seg.get("notes", []))
    return False


def audit_class(sid, age, c):
    out = []

    def f(rule, sev, detail, seg=None):
        out.append({"song": sid, "class": c["index"], "seg": seg, "rule": rule, "severity": sev, "detail": detail})

    segs = c["segments"]
    t = 0.0
    first_play = None
    last_act = 0.0
    talk_run, talk_sec = 0, 0.0
    prev_praise_line = None
    prev_kind = None
    for i, s in enumerate(segs):
        k = s["kind"]
        v = s.get("voice")
        # every segment speaks (title/say/praise/notes)
        if not v:
            f("voice-missing", "error", "%s segment has no teacher line" % k, i)
        else:
            limit = 14 if k in NOTE_KINDS else 22
            if words(v) > limit:
                f("voice-too-long", "warn", "%d words (max %d): %s" % (words(v), limit, v), i)
            if EMOJI.search(v) or "!!" in v or re.search(r"\b[A-G]#", v) or re.search(r"\b[A-Z]{4,}\b", v):
                f("voice-format", "error", v, i)
            if k in NOTE_KINDS and s.get("voiceSec", 0) + 0.39 > s.get("leadInSec", 0):
                f("voice-overlaps-notes", "error", "line %.2fs, lead-in %.2fs" % (s.get("voiceSec", 0), s.get("leadInSec", 0)), i)
        # talk runs between playing
        if k in TALK:
            talk_run += 1
            talk_sec += s.get("voiceSec", s["durationSec"])
            if talk_run > 2:
                f("too-much-talk", "warn", "%d talk segments in a row" % talk_run, i)
            if talk_sec > 12.5:
                f("talk-over-12s", "warn", "%.1fs of speech in a row" % talk_sec, i)
        elif k in NOTE_KINDS:
            talk_run, talk_sec = 0, 0.0
        # praise
        if k == "praise":
            if prev_kind == "praise":
                f("praise-twice", "error", "two praise segments in a row", i)
            if v and v == prev_praise_line:
                f("praise-repeat", "warn", "same praise line twice in a row: %s" % v, i)
            prev_praise_line = v
        # child acts
        if child_plays(s):
            if first_play is None:
                first_play = t + s.get("leadInSec", 0)
            gap = t - last_act
            if gap > 30.5:
                f("child-idle-30s", "warn", "%.0fs without the child acting before this segment" % gap, i)
            last_act = t + s["durationSec"]
        prev_kind = k
        t += s["durationSec"]
    if first_play is None:
        f("child-never-plays", "info", "no segment where the child plays (listening class)")
    elif first_play > 20.5:
        f("first-play-late", "warn", "child first plays at %.0fs (max 20s)" % first_play)
    if t - last_act > 30.5 and first_play is not None:
        f("child-idle-30s", "warn", "%.0fs without the child acting at the end" % (t - last_act))
    # bear/bird only in high-low: caption mentions of the characters outside high_low
    for i, s in enumerate(segs):
        cap = (s.get("caption", "") + " " + (s.get("voice") or "")).lower()
        if s["kind"] not in ("high_low", "say", "title") and re.search(r"\b(bear|bird)\b", cap) and c["type"] != "high-low":
            f("character-off-game", "info", "mentions bear/bird outside the high-low game: %s" % s.get("caption"), i)
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--json", default=os.path.join(HERE, "..", "docs", "class-audit.json"))
    ap.add_argument("--song")
    ap.add_argument("--strict", action="store_true")
    a = ap.parse_args()
    findings = []
    n_classes = 0
    for p in sorted(glob.glob(os.path.join(HERE, "lessons", "*.json"))):
        L = json.load(open(p))
        if a.song and L["songId"] != a.song:
            continue
        for c in L["classes"]:
            n_classes += 1
            findings += audit_class(L["songId"], L.get("ageGroup"), c)
    by_rule = Counter(f["rule"] for f in findings)
    classes_hit = defaultdict(set)
    for f in findings:
        classes_hit[f["rule"]].add((f["song"], f["class"]))
    print("audited %d classes, %d findings" % (n_classes, len(findings)))
    for rule, cnt in by_rule.most_common():
        sev = next(f["severity"] for f in findings if f["rule"] == rule)
        print("  %-22s %-5s %5d findings in %4d classes" % (rule, sev, cnt, len(classes_hit[rule])))
    os.makedirs(os.path.dirname(os.path.abspath(a.json)), exist_ok=True)
    json.dump(findings, open(a.json, "w"), indent=1)
    if a.strict and any(f["severity"] == "error" for f in findings):
        sys.exit(1)


if __name__ == "__main__":
    main()
