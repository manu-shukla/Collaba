#!/usr/bin/env bash
#
# Encodes source footage into the hero reel showcase's clip slots.
#
# Output always lands in src/assets/reels/<id>.mp4, which is all the wiring there is —
# ReelShowcase.tsx picks up whatever is in that folder by filename. See
# design/reel-clips.md for where to source footage and the content rules.
#
# ONE FILE holding all five scenes back to back (the usual case — see
# design/reel-prompts.md). Scene boundaries are detected automatically:
#   scripts/prepare-reels.sh split ~/Downloads/collaba-reels.mp4
#
# Same, but you choose the start of each scene yourself, in order:
#   scripts/prepare-reels.sh split reel.mp4 0 6.5 13 19.5 26
#
# Just show me where the cuts are, don't encode anything:
#   scripts/prepare-reels.sh scenes ~/Downloads/collaba-reels.mp4
#
# FIVE SEPARATE FILES named after the reel ids:
#   scripts/prepare-reels.sh ~/Downloads/collaba-reels
#
# ONE reel, with an optional start offset in seconds to pick the good bit:
#   scripts/prepare-reels.sh cafe ~/Downloads/pexels-1234.mp4
#   scripts/prepare-reels.sh cafe ~/Downloads/pexels-1234.mp4 6

set -euo pipefail

# Must match the reel ids in src/components/ReelShowcase.tsx, in feed order — `split`
# assigns detected scenes to these in sequence.
REEL_IDS=(cafe skincare fitness decor fashion)

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT_DIR="$REPO_ROOT/src/assets/reels"

# All of these are overridable from the environment — CRF=34 scripts/prepare-reels.sh ...
# — so one stubborn file can be squeezed without editing the defaults everything else uses.
#
# 720x1280, not 1080p: the frame is ~230 CSS px wide, so even a 3x display never asks
# for more than ~700px. 1080p is roughly double the bytes for pixels nobody sees.
OUT_W=${OUT_W:-720}
OUT_H=${OUT_H:-1280}
# A reel is on screen for the swipe in plus one dwell — about 2.4s — and ReelShowcase.tsx
# restarts the clip every time the reel comes around, so nothing past that is ever
# displayed. Three seconds is that window plus margin; five was paying for two and a half
# seconds of footage no visitor could ever see.
DURATION=${DURATION:-3}
# The size/quality dial. Higher is smaller and worse; 30 lands most footage under the
# 400 KB target at this resolution.
CRF=${CRF:-30}
# Warn above this. Not a hard failure — some footage genuinely needs the bytes.
MAX_KB=${MAX_KB:-400}
# ffmpeg's scene score, 0..1. 0.35 catches hard cuts and most dissolves without firing on
# a fast camera move inside one continuous shot.
SCENE_THRESHOLD=${SCENE_THRESHOLD:-0.35}
# Seconds trimmed off the inside of every detected boundary. If the source was assembled
# with dissolves or fades rather than hard cuts, the frames either side of a boundary are
# a blend of two scenes — starting a reel there looks like a rendering fault.
EDGE_TRIM=${EDGE_TRIM:-0.25}
# A frame is treated as a fade-through-black rather than as content when it is darker than
# this mean luma (0..255) AND darker than DARK_RATIO of its own clip's average brightness.
#
# The ratio is what makes this safe on deliberately dark footage. A moody gym shot averages
# around luma 45 the whole way through; against a fixed threshold of 40 every second frame
# of it looks like a fade, and the guards then drag the window somewhere it was never meant
# to be. Judging each frame against its own clip's norm keeps a real fade detectable while
# leaving intentionally dark material alone.
DARK_LUMA=${DARK_LUMA:-40}
DARK_RATIO=${DARK_RATIO:-0.45}
# How far to walk forward looking for a lit frame before giving up and using the original
# start anyway.
DARK_SKIP_MAX=${DARK_SKIP_MAX:-1.6}

die() {
  echo "error: $*" >&2
  exit 1
}

# Float helpers. Values go to awk via -v rather than being interpolated into the program
# text: an interpolated program needs escaped quotes inside a double-quoted string, and
# those get eaten before awk ever sees them.
f_gt() { awk -v a="$1" -v b="$2" 'BEGIN { exit !(a > b) }'; }
f_add() { awk -v a="$1" -v b="$2" 'BEGIN { printf "%.2f", a + b }'; }
f_sub() { awk -v a="$1" -v b="$2" 'BEGIN { printf "%.2f", a - b }'; }
f_round1() { awk -v a="$1" 'BEGIN { printf "%.1f", a }'; }

