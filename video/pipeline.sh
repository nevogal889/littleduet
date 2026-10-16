#!/usr/bin/env bash
# Little Duet video pipeline - restart-safe and idempotent. Re-run it after any restart:
#
#   nohup /home/claude/littleduet/video/pipeline.sh >> /home/claude/littleduet/video/render.log 2>&1 &
#
# Each run:
#   1. merges all available songs: content/songs.json if it exists, otherwise
#      content/seed-songs.json + content/_src/parts/*.json (later files win on duplicate ids)
#   2. rebuilds content/lessons/*.json and validates them (invalid lessons are not written)
#   3. renders every class whose video is missing or whose lesson changed (all CPU cores),
#      skipping finished videos; interrupted .part files are redone
#   4. checks every rendered video (check_videos.py) and logs totals
# Only one pipeline runs at a time (a second start exits immediately).
set -u
HERE="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(dirname "$HERE")"
C="$ROOT/content"
log() { echo "$(date '+%F %T') pipeline: $*"; }

mkdir -p "$HERE/out"
exec 8>"$HERE/out/.pipeline.lock"
if ! flock -n 8; then log "another pipeline is already running - exiting"; exit 0; fi

if [ -s "$C/songs.json" ] && python3 -c "import json,sys; json.load(open(sys.argv[1]))" "$C/songs.json" 2>/dev/null; then
  SRC=("$C/songs.json"); PRUNE=(--prune)
  log "using content/songs.json"
else
  SRC=("$C/seed-songs.json")
  for f in "$C"/_src/parts/*.json; do
    [ -s "$f" ] && python3 -c "import json,sys; json.load(open(sys.argv[1]))" "$f" 2>/dev/null && SRC+=("$f")
  done
  PRUNE=()
  log "songs.json not ready - using seed-songs.json + $(( ${#SRC[@]} - 1 )) part files"
fi
python3 -B "$C/build_lessons.py" --songs "${SRC[@]}" "${PRUNE[@]}" \
  || log "some lessons failed validation and were skipped (see lines above)"
log "$(ls "$C"/lessons/*.json | wc -l) lesson files"

"$HERE/render_all.sh"
python3 -B "$HERE/check_videos.py" || log "check_videos reported problems"
log "done"
