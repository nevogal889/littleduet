#!/usr/bin/env bash
# Render every class of every song in content/lessons/ to video/out/<songId>/<classId>.mp4 (+ .jpg).
# Resumable: finished classes are skipped; partial files are redone; classes whose lesson changed since
# they were rendered are redone (an .mp4 without our .hash file, e.g. a filmed video, is never touched).
# Usage: video/render_all.sh [JOBS]        (default: all CPU cores)
#        nohup video/render_all.sh > video/render.log 2>&1 &
set -u
HERE="$(cd "$(dirname "$0")" && pwd)"
JOBS="${1:-$(nproc)}"
OUT="$HERE/out"
cd "$HERE"
mkdir -p "$OUT"
exec 9>"$OUT/.render_all.lock"
flock 9   # one render_all at a time (a second one waits, then finds less to do)
rm -f "$OUT"/*/*.part.mp4 "$OUT"/*/*.part.wav   # leftovers of an interrupted run (we hold the lock)
mapfile -t ALL < <(python3 -B render.py --list)
# Breadth-first: class 1 of every song first (the free class every family sees), then class 2, ...
mapfile -t TODO < <(python3 -B render.py --list --todo | awk -F'-c' '{print $NF"\t"$0}' | sort -s -n -k1,1 | cut -f2)
echo "$(date '+%F %T') render_all: ${#ALL[@]} classes, ${#TODO[@]} to render, $JOBS parallel jobs"
START=$(date +%s)
if ((${#TODO[@]})); then
  printf '%s\n' "${TODO[@]}" | xargs -P "$JOBS" -I{} sh -c \
    'python3 -B render.py --class "$1" --threads 1 || echo "FAILED $1"' _ {}
fi
END=$(date +%s)
DONE=$(find "$OUT" -name '*.mp4' ! -name '*.part.mp4' | wc -l)
echo "$(date '+%F %T') render_all finished: $DONE videos on disk, $(du -sh "$OUT" | cut -f1) total, $((END-START)) s wall"
