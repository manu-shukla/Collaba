import { useRef } from 'react'
import { m, useReducedMotion, useScroll, useTransform } from 'motion/react'
import type { MotionValue } from 'motion/react'
import { IconArrowRight, IconChat, IconClock, IconShield, IconStore } from './Icons'
import { IconInstagram, IconYouTube, PLATFORMS } from './PlatformIcons'
import { SectionScene, TapLink } from './Motion'

/** Seconds between each connector starting to draw. */
const DRAW_STEP = 0.14

/**
 * One connector curve, drawn on by animating `pathLength` from 0 to 1.
 *
 * Framer normalises `pathLength` against the curve's real length, so the same
 * 0→1 range works for both directions of curve without measuring either.
 */
function Connector({ d, order }: { d: string; order: number }) {
  const reduced = useReducedMotion()

  if (reduced) return <path className="diagram__path" pathLength="1" d={d} />

  return (
    <m.path
      className="diagram__path"
      pathLength="1"
      d={d}
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 1 }}
      transition={{
        pathLength: { duration: 0.85, ease: [0.16, 1, 0.3, 1], delay: order * DRAW_STEP },
        opacity: { duration: 0.2, delay: order * DRAW_STEP },
      }}
    />
  )
}

type DiagramProps = {
  y: MotionValue<number>
  opacity: MotionValue<number>
}

/** Abstract business → creators → audience-interest diagram. No fabricated metrics. */
function ConnectionDiagram({ y, opacity }: DiagramProps) {
  const reduced = useReducedMotion()

  return (
    // Stays the direct grid child of .hero__grid — wrapping it in a positioning
    // div would take it out of the 7fr/5fr track it belongs to. The transform
    // does not affect layout, so .diagram's inline-size container queries still
    // resolve against its real width.
    <m.figure
      className="diagram"
      aria-labelledby="diagram-caption"
      style={reduced ? undefined : { y, opacity }}
    >
      <div className="diagram__row">
        <div className="node node--business">
          <span className="node__avatar">
            <IconStore />
          </span>
          <span className="node__label">
            <span className="node__title">Your business</span>
            <span className="node__meta">Goal · audience · city</span>
          </span>
        </div>
      </div>

      {/* Endpoints sit at 25%/75% of the viewBox — the centres of the two
          creator columns below. */}
      <svg
        className="diagram__connector"
        viewBox="0 0 240 40"
        aria-hidden="true"
        focusable="false"
      >
        <Connector d="M120 0C120 20 60 20 60 40" order={0} />
        <Connector d="M120 0C120 20 180 20 180 40" order={1} />
      </svg>

      <div className="diagram__row diagram__row--pair">
        <div className="node node--creator">
          <span className="node__avatar node__avatar--platform">
            <IconInstagram size={18} />
          </span>
          <span className="node__label">
            <span className="node__title">Instagram creator</span>
            <span className="node__meta">Reels · Stories</span>
          </span>
        </div>
        <div className="node node--creator">
          <span className="node__avatar node__avatar--platform">
            <IconYouTube size={18} />
          </span>
          <span className="node__label">
            <span className="node__title">YouTube creator</span>
            <span className="node__meta">Shorts · reviews</span>
          </span>
        </div>
      </div>

      <svg
        className="diagram__connector"
        viewBox="0 0 240 40"
        aria-hidden="true"
        focusable="false"
      >
        <Connector d="M60 0C60 20 120 20 120 40" order={2} />
        <Connector d="M180 0C180 20 120 20 120 40" order={3} />
      </svg>

      <ul className="chips">
        <li className="chip">Audience intent</li>
        <li className="chip">Local relevance</li>
        <li className="chip chip--accent">Content style</li>
        <li className="chip">Category fit</li>
        <li className="chip chip--accent">Campaign goal</li>
      </ul>

      <figcaption className="diagram__caption" id="diagram-caption">
        How a match is shaped: your goal, relevant creators, then the audience interests they
        genuinely reach.
      </figcaption>
    </m.figure>
  )
}

export function Hero() {
  const heroRef = useRef<HTMLElement | null>(null)

  // Tracked against the hero itself rather than the whole page: progress runs 0
  // at the top of the document to 1 when the hero's bottom edge reaches the top
  // of the viewport, which is exactly the window over which it scrolls away.
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  })

  // Small enough to read as depth rather than as the diagram detaching from the
  // copy beside it.
  const diagramY = useTransform(scrollYProgress, [0, 1], [0, -56])
  // Held at full strength through the first half: fading something still
  // squarely in view looks like a rendering fault, not an effect.
  const diagramOpacity = useTransform(scrollYProgress, [0, 0.55, 1], [1, 1, 0.5])

  return (
    <section className="hero" id="top" ref={heroRef}>
      {/* The diagram keeps its own, larger parallax on top of the scene's — the
          differential between copy and diagram is what reads as depth. */}
      <SectionScene className="container hero__grid">
        <div className="hero__copy">
          <p className="eyebrow">
            <span className="eyebrow__dot" aria-hidden="true" />
            Instagram, YouTube &amp; Facebook creator campaigns
          </p>

          {/* Set by the owner, and it diverges from the exact H1 in
              product-design.md §B — update that document to match, or the code
              stays out of contract with its own spec. The indigo falls on the
              trust clause, which is the load-bearing idea. */}
          <h1 className="h1">
            Reach your target audience through the creators{' '}
            <span className="text-brand">they trust most.</span>
          </h1>

          {/* No price or zero-cost claim here: product-design.md §1.2 keeps
              pricing off the V2 landing page entirely. */}
          <p className="lede">
            Collaba.in finds right-fit Instagram, YouTube, and Facebook creators for your business
            and helps run the collaboration from brief to outcome review.
          </p>

          <div className="platform-row">
            <span className="platform-row__label">Creators on</span>
            <ul className="platform-row__list">
              {PLATFORMS.map(({ id, name, Icon }) => (
                <li key={id}>
                  <Icon size={20} />
                  {name}
                </li>
              ))}
            </ul>
          </div>

          <div className="hero__actions">
            <TapLink className="btn btn--primary" href="#pilot-request">
              Plan my free pilot
            </TapLink>
            <a className="link-arrow" href="#how-it-works">
              See how it works
              <IconArrowRight />
            </a>
          </div>

          <ul className="hero__trust">
            <li>
              <IconClock /> Takes about 2 minutes
            </li>
            <li>
              <IconChat /> We reply personally
            </li>
            <li>
              <IconShield /> No payment details
            </li>
          </ul>
        </div>

        <ConnectionDiagram y={diagramY} opacity={diagramOpacity} />
      </SectionScene>
    </section>
  )
}
