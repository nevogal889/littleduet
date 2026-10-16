#!/usr/bin/env python3
"""Little Duet lesson video renderer.

    python3 video/render.py --song twinkle-twinkle                 # every class of one song
    python3 video/render.py --class twinkle-twinkle-c03            # one class
    python3 video/render.py --all                                  # every song in content/lessons
    python3 video/render.py --class twinkle-twinkle-c03 --frames 3,20,60   # PNG stills only
    python3 video/render.py --samples                              # export video/samples/*.mp3

Output: video/out/<songId>/<classId>.mp4 (1280x720, 30 fps, H.264 + AAC, faststart)
        video/out/<songId>/<classId>.jpg (640x360 thumbnail)
Existing outputs are skipped unless --force.
"""
import argparse
import glob
import json
import math
import os
import random
import subprocess
import sys
import time

import numpy as np
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
sys.path.insert(0, HERE)
import ld_audio as AU          # noqa: E402
import ld_icons as IC          # noqa: E402

W, H, FPS = 1280, 720, 30
GROUND = (238, 243, 247)
INK = (30, 42, 58)
INK_SOFT = (74, 85, 104)
CORAL = (242, 107, 79)
CORAL_L = (250, 196, 184)
MARI = (245, 184, 61)
INDIGO = (61, 76, 140)
INDIGO_L = (176, 186, 228)
LOW_KEY = (150, 163, 216)
PARENT_KEY = (190, 199, 236)
WHITE = (255, 255, 255)
LANE = (226, 234, 242)
LANE_LINE = (212, 222, 233)
PROG_BG = (214, 223, 233)

TOP_H = 160                 # caption band
MID_Y0, MID_Y1 = 160, 318   # icon + lyric
ROLL_Y0, ROLL_Y1 = 318, 450 # falling notes
KB_Y0, KB_Y1 = 450, 706     # keyboard
PROG_Y0, PROG_Y1 = 712, 720
ICON_X, ICON_SIZE = 190, 138
RIGHT_X = 1120              # right slot centre (beat circle / bird)
MID_CY = (MID_Y0 + MID_Y1) // 2 + 4
LYRIC_X0, LYRIC_X1 = 300, 990

NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]

# ------------------------------------------------------------------ fonts
FONT_DIR = os.path.join(HERE, "assets", "gfonts", "ofl")
BRICO = os.path.join(FONT_DIR, "bricolagegrotesque", "BricolageGrotesque[opsz,wdth,wght].ttf")
DMSANS = os.path.join(FONT_DIR, "dmsans", "DMSans[opsz,wght].ttf")
FALLBACK = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
FALLBACK_REG = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
_fonts = {}


def font(kind, size, weight=700):
    key = (kind, size, weight)
    if key in _fonts:
        return _fonts[key]
    f = None
    try:
        if kind == "display" and os.path.exists(BRICO):
            f = ImageFont.truetype(BRICO, size)
            f.set_variation_by_axes([min(96, max(12, size)), weight, 100])
        elif kind == "text" and os.path.exists(DMSANS):
            f = ImageFont.truetype(DMSANS, size)
            f.set_variation_by_axes([min(40, max(9, size)), weight])
    except Exception:
        f = None
    if f is None:
        f = ImageFont.truetype(FALLBACK if weight >= 600 else FALLBACK_REG, size)
    _fonts[key] = f
    return f


def midi(p):
    return NAMES.index(p[:-1]) + 12 * (int(p[-1]) + 1)


def is_black(m):
    return "#" in NAMES[m % 12]


def mix(c1, c2, a):
    return tuple(int(round(c1[i] * (1 - a) + c2[i] * a)) for i in range(3))


