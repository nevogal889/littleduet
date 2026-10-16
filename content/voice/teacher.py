"""Teacher voice for Little Duet lessons.

Every segment gets a spoken line (`voice`), an id for its audio file (`voiceId` -> voice/<id>.mp3) and its
length (`voiceSec`). Lines come from the class-experience-director's bank (content/voice/lines.json).
Lengths come from content/voice/durations.json (written by video/render_voice.py after synthesis); lines
not rendered yet use an estimate, so the build runs in passes until every line is rendered and stable.
"""
import hashlib
import json
import math
import os
import re

HERE = os.path.dirname(os.path.abspath(__file__))
BANK_PATH = os.path.join(HERE, "lines.json")
DUR_PATH = os.path.join(HERE, "durations.json")

# Voice A: Piper LibriTTS (CC BY 4.0) speaker 396, slightly slower than default for small children.
VOICE = {"model": "en-us-libritts-high", "speaker": 396, "length_scale": 1.1, "sentence_silence": 0.35}
VOICE_VERSION = "A1|%(model)s|%(speaker)s|%(length_scale)s|%(sentence_silence)s" % VOICE

LEAD_PAD = 0.4      # silence between the end of the line and the first note
SAY_PAD = 1.0       # breathing room after a spoken line before the next segment

_bank = None
_dur = None


def bank():
    global _bank
    if _bank is None:
        _bank = json.load(open(BANK_PATH)) if os.path.exists(BANK_PATH) else {}
    return _bank


def durations():
    global _dur
    if _dur is None:
        _dur = json.load(open(DUR_PATH)) if os.path.exists(DUR_PATH) else {}
    return _dur


def reload():
    global _bank, _dur
    _bank, _dur = None, None


def enabled():
    return bool(bank()) and os.environ.get("LD_NO_VOICE") != "1"


def voice_id(text):
    return hashlib.sha1((VOICE_VERSION + "|" + text).encode()).hexdigest()[:16]


def estimate(text):
    return round(0.42 * len(text.split()) + 0.5, 2)


def voice_sec(text):
    d = durations().get(voice_id(text))
    return d if d is not None else estimate(text)


def is_rendered(text):
    return voice_id(text) in durations()


NOTE_WORDS = {"C": "C", "D": "D", "E": "E", "F": "F", "G": "G", "A": "A", "B": "B"}


def note_word(p):
    """'F#4' -> 'F sharp' (spoken), using the bank's noteWords when present."""
    m = re.match(r"^([A-G]#?)", p or "")
    if not m:
        return p or ""
    words_ = bank().get("noteWords") or {}
    return words_.get(m.group(1)) or (m.group(1)[0] + (" sharp" if "#" in m.group(1) else ""))


def _lower_first(s):
    s = (s or "").strip().rstrip(".!?")
    return s[:1].lower() + s[1:] if s else s


def _pick(options, key):
    options = [o for o in (options or []) if o]
    if not options:
        return None
    h = int(hashlib.sha1(key.encode()).hexdigest()[:8], 16)
    return options[h % len(options)]


def _by_age(entry, age):
    if not entry:
        return None
    return entry.get(age) or entry.get("all")


def _fill(t, **kw):
    out = t
    for k, v in kw.items():
        out = out.replace("{%s}" % k, v or "")
    out = re.sub(r"\s+", " ", out).strip()
    out = re.sub(r"\s+([.,!?])", r"\1", out)
    out = re.sub(r"([?!])\.", r"\1", out)          # "Lassie?." -> "Lassie?"
    return out


def _pattern(cap):
    for pt in bank().get("captionPatterns") or []:
        m = re.match(pt["match"], cap)
        if m:
            out = pt["say"]
            for i, g in enumerate(m.groups(), 1):
                out = out.replace("{%d}" % i, g or "")
            return out
    return None


def line_for(seg, ctx):
    """Spoken line for one segment. ctx: {"title", "age", "note", "key"} (key = unique, deterministic)."""
    b = bank()
    kind = seg["kind"]
    cap = seg.get("caption", "")
    cue = _lower_first(seg.get("parentCue"))
    fills = dict(title=ctx.get("title", ""), note=note_word(ctx.get("note", "")), caption=cap.strip().rstrip(".!?"), cue=cue)
    if kind == "title":
        t = _pick(_by_age(b.get("classIntro"), ctx["age"]), ctx["key"])
        return _fill(t, **fills) if t else None
    if kind == "praise" and ctx.get("rot"):
        # Rotate through the praise list in order, so two praise lines in a class never repeat back to back.
        opts = [o for o in (_by_age((b.get("kind") or {}).get("praise"), ctx["age"]) or []) if o]
        over = (b.get("captions") or {}).get(cap)
        if ctx["rot"] == 1 and over:
            return _fill(over, **fills)
        if opts:
            base = int(hashlib.sha1(ctx["key"].split("|p")[0].encode()).hexdigest()[:8], 16)
            return _fill(opts[(base + ctx["rot"]) % len(opts)], **fills)
    use_kind = cap in set(b.get("useKindBank") or []) and kind != "say"
    over = None if use_kind else ((b.get("captions") or {}).get(cap) or _pattern(cap))
    if over:
        # Override lines are complete as written; the grown-up's cue stays on screen (GROWN-UP band),
        # which keeps talk stretches short (spec 8).
        return _fill(over, **fills)
    if kind == "say":
        s = b.get("say") or {}
        t = s.get("template") if cue else s.get("noCue")
        return _fill(t or "{caption}.", **fills)
    k = kind
    if kind == "high_low":
        k = "high_low:%s" % seg.get("target", "low")
    t = _pick(_by_age((b.get("kind") or {}).get(k), ctx["age"]), ctx["key"])
    return _fill(t, **fills) if t else None


NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]


def moment_lines():
    """{moment: [{"text", "voiceId", "note"?}]} for the app (nudges, "I heard C", class end...).
    Lines with {note} are expanded for every note name."""
    out = {}
    for key, lines in (bank().get("moments") or {}).items():
        items = []
        for t in lines:
            if "{note}" in t:
                for n in NOTE_NAMES:
                    text = _fill(t, note=note_word(n))
                    items.append({"note": n, "text": text, "voiceId": voice_id(text)})
            else:
                text = _fill(t)
                items.append({"text": text, "voiceId": voice_id(text)})
        out[key] = items
    return out


def apply(seg, ctx, lead_in_fn=None, body_fn=None, tail=1.5, min_sec=None):
    """Add voice fields to `seg` and grow its timing so the line fits. Returns seg."""
    if not enabled():
        return seg
    text = line_for(seg, ctx)
    if not text:
        return seg
    vs = voice_sec(text)
    seg["voice"] = text
    seg["voiceId"] = voice_id(text)
    seg["voiceSec"] = vs
    if seg.get("notes"):
        lead = max(seg["leadInSec"], round(vs + LEAD_PAD, 3))
        seg["leadInSec"] = lead
        seg["durationSec"] = int(math.ceil(lead + body_fn(seg) + tail))
    else:
        seg["durationSec"] = max(seg["durationSec"], int(math.ceil(vs + SAY_PAD)), min_sec or 0)
    return seg


def all_lines(lessons):
    """Unique (text) spoken lines across lesson dicts."""
    out = {}
    for l in lessons:
        for c in l.get("classes", []):
            for s in c.get("segments", []):
                if s.get("voice"):
                    out[s["voiceId"]] = s["voice"]
    return out
