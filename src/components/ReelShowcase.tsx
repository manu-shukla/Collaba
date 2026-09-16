import { useEffect, useRef, useState } from 'react'
import { m, useInView, useReducedMotion } from 'motion/react'
import type { MotionValue } from 'motion/react'
import {
  IconChat,
  IconCoffee,
  IconDumbbell,
  IconHeart,
  IconHome,
  IconShare,
  IconShirt,
  IconSkincare,
} from './Icons'
import { IconFacebook, IconInstagram, IconYouTube } from './PlatformIcons'

/** How long each reel holds before the feed advances. */
const DWELL_MS = 1900
/** Duration of the swipe itself — short enough to read as a flick, not a scroll. */
const SWIPE_S = 0.52
/**
 * How much of a clip is ever displayed: the swipe in, plus the dwell. Because a clip always
 * restarts when its reel comes around (see ReelMedia), nothing past this point is ever
 * seen — which is why scripts/prepare-reels.sh only has to produce about three seconds.
 */
export const DISPLAYED_S = SWIPE_S + DWELL_MS / 1000

type Glyph = (props: { size?: number; className?: string }) => JSX.Element

type Reel = {
  id: string
  /** What kind of content this is. Never a person — see the no-fabrication note below. */
  category: string
  city: string
  platform: 'instagram' | 'youtube' | 'facebook'
  Icon: Glyph
  tint: 'indigo' | 'coral' | 'ink'
}

/**
 * Real footage, wired by filename rather than by a field on the reel: drop
 * `src/assets/reels/<reel id>.mp4` into place and that reel plays it. No code change,
 * one reel at a time, and reels without a file keep their coded poster.
 *
 * src/assets rather than public/ is what buys that. public/ is copied verbatim and
 * cannot be enumerated at build time, so wiring a clip there needs either a
 * hand-maintained path in this file or a 404 per reel on every page load to discover
 * which files exist. Vite also fingerprints and compresses what it finds here, which
 * it does not do for public/.
 *
 * See design/reel-clips.md for what to feed it, and scripts/prepare-reels.sh for the
 * encode.
 */
const CLIPS = import.meta.glob<string>('../assets/reels/*.mp4', {
  eager: true,
  query: '?url',
  import: 'default',
})

function clipFor(id: string): string | undefined {
  const match = Object.keys(CLIPS).find((path) => path.endsWith(`/${id}.mp4`))
  return match ? CLIPS[match] : undefined
}

/**
 * The feed's content.
 *
 * Category and city only: no handles, no names, no like/view/follower counts. Those
 * would be invented people and invented numbers, which product-design.md §1.2–1.3
 * rules out — the same constraint the diagram this replaced carried. The cities do
 * real work here rather than being decoration: local relevance is one of the five
 * matching dimensions the page sells.
 */
const REELS: readonly Reel[] = [
  { id: 'cafe', category: 'Café review', city: 'Pune', platform: 'instagram', Icon: IconCoffee, tint: 'coral' },
  { id: 'skincare', category: 'Skincare routine', city: 'Mumbai', platform: 'instagram', Icon: IconSkincare, tint: 'indigo' },
  { id: 'fitness', category: 'Gym & fitness', city: 'Delhi', platform: 'youtube', Icon: IconDumbbell, tint: 'ink' },
  { id: 'decor', category: 'Home decor', city: 'Bengaluru', platform: 'facebook', Icon: IconHome, tint: 'indigo' },
  { id: 'fashion', category: 'Local fashion', city: 'Jaipur', platform: 'youtube', Icon: IconShirt, tint: 'coral' },
]

const PLATFORM_MARKS = {
  instagram: IconInstagram,
  youtube: IconYouTube,
  facebook: IconFacebook,
} as const

/**
 * The feed is rendered twice back to back, so scrolling one past the last real reel
 * lands on a pixel-identical copy of the first. That copy is what makes the loop
 * seamless without AnimatePresence or layout projection (neither is available —
 * motionFeatures.ts loads domAnimation only).
 */
const SLIDES = [...REELS, ...REELS]
/** One reel as a percentage of the doubled track's height. */
const STEP_PCT = 100 / SLIDES.length

/**
 * A reel's content: the coded poster, plus real footage over it when the reel has a
 * clip. The poster is not an either/or with the video — it is always rendered
 * underneath, so it doubles as the frame shown while the clip buffers and as the
 * permanent fallback if the file is missing, still encoding, or refused playback.
 */
