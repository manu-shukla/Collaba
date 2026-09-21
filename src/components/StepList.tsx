import { useRef } from 'react'
import { m, useReducedMotion, useScroll, useSpring } from 'motion/react'
import { Reveal, RevealGroup } from './Motion'

export type Step = {
  title: string
  body: string
  /**
   * Given, the card's top-left badge is this icon and the step's number moves to a
   * small label above the title. Omitted, the badge is the number itself — which is
   * the home page's treatment, and the reason this is one component and not two.
   */
  Icon?: (props: { size?: number; className?: string }) => JSX.Element
}

/**
 * The three-across row of numbered step cards, joined by a line that draws itself
 * as the row is read.
 *
 * Shared by the home page's "How it works" and the creators page's. The scroll-linked
 * line is most of why: it is a `useScroll` range, a spring and a transform-origin
 * that all have to agree with `.steps__line`'s left/right insets in CSS, and two
 * copies of that drifting apart is a line that stops short of the last card on one
 * page only. The badge stays 2.5rem square in both forms for the same reason — the
 * line's vertical offset is measured to its centre.
 */
export function StepList({ steps }: { steps: readonly Step[] }) {
  const stepsRef = useRef<HTMLDivElement | null>(null)
  const reduced = useReducedMotion()

  // Tracks reading position rather than firing once on entry: it starts drawing as
  // the row enters from the bottom and completes as the row passes the middle of
  // the screen, so the line grows under the reader's eye.
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
    // Wrapper exists to position the line: an absolutely-positioned element cannot
    // be a child of the <ol>, and a ::before pseudo-element cannot be driven by a
    // MotionValue. Left unbound under reduced motion, where the CSS default draws
    // it at full width.
    <div className="steps__wrap" ref={stepsRef}>
      <m.span
        className="steps__line"
        aria-hidden="true"
        style={reduced ? undefined : { scaleX: lineScale }}
      />

      <RevealGroup as="ol" className="steps">
        {steps.map((step, index) => (
          <Reveal as="li" key={step.title} className="step">
            {step.Icon ? (
              <span className="step__badge" aria-hidden="true">
                <step.Icon size={22} />
              </span>
            ) : (
              <span className="step__num" aria-hidden="true">
                {index + 1}
              </span>
            )}
            <div className="step__body">
              {step.Icon && (
                // Decoration over a list that is already ordered — the <ol> tells
                // assistive tech the sequence, and the visually-hidden "Step n"
                // below says it in words.
                <p className="step__label" aria-hidden="true">
                  {String(index + 1).padStart(2, '0')}
                </p>
              )}
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
  )
}
