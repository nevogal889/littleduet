#!/usr/bin/env python3
"""Synthesize the teacher's lines (Voice A) for every lesson and tutorial.

    python3 video/render_voice.py [--out video/out] [--piper PATH] [--model DIR]

Reads content/lessons/*.json and content/tutorial/tutorial-*.json, renders every line that is not in
content/voice/durations.json yet with Piper (offline), writes video/out/voice/<voiceId>.wav (for video
mixing) and .mp3 (for the app), and records each line's length in durations.json. Re-run the lesson builder
afterwards: segments are sized from the real lengths. Restart-safe: rendered lines are skipped.
"""
import argparse
import glob
import json
import os
import subprocess
import sys
import tempfile
import wave

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "content", "voice"))
import teacher  # noqa: E402

AUDIO_DIR = os.path.join(ROOT, "content", "voice", "audio")   # committed source of truth (mp3)
DEF_PIPER = os.environ.get("PIPER_BIN", "/home/claude/tts/piper/piper")
DEF_MODEL = os.environ.get("PIPER_VOICES", "/home/claude/tts/libritts-high")


def lines_needed():
    files = sorted(glob.glob(os.path.join(ROOT, "content", "lessons", "*.json")))
    files += sorted(glob.glob(os.path.join(ROOT, "content", "tutorial", "tutorial-*.json")))
    lines = teacher.all_lines(json.load(open(f)) for f in files)
    for items in teacher.moment_lines().values():   # nudges, "I heard C", class end (played by the app)
        for it in items:
            lines[it["voiceId"]] = it["text"]
    return lines


def wav_sec(path):
    w = wave.open(path)
    return w.getnframes() / float(w.getframerate())


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", default=os.path.join(ROOT, "video", "out"))
    ap.add_argument("--piper", default=DEF_PIPER)
    ap.add_argument("--model", default=DEF_MODEL)
    ap.add_argument("--force", action="store_true")
    a = ap.parse_args()
    vdir = os.path.join(a.out, "voice")          # wav cache for video mixing
    os.makedirs(vdir, exist_ok=True)
    os.makedirs(AUDIO_DIR, exist_ok=True)
    need = lines_needed()
    dur = {} if a.force else dict(teacher.durations())
    for vid in need:                             # migrate mp3s rendered into the old cache location
        old = os.path.join(vdir, vid + ".mp3")
        if os.path.exists(old) and not os.path.exists(os.path.join(AUDIO_DIR, vid + ".mp3")):
            os.replace(old, os.path.join(AUDIO_DIR, vid + ".mp3"))
    # Piper is not deterministic, so a line's audio is synthesized once and kept (content/voice/audio).
    todo = {vid: t for vid, t in need.items()
            if vid not in dur or not os.path.exists(os.path.join(AUDIO_DIR, vid + ".mp3"))}
    print("voice lines: %d needed, %d to render" % (len(need), len(todo)), flush=True)
    if todo:
        model = os.path.join(a.model, teacher.VOICE["model"] + ".onnx")
        with tempfile.NamedTemporaryFile("w", suffix=".jsonl", delete=False) as fh:
            for vid, text in todo.items():
                fh.write(json.dumps({"text": text, "output_file": os.path.join(vdir, vid + ".wav"),
                                     "speaker_id": teacher.VOICE["speaker"]}) + "\n")
            jl = fh.name
        cmd = [a.piper, "-m", model, "--json-input", "--length_scale", str(teacher.VOICE["length_scale"]),
               "--sentence_silence", str(teacher.VOICE["sentence_silence"])]
        with open(jl) as inp:
            r = subprocess.run(cmd, stdin=inp, capture_output=True)
        os.remove(jl)
        if r.returncode != 0:
            sys.stderr.write(r.stderr.decode()[-2000:])
            sys.exit(1)
        for vid in todo:
            wav = os.path.join(vdir, vid + ".wav")
            if not os.path.exists(wav):
                print("missing render for %s" % vid)
                continue
            subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", wav, "-ac", "1", "-b:a", "64k",
                            os.path.join(AUDIO_DIR, vid + ".mp3")], check=True)
            dur[vid] = round(wav_sec(wav), 2)
    # keep only lines still in use (stale ids drop out of the table, files are kept)
    dur = {k: v for k, v in dur.items() if k in need}
    with open(teacher.DUR_PATH, "w") as fh:
        json.dump(dict(sorted(dur.items())), fh, indent=0)
    print("durations: %d lines, %.1f min of speech" % (len(dur), sum(dur.values()) / 60.0))


if __name__ == "__main__":
    main()
