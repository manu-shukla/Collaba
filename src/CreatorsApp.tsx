import { CreatorForm } from './components/CreatorForm'
import { CreatorHero } from './components/CreatorHero'
import { CreatorProof } from './components/CreatorProof'
import { CreatorSteps } from './components/CreatorSteps'
import { Footer, type FooterLink } from './components/Footer'
import { Wordmark } from './components/Logo'
import { MotionProvider } from './components/Motion'
import { CREATOR_PLACEMENTS, useCtaAnalytics } from './hooks/useCtaAnalytics'

/**
 * The creators page: /creators, reached from the band at the foot of the home page.
 *
 * A second Vite entry point rather than a client-side route. The site had no router
 * and needed none for this — a creator arriving from an Instagram bio link should
 * get a page with its own title, its own description and its own canonical URL,
 * which a hash route cannot give them, and adding react-router to a two-page
 * marketing site buys nothing else.
 *
 * Header and StickyCta from the home page are deliberately absent: every link in
 * both points at a `#` anchor that only exists on the home page, so rendering them
 * here would put four dead links and a dead CTA on the page. The slim header below
 * carries the one link a creator needs instead.
 *
 * The three promise cards that used to sit under the hero are gone: the hero's tick
 * row makes the same three points in nine words, and the step row below says how it
 * happens. Two versions of the same argument between the pitch and the form was the
 * longest part of the page and the least read.
 */
/** Both anchors exist on this page; "/" is the only link that leaves it, which is why
    it is the only one carrying a tone — see FooterLink. */
const FOOTER_LINKS: FooterLink[] = [
  { href: '#how-it-works', label: 'How it works' },
  { href: '#creator-application', label: 'Apply to join' },
  { href: '/', label: 'For businesses', tone: 'business' },
]

export default function CreatorsApp() {
  // One delegated listener for every link on this page that aims at the creator
  // form — the hero button, the footer link, the skip link. CREATOR_PLACEMENTS is
  // a module constant rather than an inline array so the effect is not torn down
  // and rebuilt on every render.
  useCtaAnalytics({
    href: '#creator-application',
    placements: CREATOR_PLACEMENTS,
    funnel: 'creator',
  })

  return (
    <MotionProvider>
      <a className="skip-link" href="#creator-application">
        Skip to the creator application form
      </a>

      {/* Not .header: that one is sticky, carries the scroll-progress bar and a
          phone drawer, all of it built around a long single-page scroll. This page
          is a pitch and a form, so the header is a line at the top. */}
      <header className="pageheader">
        <div className="container pageheader__inner">
          <Wordmark href="/" label="Collaba.in home" />
          <a className="pageheader__back" href="/">
            For businesses
          </a>
        </div>
      </header>

      <main id="main">
        <CreatorHero />
        <CreatorProof />
        <CreatorSteps />
        <CreatorForm />
      </main>

      {/* The footer's own default nav is the business funnel — the home page's
          platform sections and "Plan my free pilot". Those are the wrong three
          links to leave a creator with, so this page names its own: the two places
          it can send them, and the door back to the business side. */}
      <Footer links={FOOTER_LINKS} />
    </MotionProvider>
  )
}