function ReelMedia({
  reel,
  active,
  upcoming,
}: {
  reel: Reel
  active: boolean
  upcoming: boolean
}) {
  const { Icon } = reel
  const clip = clipFor(reel.id)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    if (!active) {
      video.pause()
      return
    }

    // Always from the top, never resumed from where it paused.
    //
    // Resuming was the first design: a reel is only on screen for one dwell, so letting
    // the clip carry on meant a visitor saw a different part of it on each pass. That
    // reads as variety with abstract footage and as breakage with real footage. Every
    // clip here is a small narrative — a hand enters, places a glass, withdraws — so
    // pass two would open mid-gesture, pass three would jump backwards to the start, and
    // the reel looked like it had a cut spliced into it. Restarting costs nothing: four
    // other reels go by in between, so nobody registers seeing the same two seconds
    // again, and it makes every pass identical and predictable.
    video.currentTime = 0

    // play() can still be refused even for a muted video — an iPhone in Low Power
    // Mode does exactly that. Swallowing the rejection leaves the poster on screen,
    // which is the right outcome and nothing the visitor needs told about.
    void video.play().catch(() => {})
  }, [active])

  return (
    <>
      <span className="showcase__glyph" aria-hidden="true">
        <Icon size={96} />
      </span>

      {clip && !failed && (
        <video
          ref={videoRef}
          className="showcase__video"
          src={clip}
          muted
          loop
          playsInline
          // Only the reel on screen and the one about to slide into view buffer for
          // real; the rest hold at metadata. Warming the next one is what stops a reel
          // arriving as a still frame and then jerking into motion a beat later, and it
          // still means at most two clips are ever downloading — not five above the fold.
          preload={active || upcoming ? 'auto' : 'metadata'}
          onError={() => setFailed(true)}
        />
      )}

      {/* A real element, and deliberately the last thing ReelMedia renders: as a
          pseudo-element on the reel it either sat under the video (leaving the white
          caption with no contrast over bright footage) or, as ::after, over the caption
          and the action rail. Between the video and the badge is the only correct spot. */}
      <span className="showcase__scrim" aria-hidden="true" />
    </>
  )
}

/** A single reel: platform badge, content, action rail, category/city caption. */
function Slide({
  reel,
  active,
  upcoming,
}: {
  reel: Reel
  active: boolean
  upcoming: boolean
}) {
  const Mark = PLATFORM_MARKS[reel.platform]

  return (
    <article className={`showcase__reel showcase__reel--${reel.tint}`}>
      <ReelMedia reel={reel} active={active} upcoming={upcoming} />

      <span className="showcase__badge">
        <Mark size={16} />
      </span>

      {/* Affordances only, deliberately without counts beside them. */}
      <div className="showcase__rail">
        <span className="showcase__railBtn">
          <IconHeart size={16} />
        </span>
        <span className="showcase__railBtn">
          <IconChat size={16} />
        </span>
        <span className="showcase__railBtn">
          <IconShare size={16} />
        </span>
      </div>

      <div className="showcase__meta">
        <span className="showcase__category">{reel.category}</span>
        <span className="showcase__city">{reel.city}</span>
      </div>
    </article>
  )
}

/**
 * The phone chrome. Shared by the animated and reduced-motion renders.
 *
 * Three nested boxes rather than one: the outer rim is the metal edge, the middle is
 * the black bezel, and only the inner box clips the feed. A single bordered box could
 * not produce the two different corner radii that make the frame read as a device.
 *
 * Deliberately a generic modern handset silhouette — rounded rim, pill camera cutout,
 * side keys, home indicator. No Apple wordmark or logo anywhere: the frame is a
 * device mockup, and the page must not imply an endorsement by any platform vendor
 * (product-design.md §1.3 makes the same point about the platform marks).
 */
function Frame({
  children,
  frameRef,
}: {
  children: React.ReactNode
  frameRef?: React.Ref<HTMLDivElement>
}) {
  return (
    <div className="showcase__phone" ref={frameRef}>
      {/* On the rim, not inside it — the silhouette is most of what turns a rounded
          rectangle into a phone. */}
      <span className="showcase__key showcase__key--silence" aria-hidden="true" />
      <span className="showcase__key showcase__key--volup" aria-hidden="true" />
      <span className="showcase__key showcase__key--voldown" aria-hidden="true" />
      <span className="showcase__key showcase__key--power" aria-hidden="true" />

      <div className="showcase__bezel">
        {/*
          aria-hidden because the slide list is duplicated — a screen reader would
          announce all five categories twice, and the announcement would be a
          meaningless stream of nouns anyway. The figcaption carries the meaning.
        */}
        <div className="showcase__screen" aria-hidden="true">
          {children}
          {/* After {children} so both sit above the feed without needing a z-index. */}
          <span className="showcase__island" />
          <span className="showcase__home" />
        </div>
      </div>
    </div>
  )
}

const CAPTION =
  ''

type ReelShowcaseProps = {
  y: MotionValue<number>
  opacity: MotionValue<number>
}

