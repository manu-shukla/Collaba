import { Reveal, TapLink } from './Motion'
import { IconArrowRight } from './Icons'
import { PLATFORMS } from './PlatformIcons'
import { track } from '../lib/firebase'

/**
 * Where the creator banner sends people.
 *
 * Clean, with no `.html`, and without depending on a host rewrite to strip one:
 * the page's source lives at `creators/index.html` and builds to
 * `dist/creators/index.html`, so `/creators` is a directory whose index file
 * every static host already knows how to serve. Kept in step with the
 * `<link rel="canonical">` in that file.
 */
export const CREATORS_PATH = '/creators'

/**
 * Bottom-of-page band for the other side of the marketplace.
 *
 * Everything above it addresses a business — the hero, the form, the FAQ all
 * speak to someone buying a collaboration. Creators arriving on the same page had
 * no door of their own, and the pilot-request form is the wrong one: it asks for a
 * business name. So this sits last, after the FAQ and before the footer, where it
 * catches the reader who has got to the end and is not the audience for any of it.
 *
 * Deliberately a band rather than a full section: at `--section-padding` a single
 * line of copy would have sat in 160px of air and read as a fourth pitch. See the
 * note on `--band-padding` in tokens.css.
 *
 * Full-bleed, and a single row: the coral tint is the section's own surface so the
 * band spans the viewport like the footer below it, but the content is one
 * horizontal row — marks, copy, button — rather than a centred stack. The stack was
 * a third of the viewport tall for one sentence and a link; a row says the same
 * thing in a little over a button's height.
 */
export function CreatorBanner() {
  return (
    <section className="creatorband" aria-labelledby="creatorband-title">
      <Reveal className="container creatorband__inner">
        {/* The platform marks in their own colours, the same brand tone the platform
            cards further up the page use. An earlier version painted them white on
            green and ink gradient tiles, which cost the one thing a logo is for —
            Instagram's gradient and YouTube's red are read before any word beside
            them.

            They lead the row rather than trailing it: they need no reading, so they
            do the work an eyebrow would. Each carries its name for screen readers —
            the row used to be followed by a sentence naming all three, and that line
            was a whole row of height spent on something the marks already say. */}
        <span className="creatorband__marks">
          {PLATFORMS.map(({ id, name, Icon }) => (
            <span className="creatorband__mark" key={id}>
              <Icon size={18} />
              <span className="visually-hidden">{name}</span>
            </span>
          ))}
        </span>

        <div className="creatorband__copy">
          <h2 className="creatorband__title" id="creatorband-title">
            Are you a creator?
          </h2>
          {/* One line, and it has to stay one line: the band is a door, and every
              extra line of copy costs the row its height. */}
          <p className="creatorband__sub">Join Collaba and get discovered by amazing brands.</p>
        </div>

        {/* Tracked here rather than by useCtaAnalytics, because that hook watches one
            href per page and this is the only link on the home page pointing
            somewhere else.

            `cta_click`, not `sign_up`. This is a click on a link, and GA4's `sign_up`
            is the completed conversion — which CreatorForm already fires when an
            application lands. Reporting both under `sign_up` would have counted every
            curious click as a creator joining, and double-counted the ones who went
            on to actually apply. */}
        <TapLink
          className="btn btn--secondary creatorband__cta"
          href={CREATORS_PATH}
          onClick={() =>
            track('cta_click', {
              funnel: 'creator',
              placement: 'creator_band',
              link_text: 'Join as a Creator',
              destination: CREATORS_PATH,
            })
          }
        >
          Join as a Creator
          <IconArrowRight size={18} />
        </TapLink>
      </Reveal>
    </section>
  )
}
