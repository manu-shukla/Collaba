import { IconDealSigned, IconPlayCircle, IconUsers } from './Icons'
import { Reveal, SectionScene } from './Motion'
import { StepList } from './StepList'

/**
 * The creator's side of the flow, in the order it happens to them.
 *
 * The same <StepList> the home page uses — bordered cards, the connector line that
 * draws as the row is read — so the two pages read as one product rather than two
 * sites that happen to share a logo. The difference is the badge: these steps carry
 * an icon and move the number to a small label, which is what the design asked for
 * and what StepList's optional `Icon` exists to do.
 */
const STEPS = [
  {
    Icon: IconPlayCircle,
    title: 'You create',
    body: 'Keep making the content your audience already loves.',
  },
  {
    Icon: IconUsers,
    title: 'We find the fit',
    body: 'We connect you with businesses looking for creators like you.',
  },
  {
    Icon: IconDealSigned,
    title: 'You get the deal',
    body: 'Receive relevant collaboration opportunities and choose the ones you want.',
  },
] as const

export function CreatorSteps() {
  return (
    <section className="section section--surface" id="how-it-works">
      <SectionScene className="container">
        {/* Heading left, the one-line summary right — the summary is an aside, and
            putting it under the heading would make it compete with the steps. It
            drops below the heading on a phone, where there is one column. */}
        <Reveal className="creatorsteps__head">
          <div>
            <p className="eyebrow">
              <span className="eyebrow__dot" aria-hidden="true" />
              How it works
            </p>
            <h2 className="h2" style={{ marginTop: 'var(--sp-1)' }}>
              Create. Get matched. Collaborate.
            </h2>
          </div>
          <p className="creatorsteps__aside">Simple for you. Powerful opportunities.</p>
        </Reveal>

        <StepList steps={STEPS} />
      </SectionScene>
    </section>
  )
}
