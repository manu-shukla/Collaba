import { useRef } from 'react'
import { m, useReducedMotion, useScroll, useSpring } from 'motion/react'
import { Reveal, RevealGroup, SectionScene } from './Motion'
import { IconBolt, IconRupee, IconShieldCheck, IconTarget } from './Icons'
import { PLATFORMS } from './PlatformIcons'
import { PlatformCardAnimated } from './PlatformCardAnimated'

// Concrete outcomes a local business would recognise, in the register the rest of
// the page uses. The previous five mixed vocabularies: "local discovery" and
// "qualified leads" were marketing terms, and "product trials" rarely applies to
// a shop or a café.
const useCases = [
  'store launches',
  'more walk-ins',
  'new product launches',
  'festive offers',
  'online orders',
]

export function RelevanceStrip() {
  return (
    <section className="strip" id="use-cases" aria-label="What Collaba is built for">
      <SectionScene className="container strip__inner">
        <p className="strip__label">Built for</p>
        <ul className="strip__list">
          {useCases.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </SectionScene>
    </section>
  )
}

export function Platforms() {
  return (
    <section className="section section--surface" id="platforms">
      <SectionScene className="container">
        {/* Left-aligned, like the two sections below it. The centring — and the
            two inline styles that centring needed, on the eyebrow and the lede —
            is gone. */}
        <Reveal className="section__head">
          <p className="eyebrow">
            <span className="eyebrow__dot" aria-hidden="true" />
            Where we work
          </p>
          <h2 className="h2" style={{ marginTop: 'var(--sp-1)' }}>
            Instagram, YouTube, and Facebook creators.
          </h2>
          <p className="lede" style={{ marginTop: 'var(--sp-2)' }}>
            These are the three platforms we match on today. We pick the platform that suits your
            goal — not all three by default.
          </p>
        </Reveal>

        {/* The group times the cards off its own entry, so the row lands as one
            gesture instead of three cards each reacting to their own edge. */}
        <RevealGroup className="features">
          {PLATFORMS.map(({ id, label, Icon, formats, strength }) => (
            <Reveal key={id} className="platform-card-wrapper">
              <PlatformCardAnimated platformId={id} className="card platform-card">
                <span className="platform-card__mark">
                  <Icon size={26} />
                </span>
                <h3 className="h3">{label}</h3>
                <p>{strength}</p>
                <ul className="chips platform-card__formats">
                  {formats.map((format) => (
                    <li className="chip" key={format}>
                      {format}
                    </li>
                  ))}
                </ul>
              </PlatformCardAnimated>
            </Reveal>
          ))}
        </RevealGroup>
      </SectionScene>
    </section>
  )
}

// Written to be understood on one read, which is not the same as written short.
// Each title says who does the thing, and each body says what actually happens
// and what the reader gets — in plain words, with no terms the reader would have
// to work out ("audience context", "practical fit", "outcome summary" were all
// doing that job badly).
const steps = [
  {
    title: 'You tell us what you need',
    body: 'Tell us about your business, the customers you want to reach, your city and your budget.',
  },
  {
    title: 'We find creators who fit',
    body: 'Collaba will find creators on Instagram, YouTube and Facebook whose followers match your customers.',
  },
  {
    title: 'You choose, and we run it',
    body: 'You get a shortlist with the reason for each pick. Choose who you like, and we handle the rest.',
  },
]

export function HowItWorks() {
  const stepsRef = useRef<HTMLDivElement | null>(null)
  const reduced = useReducedMotion()

  // The connector now tracks reading position instead of firing once on entry:
  // it starts drawing as the row enters from the bottom and completes as the row
  // passes the middle of the screen, so the line grows under the reader's eye.
  const { scrollYProgress } = useScroll({
    target: stepsRef,
    offset: ['start 90%', 'end 60%'],
  })
  const lineScale = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 26,
    restDelta: 0.001,
  })

  return (
    // --surface so this alternates with WhyCollaba above it and the lead form
    // below, both of which sit on the canvas. It was the canvas itself until
    // WhyCollaba moved ahead of it, at which point it and the lead form were two
    // canvas bands with no seam between them.
    <section className="section section--surface" id="how-it-works">
      <SectionScene className="container">
        {/* Eyebrow added because this was the only section head on the page
            without one, which also frees the heading from having to label itself.
            The lede states who does the work, since that is the thing a reader
            most often gets wrong about this section. */}
        <Reveal className="section__head">
          <p className="eyebrow">
            <span className="eyebrow__dot" aria-hidden="true" />
            How it works
          </p>
          <h2 className="h2" style={{ marginTop: 'var(--sp-1)' }}>
            Just 3 simple steps.
          </h2>
          <p className="lede" style={{ marginTop: 'var(--sp-2)' }}>
            You describe your business once. We do the searching and negotiating, and you decide who
            to work with.
          </p>
        </Reveal>

        {/* Wrapper exists to position the line: an absolutely-positioned element
            cannot be a child of the <ol>, and a ::before pseudo-element cannot be
            driven by a MotionValue. Left unbound under reduced motion, where the
            CSS default draws it at full width. */}
        <div className="steps__wrap" ref={stepsRef}>
          <m.span
            className="steps__line"
            aria-hidden="true"
            style={reduced ? undefined : { scaleX: lineScale }}
          />

          <RevealGroup as="ol" className="steps">
            {steps.map((step, index) => (
              <Reveal as="li" key={step.title} className="step">
                <span className="step__num" aria-hidden="true">
                  {index + 1}
                </span>
                <div className="step__body">
                  <h3 className="h3">
                    <span className="visually-hidden">Step {index + 1}: </span>
                    {step.title}
                  </h3>
                  <p>{step.body}</p>
                </div>
              </Reveal>
            ))}
          </RevealGroup>
        </div>
      </SectionScene>
    </section>
  )
}

