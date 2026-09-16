# Generation prompts for the hero reel clips

Two routes to the same result. Pick one.

- **Route A — one file** (below). Make a single video containing all five scenes back to
  back and hand it over; `scripts/prepare-reels.sh split` finds the scene boundaries and
  cuts it into the five slots. One export instead of five, and it suits Google Vids, which
  is built for assembling clips on a timeline.
- **Route B — five files** (the five numbered sections further down). **Each of those
  sections is completely self-contained** — orientation, settings, prompt, negative prompt
  and acceptance checks are repeated in every one, so you can paste a single section into a
  fresh tool session with no memory of the others and it will still be correct.

---

## Route A — one video, five scenes

### What to hand over

A single video file. That is all. The split is automatic and the edge cases are already
handled — you do not need to cut it, trim it, or clean up the seams.

| Requirement | Why |
| --- | --- |
| **Portrait 9:16.** If your tool only does 16:9, that works too — keep every subject dead centre, since a landscape frame gets centre-cropped and loses its left and right thirds. | The frame on the site is a vertical phone. |
| **Exactly five scenes, in this order: café → skincare → gym → home decor → fashion.** | Slots are filled in sequence, and each has a fixed caption (Pune, Mumbai, Delhi, Bengaluru, Jaipur). Out of order means a Jaipur caption over a gym. |
| **Each scene at least 4 seconds** (5–6 is ideal, 3 is the floor). | Trimming needs room to move the cut off the seam. |
| **Hard cuts between scenes are preferred, but fades and dissolves are fine.** | Both are detected. Fades through black are stripped automatically — see below. |
| **No text, titles, captions or logos anywhere** — including no intro or outro card. | The site draws its own caption in crisp vector; baked-in text is blurry at this size, and invented metrics are ruled out by `design/product-design.md` §1.2. |
| **No audio needed.** | The reels are muted. |

### What the script handles for you, so don't worry about it

Verified against two deliberately hostile test files — one where every scene boundary is a
pure black frame, one where every scene fades out 2.3s in:

- **Scene detection on both cut styles.** Frame-difference scoring finds hard cuts;
  black-run detection finds fades. Either alone misses half the cases — a dissolve through
  black barely changes frame to frame, so a fade-assembled file looks like one continuous
  scene to the first method.
- **Black frames never reach the screen.** The cut is nudged inward off each boundary, the
  start walks forward past any fade-up, the window slides back off any fade-out, and if
  darkness still falls inside the range the visitor can actually see, the clip is shortened
  instead. A short clip costs nothing — the site rewinds a clip before it can reach its own
  loop point anyway.
- **A clip can never borrow from the wrong scene.** Each slot is hard-bounded by its own
  scene, so shortening or shifting cannot walk backwards across a boundary and quietly fill
  the fashion slot with the decor footage.
- **Cropping, downscaling, audio stripping, compression, and the size budget.**

If detection finds fewer than five scenes it falls back to an even split and says so, and
you can always override with exact timestamps:

```bash
scripts/prepare-reels.sh scenes reel.mp4                  # show me the boundaries found
scripts/prepare-reels.sh split reel.mp4                   # automatic
scripts/prepare-reels.sh split reel.mp4 0 6 12 18 24      # or name them yourself
```

### The prompt — paste this

If your tool generates one scene at a time (Veo, Flow, and Vids all do), generate these
five in turn and lay them on the timeline in this order with **hard cuts and no transition
effects**. Then export one file.

