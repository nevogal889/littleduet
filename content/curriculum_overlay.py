"""Cognitive-game layer for Little Duet lessons (the Micro-Lesson Visualizer data).

The musical spine (class order, types, notes, timing) comes from build_lessons.py. This module adds,
per class: the skill practiced, the thinking target, the parent / child / bridge lines and the
after-class summary, and per song: a skill map and a one-line summary for parents.

Two sources:
  * content/curriculum/<songId>.json, written by the curriculum-architect agent
    (.claude/agents/curriculum-architect.md) and checked here by check_plan(), or
  * DEFAULTS below (by class type), so every song has the data even before its agent pass.
"""
import re
from collections import OrderedDict

SKILLS = OrderedDict([
    ("beat", "Steady beat"),
    ("pitch", "High and low"),
    ("listening", "Listening memory"),
    ("counting", "Counting"),
    ("patterns", "Patterns"),
    ("space", "Keyboard map"),
    ("fingers", "Finger control"),
    ("form", "Song shape"),
    ("expression", "Loud, soft, fast, slow"),
    ("together", "Playing together"),
])

# Words parents must never see: we name the skill practiced, never promise an outcome.
FORBIDDEN = re.compile(
    r"\b(smart(er|est)?|iq|intelligen\w*|genius|brain\w*|neur\w*|cognitive gains?|proven|"
    r"scientific\w*|accelerat\w*|weaponi[sz]\w*|guarantee\w*)\b", re.I)
EMOJI = re.compile(u"[\U0001F000-\U0001FFFF☀-➿]")

GAME_KINDS = {"listen", "demo", "your_turn", "beat", "high_low"}
GAME_KINDS_BY_AGE = {"2-3": {"beat", "high_low", "listen"},
                     "3-4": {"beat", "high_low", "listen", "demo", "your_turn"},
                     "4-5": GAME_KINDS, "5-6": GAME_KINDS}
DURS = {0.5, 1, 1.5, 2, 3, 4}

LIMITS = {"title": 28, "goal_words": 20, "parentPrompt": 18, "childAction": 14, "bridge": 16,
          "caption": 8, "parentCue": 10, "praise": 5, "celebrate": 12, "songSummary": 25,
          "concept_words": 6, "parentLine_words": 12}


def _d(primary, secondary, concept, line, child, bridge):
    return {"skill": {"primary": primary, "secondary": secondary},
            "mathTarget": {"concept": concept, "parentLine": line},
            "childAction": child, "bridge": bridge}


