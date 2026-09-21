import { useRef } from 'react'
import { m, useScroll, useTransform } from 'motion/react'
import { IconArrowRight, IconCheck } from './Icons'
import { TapLink } from './Motion'
import creatorDeals from '../assets/creators/creator-deals.webp'

/**
 * What a creator gets, in three clauses short enough to read in one pass. Sits
 * directly under the CTA because they are the objections that stop someone
 * pressing it.
 */
const ASSURANCES = [
  'Free to join',
  'Relevant collaboration deals',
  'You choose what to work on',
] as const

export function CreatorHero() {
  const heroRef = useRef<HTMLElement | null>(null)

  // Tracked against the hero itself rather than the page: progress runs 0 at the
  // top of the document to 1 when the hero's bottom edge reaches the top of the
  // viewport, which is exactly the window over which it scrolls away.
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  })
  const artY = useTransform(scrollYProgress, [0, 1], [0, -56])
  // Held at full strength through the first half: fading something still squarely
  // in view looks like a rendering fault, not an effect.
  const artOpacity = useTransform(scrollYProgress, [0, 0.55, 1], [1, 1, 0.5])

  return (
    <section className="hero hero--creator" id="top" ref={heroRef}>
      {/*
        A plain container, not the <SectionScene> the home hero uses.
        SectionScene animates opacity and a transform on this element, and either
        one makes it an isolated blending group — which stops the artwork below
        from reaching the hero's own gradient with mix-blend-mode, leaving it
        sitting in a white rectangle. The section handoff is a nicety; the artwork
        having no background is not.
      */}
      <div className="container hero__grid">
        <div className="hero__copy">
          {/* A filled chip rather than the home page's dotted .eyebrow: this page
              opens on a claim about who it is for, and the chip reads as a label
              on the page rather than as the first line of the sentence. */}
          <p className="chip-eyebrow">For creators</p>

          {/* Two sentences, two colours. The brand colour — coral on this page, see
              the theme block in tokens.css — falls on the half that is Collaba's side
              of the bargain, which is the whole proposition: the creator keeps doing
              what they do, we do the deal-finding. */}
          <h1 className="h1">
            You focus on creating.{' '}
            <span className="text-brand">We focus on collaboration deals.</span>
          </h1>

          <p className="lede">
            Keep doing what you already do. Create content, grow your audience, and stay true to
            your style. Collaba connects you with businesses looking for creators like you, so you
            spend less time finding brands and more time doing what you love.
          </p>

          <div className="hero__actions">
            <TapLink className="btn btn--primary" href="#creator-application">
              Join Collaba
              <IconArrowRight />
            </TapLink>
          </div>

          <ul className="hero__trust hero__trust--ticks">
            {ASSURANCES.map((item) => (
              <li key={item}>
                <span className="tick" aria-hidden="true">
                  <IconCheck size={13} />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/*
          The supplied artwork, in place of the phone feed the home page uses. It
          already contains its own floating notification cards, so the CSS
          .briefcard row that used to orbit the phone here is gone with it — two
          sets of floating cards on one image was the clutter, not the feature.

          Decorative, hence alt="": it illustrates the sentence beside it rather
          than adding anything a screen-reader user would otherwise miss, and its
          own content is a mocked-up inbox — reading "Brand Partnership, see our
          terms for your collaboration below" aloud would present a made-up message
          as though it were real.

          width/height are the file's own pixel dimensions, so the browser reserves
          the right box before the bytes arrive; without them this is the largest
          element on the page shifting the layout as it loads. fetchPriority high
          for the same reason — it is the LCP element.
        */}
        <m.img
          className="creatorhero__art"
          style={{ y: artY, opacity: artOpacity }}
          src={creatorDeals}
          alt=""
          width={992}
          height={1056}
          fetchPriority="high"
          decoding="async"
        />
      </div>
    </section>
  )
}