# ------------------------------------------------------------------ keyboard
class Keyboard:
    def __init__(self, lo, hi, y0=None, y1=None, width=None, max_kw=112.0, margin=64.0):
        self.ky0 = self.ky0 if y0 is None else y0
        self.ky1 = self.ky1 if y1 is None else y1
        self.width = W if width is None else width
        self.lo, self.hi = lo, hi
        whites = [m for m in range(lo, hi + 1) if not is_black(m)]
        self.whites = whites
        n = len(whites)
        kw = min(max_kw, (self.width - margin) / n)
        self.kw = kw
        x0 = (self.width - kw * n) / 2.0
        self.x0 = x0
        self.bw = kw * 0.6
        self.bh = (self.ky1 - self.ky0) * 0.6
        self.rect = {}
        for i, m in enumerate(whites):
            self.rect[m] = (x0 + i * kw, self.ky0, x0 + (i + 1) * kw, self.ky1)
        for m in range(lo, hi + 1):
            if is_black(m):
                left = self.rect[m - 1]
                cx = left[2]
                # nudge C#/D# and F#/G#/A# a little like a real piano
                nud = {1: -0.08, 3: 0.08, 6: -0.1, 8: 0.0, 10: 0.1}[m % 12] * self.bw
                self.rect[m] = (cx - self.bw / 2 + nud, self.ky0, cx + self.bw / 2 + nud, self.ky0 + self.bh)
        self.base = None
        self._patch = {}
        self.split = whites[n // 2]   # low half = keys below this

    def cx(self, m):
        r = self.rect[m]
        return (r[0] + r[2]) / 2.0

    def draw(self, img, fills=None):
        """Draw the keyboard on img; fills maps midi -> fill colour."""
        fills = fills or {}
        d = ImageDraw.Draw(img)
        fx0, fx1 = int(self.x0) - 14, int(self.x0 + self.kw * len(self.whites)) + 14
        for m in self.whites:
            x0, y0, x1, y1 = self.rect[m]
            d.rounded_rectangle([round(x0), y0 - 8, round(x1), y1], radius=max(4, int(self.kw * 0.12)),
                                fill=fills.get(m, WHITE), outline=INK, width=2)
        for m in range(self.lo, self.hi + 1):
            if is_black(m):
                x0, y0, x1, y1 = self.rect[m]
                f = fills.get(m, INK)
                d.rounded_rectangle([round(x0), y0 - 8, round(x1), round(y1)], radius=max(3, int(self.bw * 0.15)),
                                    fill=f, outline=INK, width=2)
                if f == INK:   # small highlight to read as glossy plastic
                    d.rounded_rectangle([round(x0) + 4, round(y1) - 14, round(x1) - 4, round(y1) - 6],
                                        radius=3, fill=(58, 72, 92))
        d.rounded_rectangle([fx0, self.ky0 - 10, fx1, self.ky0], radius=4, fill=INK)   # fallboard
        if self.lo <= 60 <= self.hi:      # middle C dot
            x = self.cx(60)
            r = max(4, int(self.kw * 0.07))
            d.ellipse([x - r, self.ky1 - 3 * r - 6, x + r, self.ky1 - r - 6], fill=INK if 60 not in fills else WHITE)
        return img

    def patch(self, m, fill):
        """(x, y, image) of the keyboard region for key m drawn in `fill`."""
        key = (m, fill)
        if key not in self._patch:
            img = self.base.copy()
            self.draw(img, {m: fill})
            x0, y0, x1, y1 = self.rect[m]
            box = (int(math.floor(x0)) - 1, self.ky0, int(math.ceil(x1)) + 2, int(math.ceil(y1)) + 1)
            self._patch[key] = (box[0], box[1], img.crop(box))
        return self._patch[key]

    def circle_pos(self, m, big):
        x0, y0, x1, y1 = self.rect[m]
        if is_black(m):
            r = min(self.bw * 0.46, 30)
            return (x0 + x1) / 2.0, y1 - r - 8, r
        r = min(self.kw * 0.40, 40 if big else 32)
        return (x0 + x1) / 2.0, self.ky1 - r - 30, r


_circle_cache = {}


def finger_sprite(num, r, color, ring=INK):
    key = (num, int(r), color)
    if key in _circle_cache:
        return _circle_cache[key]
    s = 4
    R = int(r)
    im = Image.new("RGBA", ((2 * R + 4) * s, (2 * R + 4) * s), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    d.ellipse([2 * s, 2 * s, (2 * R + 2) * s, (2 * R + 2) * s], fill=WHITE + (255,), outline=ring + (255,),
              width=max(2, int(r * 0.09)) * s)
    if num:
        f = font("display", int(r * 1.25 * s), 800)
        d.text(((R + 2) * s, (R + 2) * s + int(r * 0.06 * s)), str(num), font=f, fill=color + (255,), anchor="mm")
    im = im.resize((2 * R + 4, 2 * R + 4), Image.LANCZOS)
    _circle_cache[key] = im
    return im


def circle_sprite(r, color, alpha=255):
    key = ("c", int(r), color, alpha)
    if key in _circle_cache:
        return _circle_cache[key]
    s = 3
    R = max(1, int(r))
    im = Image.new("RGBA", ((2 * R + 2) * s, (2 * R + 2) * s), (0, 0, 0, 0))
    ImageDraw.Draw(im).ellipse([s, s, (2 * R + 1) * s, (2 * R + 1) * s], fill=color + (alpha,))
    im = im.resize((2 * R + 2, 2 * R + 2), Image.LANCZOS)
    _circle_cache[key] = im
    return im


def paste_center(frame, sprite, cx, cy):
    frame.paste(sprite, (int(round(cx - sprite.width / 2.0)), int(round(cy - sprite.height / 2.0))), sprite)


# ------------------------------------------------------------------ text
def fit_lines(text, kind, sizes, max_w, max_lines, weight=700):
    """Largest size from `sizes` at which text fits in max_lines lines of max_w."""
    words = text.split()
    for sz in sizes:
        f = font(kind, sz, weight)
        lines, cur = [], ""
        for w_ in words:
            t = (cur + " " + w_).strip()
            if f.getlength(t) <= max_w or not cur:
                cur = t
            else:
                lines.append(cur)
                cur = w_
        lines.append(cur)
        if len(lines) <= max_lines and all(f.getlength(l) <= max_w for l in lines):
            return f, lines, sz
    return f, lines, sz


def render_band(caption, cue, accent=INK):
    img = Image.new("RGB", (W, TOP_H), GROUND)
    d = ImageDraw.Draw(img)
    f, lines, sz = fit_lines(caption, "display", [60, 56, 52, 48], W - 120, 1)
    if len(lines) > 1 or f.getlength(lines[0]) > W - 120:
        f, lines, sz = fit_lines(caption, "display", [52, 48], W - 120, 2)
    lh = int(sz * 1.08)
    cap_h = lh * len(lines)
    cue_h = 34 if cue else 0
    y = (TOP_H - cap_h - cue_h - 8) // 2 + 6
    for l in lines:
        d.text((W / 2, y + lh / 2), l, font=f, fill=accent, anchor="mm")
        y += lh
    if cue:
        fl = font("text", 15, 700)
        fc = font("text", 25, 500)
        label = "GROWN-UP"
        lw = fl.getlength(label) + 20
        tw = fc.getlength(cue)
        total = lw + 12 + tw
        x = (W - total) / 2
        cy = y + 6 + 15
        d.rounded_rectangle([x, cy - 13, x + lw, cy + 13], radius=13, fill=INDIGO)
        d.text((x + lw / 2, cy + 1), label, font=fl, fill=WHITE, anchor="mm")
        d.text((x + lw + 12, cy), cue, font=fc, fill=INK_SOFT, anchor="lm")
    return img


class LyricLine:
    """Pre-rendered lyric line in ink and coral; syllable spans for karaoke."""

    def __init__(self, text, notes_slice):
        self.text = text
        max_w = LYRIC_X1 - LYRIC_X0
        f, lines, sz = fit_lines(text, "display", [48, 44, 40, 36, 32, 28], max_w, 1, 600)
        self.f = f
        tw = int(f.getlength(text)) + 8
        hgt = int(sz * 1.5)
        self.size = (tw, hgt)
        self.ink = Image.new("RGBA", (tw, hgt), (0, 0, 0, 0))
        self.hot = Image.new("RGBA", (tw, hgt), (0, 0, 0, 0))
        ImageDraw.Draw(self.ink).text((4, hgt / 2), text, font=f, fill=INK + (255,), anchor="lm")
        ImageDraw.Draw(self.hot).text((4, hgt / 2), text, font=f, fill=CORAL + (255,), anchor="lm")
        # map syllables to character spans
        low = text.lower()
        cur = 0
        self.spans = []
        for n in notes_slice:
            s = (n.get("s") or "").strip().lower().strip("-,.!?'\"")
            span = None
            if s:
                i = low.find(s, cur)
                if i >= 0 and i - cur <= 6:
                    span = (i, i + len(s))
                    cur = i + len(s)
            if span:
                a = 4 + f.getlength(text[: span[0]])
                b = 4 + f.getlength(text[: span[1]])
                span = (int(a) - 2, int(math.ceil(b)) + 2)
            self.spans.append(span)
        self.x = int((LYRIC_X0 + LYRIC_X1) / 2 - tw / 2)
        self.y = int(MID_CY - hgt / 2)

    def draw(self, frame, k):
        frame.paste(self.ink, (self.x, self.y), self.ink)
        if k is not None and 0 <= k < len(self.spans) and self.spans[k]:
            a, b = self.spans[k]
            a, b = max(0, a), min(self.size[0], b)
            crop = self.hot.crop((a, 0, b, self.size[1]))
            d = ImageDraw.Draw(frame)
            d.rounded_rectangle([self.x + a - 2, self.y + self.size[1] - 10, self.x + b + 2,
                                 self.y + self.size[1] - 5], radius=3, fill=CORAL)
            frame.paste(crop, (self.x + a, self.y), crop)


# ------------------------------------------------------------------ timeline
class Ev:
    __slots__ = ("on", "off", "m", "child", "f", "k", "lh", "gap0", "vel", "line")


def build_timeline(cls):
    """Absolute-time segments with note events (shared timing model, see build_lessons.py)."""
    t = 0.0
    segs = []
    for s in cls["segments"]:
        S = dict(s)
        S["t0"], S["t1"] = t, t + s["durationSec"]
        S["events"], S["beats"] = [], []
        if s.get("notes"):
            bpm = s["bpm"]
            spb = 60.0 / bpm
            gap = s.get("gapBeats", 0) if s["kind"] == "your_turn" else 0
            tt = t + s.get("leadInSec", 0)
            S["notes_t0"] = tt
            lines = s.get("lines") or []
            line_of = []
            li = -1
            for i in range(len(s["notes"])):
                while li + 1 < len(lines) and lines[li + 1]["from"] <= i:
                    li += 1
                line_of.append(li)
            base_vel = {"listen": 0.85, "demo": 0.8, "together": 0.85, "beat": 0.8, "high_low": 0.8,
                        "your_turn": 0.75}.get(s["kind"], 0.8)
            if s.get("dynamic") == "loud":
                base_vel = 1.0
            elif s.get("dynamic") == "soft":
                base_vel = 0.32
            lh_open = None
            for i, n in enumerate(s["notes"]):
                child = n.get("who") != "parent"
                gap0 = None
                if gap and child and not n.get("rest"):
                    gap0 = tt
                    tt += gap * spb
                dur = n["d"] * spb
                if not n.get("rest"):
                    e = Ev()
                    e.on, e.off, e.m, e.child, e.f, e.k, e.lh = tt, tt + dur, midi(n["p"]), child, n.get("f"), i, False
                    e.gap0, e.line = gap0, line_of[i]
                    e.vel = base_vel * (0.42 if (s["kind"] == "your_turn" and child) else 1.0)
                    if s["kind"] == "high_low":
                        e.child = False
                    S["events"].append(e)
                if n.get("lh"):
                    lh = n["lh"]
                    e = Ev()
                    e.on, e.m, e.child, e.f, e.k, e.lh = tt, midi(lh["p"]), True, lh.get("f"), i, True
                    e.off = tt + lh["d"] * spb
                    e.gap0, e.line = gap0, line_of[i]
                    e.vel = 0.62 * (0.6 if s["kind"] == "your_turn" else 1.0)
                    if lh_open is not None:
                        lh_open.off = min(lh_open.off, e.on)
                    lh_open = e
                    S["events"].append(e)
                tt += dur
            S["notes_t1"] = tt
            if lh_open is not None:
                lh_open.off = min(lh_open.off, tt)
            S["lines_meta"] = [(ln["lyric"], ln["from"]) for ln in lines]
            if s["kind"] == "beat":
                b = S["notes_t0"]
                k = 0
                while b < S["notes_t1"] - 1e-6:
                    S["beats"].append(b)
                    b += spb
                    k += 1
            S["spb"] = spb
        segs.append(S)
        t += s["durationSec"]
    return segs, t


def class_range(cls):
    ms = []
    hl = False
    for s in cls["segments"]:
        for n in s.get("notes", []) or []:
            if not n.get("rest"):
                ms.append(midi(n["p"]))
            if n.get("lh"):
                ms.append(midi(n["lh"]["p"]))
        for k in s.get("showKeys", []) or []:
            ms.append(midi(k["p"]))
        if s["kind"] == "high_low":
            hl = True
    if hl:
        return 48, 84
    if not ms:
        return 60, 72
    lo = (min(ms) // 12) * 12
    hi = (max(ms) // 12 + 1) * 12
    return max(48, lo), min(84, hi)


# ------------------------------------------------------------------ audio
VOICE_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "out", "voice")
VOICE_AUDIO = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "content", "voice", "audio")
VOICE_GAIN = 0.9
_voice_cache = {}


def voice_audio(vid):
    """Teacher line (video/out/voice/<id>.wav, 22.05 kHz mono) as 44.1 kHz stereo float, or None."""
    if vid in _voice_cache:
        return _voice_cache[vid]
    path = os.path.join(VOICE_DIR, vid + ".wav")
    mp3 = os.path.join(VOICE_AUDIO, vid + ".mp3")
    buf = None
    x = None
    if os.path.exists(path):
        import wave
        from scipy.signal import resample_poly
        w = wave.open(path)
        x = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32) / 32768.0
        sr = w.getframerate()
        if sr != AU.SR:
            g = math.gcd(sr, AU.SR)
            x = resample_poly(x, AU.SR // g, sr // g).astype(np.float32)
    elif os.path.exists(mp3):   # CI: decode the committed mp3 straight to 44.1 kHz mono
        raw = subprocess.run(["ffmpeg", "-loglevel", "error", "-i", mp3, "-ac", "1", "-ar", str(AU.SR), "-f", "f32le", "-"],
                             capture_output=True, check=True).stdout
        x = np.frombuffer(raw, np.float32)
    if x is not None:
        buf = np.stack([x, x], axis=1) * VOICE_GAIN
    _voice_cache[vid] = buf
    return buf


def render_audio(segs, total):
    n = int(math.ceil(total * AU.SR)) + 1
    mixbuf = np.zeros((n, 2), np.float32)

    def add(buf, t):
        i = int(t * AU.SR)
        if i >= n:
            return
        j = min(n, i + len(buf))
        mixbuf[i:j] += buf[: j - i]

    for S in segs:
        if S.get("voiceId"):
            vb = voice_audio(S["voiceId"])
            if vb is not None:
                add(vb, S["t0"] + 0.15)
        for e in S["events"]:
            add(AU.note_audio(e.m, max(0.08, e.off - e.on - 0.02), e.vel), e.on)
        if S["kind"] == "beat":
            bpb = S.get("bpb", 4)
            for k, b in enumerate(S["beats"]):
                add(AU.tick(accent=(k % bpb == 0)), b)
        if S["kind"] == "praise":
            for k, m in enumerate((72, 76, 79, 84)):
                add(AU.note_audio(m, 0.5 if k < 3 else 1.2, 0.45), S["t0"] + 0.25 + k * 0.11)
    return AU.master(mixbuf, -16.0)


# ------------------------------------------------------------------ renderer
CONFETTI_COLS = [CORAL, MARI, INDIGO, INDIGO_L, CORAL_L]


class ClassRenderer:
    def __init__(self, lesson, cls):
        self.lesson, self.cls = lesson, cls
        self.segs, self.total = build_timeline(cls)
        lo, hi = class_range(cls)
        self.kb = Keyboard(lo, hi)
        self.icon_name = lesson.get("icon", "music")
        num, den = (int(x) for x in lesson.get("timeSignature", "4/4").split("/"))
        self.beats_per_bar = max(1, int(round(num * 4.0 / den)))
        for S in self.segs:
            S["bpb"] = self.beats_per_bar
        self.icon = IC.draw_icon(self.icon_name, ICON_SIZE)
        self.icon_big = IC.draw_icon(self.icon_name, 200)
        self.bear = IC.draw_icon("bear", ICON_SIZE)
        self.bird = IC.draw_icon("bird", ICON_SIZE)
        self.bear_dim = self._dim(IC.draw_icon("bear", 96))
        self.bird_dim = self._dim(IC.draw_icon("bird", 96))
        self._bands, self._lyrics = {}, {}
        self._build_base()

    @staticmethod
    def _dim(im):
        a = np.array(im)
        a[..., 3] = (a[..., 3] * 0.35).astype(np.uint8)
        return Image.fromarray(a)

    def _build_base(self):
        base = Image.new("RGB", (W, H), GROUND)
        d = ImageDraw.Draw(base)
        d.rectangle([0, ROLL_Y0, W, ROLL_Y1], fill=LANE)
        for m in self.kb.whites:   # faint lane lines at every C and F
            if m % 12 in (0, 5):
                x = int(self.kb.rect[m][0])
                d.line([x, ROLL_Y0, x, ROLL_Y1], fill=LANE_LINE, width=2)
        d.rectangle([0, PROG_Y0, W, PROG_Y1], fill=PROG_BG)
        self.kb.base = base
        self.kb.draw(base)
        self.base = base
        # high/low overlays (whole keyboard tinted)
        lowf = {m: LOW_KEY for m in self.kb.whites if m < self.kb.split}
        lowf.update({m: INDIGO for m in range(self.kb.lo, self.kb.hi + 1) if is_black(m) and m < self.kb.split})
        highf = {m: MARI for m in self.kb.whites if m >= self.kb.split}
        self.kb_low = self.kb.draw(base.copy(), lowf).crop((0, KB_Y0 - 8, W, KB_Y1 + 1))
        self.kb_high = self.kb.draw(base.copy(), highf).crop((0, KB_Y0 - 8, W, KB_Y1 + 1))
        # title card background
        tc = base.copy()
        self.title_cache = {}
        self.title_base = tc
        glow = Image.new("RGBA", (int(self.kb.kw * 1.7), 56), (0, 0, 0, 0))
        ga = np.zeros((56, glow.width), np.float32)
        yy, xx = np.mgrid[0:56, 0:glow.width]
        dx = (xx - glow.width / 2.0) / (glow.width / 2.0)
        dy = (56 - yy) / 56.0
        ga = np.clip(1 - np.sqrt(dx ** 2 + dy ** 2), 0, 1) ** 1.6 * 150
        g = np.zeros((56, glow.width, 4), np.uint8)
        g[..., 0], g[..., 1], g[..., 2] = CORAL
        g[..., 3] = ga.astype(np.uint8)
        self.glow = Image.fromarray(g)

    def band(self, S):
        key = (S.get("caption", ""), S.get("parentCue"))
        if key not in self._bands:
            self._bands[key] = render_band(*key)
        return self._bands[key]

    def lyric(self, S, li):
        key = (id(S), li)
        if key not in self._lyrics:
            text, frm = S["lines_meta"][li]
            nxt = S["lines_meta"][li + 1][1] if li + 1 < len(S["lines_meta"]) else len(S["notes"])
            self._lyrics[key] = LyricLine(text, S["notes"][frm:nxt]) if text.strip() else None
        return self._lyrics[key]

    def title_card(self, S):
        key = S.get("caption")
        if key not in self.title_cache:
            img = self.base.copy()
            d = ImageDraw.Draw(img)
            d.rectangle([0, ROLL_Y0, W, KB_Y0], fill=GROUND)
            self.kb.draw(img)
            f, lines, sz = fit_lines(S["caption"], "display", [64, 60, 56, 52, 48], W - 160, 1, 800)
            if f.getlength(lines[0]) > W - 160 or len(lines) > 1:
                f, lines, sz = fit_lines(S["caption"], "display", [52, 48], W - 160, 2, 800)
            y = 74 if len(lines) == 1 else 52
            for l in lines:
                d.text((W / 2, y), l, font=f, fill=INK, anchor="mm")
                y += int(sz * 1.05)
            sub = S.get("subcaption", "")
            fs = font("text", 34, 700)
            tw = fs.getlength(sub) + 44
            y += 12
            d.rounded_rectangle([W / 2 - tw / 2, y - 25, W / 2 + tw / 2, y + 25], radius=25, fill=CORAL)
            d.text((W / 2, y + 1), sub, font=fs, fill=WHITE, anchor="mm")
            self.title_cache[key] = (img, y + 30)
        return self.title_cache[key]

    # -------------------------------------------------------------- frame
    def frame(self, t):
        S = self._seg_at(t)
        kind = S["kind"]
        lt = t - S["t0"]
        if kind == "title":
            img, ybot = self.title_card(S)
            fr = img.copy()
            bounce = 6 * abs(math.sin(math.pi * t / 1.2))
            paste_center(fr, self.icon_big, W / 2, (ybot + KB_Y0 - 10) / 2 + 2 - bounce)
            self._progress(fr, t)
            return fr
        fr = self.base.copy()
        fr.paste(self.band(S), (0, 0))
        spb = S.get("spb", 0.75)
        has_notes = bool(S["events"]) or kind in ("beat", "high_low")
        # icon bounce: on the beat in note segments, slow breathing otherwise
        if has_notes and t >= S.get("notes_t0", 1e9):
            ph = ((t - S["notes_t0"]) / spb) % 1.0
            amp = {"loud": 18, "soft": 6}.get(S.get("dynamic"), 12)
            bounce = amp * abs(math.sin(math.pi * ph))
        else:
            bounce = 5 * abs(math.sin(math.pi * t / 1.6))
        if kind == "high_low":
            low = S.get("target") == "low"
            big, small = (self.bear, self.bird_dim) if low else (self.bird, self.bear_dim)
            if low:
                paste_center(fr, big, ICON_X, MID_CY - bounce)
                paste_center(fr, small, RIGHT_X, MID_CY)
            else:
                paste_center(fr, small, ICON_X, MID_CY)
                paste_center(fr, big, RIGHT_X, MID_CY - bounce)
            fr.paste(self.kb_low if low else self.kb_high, (0, KB_Y0 - 8))
        elif kind == "praise":
            paste_center(fr, self.icon, ICON_X, MID_CY - 14 * abs(math.sin(math.pi * lt / 0.5)))
        else:
            paste_center(fr, self.icon, ICON_X, MID_CY - bounce)

        if kind == "say" and S.get("caption", "").lower().startswith("stop"):
            # freeze cue for pre-readers: big pause sign in the right slot
            paste_center(fr, circle_sprite(58, CORAL), RIGHT_X, MID_CY)
            d = ImageDraw.Draw(fr)
            for dx in (-15, 15):
                d.rounded_rectangle([RIGHT_X + dx - 8, MID_CY - 26, RIGHT_X + dx + 8, MID_CY + 26], radius=4,
                                    fill=WHITE)
        if kind == "praise":
            self._confetti(fr, S, lt)
        elif kind == "say" and S.get("showKeys"):
            pulse = 0.5 + 0.5 * math.sin(2 * math.pi * lt / 1.4)
            for k in S["showKeys"]:
                m = midi(k["p"])
                if self.kb.lo <= m <= self.kb.hi:
                    self._light(fr, m, mix(CORAL_L, CORAL, pulse), k.get("f"), INK, big=True, black_pass=False)
            for k in S["showKeys"]:
                m = midi(k["p"])
                if self.kb.lo <= m <= self.kb.hi and is_black(m):
                    self._light(fr, m, mix(CORAL_L, CORAL, pulse), k.get("f"), INK, big=True, black_pass=True)
        if S["events"] or kind in ("beat", "high_low"):
            self._notes(fr, S, t)
        pill = self._phase_pill(kind)
        if pill is not None:
            fr.paste(pill, (24, ROLL_Y0 + 10), pill)
        self._progress(fr, t)
        return fr

    PHASES = {"listen": ("WATCH", INDIGO, (226, 230, 246)), "demo": ("WATCH", INDIGO, (226, 230, 246)),
              "your_turn": ("YOUR TURN", (181, 67, 43), (253, 227, 220)),
              "high_low": ("YOUR TURN", (181, 67, 43), (253, 227, 220)),
              "together": ("TOGETHER", (154, 106, 0), (253, 240, 210)), "beat": ("TOGETHER", (154, 106, 0), (253, 240, 210))}

    def _phase_pill(self, kind):
        """WATCH / YOUR TURN / TOGETHER banner (class-experience spec 4), same as the screen piano."""
        ph = self.PHASES.get(kind)
        if not ph:
            return None
        cache = self.__dict__.setdefault("_pills", {})
        if kind not in cache:
            label, fg, bg = ph
            f = font("text", 24, 800)
            tw = int(f.getlength(label))
            w, h = tw + 64, 44
            im = Image.new("RGBA", (w, h), (0, 0, 0, 0))
            d = ImageDraw.Draw(im)
            d.rounded_rectangle([0, 0, w - 1, h - 1], radius=h // 2, fill=bg + (245,))
            d.ellipse([16, h / 2 - 7, 30, h / 2 + 7], fill=fg)
            d.text((42, h / 2 + 1), label, font=f, fill=fg, anchor="lm")
            cache[kind] = im
        return cache[kind]

    def _seg_at(self, t):
        i = getattr(self, "_si", 0)
        if i >= len(self.segs) or t < self.segs[i]["t0"]:
            i = 0
        while i < len(self.segs) - 1 and t >= self.segs[i]["t1"]:
            i += 1
        self._si = i
        return self.segs[i]

    def _light(self, fr, m, fill, f, ring_col, big, black_pass=None):
        if black_pass is not None and black_pass != is_black(m):
            return
        x, y, p = self.kb.patch(m, fill)
        fr.paste(p, (x, y))
        if f:
            cx, cy, r = self.kb.circle_pos(m, big)
            paste_center(fr, finger_sprite(f, r, ring_col if ring_col != INK else INK), cx, cy)

    def _notes(self, fr, S, t):
        kind = S["kind"]
        d = ImageDraw.Draw(fr)
        evs = S["events"]
        spb = S["spb"]
        look = max(1.2, 2.6 * spb)                 # seconds of look-ahead in the roll lane
        hit = KB_Y0 - 10                           # bars land on the fallboard
        pps = (hit - ROLL_Y0 - 6) / look
        show_keys = kind != "high_low"
        lit = []
        cur_k, cur_line = None, 0
        nxt = None
        for e in evs:
            if e.on <= t:
                if not e.lh:
                    cur_k, cur_line = e.k, e.line
            elif nxt is None and not e.lh:
                nxt = e
            # falling bars
            if show_keys and e.on - t < look and e.off > t:
                yb = hit - (e.on - t) * pps
                yt = hit - (e.off - t) * pps
                yb, yt = min(yb, hit), max(yt, ROLL_Y0)
                if yb - yt > 3:
                    x0, _, x1, _ = self.kb.rect[e.m]
                    w = (x1 - x0) * (0.86 if is_black(e.m) else 0.72)
                    cx = (x0 + x1) / 2
                    col = CORAL if e.child else (INDIGO_L if not e.lh else CORAL)
                    if is_black(e.m):
                        col = mix(col, INK, 0.25)
                    d.rounded_rectangle([cx - w / 2, yt, cx + w / 2, yb], radius=min(10, (yb - yt) / 2, w / 2),
                                        fill=col)
            release = min(0.09, 0.3 * (e.off - e.on))
            if e.gap0 is not None and e.gap0 <= t < e.on:
                lit.append((e, "gap", (t - e.gap0) / max(1e-3, e.on - e.gap0)))
            elif e.on <= t < e.off - release:
                lit.append((e, "on", (t - e.on)))
        if cur_k is None and nxt is not None:
            cur_line = nxt.line
        if not S.get("lines_meta") and kind != "high_low":
            # no lyrics: show the letter name of the key to play (current, else next)
            cur = [e for e, st, _ in lit if not e.lh]
            e = cur[0] if cur else nxt
            if e is not None:
                name = NAMES[e.m % 12].replace("#", " sharp")
                f = font("display", 84, 800)
                col = CORAL if (e.child and cur and cur[0] is e and lit[0][1] == "on") else INK_SOFT
                d.text(((LYRIC_X0 + LYRIC_X1) / 2, MID_CY), name, font=f, fill=col, anchor="mm")
        # karaoke lyric
        if S.get("lines_meta") and cur_line is not None and cur_line >= 0:
            ly = self.lyric(S, cur_line)
            if ly is not None:
                frm = S["lines_meta"][cur_line][1]
                k = None
                if cur_k is not None and any(st == "on" and not e.lh and e.k == cur_k for e, st, _ in lit):
                    k = cur_k - frm
                ly.draw(fr, k)
        # lit keys: whites first, then blacks, then finger circles
        if not show_keys:
            lit = []
        order = sorted(lit, key=lambda x: is_black(x[0].m))
        circles = []
        for e, st, v in order:
            if e.child:
                fill = CORAL if st == "on" else CORAL_L
                ring = INK
            else:
                fill = PARENT_KEY
                ring = INDIGO
            x, y, p = self.kb.patch(e.m, fill)
            fr.paste(p, (x, y))
            if e.child and st == "on":
                gx = self.kb.cx(e.m)
                fr.paste(self.glow, (int(gx - self.glow.width / 2), KB_Y0 - 10 - self.glow.height), self.glow)
            circles.append((e, st, v, ring))
        for e, st, v, ring in circles:
            cx, cy, r = self.kb.circle_pos(e.m, e.child)
            if e.f:
                paste_center(fr, finger_sprite(e.f, r, ring if not e.child else INK, ring), cx, cy)
            if st == "gap":   # countdown: coral arc shrinking around the finger circle
                rr = r + 7
                d.arc([cx - rr, cy - rr, cx + rr, cy + rr], -90, -90 + 360 * (1 - v), fill=CORAL, width=6)
                if not e.f:
                    paste_center(fr, circle_sprite(r * 0.5, CORAL), cx, cy)
        # beat circle / high-low pulse
        if kind == "beat":
            self._beat_circle(fr, S, t, MARI)
        elif kind == "high_low":
            low = S.get("target") == "low"
            ons = [e.on for e in evs]
            last = max([o for o in ons if o <= t], default=None)
            ph = (t - last) if last is not None else 9
            r = 74 + 16 * math.exp(-ph * 7)
            cx = ICON_X if low else RIGHT_X
            ring = Image.new("RGBA", (int(2 * r + 10), int(2 * r + 10)), (0, 0, 0, 0))
            ImageDraw.Draw(ring).ellipse([5, 5, 2 * r + 5, 2 * r + 5], outline=(INDIGO if low else MARI) + (220,),
                                         width=6)
            paste_center(fr, ring, cx, MID_CY)

    def _beat_circle(self, fr, S, t, col):
        beats = S["beats"]
        if not beats:
            return
        spb = S["spb"]
        if t < beats[0]:
            # count-in: outlined circle pulsing in time
            ph = ((t - S["notes_t0"]) / spb) % 1.0
            r = 44
            d = ImageDraw.Draw(fr)
            d.ellipse([RIGHT_X - r, MID_CY - r, RIGHT_X + r, MID_CY + r], outline=col, width=5)
            return
        k = int((t - beats[0]) / spb)
        if k >= len(beats):
            return
        ph = (t - beats[k]) / spb
        base = {"loud": 54, "soft": 36}.get(S.get("dynamic"), 46)
        r = base + 22 * math.exp(-ph * 6)
        paste_center(fr, circle_sprite(r + 14, CORAL_L, 120), RIGHT_X, MID_CY)
        paste_center(fr, circle_sprite(r, col), RIGHT_X, MID_CY)
        d = ImageDraw.Draw(fr)
        d.text((RIGHT_X, MID_CY + 2), str(k % S.get("bpb", 4) + 1), font=font("display", int(r * 0.9), 800), fill=WHITE,
               anchor="mm")

    def _confetti(self, fr, S, lt):
        rnd = random.Random(int(S["t0"] * 1000))
        d = ImageDraw.Draw(fr)
        for i in range(46):
            x0 = rnd.uniform(40, W - 40)
            v = rnd.uniform(160, 300)
            delay = rnd.uniform(0, 1.2)
            y = -20 + (lt - delay) * v
            if y < -20 or y > ROLL_Y1 - 10:
                continue
            x = x0 + 26 * math.sin(lt * rnd.uniform(1.5, 3) + i)
            col = CONFETTI_COLS[i % len(CONFETTI_COLS)]
            a = lt * rnd.uniform(2, 5) + i
            s = rnd.uniform(7, 12)
            shape = i % 3
            if shape == 0:
                pts = [(x + s * math.cos(a + k * math.pi / 2) * (1.6 if k % 2 else 0.7),
                        y + s * math.sin(a + k * math.pi / 2) * (1.6 if k % 2 else 0.7)) for k in range(4)]
                d.polygon(pts, fill=col)
            elif shape == 1:
                d.ellipse([x - s * 0.7, y - s * 0.7, x + s * 0.7, y + s * 0.7], fill=col)
            else:
                pts = [(x + s * math.cos(a + k * 2.094), y + s * math.sin(a + k * 2.094)) for k in range(3)]
                d.polygon(pts, fill=col)

    def _progress(self, fr, t):
        x = int(W * min(1.0, t / self.total))
        if x > 0:
            ImageDraw.Draw(fr).rectangle([0, PROG_Y0, x, PROG_Y1], fill=CORAL)



# ------------------------------------------------------------------ covers
AGE_LABELS = {"2-3": "Tiny Ears", "3-4": "Little Explorer", "4-5": "First Songs", "5-6": "Little Pianist"}
COVER_VERSION = "6"   # 6: no age pill (the app shows the age group elsewhere)


def song_melody(lesson):
    """The whole-song notes (from the concert class, else the longest note segment)."""
    best = []
    for c in reversed(lesson["classes"]):
        for sgm in c["segments"]:
            ns = sgm.get("notes") or []
            if len(ns) > len(best) and sgm["kind"] in ("together", "beat", "listen"):
                best = ns
        if best:
            break
    return [n for n in best if not n.get("rest") and n.get("h") != "L"], best


def cover_hash(lesson):
    import hashlib
    mel, _ = song_melody(lesson)
    key = [COVER_VERSION, lesson.get("title"), lesson.get("icon"), lesson.get("ageGroup"),
           [(n["p"], n["d"], n.get("f")) for n in mel[:16]]]
    return hashlib.sha1(json.dumps(key).encode()).hexdigest()


def _cover_keys(img, mel, all_notes, bpm, lane_y0, kb_y0, kb_y1, width, max_kw, margin, x_off=0):
    """Lane + keyboard with the first notes lit coral and the next notes falling as bars."""
    ms = [midi(n["p"]) for n in mel[:12]] or [60]      # the opening's range keeps keys big
    lo = max(48, (min(ms) // 12) * 12)
    hi = min(84, (max(ms) // 12 + 1) * 12)
    kb = Keyboard(lo, hi, y0=kb_y0, y1=kb_y1, width=width, max_kw=max_kw, margin=margin)
    canvas = Image.new("RGB", (width, img.height), GROUND)
    d = ImageDraw.Draw(canvas)
    d.rectangle([0, lane_y0, width, kb_y0], fill=LANE)
    for m in kb.whites:
        if m % 12 in (0, 5):
            x = int(kb.rect[m][0])
            d.line([x, lane_y0, x, kb_y0], fill=LANE_LINE, width=2)
    # first notes lit: the distinct keys of the first three notes
    lit = []
    for n in mel[:3]:
        if n["p"] not in [l["p"] for l in lit]:
            lit.append(n)
    fills = {midi(n["p"]): CORAL for n in lit}
    kb.draw(canvas, fills)
    # upcoming notes as falling bars (timing as in the lesson video)
    spb = 60.0 / max(40, bpm)
    hit = kb_y0 - 10
    pps = (hit - lane_y0 - 4) / (2.4 * spb)            # about two beats of upcoming notes
    t = 0.0
    start = sum(n["d"] for n in mel[:3]) * spb
    for n in mel[3:11]:
        on, off = t + start, t + start + n["d"] * spb
        t += n["d"] * spb
        rel_on, rel_off = on - start, off - start
        yb, yt = hit - rel_on * pps, hit - rel_off * pps
        if yb <= lane_y0:
            break
        yt = max(yt, lane_y0)
        m = midi(n["p"])
        x0, _, x1, _ = kb.rect[m]
        w = (x1 - x0) * (0.86 if is_black(m) else 0.72)
        cx = (x0 + x1) / 2
        col = CORAL if not is_black(m) else mix(CORAL, INK, 0.25)
        if yb - yt > 10:
            d.rounded_rectangle([cx - w / 2, yt + 3, cx + w / 2, yb - 3], radius=min(10, (yb - yt) / 3, w / 2),
                                fill=col)
    for n in lit:
        if n.get("f"):
            cx, cy, r = kb.circle_pos(midi(n["p"]), True)
            paste_center(canvas, finger_sprite(n["f"], r, INK), cx, cy)
    img.paste(canvas.crop((0, lane_y0 - 2, width, kb_y1 + 2)), (x_off, lane_y0 - 2))


def _age_pill(d, cx, y, age, size, anchor_left=False):
    label = "Ages %s  |  %s" % (age, AGE_LABELS.get(age, ""))
    f = font("text", size, 700)
    tw = f.getlength(label) + size * 1.4
    x0 = cx if anchor_left else cx - tw / 2
    h = size * 1.7
    d.rounded_rectangle([x0, y, x0 + tw, y + h], radius=h / 2, fill=CORAL)
    d.text((x0 + tw / 2, y + h / 2 + 1), label, font=f, fill=WHITE, anchor="mm")
    return y + h


def render_covers(lesson, out_root):
    sid = lesson["songId"]
    out_dir = os.path.join(out_root, sid)
    os.makedirs(out_dir, exist_ok=True)
    mel, _ = song_melody(lesson)
    bpm = next((sg["bpm"] for c in reversed(lesson["classes"]) for sg in c["segments"] if sg.get("bpm")), 90)
    title, age = lesson.get("title", sid), lesson.get("ageGroup", "")
    icon = lesson.get("icon", "music")

    # 1280x720: icon left, title right, keyboard strip at the bottom
    img = Image.new("RGB", (W, H), GROUND)
    _cover_keys(img, mel, None, bpm, lane_y0=338, kb_y0=478, kb_y1=708, width=W, max_kw=112, margin=64)
    ic = IC.draw_icon(icon, 280)
    paste_center(img, ic, 250, 170)
    d = ImageDraw.Draw(img)
    f, lines, sz = fit_lines(title, "display", [104, 96, 88, 80, 72, 64, 56], 760, 2, 800)
    lh = int(sz * 1.02)
    y = 170 - lh * len(lines) / 2
    for l in lines:
        d.text((440, y + lh / 2), l, font=f, fill=INK, anchor="lm")
        y += lh
    img.save(os.path.join(out_dir, "cover.jpg"), quality=90)

    # 720x720 square: icon on top, title centred, keyboard strip at the bottom
    S = 720
    sq = Image.new("RGB", (S, S), GROUND)
    _cover_keys(sq, mel, None, bpm, lane_y0=470, kb_y0=560, kb_y1=708, width=S, max_kw=86, margin=40)
    paste_center(sq, IC.draw_icon(icon, 200), S / 2, 124)
    d = ImageDraw.Draw(sq)
    f, lines, sz = fit_lines(title, "display", [80, 72, 66, 60, 54, 48], S - 70, 2, 800)
    lh = int(sz * 1.02)
    y = 352 - lh * len(lines) / 2
    for l in lines:
        d.text((S / 2, y + lh / 2), l, font=f, fill=INK, anchor="mm")
        y += lh
    sq.save(os.path.join(out_dir, "cover-square.jpg"), quality=90)
    with open(os.path.join(out_dir, ".cover.hash"), "w") as fh:
        fh.write(cover_hash(lesson) + "\n")


def needs_cover(lesson, out_root):
    d = os.path.join(out_root, lesson["songId"])
    if not (os.path.exists(os.path.join(d, "cover.jpg")) and os.path.exists(os.path.join(d, "cover-square.jpg"))):
        return True
    hp = os.path.join(d, ".cover.hash")
    if not os.path.exists(hp):
        return False            # hand-made cover: leave it alone
    with open(hp) as fh:
        return fh.read().strip() != cover_hash(lesson)


# ------------------------------------------------------------------ IO
def load_lessons(lessons_dir):
    out = {}
    for p in sorted(glob.glob(os.path.join(lessons_dir, "*.json"))):
        with open(p) as f:
            L = json.load(f)
        out[L["songId"]] = L
    return out


def encode(renderer, mp4, crf, preset, threads, audio_kbps):
    tmp_mp4 = mp4 + ".part.mp4"
    wav = mp4 + ".part.wav"
    audio = render_audio(renderer.segs, renderer.total)
    AU.write_wav(wav, audio)
    n_frames = int(round(renderer.total * FPS))
    cmd = ["ffmpeg", "-y", "-v", "error", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", "%dx%d" % (W, H),
           "-r", str(FPS), "-i", "pipe:0", "-i", wav, "-map", "0:v", "-map", "1:a",
           "-c:v", "libx264", "-preset", preset, "-crf", str(crf), "-tune", "animation",
           "-pix_fmt", "yuv420p", "-g", str(FPS * 10), "-bf", "3", "-threads", str(threads),
           "-c:a", "aac", "-b:a", "%dk" % audio_kbps, "-ar", "44100",
           "-movflags", "+faststart", "-shortest", tmp_mp4]
    proc = subprocess.Popen(cmd, stdin=subprocess.PIPE)
    prev_key, prev_bytes = None, None
    thumb = None
    try:
        for i in range(n_frames):
            t = i / float(FPS)
            fr = renderer.frame(t)
            b = fr.tobytes()
            proc.stdin.write(b)
            if thumb is None and t >= 1.2:
                thumb = fr
    finally:
        proc.stdin.close()
        rc = proc.wait()
    os.remove(wav)
    if rc != 0:
        raise RuntimeError("ffmpeg failed (%d) for %s" % (rc, mp4))
    os.replace(tmp_mp4, mp4)
    (thumb or renderer.frame(1.2)).resize((640, 360), Image.LANCZOS).save(mp4[:-4] + ".jpg", quality=86)
    return n_frames / float(FPS)


RENDER_VERSION = "2"   # 2: teacher voice, phase banners, marigold beat circle


def class_hash(lesson, cls):
    import hashlib
    key = {"v": RENDER_VERSION, "icon": lesson.get("icon"), "title": lesson.get("title"),
           "ts": lesson.get("timeSignature"), "cls": cls}
    return hashlib.sha1(json.dumps(key, sort_keys=True).encode()).hexdigest()


def hash_path(out_root, lesson, cls):
    return os.path.join(out_root, lesson["songId"], "." + cls["id"] + ".hash")


def needs_render(lesson, cls, out_root):
    """Missing mp4/jpg -> render. Rendered by us (hash file) but lesson changed -> re-render.
    An mp4 without a hash file is treated as a filmed/hand-made replacement and left alone."""
    mp4 = os.path.join(out_root, cls["video"])
    jpg = os.path.join(out_root, cls["thumb"])
    if not (os.path.exists(mp4) and os.path.exists(jpg)):
        return True
    hp = hash_path(out_root, lesson, cls)
    if not os.path.exists(hp):
        return False
    with open(hp) as f:
        return f.read().strip() != class_hash(lesson, cls)


def stamp(lesson, cls, out_root):
    with open(hash_path(out_root, lesson, cls), "w") as f:
        f.write(class_hash(lesson, cls) + "\n")


def render_class(lesson, cls, out_root, force=False, crf=26, preset="veryfast", threads=0, audio_kbps=80):
    sid = lesson["songId"]
    out_dir = os.path.join(out_root, sid)
    os.makedirs(out_dir, exist_ok=True)
    mp4 = os.path.join(out_dir, cls["id"] + ".mp4")
    if not force and not needs_render(lesson, cls, out_root):
        return None
    t0 = time.time()
    r = ClassRenderer(lesson, cls)
    secs = encode(r, mp4, crf, preset, threads, audio_kbps)
    stamp(lesson, cls, out_root)
    wall = time.time() - t0
    size = os.path.getsize(mp4)
    print("%s  %5.1fs video  %5.1fs wall  %.2fx realtime  %.2f MB" % (cls["id"], secs, wall, secs / wall,
                                                                      size / 1e6), flush=True)
    return secs, wall, size


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--lessons", default=os.path.join(ROOT, "content", "lessons"))
    ap.add_argument("--out", default=os.path.join(HERE, "out"))
    ap.add_argument("--song", action="append")
    ap.add_argument("--class", dest="cls", action="append")
    ap.add_argument("--all", action="store_true")
    ap.add_argument("--force", action="store_true")
    ap.add_argument("--crf", type=int, default=26)
    ap.add_argument("--preset", default="veryfast")
    ap.add_argument("--threads", type=int, default=0)
    ap.add_argument("--audio-kbps", type=int, default=80)
    ap.add_argument("--frames", help="comma-separated seconds: write PNG stills instead of video")
    ap.add_argument("--frames-out", default=os.path.join(HERE, "out", "_frames"))
    ap.add_argument("--samples", action="store_true", help="export video/samples/<Note>.mp3 (C3..C6)")
    ap.add_argument("--covers", action="store_true",
                    help="write out/<songId>/cover.jpg (1280x720) and cover-square.jpg (720x720); "
                         "with --song/--all; existing covers are skipped unless --force")
    ap.add_argument("--list", action="store_true", help="print every classId, one per line")
    ap.add_argument("--todo", action="store_true", help="with --list: only classes that need rendering")
    ap.add_argument("--stamp", action="store_true",
                    help="mark existing outputs as rendered from the current lessons (writes .hash files)")
    a = ap.parse_args()

    if a.samples:
        w = AU.export_samples(os.path.join(HERE, "samples"))
        print("wrote %d samples to %s" % (len(w), os.path.join(HERE, "samples")))
        return
    lessons = load_lessons(a.lessons)
    by_class = {c["id"]: (L, c) for L in lessons.values() for c in L["classes"]}
    if a.list:
        for cid, (L, c) in by_class.items():
            if not a.todo or needs_render(L, c, a.out):
                print(cid)
        return
    if a.stamp:
        n = 0
        for L, c in by_class.values():
            if os.path.exists(os.path.join(a.out, c["video"])):
                stamp(L, c, a.out)
                n += 1
        print("stamped %d existing videos" % n)
        return
    if a.covers:
        sids = a.song or (list(lessons) if a.all else [])
        if not sids:
            ap.error("--covers needs --song or --all")
        n = 0
        for sid in sids:
            if a.force or needs_cover(lessons[sid], a.out):
                render_covers(lessons[sid], a.out)
                n += 1
        print("covers: %d written, %d up to date" % (n, len(sids) - n))
        return
    todo = []
    if a.cls:
        todo += [by_class[c] for c in a.cls]
    if a.song:
        for s in a.song:
            todo += [(lessons[s], c) for c in lessons[s]["classes"]]
    if a.all:
        todo += [(L, c) for L in lessons.values() for c in L["classes"]]
    if not todo:
        ap.error("nothing to do: pass --class, --song, --all, --samples or --list")
    if a.frames:
        os.makedirs(a.frames_out, exist_ok=True)
        for L, c in todo:
            r = ClassRenderer(L, c)
            for ts in a.frames.split(","):
                t = float(ts)
                p = os.path.join(a.frames_out, "%s_%06.1f.png" % (c["id"], t))
                r.frame(t).save(p)
                print(p)
        return
    tot_v = tot_w = tot_s = 0.0
    n = 0
    for L, c in todo:
        res = render_class(L, c, a.out, a.force, a.crf, a.preset, a.threads, a.audio_kbps)
        if res:
            n += 1
            tot_v += res[0]
            tot_w += res[1]
            tot_s += res[2]
    if n:
        print("rendered %d videos: %.0f s of video in %.0f s wall (%.2fx realtime), avg %.2f MB, "
              "avg %.2f MB per 4 min" % (n, tot_v, tot_w, tot_v / tot_w, tot_s / n / 1e6,
                                          tot_s / tot_v * 240 / 1e6))


if __name__ == "__main__":
    main()