# Default layer by class type, with a few title-specific variants (spine titles from build_lessons).
DEFAULTS = {
    "listen": _d("listening", ["beat", "together"], "Auditory pattern recognition",
                 "Hearing the whole tune before playing it",
                 "Sway and listen to the whole song.",
                 "The keys light up where each sound lives."),
    "beat": _d("beat", ["together"], "Periodicity (steady pulse)",
               "Feeling something that repeats at an even time",
               "Tap any key on every beat.",
               "The beat is a heartbeat: tap, tap, tap, never in a hurry."),
    "high-low": _d("pitch", ["space"], "Spatial mapping of pitch",
                   "Low sounds live on the left, high sounds on the right",
                   "Tap low for the bear, high for the bird.",
                   "Low notes are heavy bears on the left; high notes are little birds."),
    "loud-soft": _d("expression", ["together"], "Magnitude contrast",
                    "Telling a big sound from a small one",
                    "Tap loud like a drum, soft like a whisper.",
                    "Loud is a big drum; soft is a whisper on the keys."),
    "fast-slow": _d("expression", ["beat"], "Rate (fast versus slow)",
                    "Matching the speed of a pattern",
                    "Tap fast like a rabbit, slow like a turtle.",
                    "Fast taps are rabbit hops; slow taps are turtle steps."),
    "stop-go": _d("listening", ["beat"], "Inhibitory control (start and stop)",
                  "Stopping and starting exactly with the sound",
                  "Play when the music goes, freeze when it stops.",
                  "Music on, hands dance; music off, hands freeze like statues."),
    "rhythm": _d("patterns", ["beat"], "Rhythmic grouping",
                 "Hearing long and short sounds inside the words",
                 "Tap once for every part of a word.",
                 "Every word part is one footstep on the keys."),
    "review": _d("patterns", ["listening"], "Retrieval practice",
                 "Bringing back games from earlier classes",
                 "Play the favourite games again.",
                 "Each game is a door you already know how to open."),
    "together": _d("together", ["beat"], "Synchrony",
                   "Keeping time with another person",
                   "Play along with your grown-up.",
                   "Two players, one song, like walking in step."),
    "special-note": _d("space", ["listening"], "One-to-one correspondence",
                       "Matching one sound to one key",
                       "Find the special note and play it on cue.",
                       "The special note is a doorbell: same key, same sound, every time."),
    "echo": _d("listening", ["patterns"], "Sequence memory",
               "Holding a short tune in mind and repeating it",
               "Listen, then copy the little tune.",
               "Echo it back like a parrot copying a song."),
    "octave": _d("space", ["pitch"], "Translation (same shape, new place)",
                 "Finding the same note higher or lower on the keyboard",
                 "Play the same note in its high and low homes.",
                 "Every note has a family: same name, a different house."),
    "hand-position": _d("fingers", ["space"], "Spatial anchoring",
                        "Finding a home spot for the hand",
                        "Put one finger on each lit key.",
                        "Fingers curved, like holding a little ball."),
    "phrase": _d("fingers", ["form"], "Decomposition",
                 "Learning a big thing in small parts",
                 "Play this part of the tune, note by note.",
                 "Each part is one stair; we climb one stair at a time."),
    "put-together": _d("form", ["patterns"], "Composition of parts",
                       "Joining small parts into a whole",
                       "Join the parts into the whole song.",
                       "The parts click together like train cars."),
    "play-along": _d("together", ["fingers"], "Synchrony",
                     "Keeping your part going while the music moves on",
                     "Play the song along with the music.",
                     "The music is a train; hop on and ride along."),
    "left-hand": _d("fingers", ["space"], "Bilateral mapping",
                    "Giving the other hand its own job",
                    "Play the low notes with the left hand.",
                    "The left hand plays the deep low notes, like a big drum."),
    "hands-together": _d("fingers", ["patterns"], "Coordinating two streams",
                         "Two hands doing different jobs at once",
                         "Play both hands together, slowly.",
                         "Left hand is the drum; right hand sings the song."),
    "concert": _d("form", ["together", "expression"], "Sequencing start to end",
                  "Holding the whole song in order, first note to last",
                  "Play the whole song, then take a bow.",
                  "From the first note to the last: one big journey."),
}
TITLE_DEFAULTS = {
    "Tricky spots": _d("fingers", ["patterns"], "Error localisation",
                       "Finding the hard bit and practising just that",
                       "Play the tricky part slowly, then faster.",
                       "Tricky spots are puddles: step slowly, then hop over."),
    "Add a second note": _d("listening", ["space"], "Two-category sorting",
                            "Telling two sounds apart and matching each to its key",
                            "Play the two special notes when they come.",
                            "Two doorbells: one for each friend at the door."),
    "Sing and play": _d("form", ["together"], "Cross-modal matching",
                        "Matching words, voice and keys at the same time",
                        "Sing the words while you play.",
                        "Your voice and your fingers walk together."),
    "Slow and steady": _d("fingers", ["beat"], "Tempo control",
                          "Doing a task slowly and evenly",
                          "Play the tune slowly, every note even.",
                          "Slow fingers, like a cat walking on tiptoe."),
}


def label(sid):
    return SKILLS[sid]


def default_layer(cls):
    base = TITLE_DEFAULTS.get(cls["title"]) or DEFAULTS.get(cls["type"]) or DEFAULTS["listen"]
    out = OrderedDict()
    out["skill"] = dict(base["skill"])
    out["mathTarget"] = dict(base["mathTarget"])
    out["parentPrompt"] = cls["parentTip"]
    out["childAction"] = base["childAction"]
    out["bridge"] = base["bridge"]
    out["celebrate"] = celebrate_line(out["skill"])
    return out


PHRASE = {"beat": "keeping a steady beat", "pitch": "hearing high and low",
          "listening": "listening and remembering", "counting": "counting",
          "patterns": "spotting patterns", "space": "finding the way on the keys",
          "fingers": "careful fingers", "form": "the shape of a song",
          "expression": "loud and soft, fast and slow", "together": "playing together"}