> A sequence of five separate 5-second vertical 9:16 portrait video clips, cut together
> back to back with hard cuts, no text and no people. Handheld phone camera feel, shallow
> depth of field, natural light, slow unhurried camera movement already in progress on the
> first frame of every clip. The bottom third of every frame stays dark or plain. Each
> subject is centred in the middle third of the frame.
>
> Clip 1 — warm coral and burnt orange. Extreme close-up of a glass tumbler of Indian
> filter coffee on a dark wooden café table, pale foam settling, fine steam curling up. Soft
> warm morning light from the left, out-of-focus plants and exposed brick behind. Camera
> drifts slowly forward and slightly down.
>
> Clip 2 — cool blue and lilac. Macro shot of a frosted glass serum bottle on a pale marble
> ledge beside a folded linen cloth. One clear droplet falls and spreads on the marble
> within the first two seconds. Cool diffused daylight, lavender shadows, lower frame in
> deeper shadow. Camera orbits extremely slowly to the right.
>
> Clip 3 — near-black. A loaded barbell on a rubber gym floor in a dark industrial gym,
> chalk dust drifting through one hard shaft of side light, a cool white rim light along the
> bar. Background falls away into darkness. Camera tracks slowly left to right at floor
> level.
>
> Clip 4 — warm natural tones with one deep indigo accent. A quiet corner of a sunlit
> Indian apartment: cane-backed wooden chair, jute rug, brass planter with a monstera, sheer
> white curtain lifting in a breeze, one indigo cushion. Long soft afternoon shadows, floor
> in shadow. Camera pans slowly right to left.
>
> Clip 5 — saturated coral and indigo. Close-up of hand-block-printed cotton fabric hanging
> on a line in a Jaipur courtyard, rippling in a light wind, late-afternoon sun behind it so
> the print glows through the weave. Pink sandstone wall out of focus behind. Camera drifts
> slowly upward along the cloth.

### Negative prompt — paste this

```
text, captions, subtitles, titles, watermark, logo, numbers, counters, user interface, app
interface, phone screen, hands, fingers, faces, people, crowds, fast motion, whip pan,
zoom burst, shaky camera, warped geometry, extra limbs, morphing objects, melting edges,
oversaturated HDR, letterboxing, black bars, horizontal framing, split screen, freeze
frame, static shot, intro card, outro card, end screen
```

### Before you send it

- Five scenes, in the right order, each roughly 4s or more.
- No text or logos in any frame, and no intro/outro card.
- Nothing visibly warped — scrub through and watch edges and repeating patterns (the cane
  weave and the block print are the likely offenders).
- Vertical, or every subject dead centre.

Then send me the file. I run the split, check every produced clip's frames, and verify
playback in the browser before it goes anywhere near the site.

---

## Route B — five separate files

Work through the five numbered sections below in any order. Once you have the files, name
each after its reel id and run `scripts/prepare-reels.sh <folder>` — see
`design/reel-clips.md`.

---

## Clip length: 5 seconds is a default, not a requirement

**They do not all have to be the same length, and none has to be exactly 5 seconds.**
3–6 seconds each is the useful range. 5s is simply the unit most tools hand you, and what
`scripts/prepare-reels.sh` trims to.

- **Shorter is fine.** A 3s clip is kept at 3s — the script trims, it never pads.
- **Longer is fine.** The script keeps 5s from the start, or from an offset you choose:
  `scripts/prepare-reels.sh cafe clip.mp4 6`. Override the window with
  `DURATION=8 scripts/prepare-reels.sh ...` if a particular clip earns the bytes.
- **Mixed lengths are fine.** Each reel plays independently; nothing is synchronised.

**But the first ~2 seconds are what matters, and here is why.** Each reel is only on screen
about 1.9s before the feed advances, and the clip *pauses* rather than restarting — so it
resumes where it left off on the next pass. Measured on a real 5s clip:

| pass | media shown |
| --- | --- |
| 1st | 0.0 → 1.9s |
| 2nd | 1.9 → 3.8s |
| 3rd | 3.8 → 5.0s, then wraps |

A full cycle of all five reels takes about 12 seconds, so a 5s clip is only fully seen by
someone who stays on the page ~35 seconds. **Almost every visitor sees only the first two
seconds.** Put the best framing and the clearest motion there; treat the rest as a bonus
for people who linger. This is also why a 2–3s clip is perfectly viable — it just comes
back around sooner.

