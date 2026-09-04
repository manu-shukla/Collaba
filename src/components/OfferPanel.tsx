import { Reveal } from './Motion'
import { IconCheck } from './Icons'

const included = [
  'Discovery call',
  'Campaign brief',
  'Creator matching',
  'Pilot coordination',
  'Outcome summary',
]

export function OfferPanel() {
  return (
    <section className="section" id="free-pilot">
      <div className="container">
        <Reveal className="offer">
          <div className="offer__inner">
            <div>
              <p className="eyebrow">
                <span className="eyebrow__dot" aria-hidden="true" />
                First pilot free
              </p>
              <h2 className="h2" style={{ marginTop: 'var(--sp-1)' }}>
                Test the fit before you spend.
              </h2>
              <p>
                Your first agreed Collaba pilot is free. We will confirm the deliverables, timeline,
                and what is included before anything starts.
              </p>

              <ul className="offer__included">
                {included.map((item) => (
                  <li key={item}>
                    <IconCheck />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="offer__aside">
              <p className="offer__price">₹0</p>
              <p className="offer__boundary">
                for the agreed pilot scope. No card. No surprise invoice.
              </p>
              <a className="btn btn--onBrand btn--block" href="#pilot-request">
                Claim my free pilot
              </a>
              <p className="offer__fine">
                Creator compensation, product samples, travel, and paid media are confirmed in
                writing with you before the pilot begins.
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