def celebrate_line(skill):
    ids = [skill["primary"]] + [s for s in skill.get("secondary", []) if s != skill["primary"]][:1]
    return "Today you practiced %s." % " and ".join(PHRASE[i] for i in ids)


def plan_layer(pc):
    out = OrderedDict()
    for k in ("skill", "mathTarget", "parentPrompt", "childAction", "bridge", "celebrate"):
        out[k] = pc[k]
    return out


def skill_map(classes):
    """[{id,label,value 0..1,classes}] sorted by weight: primary 2, secondary 1."""
    w, n = OrderedDict(), {}
    for c in classes:
        sk = c["skill"]
        for i, sid in enumerate([sk["primary"]] + list(sk.get("secondary", []))):
            w[sid] = w.get(sid, 0) + (2 if i == 0 else 1)
            n[sid] = n.get(sid, 0) + 1
    top = max(w.values()) if w else 1
    order = sorted(w, key=lambda s: (-w[s], list(SKILLS).index(s)))
    return [OrderedDict([("id", s), ("label", label(s)), ("value", round(w[s] / float(top), 2)),
                         ("classes", n[s])]) for s in order]


def default_summary(smap):
    labs = [x["label"].lower() for x in smap[:3]]
    if len(labs) >= 3:
        joined = "%s, %s and %s" % tuple(labs)
    else:
        joined = " and ".join(labs)
    return "Practices %s, with a tune you can share." % joined


# ---------------------------------------------------------------- plan checker
def _words(s):
    return len(str(s).split())


def check_plan(plan, spine, age):
    """Errors for an agent plan against the spine lesson (built without a plan)."""
    errs = []
    sid = spine["songId"]
    if plan.get("songId") != sid:
        errs.append("songId %r != %r" % (plan.get("songId"), sid))
    if plan.get("ageGroup") != age:
        errs.append("ageGroup %r != song ageGroup %r" % (plan.get("ageGroup"), age))
    summ = plan.get("songSummary", "")
    if not summ or _words(summ) > LIMITS["songSummary"]:
        errs.append("songSummary empty or > %d words" % LIMITS["songSummary"])
    pcs = plan.get("classes", [])
    sc = spine["classes"]
    if len(pcs) != len(sc):
        errs.append("plan has %d classes, spine has %d" % (len(pcs), len(sc)))
    for i, (pc, c) in enumerate(zip(pcs, sc)):
        w = "class %d" % (i + 1)
        if pc.get("index") != i + 1:
            errs.append("%s: index %r" % (w, pc.get("index")))
        if pc.get("spineType") != c["type"]:
            errs.append("%s: spineType %r != spine %r" % (w, pc.get("spineType"), c["type"]))
        for k in ("title", "goal", "skill", "mathTarget", "parentPrompt", "childAction", "bridge",
                  "intro", "praise", "celebrate"):
            if k not in pc:
                errs.append("%s: missing %s" % (w, k))
        if errs and any(e.startswith(w + ": missing") for e in errs):
            continue
        if not pc["title"] or len(pc["title"]) > LIMITS["title"]:
            errs.append("%s: title empty or > %d chars" % (w, LIMITS["title"]))
        if _words(pc["goal"]) > LIMITS["goal_words"]:
            errs.append("%s: goal > %d words" % (w, LIMITS["goal_words"]))
        for k in ("parentPrompt", "childAction", "bridge", "praise", "celebrate"):
            if not pc[k] or _words(pc[k]) > LIMITS[k]:
                errs.append("%s: %s empty or > %d words" % (w, k, LIMITS[k]))
        sk = pc["skill"]
        if sk.get("primary") not in SKILLS:
            errs.append("%s: skill.primary %r not in taxonomy" % (w, sk.get("primary")))
        sec = sk.get("secondary", [])
        if not isinstance(sec, list) or len(sec) > 2 or any(s not in SKILLS for s in sec):
            errs.append("%s: skill.secondary must be <=2 taxonomy ids" % w)
        mt = pc["mathTarget"]
        if not mt.get("concept") or _words(mt["concept"]) > LIMITS["concept_words"]:
            errs.append("%s: mathTarget.concept empty or > %d words" % (w, LIMITS["concept_words"]))
        if not mt.get("parentLine") or _words(mt["parentLine"]) > LIMITS["parentLine_words"]:
            errs.append("%s: mathTarget.parentLine empty or > %d words" % (w, LIMITS["parentLine_words"]))
        intro = pc["intro"]
        if not isinstance(intro, list) or not 1 <= len(intro) <= 2:
            errs.append("%s: intro must have 1-2 items" % w)
            intro = []
        for j, it in enumerate(intro):
            if not it.get("caption") or _words(it["caption"]) > LIMITS["caption"]:
                errs.append("%s intro %d: caption empty or > %d words" % (w, j, LIMITS["caption"]))
            if it.get("parentCue") and _words(it["parentCue"]) > LIMITS["parentCue"]:
                errs.append("%s intro %d: parentCue > %d words" % (w, j, LIMITS["parentCue"]))
        games = pc.get("games", [])
        if not isinstance(games, list) or len(games) > 2:
            errs.append("%s: games must be a list of at most 2" % w)
            games = []
        for j, g in enumerate(games):
            errs += ["%s game %d: %s" % (w, j, e) for e in check_game(g, age)]
    # wording rules over the parent / child facing text (concept may use expert terms)
    texts = [("songSummary", summ)]
    for i, pc in enumerate(pcs):
        for k in ("title", "goal", "parentPrompt", "childAction", "bridge", "praise", "celebrate"):
            texts.append(("class %d %s" % (i + 1, k), pc.get(k, "")))
        texts.append(("class %d mathTarget.parentLine" % (i + 1), (pc.get("mathTarget") or {}).get("parentLine", "")))
        for it in pc.get("intro", []) or []:
            texts += [("class %d intro" % (i + 1), it.get("caption", "")), ("class %d intro" % (i + 1), it.get("parentCue", ""))]
        for g in pc.get("games", []) or []:
            texts += [("class %d game" % (i + 1), g.get("caption", "")), ("class %d game" % (i + 1), g.get("parentCue", ""))]
    for where, t in texts:
        m = FORBIDDEN.search(str(t))
        if m:
            errs.append("%s: forbidden claim word %r" % (where, m.group(0)))
        if EMOJI.search(str(t)):
            errs.append("%s: emoji" % where)
    return errs