---

## Before your first generation: the Google Vids problem

**Everything here needs PORTRAIT — vertical 9:16.** Google Vids is built around 16:9
landscape presentation video, and I could not find any Google documentation saying it
supports 9:16 output. Its generation engine is current (Veo 3.1, and as of July 2026 the
Omni Flash model), so quality is not the concern — orientation is.

**Check this first, before generating five clips:** open Vids and look for an aspect
ratio or format setting on the project. If you can set it to 9:16, ignore the rest of
this section.

**If Vids only gives you 16:9 landscape**, you have two options:

1. **Use Google Flow (`labs.google/flow`) or the Gemini app instead.** Same underlying
   Google models, but built for generating standalone clips rather than 16:9 presentation
   video, so a portrait option is far more likely to be there. This is the better path if
   it is open to you.
2. **Generate landscape anyway and let me crop it.** `scripts/prepare-reels.sh`
   centre-crops any aspect ratio to a true 9:16, so a 16:9 clip does work — but it throws
   away the left and right thirds of the frame. Every prompt below therefore says
   "composition centred, subject in the middle third of the frame". Keep that clause. It
   is what makes a landscape take survive the crop.

Do not let a tool letterbox a landscape clip into a vertical frame with black bars. That
is not the same thing and it will look broken.

---

## 1 of 5 — Café review · Pune

**Orientation: PORTRAIT — vertical 9:16.** Not landscape.
**Settings:** duration 5 seconds, 1080×1920 if offered, no audio needed.
**Rules:** generate 3 takes and pick the best. Use image-to-video if the tool offers it
(make a still first, then animate it) — it is far more stable than text-to-video.
**Front-load the best motion into the first 2 seconds** — that is the part every visitor
sees (see "Clip length" at the top).
**Palette:** warm coral and burnt orange.

**Prompt — paste this:**

> Vertical 9:16 portrait video, 5 seconds, handheld phone camera feel. Extreme close-up
> of a glass tumbler of Indian filter coffee on a dark wooden café table, thick pale foam
> settling on top, fine wisps of steam rising and curling. Soft warm morning light from a
> window to the left; terracotta, burnt orange and deep brown tones; out-of-focus green
> plants and exposed brick wall in the background. Composition centred, the glass in the
> middle third of the frame. The lower part of the frame is the dark table surface falling
> into soft shadow. Shallow depth of field, natural film grain, quiet and unhurried. No
> text, no people, no hands. The camera drifts slowly forward and very slightly downward,
> as if held by someone leaning in over the table. The camera is already in motion on the very first
> frame — no static opening, no fade in from black, no fade out at the end.

**Negative prompt — paste this:**

```
text, captions, subtitles, watermark, logo, numbers, counters, user interface, app
interface, phone screen, hands, fingers, faces, people, crowds, fast motion, whip pan,
zoom burst, shaky camera, warped geometry, extra limbs, morphing objects, melting edges,
oversaturated HDR, letterboxing, black bars, horizontal framing, split screen, fade in,
fade out, fade from black, fade to black, black frame, freeze frame, static shot
```

**What the 5 seconds should do** (no model obeys this exactly — it is there to bias the
motion slow, and to tell you which 5 seconds to keep if you are handed 10):

| Time | Beat |
| --- | --- |
| 0.0–2.0s | Already drifting forward on frame one. Steam curling, foam settling. |
| 2.0–4.0s | Push continues; background blurs further as the glass fills more of the frame. |
| 4.0–5.0s | Motion eases. Steam continues. Nothing new enters frame. |

**Accept the take only if:**

- It is vertical, or the glass is dead centre so a centre-crop keeps it.
- No text, numbers, logos, UI, hands or faces anywhere in frame.
- **The very first frame is fully exposed, in focus and already moving** — no fade up
  from black, no still opening. That frame is what appears the instant the reel swipes in.