command -v ffmpeg >/dev/null || die "ffmpeg not found. Install it with: brew install ffmpeg"
command -v ffprobe >/dev/null || die "ffprobe not found (it ships with ffmpeg)"

is_reel_id() {
  local candidate=$1
  for id in "${REEL_IDS[@]}"; do
    [[ $id == "$candidate" ]] && return 0
  done
  return 1
}

media_duration() {
  ffprobe -v error -show_entries format=duration -of csv=p=0 "$1"
}

# The clip's own typical brightness, from eight evenly spaced samples. Cached per source in
# a global so a five-slot split does not re-probe the same file five times.
_avg_luma_src=""
_avg_luma_val=""
source_avg_luma() {
  local source=$1
  [[ $source == "$_avg_luma_src" ]] && { echo "$_avg_luma_val"; return; }
  local total dur at sum=0 n=0 v
  dur=$(media_duration "$source")
  for i in 1 2 3 4 5 6 7 8; do
    at=$(awk -v i="$i" -v d="$dur" 'BEGIN { printf "%.2f", d * (i - 0.5) / 8 }')
    v=$(luma_at "$source" "$at")
    sum=$((sum + v))
    n=$((n + 1))
  done
  _avg_luma_src=$source
  _avg_luma_val=$((sum / n))
  echo "$_avg_luma_val"
}

# The brightness below which a frame in THIS clip counts as a fade.
dark_threshold() {
  local avg scaled
  avg=$(source_avg_luma "$1")
  scaled=$(awk -v a="$avg" -v r="$DARK_RATIO" 'BEGIN { printf "%d", a * r }')
  (( scaled < DARK_LUMA )) && { echo "$scaled"; return; }
  echo "$DARK_LUMA"
}

# Mean brightness (0..255) of the single frame at $2 seconds into $1. The frame is scaled
# to 1x1 first, so the "average" is done by the scaler in C rather than by us.
luma_at() {
  local source=$1 at=$2 byte
  byte=$(ffmpeg -hide_banner -loglevel error -ss "$at" -i "$source" -frames:v 1 \
    -vf "scale=1:1" -f rawvideo -pix_fmt gray - 2>/dev/null | od -An -tu1 | tr -d ' \n' || true)
  # Empty means the seek landed past the end of the stream; treat that as "not dark" so
  # the caller stops walking forward.
  echo "${byte:-255}"
}

# The furthest into a clip playback ever actually reaches: the swipe in (0.52s) plus one
# dwell (1.9s), rounded up. Clips always restart when their reel comes around, so frames
# past this are never displayed and only this range has to look good.
DISPLAY_MAX=${DISPLAY_MAX:-2.6}
# How far back the window may slide to get a fade-out off the end of that range.
TAIL_SHIFT_MAX=${TAIL_SHIFT_MAX:-1.4}
# Floor for a shortened clip: one full pass, so the reel is never left with a frozen last
# frame while it is still on screen.
MIN_DURATION=${MIN_DURATION:-2.5}

# Walks $2 forward until the frame there is not a fade-through-black. Echoes the start to
# actually use.
skip_dark_start() {
  local source=$1 start=$2 step=0.2 walked=0 luma floor_luma
  floor_luma=$(dark_threshold "$source")
  while :; do
    luma=$(luma_at "$source" "$start")
    (( luma >= floor_luma )) && break
    f_gt "$(f_add "$walked" "$step")" "$DARK_SKIP_MAX" && break
    start=$(f_add "$start" "$step")
    walked=$(f_add "$walked" "$step")
  done
  echo "$start"
}