_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]


def midi(p):
    m = re.match(r"^([A-G])(#?)(\d)$", p or "")
    if not m:
        raise ValueError(p)
    return _NAMES.index(m.group(1) + m.group(2)) + 12 * (int(m.group(3)) + 1)


def check_game(g, age):
    errs = []
    k = g.get("kind")
    if k not in GAME_KINDS_BY_AGE[age]:
        errs.append("kind %r not allowed for age %s (allowed: %s)" % (k, age, sorted(GAME_KINDS_BY_AGE[age])))
    if not g.get("caption") or _words(g["caption"]) > LIMITS["caption"]:
        errs.append("caption empty or > %d words" % LIMITS["caption"])
    if g.get("parentCue") and _words(g["parentCue"]) > LIMITS["parentCue"]:
        errs.append("parentCue > %d words" % LIMITS["parentCue"])
    if k == "high_low" and g.get("target") not in ("low", "high"):
        errs.append("high_low needs target low|high")
    bpm = g.get("bpm")
    if bpm is not None and not (isinstance(bpm, (int, float)) and 50 <= bpm <= 120):
        errs.append("bpm must be 50-120")
    ns = g.get("notes") or []
    if not 2 <= len(ns) <= 16:
        errs.append("needs 2-16 notes")
    for n in ns:
        if n.get("rest"):
            if n.get("d") not in DURS:
                errs.append("rest duration %r" % n.get("d"))
            continue
        try:
            m = midi(n.get("p", ""))
        except Exception:
            errs.append("bad pitch %r" % n.get("p"))
            continue
        if not midi("C3") <= m <= midi("C6"):
            errs.append("pitch %s outside C3-C6" % n["p"])
        if n.get("d") not in DURS:
            errs.append("duration %r not in %s" % (n.get("d"), sorted(DURS)))
        if "f" in n and n["f"] not in (1, 2, 3, 4, 5):
            errs.append("bad finger %r" % n["f"])
        if age in ("2-3", "3-4") and "#" in n["p"] and k in ("your_turn", "demo") and not g.get("blackKeys"):
            errs.append("black key %s for a young child (set \"blackKeys\": true for a black-key game)" % n["p"])
    return errs
