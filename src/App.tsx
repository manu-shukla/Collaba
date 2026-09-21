import { Header } from './components/Header'
import { Hero } from './components/Hero'
// RelevanceStrip (the "Built for" band under the hero) is intentionally not
// rendered for now. The component is kept in src/components/Sections.tsx — add it
// back to this import and to the tree below to bring the band back.
import { HowItWorks, Platforms, WhyCollaba } from './components/Sections'
// OfferPanel ("First pilot free") is intentionally not rendered for now.
// The component is kept in src/components/OfferPanel.tsx — re-add the import and
// <OfferPanel /> below to bring the section back.
// import { OfferPanel } from './components/OfferPanel'
import { LeadForm } from './components/LeadForm'
import { Faq } from './components/Faq'
import { CreatorBanner } from './components/CreatorBanner'
import { Footer } from './components/Footer'
import { StickyCta } from './components/StickyCta'
import { MotionProvider } from './components/Motion'
import { useCtaAnalytics } from './hooks/useCtaAnalytics'

export default function App() {
  // One delegated listener for every "plan my pilot" link on the page.
  useCtaAnalytics()

  return (
    // Wraps the whole tree: every `m.*` component below needs the feature bundle
    // this provides, and it is deliberately mounted once rather than per section.
    <MotionProvider>
      <a className="skip-link" href="#pilot-request">
        Skip to the pilot request form
      </a>
      <Header />
      <main id="main">
        <Hero />
        {/* <RelevanceStrip /> */}
        <Platforms />
        <WhyCollaba />
        <HowItWorks />
        {/* <OfferPanel /> */}
        <LeadForm />
        <Faq />
        {/* Last thing on the page, and the only one addressed to a creator rather
            than a business — see the note in CreatorBanner. */}
        <CreatorBanner />
      </main>
      <Footer />
      <StickyCta />
    </MotionProvider>
  )
}