# Slides $2 earlier until the frame the visitor last sees is not mid fade-out. The
# counterpart to skip_dark_start: a clip that ends by fading to black looks like the reel
# is breaking just as the feed moves on, which is exactly where the eye already is.
avoid_dark_tail() {
  local source=$1 start=$2 floor=${3:-0} step=0.2 shifted=0 luma probe floor_luma
  floor_luma=$(dark_threshold "$source")
  while :; do
    probe=$(f_add "$start" "$DISPLAY_MAX")
    luma=$(luma_at "$source" "$probe")
    (( luma >= floor_luma )) && break
    # Nowhere left to slide: at the scene's own start, or out of budget.
    f_gt "$(f_add "$floor" "$step")" "$start" && break
    f_gt "$(f_add "$shifted" "$step")" "$TAIL_SHIFT_MAX" && break
    start=$(f_sub "$start" "$step")
    shifted=$(f_add "$shifted" "$step")
  done
  echo "$start"
}

# Longest window from $2 that contains no fade-through-black, capped at $DURATION.
#
# This is the guarantee that shifting cannot give. Sliding the window earlier only helps
# when the dark patch sits just past the edge of the displayed range; if a scene simply
# ends in darkness, the only way to keep black frames off the screen is to hand the browser
# a shorter clip. A shorter clip is not a loss: ReelShowcase.tsx rewinds a clip once less
# than one pass remains, so trimming the tail just means the reel replays its opening
# instead of running into the fade.
usable_duration() {
  local source=$1 start=$2 limit=$3 step=0.2 at=0 luma floor_luma
  floor_luma=$(dark_threshold "$source")
  while f_gt "$limit" "$at"; do
    luma=$(luma_at "$source" "$(f_add "$start" "$at")")
    if (( luma < floor_luma )); then
      # Back off one step so the dark frame itself is excluded.
      local usable
      usable=$(f_sub "$at" "$step")
      f_gt "$MIN_DURATION" "$usable" && usable=$MIN_DURATION
      echo "$usable"
      return
    fi
    at=$(f_add "$at" "$step")
  done
  echo "$limit"
}

# Scene-change timestamps, one per line, always starting at 0.
#
# Two detectors, because they fail on opposite things. `select=gt(scene,...)` scores the
# difference between consecutive frames, so it finds hard cuts and misses fades entirely —
# a one-second dissolve through black changes very little frame to frame, and a file
# assembled that way looks like a single continuous scene to it. `blackdetect` finds the
# black runs a fade produces but says nothing about a hard cut. Together they cover both,
# which matters because a generated montage can easily contain a mix of the two.
detect_scenes() {
  local source=$1
  {
    echo 0
    ffmpeg -hide_banner -nostats -i "$source" \
      -filter:v "select='gt(scene,${SCENE_THRESHOLD})',showinfo" -f null - 2>&1 |
      sed -n 's/.*pts_time:\([0-9.]*\).*/\1/p'
    # The *end* of a black run is where the next scene begins.
    ffmpeg -hide_banner -nostats -i "$source" \
      -filter:v "blackdetect=d=0.05:pix_th=0.10" -f null - 2>&1 |
      sed -n 's/.*black_end:\([0-9.]*\).*/\1/p'
  } | sort -n | awk -v gap=0.6 '
      # Both detectors can fire around the same transition. Collapse anything closer
      # together than one dwell into a single boundary, keeping the earliest.
      NR == 1 || $1 > last + gap { print; last = $1 }'
}