/**
 * Hero product demo: a phone feed that advances reel by reel.
 *
 * Built entirely from DOM and vector rather than a video of the whole thing, so the
 * UI text stays sharp at any density, the frame reflows with the hero column, and
 * reduced motion can be honoured with a real static state instead of a paused first
 * frame. Only the content inside each reel is a candidate for real footage (Reel.src).
 */
export function ReelShowcase({ y, opacity }: ReelShowcaseProps) {
  const reduced = useReducedMotion()
  const frameRef = useRef<HTMLDivElement | null>(null)
  // Once the hero has scrolled away there is nobody to see the feed, so stop
  // advancing it rather than running a timer and a transform for the rest of the visit.
  const inView = useInView(frameRef)
  const [index, setIndex] = useState(0)
  const [instant, setInstant] = useState(false)

  // setTimeout chain rather than setInterval: the dwell should start when a reel has
  // settled, and an interval would keep firing on its own cadence while the tab is
  // backgrounded and then deliver a burst of advances on return.
  useEffect(() => {
    if (reduced || !inView || instant) return
    const id = window.setTimeout(() => setIndex((current) => current + 1), DWELL_MS)
    return () => window.clearTimeout(id)
  }, [reduced, inView, instant, index])

  // Two frames, not one: the duration-0 snap back to index 0 has to actually commit
  // to the DOM before normal timing returns, otherwise the next advance animates
  // from the pre-snap position and the whole loop visibly rewinds.
  useEffect(() => {
    if (!instant) return
    let inner = 0
    const outer = requestAnimationFrame(() => {
      inner = requestAnimationFrame(() => setInstant(false))
    })
    return () => {
      cancelAnimationFrame(outer)
      cancelAnimationFrame(inner)
    }
  }, [instant])

  if (reduced) {
    // Static, but still a feed: the track is nudged up by a sliver of the screen so
    // the next reel's top edge is visible. A single full-bleed poster would read as
    // a stock photo rather than as the product.
    return (
      <figure className="showcase" aria-labelledby="showcase-caption">
        <Frame frameRef={frameRef}>
          <div className="showcase__track showcase__track--static">
            {/* active={false} throughout: a looping clip is motion, so under reduced
                motion the video stays paused on its first frame (and falls back to the
                coded poster if the browser has not decoded one). */}
            {REELS.slice(0, 2).map((reel) => (
              <Slide key={reel.id} reel={reel} active={false} upcoming={false} />
            ))}
          </div>
        </Frame>
        <figcaption className="showcase__caption" id="showcase-caption">
          {CAPTION}
        </figcaption>
      </figure>
    )
  }

  return (
    // Stays the direct grid child of .hero__grid — wrapping it in a positioning div
    // would take it out of the 7fr/5fr track it belongs to.
    <m.figure className="showcase" aria-labelledby="showcase-caption" style={{ y, opacity }}>
      <Frame frameRef={frameRef}>
        <m.div
          className="showcase__track"
          animate={{ y: `-${index * STEP_PCT}%` }}
          transition={
            instant
              ? { duration: 0 }
              : { duration: SWIPE_S, ease: [0.16, 1, 0.3, 1] }
          }
          onAnimationComplete={() => {
            // Landed on the duplicate of the first reel: snap back to the real one.
            // Same pixels, so the jump is invisible, and the index never grows unbounded.
            if (index === REELS.length) {
              setInstant(true)
              setIndex(0)
            }
          }}
        >
          {/*
            Exactly one slide plays, and only ever a slide from the first copy of the list.
            The duplicates exist purely to make the loop's wrap invisible, and a duplicate
            must NOT play: it is a different <video> element from the original, so it would
            reach a different currentTime, and the snap that is meant to be pixel-identical
            would instead jump the footage backwards. That was the "cut" in the middle of
            the first reel — the duplicate played its opening half-second, then the snap
            handed over to the original starting from zero again.

            Held at its first frame instead, the duplicate matches the original exactly at
            the moment of the snap, so the wrap stays invisible and playback starts once.
            The cost is that the reel is a still frame for the ~0.5s swipe that reveals it,
            which is far cheaper than a visible jump.
          */}
          {SLIDES.map((reel, slide) => (
            <Slide
              key={`${reel.id}-${slide}`}
              reel={reel}
              active={inView && slide === index && slide < REELS.length}
              // The first slide is what the snap lands on, so warm it while the duplicate
              // is being swiped in.
              upcoming={inView && (slide === index + 1 || (index === REELS.length && slide === 0))}
            />
          ))}
        </m.div>

        {/* Keyed on the real reel so the bar does not restart on the loop's snap. */}
        <m.span
          className="showcase__progress"
          key={index % REELS.length}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: DWELL_MS / 1000, ease: 'linear' }}
          aria-hidden="true"
        />
      </Frame>

      <figcaption className="showcase__caption" id="showcase-caption">
        {CAPTION}
      </figcaption>
    </m.figure>
  )
}