- The bottom third is dark or plain — cover the lower quarter with your thumb and check
  nothing important is under it. The site puts a caption there.
- Nothing warped: pause on a few frames, check the glass rim and the table edge.

**Save as:** `cafe.mp4`

---

## 2 of 5 — Skincare routine · Mumbai

**Orientation: PORTRAIT — vertical 9:16.** Not landscape.
**Settings:** duration 5 seconds, 1080×1920 if offered, no audio needed.
**Rules:** generate 3 takes and pick the best. Use image-to-video if the tool offers it
(make a still first, then animate it) — it is far more stable than text-to-video.
**Front-load the best motion into the first 2 seconds** — that is the part every visitor
sees (see "Clip length" at the top).
**Palette:** cool blue and lilac.

**Prompt — paste this:**

> Vertical 9:16 portrait video, 5 seconds. Macro shot of a frosted glass serum bottle
> standing on a pale marble ledge beside a neatly folded linen cloth. A single clear
> droplet falls from the glass dropper and spreads slowly on the marble. Cool diffused
> daylight through a large window, soft blue and lilac highlights across the glass, muted
> lavender shadows. Composition centred, the bottle in the middle third of the frame. The
> lower part of the frame falls into deeper shadow. Clean, minimal, quiet product-film
> mood, very shallow depth of field, no clutter. No text, no people, no hands. The camera
> orbits extremely slowly to the right, keeping the bottle centred. The camera is already in motion on the very first
> frame — no static opening, no fade in from black, no fade out at the end.

**Negative prompt — paste this:**

```
text, captions, subtitles, watermark, logo, numbers, counters, user interface, app
interface, phone screen, hands, fingers, faces, people, crowds, fast motion, whip pan,
zoom burst, shaky camera, warped geometry, extra limbs, morphing objects, melting edges,
oversaturated HDR, letterboxing, black bars, horizontal framing, split screen, fade in,
fade out, fade from black, fade to black, black frame, freeze frame, static shot
```

**What the 5 seconds should do** (no model obeys this exactly — it is there to bias the
motion slow, and to tell you which 5 seconds to keep if you are handed 10):

| Time | Beat |
| --- | --- |
| 0.0–1.0s | Orbit already moving on frame one; light shifting across the glass. |
| 1.0–2.0s | One droplet falls and spreads on the marble — **inside the first 2s, on purpose**. |
| 2.0–5.0s | Orbit continues; reflections travel across the bottle. No second droplet. |

**Accept the take only if:**

- It is vertical, or the bottle is dead centre so a centre-crop keeps it.
- No text, numbers, logos, UI, hands or faces anywhere in frame.
- **The very first frame is fully exposed, in focus and already moving** — no fade up
  from black, no still opening. That frame is what appears the instant the reel swipes in.
- The bottom third is dark or plain. **This is the risky one** — pale marble can wash out
  the caption the site puts there. If the bottom is bright white, re-generate.
- Nothing warped: pause on a few frames, check the dropper and the bottle's edges.

**Save as:** `skincare.mp4`

---

## 3 of 5 — Gym & fitness · Delhi

**Orientation: PORTRAIT — vertical 9:16.** Not landscape.
**Settings:** duration 5 seconds, 1080×1920 if offered, no audio needed.
**Rules:** generate 3 takes and pick the best. Use image-to-video if the tool offers it
(make a still first, then animate it) — it is far more stable than text-to-video.
**Front-load the best motion into the first 2 seconds** — that is the part every visitor
sees (see "Clip length" at the top).
**Palette:** near-black.
**This is the easiest of the five to get right** — darkness hides model artefacts. Start
here if you want a quick win.

**Prompt — paste this:**