# encode <reel-id> <source> [start] [note] [floor] [ceil]
#
# floor/ceil bound the region of the source this clip may come from. In `split` mode they
# are the scene's own boundaries, and they are not advisory: without a floor, the
# "window runs off the end of the file" clamp happily walks the start backwards across a
# scene boundary and silently fills the slot with the *previous* scene's footage.
encode() {
  local id=$1 source=$2 start=${3:-0} note=${4:-} floor=${5:-0} ceil=${6:-}
  local out="$OUT_DIR/$id.mp4"

  [[ -f $source ]] || die "no such file: $source"
  mkdir -p "$OUT_DIR"

  local total
  total=$(media_duration "$source")
  [[ -n $ceil ]] || ceil=$total
  f_gt "$ceil" "$total" && ceil=$total

  # A window that runs past the ceiling is pulled back — but never past the floor, and
  # never far enough to leave the scene. Where it will not fit, the clip is shortened
  # further down instead.
  if f_gt "$(f_add "$start" "$DURATION")" "$ceil"; then
    local clamped
    clamped=$(f_sub "$ceil" "$DURATION")
    f_gt "$floor" "$clamped" && clamped=$floor
    if f_gt "$start" "$clamped"; then
      note="${note:+$note, }clamped from ${start}s"
      start=$clamped
    fi
  fi

  # A generated montage very often fades through black between scenes, so the frame at a
  # boundary is not content. Walk forward to the first lit frame.
  local lit
  lit=$(skip_dark_start "$source" "$start")
  if f_gt "$lit" "$start"; then
    note="${note:+$note, }skipped $(f_round1 "$(f_sub "$lit" "$start")")s of black"
    start=$lit
  fi

  # And the same problem at the other end of the displayed range: first try to slide the
  # window earlier so the full clip still fits...
  local pulled
  pulled=$(avoid_dark_tail "$source" "$start" "$floor")
  if f_gt "$start" "$pulled"; then
    note="${note:+$note, }pulled back $(f_round1 "$(f_sub "$start" "$pulled")")s off a fade-out"
    start=$pulled
  fi

  # ...and if darkness still falls inside the window, shorten the clip instead. Between the
  # two, no black frame can reach the screen.
  # Longest window that stays inside the scene AND contains no fade.
  local room want
  room=$(f_sub "$ceil" "$start")
  f_gt "$room" "$DURATION" && room=$DURATION
  want=$(usable_duration "$source" "$start" "$room")
  if f_gt "$DURATION" "$want"; then
    note="${note:+$note, }trimmed to ${want}s"
  fi

  # scale=...increase + crop centre-crops any aspect ratio to a true 9:16 instead of
  # squashing it. -an drops audio: the reels are muted, so an audio stream is pure
  # wasted bytes. +faststart moves the index to the front of the file so playback can
  # begin before the whole thing has arrived.
  ffmpeg -hide_banner -loglevel error -y \
    -ss "$start" -i "$source" -t "$want" -an \
    -vf "scale=${OUT_W}:${OUT_H}:force_original_aspect_ratio=increase,crop=${OUT_W}:${OUT_H}" \
    -c:v libx264 -profile:v high -pix_fmt yuv420p -crf "$CRF" -preset slow \
    -movflags +faststart \
    "$out"

  local kb dims dur line
  kb=$(( $(wc -c <"$out") / 1024 ))
  dims=$(ffprobe -v error -select_streams v:0 -show_entries stream=width,height \
    -of csv=p=0:nk=1 "$out" | tr ',' 'x')
  dur=$(ffprobe -v error -select_streams v:0 -show_entries stream=duration \
    -of csv=p=0:nk=1 "$out")

  # Built as one string and echoed, rather than passed to printf as six separate
  # arguments: an empty or word-split value there silently shifts every later column.
  line=$(printf '  %-9s @%-8s %-9s %5ss %5s KB' \
    "$id" "${start}s" "$dims" "$(f_round1 "${dur:-0}")" "$kb")
  echo "${line}${note:+  $note}"

  if (( kb > MAX_KB )); then
    printf '  %-9s %s\n' "" "over ${MAX_KB} KB — re-run with CRF=34 to shrink it" >&2
  fi
}

cmd_scenes() {
  local source=$1
  [[ -f $source ]] || die "no such file: $source"
  local total
  total=$(media_duration "$source")
  echo "$(basename "$source") — ${total}s, scene threshold ${SCENE_THRESHOLD}"
  local n=0
  while read -r at; do
    n=$((n + 1))
    printf '  scene %d starts at %ss\n' "$n" "$at"
  done < <(detect_scenes "$source")
  echo "  ($n scenes; 5 wanted. Use: $0 split $source [t1 t2 t3 t4 t5])"
}

