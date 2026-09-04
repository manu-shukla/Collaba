import { Header } from './components/Header'
import { Hero } from './components/Hero'
import { HowItWorks, Platforms, RelevanceStrip, WhyCollaba } from './components/Sections'
// OfferPanel ("First pilot free") is intentionally not rendered for now.
// The component is kept in src/components/OfferPanel.tsx — re-add the import and
// <OfferPanel /> below to bring the section back.
// import { OfferPanel } from './components/OfferPanel'
import { LeadForm } from './components/LeadForm'
import { Faq } from './components/Faq'
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
        <RelevanceStrip />
        <Platforms />
        <HowItWorks />
        <WhyCollaba />
        {/* <OfferPanel /> */}
        <LeadForm />
        <Faq />
      </main>
      <Footer />
      <StickyCta />
    </MotionProvider>
  )
}
