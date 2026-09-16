import { useRef } from 'react'
import { useScroll, useTransform } from 'motion/react'
import { IconArrowRight, IconShield } from './Icons'
import { PLATFORMS } from './PlatformIcons'
import { SectionScene, TapLink } from './Motion'
import { ReelShowcase } from './ReelShowcase'

export function Hero() {
  const heroRef = useRef<HTMLElement | null>(null)

  // Tracked against the hero itself rather than the whole page: progress runs 0
  // at the top of the document to 1 when the hero's bottom edge reaches the top
  // of the viewport, which is exactly the window over which it scrolls away.
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  })

  // Small enough to read as depth rather than as the showcase detaching from the
  // copy beside it.
  const showcaseY = useTransform(scrollYProgress, [0, 1], [0, -56])
  // Held at full strength through the first half: fading something still
  // squarely in view looks like a rendering fault, not an effect.
  const showcaseOpacity = useTransform(scrollYProgress, [0, 0.55, 1], [1, 1, 0.5])

  return (
    <section className="hero" id="top" ref={heroRef}>
      {/* The showcase keeps its own, larger parallax on top of the scene's — the
          differential between copy and showcase is what reads as depth. */}
      <SectionScene className="container hero__grid">
        <div className="hero__copy">
          <p className="eyebrow">
            <span className="eyebrow__dot" aria-hidden="true" />
            Instagram, YouTube &amp; Facebook creator campaigns
          </p>

          {/* Set by the owner, and it diverges from the exact H1 in
              product-design.md §B — update that document to match, or the code
              stays out of contract with its own spec. The indigo falls on the
              fit clause, which is the load-bearing idea. */}
          <h1 className="h1">
            Grow Your Business with the{' '}
            <span className="text-brand">Right Creators</span>
          </h1>

          {/* Owner-set copy. Note the budget/"best deals" mention diverges from
              product-design.md §1.2, which keeps pricing off the V2 landing
              page — reconcile that document, or the code stays out of contract
              with its own spec. Still no price or zero-cost claim. */}
          <p className="lede">
            Stop wasting hours searching Instagram for creators who don&rsquo;t fit your audience,
            location, or budget. Tell us about your business. We&rsquo;ll help you find relevant
            creators and the best deals.
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
              <IconShield /> No payment details needed
            </li>
          </ul>
        </div>

        <ReelShowcase y={showcaseY} opacity={showcaseOpacity} />
      </SectionScene>
    </section>
  )
}