cmd_split() {
  local source=$1
  shift
  [[ -f $source ]] || die "no such file: $source"

  local total
  total=$(media_duration "$source")
  local -a starts=()

  if (( $# > 0 )); then
    # Explicit timestamps win over detection, and are used exactly as given — you looked
    # at the footage, the scene detector did not.
    (( $# == ${#REEL_IDS[@]} )) || die "give ${#REEL_IDS[@]} timestamps (one per reel) or none at all; got $#"
    starts=("$@")
    echo "splitting on the ${#starts[@]} timestamps you gave"
  else
    local -a found=()
    while read -r at; do found+=("$at"); done < <(detect_scenes "$source")
    echo "detected ${#found[@]} scenes in $(basename "$source") (${total}s)"

    if (( ${#found[@]} >= ${#REEL_IDS[@]} )); then
      # More scenes than slots is normal — a generator often cuts inside a scene. Take
      # the first five and say so, rather than silently guessing which five were meant.
      # One extra boundary is kept deliberately: the loop only ever iterates over the five
      # reel ids, so a sixth entry is used solely as the last scene's ceiling. Without it
      # the final clip would be bounded by the end of the file instead of the end of its
      # own scene.
      starts=("${found[@]:0:$(( ${#REEL_IDS[@]} + 1 ))}")
      (( ${#found[@]} > ${#REEL_IDS[@]} )) &&
        echo "  using the first ${#REEL_IDS[@]}; run '$0 scenes $source' and pass timestamps to choose others"
    else
      # Too few boundaries to trust: fall back to cutting the file into equal parts. Any
      # scene detection at all would be a guess here, and an even split is at least
      # predictable and easy to override.
      echo "  fewer than ${#REEL_IDS[@]} scenes found — falling back to an even split"
      local i
      for (( i = 0; i < ${#REEL_IDS[@]}; i++ )); do
        starts+=("$(awk -v i="$i" -v t="$total" -v n="${#REEL_IDS[@]}" \
          'BEGIN { printf "%.2f", i * t / n }')")
      done
    fi
  fi

  local i floor ceil start
  for (( i = 0; i < ${#REEL_IDS[@]}; i++ )); do
    floor=${starts[$i]}
    # Each scene ends where the next begins; the last one ends with the file.
    if (( i + 1 < ${#starts[@]} )); then ceil=${starts[$((i + 1))]}; else ceil=$total; fi
    # Nudge inward off the boundary. A source assembled with dissolves has blended frames
    # either side of a cut, and a reel that opens on one looks broken.
    start=$floor
    f_gt "$start" 0 && start=$(f_add "$start" "$EDGE_TRIM")
    # The trimmed start, not the raw boundary, is the floor: a cross-dissolve that does not
    # pass through black leaves blended-but-fully-lit frames at the seam, which no
    # brightness check can catch. Letting the clamp fall back to the raw boundary would
    # quietly hand those frames back.
    encode "${REEL_IDS[$i]}" "$source" "$start" "from scene $((i + 1))" "$start" "$ceil"
  done
}

main() {
  [[ $# -ge 1 ]] || die "usage: $0 split <file> [t1..t5] | scenes <file> | <source-dir> | <reel-id> <file> [start]"

  case $1 in
    scenes)
      [[ $# -eq 2 ]] || die "usage: $0 scenes <file>"
      cmd_scenes "$2"
      return
      ;;
    split)
      [[ $# -ge 2 ]] || die "usage: $0 split <file> [t1 t2 t3 t4 t5]"
      echo "encoding to src/assets/reels/ (${OUT_W}x${OUT_H}, ${DURATION}s, crf ${CRF})"
      shift
      cmd_split "$@"
      ;;
    *)
      echo "encoding to src/assets/reels/ (${OUT_W}x${OUT_H}, ${DURATION}s, crf ${CRF})"
      if [[ -d $1 ]]; then
        local found=0 source
        for id in "${REEL_IDS[@]}"; do
          # First match wins, so cafe.mov and cafe.mp4 in the same folder is not an error.
          source=$(find "$1" -maxdepth 1 -type f -iname "$id.*" ! -name '.*' | head -n 1)
          if [[ -n $source ]]; then
            encode "$id" "$source"
            found=$((found + 1))
          else
            printf '  %-9s %s\n' "$id" "skipped — no $id.* in $1"
          fi
        done
        (( found > 0 )) || die "found nothing to encode. Name each file after a reel id: ${REEL_IDS[*]}"
      else
        # Anything with a slash in it was meant as a path, so say the file is missing
        # rather than blaming it for not being one of the five reel ids.
        [[ $1 == */* ]] && die "no such file or directory: $1"
        is_reel_id "$1" || die "unknown reel id '$1'. Known ids: ${REEL_IDS[*]}"
        [[ $# -ge 2 ]] || die "usage: $0 <reel-id> <file> [start-seconds]"
        encode "$1" "$2" "${3:-0}"
      fi
      ;;
  esac

  echo
  echo "done. Run 'npm run dev' — reels with a clip play it, the rest keep their poster."
}

main "$@"
