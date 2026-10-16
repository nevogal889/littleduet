#!/usr/bin/env python3
"""Check rendered videos against the lesson files.

    python3 video/check_videos.py [--lessons content/lessons] [--out video/out]

For every class that has an mp4: 1280x720, 30 fps, h264 + aac, moov before mdat (faststart),
duration within 0.5 s of durationSec, thumbnail 640x360, size <= 6 MB per 4 minutes.
Prints a summary (rendered / missing / failed, sizes) and exits 1 on any failure.
"""
import argparse
import glob
import json
import os
import subprocess
import sys

from PIL import Image

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from render import needs_render, needs_cover  # noqa: E402

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)


def faststart(path):
    with open(path, "rb") as f:
        data = f.read(1 << 20)
    i_moov, i_mdat = data.find(b"moov"), data.find(b"mdat")
    return i_moov != -1 and (i_mdat == -1 or i_moov < i_mdat)


def probe(path):
    out = subprocess.run(["ffprobe", "-v", "error", "-show_entries",
                          "stream=codec_type,codec_name,width,height,r_frame_rate:format=duration",
                          "-of", "json", path], capture_output=True, text=True, check=True).stdout
    return json.loads(out)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--lessons", default=os.path.join(ROOT, "content", "lessons"))
    ap.add_argument("--out", default=os.path.join(HERE, "out"))
    a = ap.parse_args()
    ok = missing = stale = 0
    covers_missing = 0
    fails = []
    sizes, secs = [], []
    for lp in sorted(glob.glob(os.path.join(a.lessons, "*.json"))):
        L = json.load(open(lp))
        if needs_cover(L, a.out):
            covers_missing += 1
        for c in L["classes"]:
            mp4 = os.path.join(a.out, c["video"])
            jpg = os.path.join(a.out, c["thumb"])
            if not os.path.exists(mp4):
                missing += 1
                continue
            if needs_render(L, c, a.out):      # rendered from an older version of the lesson
                stale += 1
                continue
            errs = []
            try:
                p = probe(mp4)
            except subprocess.CalledProcessError as e:
                fails.append("%s: ffprobe failed" % c["id"])
                continue
            v = [s for s in p["streams"] if s["codec_type"] == "video"]
            au = [s for s in p["streams"] if s["codec_type"] == "audio"]
            if not v or v[0]["codec_name"] != "h264" or (v[0]["width"], v[0]["height"]) != (1280, 720):
                errs.append("video stream not h264 1280x720")
            elif v[0]["r_frame_rate"] != "30/1":
                errs.append("fps %s" % v[0]["r_frame_rate"])
            if not au or au[0]["codec_name"] != "aac":
                errs.append("no aac audio")
            dur = float(p["format"]["duration"])
            if abs(dur - c["durationSec"]) > 0.5:
                errs.append("duration %.2f != %d" % (dur, c["durationSec"]))
            if not faststart(mp4):
                errs.append("not faststart")
            size = os.path.getsize(mp4)
            if size / dur * 240 > 6e6:
                errs.append("%.2f MB per 4 min" % (size / dur * 240 / 1e6))
            if not os.path.exists(jpg):
                errs.append("thumbnail missing")
            elif Image.open(jpg).size != (640, 360):
                errs.append("thumbnail size %s" % (Image.open(jpg).size,))
            if errs:
                fails.append("%s: %s" % (c["id"], "; ".join(errs)))
            else:
                ok += 1
            sizes.append(size)
            secs.append(dur)
    n = len(sizes)
    print("videos ok: %d  failed: %d  not rendered yet: %d  stale (lesson changed, will re-render): %d"
          % (ok, len(fails), missing, stale))
    print("songs missing or outdated covers: %d" % covers_missing)
    if n:
        print("size: avg %.2f MB, max %.2f MB, avg %.2f MB per 4 min, total %.2f GB, %.1f h of video"
              % (sum(sizes) / n / 1e6, max(sizes) / 1e6, sum(sizes) / sum(secs) * 240 / 1e6,
                 sum(sizes) / 1e9, sum(secs) / 3600))
    for f in fails:
        print("  FAIL " + f)
    sys.exit(1 if fails else 0)


if __name__ == "__main__":
    main()