> Vertical 9:16 portrait video, 5 seconds. A loaded barbell resting on a rubber gym floor
> in a dark industrial gym, fine chalk dust drifting through a single hard shaft of side
> light. Deep charcoal and near-black tones throughout, with one cool white rim light
> running along the length of the bar and catching the knurling. Composition centred, the
> bar across the middle third of the frame. Heavy, moody, high contrast; the background
> falls away into darkness and the bottom of the frame is nearly black. Shallow depth of
> field, dust motes visible in the beam. No text, no people, no hands. The camera tracks
> slowly from left to right past the bar at floor level. The camera is already in motion on the very first
> frame — no static opening, no fade in from black, no fade out at the end.

**Negative prompt — paste this:**

```
text, captions, subtitles, watermark, logo, numbers, counters, user interface, app
interface, phone screen, hands, fingers, faces, people, crowds, fast motion, whip pan,
zoom burst, shaky camera, warped geometry, extra limbs, morphing objects, melting edges,
oversaturated HDR, letterboxing, black bars, horizontal framing, split screen, fade in,
fade out, fade from black, fade to black, black frame, freeze frame, static shot
```

**What the 5 seconds should do** (no model obeys this exactly — it is there to bias the
motion slow, and to tell you which 5 seconds to keep if you are handed 10):

| Time | Beat |
| --- | --- |
| 0.0–2.0s | Already tracking on frame one. Chalk dust drifting through the light beam. |
| 2.0–4.0s | Track continues; rim light travels along the metal. |
| 4.0–5.0s | Movement eases. Dust still drifting. |

**Accept the take only if:**

- It is vertical, or the bar is dead centre so a centre-crop keeps it.
- No text, numbers, logos, UI, hands or faces anywhere in frame.
- **The very first frame is fully exposed, in focus and already moving** — no fade up
  from black, no still opening. That frame is what appears the instant the reel swipes in.
- The bottom third is dark — this shot should pass easily.
- Nothing warped: pause on a few frames, check the bar is straight and the weight plates
  are round.

**Save as:** `fitness.mp4`

---

## 4 of 5 — Home decor · Bengaluru

**Orientation: PORTRAIT — vertical 9:16.** Not landscape.
**Settings:** duration 5 seconds, 1080×1920 if offered, no audio needed.
**Rules:** generate 3 takes and pick the best. Use image-to-video if the tool offers it
(make a still first, then animate it) — it is far more stable than text-to-video.
**Front-load the best motion into the first 2 seconds** — that is the part every visitor
sees (see "Clip length" at the top).
**Palette:** warm natural tones with one indigo accent.

**Prompt — paste this:**

> Vertical 9:16 portrait video, 5 seconds. A quiet corner of a sunlit Indian apartment: a
> cane-backed wooden chair, a jute rug, a brass planter holding a monstera, and a sheer
> white curtain lifting gently in a breeze. Warm late-afternoon light throwing long soft
> shadows across the floor; muted natural tones with a single deep indigo textile cushion
> as the only saturated accent. Composition centred, the chair in the middle third of the
> frame. The floor in the lower part of the frame lies in shadow. Calm editorial interiors
> photography mood, shallow depth of field, nothing cluttered. No text, no people, no
> hands. The camera pans slowly from right to left across the corner. The camera is already in motion on the very first
> frame — no static opening, no fade in from black, no fade out at the end.

**Negative prompt — paste this:**

```
text, captions, subtitles, watermark, logo, numbers, counters, user interface, app
interface, phone screen, hands, fingers, faces, people, crowds, fast motion, whip pan,
zoom burst, shaky camera, warped geometry, extra limbs, morphing objects, melting edges,
oversaturated HDR, letterboxing, black bars, horizontal framing, split screen, fade in,
fade out, fade from black, fade to black, black frame, freeze frame, static shot
```

**What the 5 seconds should do** (no model obeys this exactly — it is there to bias the
motion slow, and to tell you which 5 seconds to keep if you are handed 10):

| Time | Beat |
| --- | --- |
| 0.0–2.0s | Pan already moving on frame one; curtain lifting in the breeze. |
| 2.0–4.0s | Pan continues, revealing the planter. |
| 4.0–5.0s | Pan eases; the curtain settles. |

