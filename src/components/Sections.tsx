import { useRef } from 'react'
import { m, useReducedMotion, useScroll, useSpring } from 'motion/react'
import { Reveal, RevealGroup, SectionScene } from './Motion'
import { IconChart, IconEye, IconTarget } from './Icons'
import { PLATFORMS } from './PlatformIcons'

const useCases = [
  'launches',
  'local discovery',
  'store visits',
  'qualified leads',
  'product trials',
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
        <Reveal className="section__head section__head--center">
          <p className="eyebrow" style={{ justifyContent: 'center' }}>
            <span className="eyebrow__dot" aria-hidden="true" />
            Where we work
          </p>
          <h2 className="h2" style={{ marginTop: 'var(--sp-1)' }}>
            Instagram, YouTube, and Facebook creators.
          </h2>
          <p className="lede" style={{ marginTop: 'var(--sp-2)', marginInline: 'auto' }}>
            These are the three platforms we match on today. We pick the platform that suits your
            goal — not all three by default.
          </p>
        </Reveal>

        {/* The group times the cards off its own entry, so the row lands as one
            gesture instead of three cards each reacting to their own edge. */}
        <RevealGroup className="features">
          {PLATFORMS.map(({ id, label, Icon, formats, strength }) => (
            <Reveal key={id} className="card platform-card">
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
            </Reveal>
          ))}
        </RevealGroup>
      </SectionScene>
    </section>
  )
}

const steps = [
  {
    title: 'Tell us the outcome you want.',
    body: 'Share your business, audience, location, and campaign goal.',
  },
  {
    title: 'We find the right-fit creators.',
    body: 'We review relevance, content quality, audience context, and practical fit — not follower count alone.',
  },
  {
    title: 'Launch with a clear plan.',
    body: 'You approve the direction, we coordinate the pilot, and you receive a concise outcome summary.',
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
    <section className="section" id="how-it-works">
      <SectionScene className="container">
        <Reveal className="section__head">
          <h2 className="h2">Three steps, and we handle the coordination.</h2>
          <p className="lede" style={{ marginTop: 'var(--sp-2)' }}>
            You stay in control of the direction. We do the sourcing, briefing, and follow-through.
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
    title: 'Relevance before reach',
    // Was a six-item list that ended on "your campaign goal" — a thing the lead
    // form no longer asks for. Three grouped criteria carry the same meaning.
    body: 'We match on category, on audience location and age, and on how a creator actually sounds — not on follower count.',
  },
  {
    icon: IconEye,
    title: 'Human-reviewed matches',
    body: 'A person on our team reviews every creator we recommend, and can explain the reasoning behind each one.',
  },
  {
    icon: IconChart,
    title: 'Built around an outcome',
    body: 'We agree the business goal and the numbers we will report on before anything is published.',
  },
]

export function WhyCollaba() {
  return (
    <section className="section section--subtle" id="why-collaba">
      <SectionScene className="container">
        <Reveal className="section__head">
          <p className="eyebrow">
            <span className="eyebrow__dot" aria-hidden="true" />
            Why Collaba
          </p>
          <h2 className="h2" style={{ marginTop: 'var(--sp-1)' }}>
            Relevance first, then reach.
          </h2>
          {/* Deliberately keeps the specifics out: this states the idea, and the
              first card below is where the matching criteria are named. The earlier
              version listed city, age and category here and the card then listed
              six criteria three lines later — the same point twice, and the reader
              met a list before they met the reason for it. */}
          <p className="lede" style={{ marginTop: 'var(--sp-2)' }}>
            A big follower count is not proof of a right-fit audience. Checking who actually watches
            is slow work from the outside, so we do it for you.
          </p>
        </Reveal>

        <RevealGroup className="features">
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

        <Reveal className="note">
          <p>
            We are building Collaba with our first businesses, so your feedback directly shapes the
            service.
          </p>
        </Reveal>
      </SectionScene>
    </section>
  )
}
