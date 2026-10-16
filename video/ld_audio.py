"""Piano audio for Little Duet videos.

Sampled piano: Salamander Grand Piano (Alexander Holm, CC-BY 3.0), mp3s from the
Tone.js audio repo (video/assets/tonejs-audio/salamander). The source is sampled every
minor third; each semitone C3..C6 is pitch-shifted from the nearest sample (max 1
semitone) with polyphase resampling and cached in video/assets/cache/piano_C3_C6.npy.
If the samples are missing, a numpy piano-like synth is used instead.
"""
import os
import subprocess
import numpy as np
from scipy.signal import resample_poly, lfilter

SR = 44100
HERE = os.path.dirname(os.path.abspath(__file__))
SAMPLE_DIR = os.path.join(HERE, "assets", "tonejs-audio", "salamander")
CACHE = os.path.join(HERE, "assets", "cache", "piano_C3_C6.npy")
LO, HI = 48, 84          # C3 .. C6 (MIDI)
NOTE_LEN = 5.0           # seconds kept per cached note
NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]
SRC_NAME = {0: "C", 3: "Ds", 6: "Fs", 9: "A"}


def midi(p):
    name, octv = p[:-1], int(p[-1])
    return NAMES.index(name) + 12 * (octv + 1)


def pname(m):
    return "%s%d" % (NAMES[m % 12], m // 12 - 1)


def _decode(path):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-f", "f32le", "-ac", "2",
                          "-ar", str(SR), "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).reshape(-1, 2).copy()


def _synth(m):
    """Fallback piano-ish tone: inharmonic partials, hammer click, two-stage decay."""
    n = int(NOTE_LEN * SR)
    t = np.arange(n) / SR
    f0 = 440.0 * 2 ** ((m - 69) / 12.0)
    B = 0.0004
    out = np.zeros(n)
    for k in range(1, 12):
        fk = f0 * k * np.sqrt(1 + B * k * k)
        if fk > SR / 2.2:
            break
        amp = (1.0 / k ** 1.3) * (1 if k % 7 else 0.3)
        dec = (0.9 + 0.08 * (m - 48)) * (1 + 0.6 * k)
        out += amp * np.sin(2 * np.pi * fk * t) * (0.65 * np.exp(-t * dec) + 0.35 * np.exp(-t * dec * 0.15))
    click = np.random.RandomState(m).randn(n) * np.exp(-t * 400) * 0.15
    out = (out + click) * (1 - np.exp(-t * 800))
    out /= np.abs(out).max() + 1e-9
    st = np.stack([out, np.roll(out, 12)], axis=1) * 0.5
    return st.astype(np.float32)


def build_cache():
    os.makedirs(os.path.dirname(CACHE), exist_ok=True)
    n = int(NOTE_LEN * SR)
    bank = np.zeros((HI - LO + 1, n, 2), np.float32)
    have = os.path.isdir(SAMPLE_DIR)
    srcs = {}
    for m in range(LO, HI + 1):
        if not have:
            bank[m - LO] = _synth(m)
            continue
        # nearest source sample (C, D#, F# or A); prefer shifting down on ties
        best = min((abs(s - m), s) for s in range(m - 2, m + 3) if s % 12 in SRC_NAME)[1]
        if best not in srcs:
            path = os.path.join(SAMPLE_DIR, "%s%d.mp3" % (SRC_NAME[best % 12], best // 12 - 1))
            x = _decode(path)
            on = int(np.argmax(np.abs(x).max(axis=1) > 0.004))
            srcs[best] = x[max(0, on - int(0.002 * SR)):]
        x = srcs[best]
        shift = m - best
        if shift == 1:      # up a semitone: 2**(1/12) ~= 89/84
            x = resample_poly(x, 84, 89, axis=0)
        elif shift == -1:
            x = resample_poly(x, 89, 84, axis=0)
        elif shift != 0:
            r = 2 ** (shift / 12.0)
            idx = np.arange(0, len(x) - 1, r)
            x = np.stack([np.interp(idx, np.arange(len(x)), x[:, c]) for c in range(2)], 1)
        x = x[:n]
        if len(x) < n:
            x = np.concatenate([x, np.zeros((n - len(x), 2))])
        fade = int(0.4 * SR)
        x[-fade:] *= np.linspace(1, 0, fade)[:, None]
        bank[m - LO] = x
    # level match: same peak per note keeps the Salamander balance roughly intact
    peaks = np.abs(bank[:, : int(0.3 * SR)]).max(axis=(1, 2))
    bank /= np.maximum(peaks, 1e-6)[:, None, None]
    bank *= 0.5
    np.save(CACHE, bank.astype(np.float16))
    return bank


_BANK = None


def bank():
    global _BANK
    if _BANK is None:
        if not os.path.exists(CACHE):
            build_cache()
        _BANK = np.load(CACHE, mmap_mode="r")
    return _BANK


def note_audio(m, dur, vel=0.8):
    """Stereo float32 buffer for a held note of `dur` seconds with a damper release."""
    m = min(max(m, LO), HI)
    b = bank()[m - LO]
    rel = 0.35
    n = min(len(b), int((dur + rel) * SR))
    x = np.asarray(b[:n], dtype=np.float32) * vel
    k = int(dur * SR)
    if k < n:
        t = np.arange(n - k) / SR
        x[k:] *= np.exp(-t / 0.09)[:, None]
    return x


def tick(accent=False):
    n = int(0.03 * SR)
    t = np.arange(n) / SR
    f = 1800.0 if accent else 1400.0
    x = (np.sin(2 * np.pi * f * t) + 0.3 * np.sin(2 * np.pi * 3.1 * f * t)) * np.exp(-t * 160)
    x *= 0.05 if accent else 0.035
    return np.stack([x, x], 1).astype(np.float32)


# ------------------------------------------------------------------ loudness
def _k_filter(x):
    # ITU-R BS.1770 K-weighting at 44.1 kHz (pre-filter + RLB high-pass)
    b1 = [1.53090959966, -2.65116903469, 1.16916686186]
    a1 = [1.0, -1.66375011030, 0.71265753053]
    b2 = [1.0, -2.0, 1.0]
    a2 = [1.0, -1.98916967363, 0.98925532215]
    return lfilter(b2, a2, lfilter(b1, a1, x, axis=0), axis=0)


def lufs(x):
    y = _k_filter(x.astype(np.float64))
    blk, hop = int(0.4 * SR), int(0.1 * SR)
    if len(y) < blk:
        return -70.0
    ms = np.array([np.mean(np.sum(y[i:i + blk] ** 2, axis=1)) for i in range(0, len(y) - blk, hop)])
    lk = -0.691 + 10 * np.log10(ms + 1e-12)
    g = ms[lk > -70]
    if not len(g):
        return -70.0
    rel = -0.691 + 10 * np.log10(g.mean()) - 10
    g2 = ms[(lk > -70) & (lk > rel)]
    return float(-0.691 + 10 * np.log10(g2.mean()))


def limit(x, ceiling=0.89):
    """Block-based peak limiter: smooth gain so no sample exceeds `ceiling`."""
    blk = 128
    nb = (len(x) + blk - 1) // blk
    pad = np.zeros((nb * blk, 2), np.float32)
    pad[: len(x)] = x
    pk = np.abs(pad).reshape(nb, blk, 2).max(axis=(1, 2))
    g = np.minimum(1.0, ceiling / np.maximum(pk, 1e-9))
    # look-ahead / hold: each block takes the min of its neighbours
    gl = g.copy()
    for s in (1, 2, 3):
        gl[:-s] = np.minimum(gl[:-s], g[s:])
        gl[s:] = np.minimum(gl[s:], g[:-s])
    # release smoothing (one-pole, ~80 ms)
    a = np.exp(-blk / (0.08 * SR))
    out = np.empty_like(gl)
    cur = 1.0
    for i, v in enumerate(gl):
        cur = v if v < cur else a * cur + (1 - a) * v
        out[i] = cur
    gs = np.interp(np.arange(nb * blk), np.arange(nb) * blk + blk / 2, out)[: len(x)]
    y = x * gs[:, None].astype(np.float32)
    return np.clip(y, -ceiling, ceiling)


def master(mix, target=-16.0, ceiling=0.75):
    """Normalise to ~target LUFS; the limiter keeps peaks at -2.5 dBFS (room for AAC overshoot).
    Two passes, because limiting the piano's transients lowers the loudness a little."""
    y = mix
    for _ in range(2):
        L = lufs(y)
        if L < -69:
            break
        y = limit(y * np.float32(10 ** ((target - L) / 20.0)), ceiling=ceiling)
    return y


def write_wav(path, x):
    pcm = (np.clip(x, -1, 1) * 32767).astype("<i2")
    import wave
    with wave.open(path, "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())


def export_samples(out_dir, lo="C3", hi="C6", secs=1.5):
    """Per-note mp3s for the app's on-screen piano: <Note>.mp3, 1.5 s, loudness-matched."""
    os.makedirs(out_dir, exist_ok=True)
    written = []
    for m in range(midi(lo), midi(hi) + 1):
        x = note_audio(m, secs - 0.35, vel=1.0)[: int(secs * SR)].astype(np.float64)
        if len(x) < int(secs * SR):
            x = np.concatenate([x, np.zeros((int(secs * SR) - len(x), 2))])
        fade = int(0.25 * SR)
        x[-fade:] *= np.linspace(1, 0, fade)[:, None] ** 2
        # loudness-match on the first 0.6 s (K-weighted RMS), then cap peaks at -1 dBFS
        y = _k_filter(x[: int(0.6 * SR)])
        rms = np.sqrt(np.mean(y ** 2)) + 1e-9
        x *= 10 ** (-18 / 20.0) / rms
        pk = np.abs(x).max()
        if pk > 0.89:
            x *= 0.89 / pk
        wav = os.path.join(out_dir, ".tmp.wav")
        write_wav(wav, x.astype(np.float32))
        dst = os.path.join(out_dir, pname(m) + ".mp3")
        subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", wav, "-c:a", "libmp3lame", "-b:a", "128k",
                        dst], check=True)
        os.remove(wav)
        written.append(dst)
    return written