**Accept the take only if:**

- It is vertical, or the chair is dead centre so a centre-crop keeps it.
- No text, numbers, logos, UI, hands or faces anywhere in frame.
- **The very first frame is fully exposed, in focus and already moving** — no fade up
  from black, no still opening. That frame is what appears the instant the reel swipes in.
- The bottom third is dark or plain — cover the lower quarter and check.
- Nothing warped. **Look hard at the chair's cane weave and the jute rug** — repeating
  patterns are exactly where these models smear.

**Save as:** `decor.mp4`

---

## 5 of 5 — Local fashion · Jaipur

**Orientation: PORTRAIT — vertical 9:16.** Not landscape.
**Settings:** duration 5 seconds, 1080×1920 if offered, no audio needed.
**Rules:** generate 3 takes and pick the best. Use image-to-video if the tool offers it
(make a still first, then animate it) — it is far more stable than text-to-video.
**Front-load the best motion into the first 2 seconds** — that is the part every visitor
sees (see "Clip length" at the top).
**Palette:** coral and indigo — this one can be the most saturated of the five.

**Prompt — paste this:**

> Vertical 9:16 portrait video, 5 seconds. Close-up of hand-block-printed cotton fabric in
> coral and indigo hanging on a line in a Jaipur courtyard, the cloth rippling slowly in a
> light wind. Warm late-afternoon sun behind the fabric so the printed pattern glows
> through the weave; a pink sandstone wall softly out of focus behind it. Composition
> centred, the hanging cloth filling the middle third of the frame. The bottom of the
> frame is in cool shadow. Rich saturated colour, fine cotton texture and individual
> threads visible at the edges. No text, no people, no hands. The camera drifts slowly
> upward along the hanging cloth. The camera is already in motion on the very first
> frame — no static opening, no fade in from black, no fade out at the end.

**Negative prompt — paste this:**

```
text, captions, subtitles, watermark, logo, numbers, counters, user interface, app
interface, phone screen, hands, fingers, faces, people, crowds, fast motion, whip pan,
zoom burst, shaky camera, warped geometry, extra limbs, morphing objects, melting edges,
oversaturated HDR, letterboxing, black bars, horizontal framing, split screen, fade in,
fade out, fade from black, fade to black, black frame, freeze frame, static shot
```

**What the 5 seconds should do** (no model obeys this exactly — it is there to bias the
motion slow, and to tell you which 5 seconds to keep if you are handed 10):

| Time | Beat |
| --- | --- |
| 0.0–2.0s | Already drifting upward on frame one; fabric rippling, backlight glowing through. |
| 2.0–4.0s | Drift continues along the cloth. |
| 4.0–5.0s | Drift eases; the fabric settles. |

**Accept the take only if:**

- It is vertical, or the cloth fills the centre so a centre-crop keeps it.
- No text, numbers, logos, UI, hands or faces anywhere in frame.
- **The very first frame is fully exposed, in focus and already moving** — no fade up
  from black, no still opening. That frame is what appears the instant the reel swipes in.
- The bottom third is dark or plain — cover the lower quarter and check.
- Nothing warped. **Look hard at the block-print motifs** — printed patterns often come
  out as mush.

**Save as:** `fashion.mp4`

---

## Why every shot avoids hands, faces and text

Not squeamishness — those three are what video models are worst at, and all three are
ruled out for this page anyway: no on-screen metrics, no platform UI, no identifiable
person without permission (`design/product-design.md` §1.2–1.3). Objects, fabric, liquid,
dust and light are what these models render convincingly, so that is what all five prompts
ask for.

## Send them to me one at a time

You do not need all five to ship. Reels without a clip keep their coded poster, so send
whichever is ready and I will encode, wire and verify it in the browser. Anything longer
than 5 seconds is fine — tell me which 5 seconds to keep and I will trim.