const benefits = [
  {
    icon: IconTarget,
    title: 'Relevant Creators',
    body: 'Matched to your niche, location and audience',
  },
  {
    icon: IconRupee,
    title: 'Better Deals',
    body: 'Get the right value for your budget',
  },
  {
    icon: IconBolt,
    title: 'Less Effort',
    body: 'We do the heavy lifting for you',
  },
  {
    icon: IconShieldCheck,
    title: 'More Confidence',
    body: 'Insights beyond just follower count',
  },
]

export function WhyCollaba() {
  return (
    // Keeps the #why-collaba id: the header and footer nav both link to it, and
    // the section still answers the same question under a different headline.
    // Plain .section (the canvas), not --subtle: --subtle is indigo-50 and this
    // was the only section on the page wearing it. Sitting between the white
    // Platforms above and the white HowItWorks below, the canvas is what keeps
    // the page alternating.
    <section className="section" id="why-collaba">
      <SectionScene className="container">
        {/* Left-aligned like HowItWorks, heading block on top and content below.
            Deliberately not the hero's two-column split, and deliberately no
            CTA — those two things together made this read as a second hero. */}
        <Reveal className="section__head solution__head">
          <p className="eyebrow">
            <span className="eyebrow__dot" aria-hidden="true" />
            Why Collaba?
          </p>
          {/* The break before the payoff is the only one set by hand — the two
              "The Right …" clauses share a line, the outcome gets its own. That
              first line fits the container at the standard .h2 scale from 48rem
              up, so no font-size override is needed here. No highlight colour on
              the payoff either: the hero already spends the one indigo phrase
              this page gets. */}
          <h2 className="h2" style={{ marginTop: 'var(--sp-1)' }}>
            The Right Creator. The Right Audience.
            <br />
            Real Business Growth.
          </h2>
          <p className="lede" style={{ marginTop: 'var(--sp-2)' }}>
            Collaba helps you discover and collaborate with relevant creators based on niche,
            audience, location and budget, so you can focus on what matters most: growing your
            business.
          </p>
        </Reveal>

        <RevealGroup className="solution__cards">
          {benefits.map((benefit) => {
            const Icon = benefit.icon
            return (
              <Reveal key={benefit.title} className="card">
                <span className="card__icon">
                  <Icon size={22} />
                </span>
                <h3 className="h3">{benefit.title}</h3>
                <p>{benefit.body}</p>
              </Reveal>
            )
          })}
        </RevealGroup>
      </SectionScene>
    </section>
  )
}
