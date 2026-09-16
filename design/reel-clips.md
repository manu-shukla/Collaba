# Putting real video into the hero reel showcase

The hero's phone feed (`src/components/ReelShowcase.tsx`) ships with coded posters — a
brand-tinted gradient and a category glyph. Each of the five reels can be swapped for
real footage independently, and **there is no code to edit**: a clip is wired by its
filename.

## The whole workflow

1. Get five vertical clips (see [Where to get the footage](#where-to-get-the-footage)).
2. Name each after its reel id and put them in one folder:

   | reel id | shows | caption on screen |
   | --- | --- | --- |
   | `cafe` | a café / restaurant | Café review · Pune |
   | `skincare` | skincare, beauty | Skincare routine · Mumbai |
   | `fitness` | gym, training | Gym & fitness · Delhi |
   | `decor` | home, interiors | Home decor · Bengaluru |
   | `fashion` | clothing, styling | Local fashion · Jaipur |

   Any extension is fine — `cafe.mov`, `cafe.mp4`, `cafe.webm`.

3. Run the encoder:

   ```bash
   scripts/prepare-reels.sh ~/Downloads/collaba-reels
   ```

4. `npm run dev`.

That's it. The script crops, trims and compresses each file to spec and writes
`src/assets/reels/<id>.mp4`, which is where `ReelShowcase.tsx` looks. **Reels without a
file keep their coded poster**, so you can ship one clip at a time — you do not need all
five to start.

To redo a single reel, or to skip past a dull opening few seconds:

```bash
scripts/prepare-reels.sh cafe ~/Downloads/pexels-1234.mp4      # from the start
scripts/prepare-reels.sh cafe ~/Downloads/pexels-1234.mp4 6    # from 0:06
```

To drop a clip and go back to the poster, delete the file:
`rm src/assets/reels/cafe.mp4`.

### Why src/assets and not public/

`public/` is copied to the site root verbatim and cannot be enumerated at build time, so
wiring a clip there needs either a hand-maintained path in the component or a 404 per
reel on every page load to discover which files exist. From `src/assets`, Vite can list
the folder at build time — which is what makes the drop-in behaviour possible — and it
also fingerprints each file for cache-busting, which it does not do for `public/`.

## What the code already handles

- **Only the visible reel plays.** Every other clip is paused, and nothing plays while
  the hero is scrolled off screen. Five clips never decode at once.
- **`preload="metadata"`** — a clip fetches its header, not its body, until it becomes
  the active reel. Adding five reels does not add five clips to the initial page load.
- **The coded poster stays underneath, always.** It shows while a clip buffers, and it is
  the permanent fallback if the file is missing or the browser refuses to autoplay (an
  iPhone in Low Power Mode does refuse, even when muted). A broken clip degrades to the
  current design — never a black box.
- **Reduced motion never plays them.** Under `prefers-reduced-motion: reduce` the video
  is rendered but left paused. A looping clip is motion.
- **`object-fit: cover`** — the clip fills the screen and is cropped, never letterboxed.

## What makes a good clip

- **Vertical, or at least vertical-friendly.** The script centre-crops anything to 9:16
  rather than squashing it, so a landscape source works but loses its sides — check that
  the subject survives the crop.
- **3–6 seconds.** Each reel is only on screen ~1.9s before the feed advances, so a long
  clip mostly never gets watched. The script trims to 5s.
- **Keep the bottom quarter visually quiet.** The caption, scrubber and home indicator
  sit there over a dark scrim. Busy detail low in the frame fights them.
- **Under 400 KB.** The script reports each file's size and warns past that. If one is
  over, re-run it with `CRF=34 scripts/prepare-reels.sh ...`.
- **Audio is discarded.** The reels are muted, so an audio stream is wasted bytes.

## Where to get the footage

Ranked by how convincing the result is per hour of effort:

1. **Film it yourself.** A phone, a real shop or café, five seconds. For a page selling
   local creator campaigns in Indian cities, footage that actually looks Indian and local
   beats everything else here — stock libraries skew Western and it shows.
2. **Free stock video.** [Pexels](https://www.pexels.com/videos/) and
   [Pixabay](https://pixabay.com/videos/) both have large vertical libraries, free for
   commercial use with no attribution required. Search the category plus "vertical".
   Check each clip's licence on its own page before using it.
3. **AI generation** (Runway, Pika, Luma, Kling, Veo — free tiers exist, limits change
   constantly). Ask for 9:16 vertical, five seconds, handheld phone-camera feel, and name
   the city. Watch for the usual tells: warped hands, dissolving text, drifting faces. A
   clip with an obvious artefact is worse than the coded poster, because it makes the
   whole page look careless.

## Content constraints — not optional

`design/product-design.md` §1.2–1.3 governs the footage the same way it governs the copy:

- **No on-screen metrics.** No view, like, follower or engagement counts burned into the
  video. This is exactly why the coded reels carry category and city only; a clip with a
  fake "1.2M views" overlay undoes it.
- **No platform UI.** A screen recording of the real Instagram or YouTube app implies a
  partnership neither has given. The frame's own badge already says which platform.
- **No identifiable person without their permission**, and nothing implying a specific
  creator is a Collaba client unless they are.
- The caption under the frame reads "Illustrative examples of the kind of short-form
  creator content we help you commission." Keep the footage inside what that sentence
  honestly covers — if a clip starts reading as a case study, the caption has to change
  too.

## Checking it worked

```bash
npm run build && npm run preview
```

- The active reel plays and the others do not; the Network tab shows one clip streaming,
  not five.
- Scroll past the hero: playback stops.
- The caption and scrubber stay readable over the footage's brightest frame. The scrim is
  tuned against pure white, but check.
- `rm src/assets/reels/cafe.mp4` and rebuild: the coded poster comes back cleanly, no
  black rectangle, no console noise.
- Toggle System Settings → Accessibility → Display → Reduce motion: the feed is static
  and nothing is playing.
