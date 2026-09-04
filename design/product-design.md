# Collaba.in Website Product Design V2

**Document type:** Product and implementation design  
**Version:** 2.0  
**Date:** September 4, 2026  
**Status:** Implementation-ready source of truth  
**Audience:** Product, design, frontend, Firebase, analytics, content, and QA

## Executive summary

Collaba.in is a managed creator-collaboration service for businesses. The website explains the service, establishes trust, and collects qualified campaign requests for personal follow-up. The website does not deliver the service itself.

V2 makes three decisions. First, customer-facing copy explicitly names **Instagram creators, YouTube creators, and Facebook creators**. Second, the interface uses platform marks and a small, consistent set of functional icons. Third, the website does not advertise an introductory zero-price offer. All calls to action now invite the visitor to discuss or submit a campaign request.

This document replaces V1. Developers must implement the canonical specifications in this document and `collaba.theme.json`. Do not combine removed V1 copy with V2 copy.

## Contents

1. V2 implementation contract
2. Product decision
3. Audience and value
4. Goals and non-goals
5. Experience concept
6. Information architecture and exact page copy
7. Visual design language and icon rules
8. Interaction, responsive behavior, and accessibility
9. Firebase architecture
10. Analytics plan
11. Form behavior and data quality
12. SEO and sharing
13. Launch acceptance criteria
14. Decisions before launch

## 1. V2 implementation contract

### 1.1 Required changes from V1

| Area | Remove from V1 | Implement in V2 |
|---|---|---|
| Positioning | Price-led introductory offer | Relevance-led creator matching across Instagram, YouTube, and Facebook |
| Header CTA | Pilot-oriented CTA | **Tell us about your campaign** linking to `#campaign-request` |
| Hero eyebrow | Generic influencer-collaboration label | **Instagram, YouTube and Facebook creator campaigns** |
| Hero supporting copy | Introductory-price promise | Platform-specific matching and managed campaign support |
| Hero trust line | Payment-related reassurance | **Takes about 2 minutes · We reply personally · No marketing spam** |
| Platform visibility | No named platform treatment | A visible platform row with official marks and text labels |
| High-contrast section | Introductory-offer panel | **More than follower count** matching-criteria panel |
| Form | Pilot request | Campaign request plus preferred-platform selection |
| FAQ | Introductory-offer scope question | Supported-platform question |
| Footer | Offer terms | Standard Terms and Privacy Notice |
| Analytics | Pilot-oriented labels and statuses | Campaign-oriented labels, `platform_mix`, and `campaign_started` |
| SEO | Generic creator copy plus introductory offer | Natural Instagram creator, YouTube creator, and Facebook creator terminology |

### 1.2 Copy removal guardrail

The rendered website must not claim or imply that the first campaign, first deal, creator match, pilot, or Collaba service has no cost. Do not display zero-price language, payment-card reassurance, hidden-charge language, crossed-out prices, offer badges, countdowns, or introductory-price terms. Pricing stays outside the V2 landing page until the business defines it.

This guardrail does not prohibit a future pricing page. Any later price claim requires a separate product and legal review.

### 1.3 Platform terminology guardrail

Use these customer-facing terms exactly where specified:

- **Instagram creators**
- **YouTube creators**
- **Facebook creators**
- **creator campaigns**
- **influencer marketing** when describing the category for search discovery

Do not repeat all platform names in every paragraph. The exact names must appear in the hero eyebrow, platform section, form options, FAQ, page title, and meta description. Use “creators” elsewhere for readable copy.

Do not claim that Collaba partners with, represents, is certified by, or is endorsed by Instagram, YouTube, Facebook, Meta, or Google.

### 1.4 Developer precedence

1. This V2 document defines product behavior and customer copy.
2. `collaba.theme.json` defines machine-readable tokens, component styles, section IDs, icon assets, and quality gates.
3. If implementation code conflicts with either file, update the code.
4. If these two files conflict, this document controls customer copy and behavior. The theme controls visual token values.

## 2. Product decision

Collaba.in is a **managed creator-collaboration service for businesses**, not a self-serve marketplace. The website has one job: make a relevant business trust the service enough to submit a campaign request.

**Positioning**

> Reach the right audience through creators they already trust.

Collaba.in connects businesses with relevant Instagram, YouTube, and Facebook creators based on audience fit, category, location, content style, platform, and campaign goal. The team then helps shape and coordinate the collaboration so the business earns qualified attention instead of vanity reach.

**Tone:** clear, optimistic, practical, personal, and credible. Avoid “guaranteed viral,” “perfect audience,” inflated creator counts, and unsupported ROI promises. Prefer **right-fit audience**, **relevant reach**, **qualified attention**, **creator-audience fit**, and **measurable outcomes**.

## 3. Audience and value

### 3.1 Primary audience

The initial audience is Indian founders, local business owners, growth leads, and marketing managers at early-stage or small-to-medium businesses that:

- want to work with Instagram, YouTube, or Facebook creators but do not know whom to trust;
- have limited time to source, evaluate, brief, and coordinate creators;
- care about customers, leads, visits, or sales more than follower count;
- want a human-guided way to evaluate creator marketing.

### 3.2 Initial categories

The page can name food and beverage, beauty and wellness, fashion, fitness, consumer apps, local experiences, and direct-to-consumer products. The visual system must remain category-neutral.

### 3.3 Customer questions to answer

1. **Will the creator's audience care?** Explain relevance-based matching.
2. **Which platforms can Collaba support?** Name Instagram, YouTube, and Facebook.
3. **Can I trust the creator and process?** Explain human review and clear approvals.
4. **Will this consume my time?** Show a three-step managed process.
5. **How will I know it worked?** Explain goal setting and an outcome summary without promising unsupported attribution.

## 4. Goals and non-goals

### 4.1 Website goals

- Validate demand by business category, platform interest, campaign goal, market, and timeline.
- Capture qualified business leads with enough context for a useful first conversation.
- Build trust in under 90 seconds on mobile.
- Establish a reusable design language for future business and creator products.
- Earn relevant search visibility for Instagram creator, YouTube creator, Facebook creator, creator campaign, and influencer marketing queries without keyword stuffing.

### 4.2 Non-goals

- No creator search, account creation, dashboard, checkout, chat, pricing calculator, blog, or case-study system.
- No public creator directory or platform-specific campaign package.
- No fake testimonials, invented metrics, marketplace counters, or urgency pressure.
- No platform feed embeds. They add tracking, performance, consent, and content-permission complexity.
- No separate creator funnel. A future creator-interest link must not compete with the business CTA.

## 5. Experience concept

**Design feeling:** confident introduction, human connection, effortless next step.

Each scroll answers one question:

1. What does Collaba do?
2. Which creator platforms does it cover?
3. Is it relevant to my campaign?
4. How does it work?
5. How does Collaba evaluate fit?
6. What happens after I submit?

The visual metaphor is **business to creator to audience connection**. Use thin curved paths, paired business and creator cards, platform marks, and small relevance tags. Avoid generic megaphones, neon social-media collages, floating emoji clouds, screenshots of platform interfaces, and photos of people pointing at phones.

## 6. Information architecture and exact page copy

The launch website is one responsive landing page with seven content sections plus the footer.

### A. Header

- Left: Collaba.in wordmark with the linked-node brand mark.
- Desktop navigation: **Platforms**, **How it works**, **Why Collaba**, and the primary CTA.
- Primary CTA: **Tell us about your campaign**.
- CTA destination: `#campaign-request`.
- Mobile: logo and one compact CTA. Add a menu only if the links do not fit at 320px width.
- Sticky state starts after 80px of vertical scroll.

### B. Hero

**Eyebrow:** Instagram, YouTube and Facebook creator campaigns

**H1:** Reach the right audience through creators they already trust.

**Supporting copy:** Collaba.in connects your business with relevant Instagram, YouTube, and Facebook creators, then helps shape the campaign from brief to outcome review.

**Primary CTA:** Tell us about your campaign

**Secondary link:** See how it works

**Trust microcopy:** Takes about 2 minutes · We reply personally · No marketing spam

**Visual:** One business card connects to three creator cards. Each creator card carries one platform mark. The paths converge on audience-interest chips. The platform marks label the channel. They must not imply platform endorsement.

### C. Platforms and use cases

**Section ID:** `platforms`

**H2:** Creators across the platforms your audience uses.

Use three equal platform cards:

1. **Instagram creators**  
   Reels, Stories, posts, and visual product discovery.
2. **YouTube creators**  
   Videos, Shorts, reviews, explainers, and integrations.
3. **Facebook creators**  
   Videos, posts, and community-led local discovery.

Each card contains the official platform mark, visible platform name, and the format sentence. Marks are decorative because visible text repeats their meaning. Use `aria-hidden="true"` and `focusable="false"` on the SVG.

Below the cards, show this non-interactive use-case strip:

> Built for launches · local discovery · store visits · qualified leads · product trials

The cards stack at widths below 768px. The strip wraps. Nothing auto-scrolls.

### D. How it works

Use three connected cards:

1. **Tell us the outcome you want.** Share your business, preferred platforms, audience, location, and campaign goal.
2. **We find right-fit creators.** We review relevance, content quality, audience context, platform fit, and practical fit instead of follower count alone.
3. **Launch with a clear plan.** You approve the direction, we coordinate the campaign, and you receive a concise outcome summary.

Use the Lucide icons `target`, `users-round`, and `chart-no-axes-combined` in this order. The icons are decorative. The connection line animates once when the section enters the viewport.

### E. Why Collaba

**H2:** Relevance first, then reach.

**Lede:** A creator's follower count says nothing about whether their audience is in your city, your age bracket, or your category. That check is slow and hard to do from the outside, so we do it for you.

Use three benefit cards:

- **Relevance before reach**  
  We match on category, audience location, audience age, intent, voice, and your campaign goal, not on follower count.  
  Icon: `scan-search`.
- **Human-reviewed matches**  
  A person on our team reviews every creator we recommend, and can explain the reasoning behind each one.  
  Icon: `badge-check`.
- **Built around an outcome**  
  We agree the business goal and the numbers we will report on before anything is published.  
  Icon: `chart-line`.

Supporting line:

> We are building Collaba with our first businesses, so your feedback directly shapes the service.

### F. Matching criteria panel

**Section ID:** `matching-criteria`

Use the existing high-contrast indigo panel. Replace the V1 offer content completely.

**H2:** More than follower count.

**Body:** We evaluate category relevance, audience location, content quality, brand fit, platform, and campaign objective before recommending creators.

Show six non-interactive criteria chips:

- Category relevance
- Audience location
- Content quality
- Brand fit
- Platform fit
- Campaign objective

**CTA:** Discuss my campaign

**CTA destination:** `#campaign-request`

**Icon:** `scan-search`, rendered at 32px in white. The icon is decorative.

### G. Campaign request form

**Section ID and form ID:** `campaign-request`

**H2:** Tell us what you want to grow.

**Intro:** Give us the basics. We will review the fit and contact you personally within one business day.

Use one page grouped into **Your business**, **Your campaign**, and **How to reach you**. Do not use a wizard.

Required fields:

1. Full name
2. Work email
3. Business name
4. Website or public social profile
5. Primary goal. Options: awareness, launch, leads, store visits, sales, content creation, not sure yet
6. Preferred creator platforms. Checkbox options: Instagram, YouTube, Facebook, not sure yet
7. Ideal customer. Short textarea prompt: **Who should care about this campaign?**

Optional fields:

- Phone or WhatsApp number
- Target city or region
- Desired timing. Options: this month, next 1 to 3 months, exploring
- Additional context

Platform selection behavior:

- Visitors can select more than one platform.
- Selecting **Not sure yet** clears Instagram, YouTube, and Facebook.
- Selecting a named platform clears **Not sure yet**.
- The validation message is **Select at least one platform or choose “Not sure yet”.**

Required consent:

> I agree that Collaba.in may use this information to evaluate my request and contact me about this service. See the Privacy Notice.

**Submit label:** Send campaign request

**Button trailing icon:** `send`, 18px, decorative

**Below-button microcopy:** No marketing spam. We only use your details to review and respond to this request.

Success state replaces the form in place:

> Thanks, {first name}. We will review your campaign request and reply within one business day. A copy has been sent to {masked email}.

Provide **Submit another request** as a quiet text action. Never clear the form after a failed submission.

### H. FAQ and footer

Use four collapsed FAQ items with these exact questions and answers:

1. **Which creator platforms do you support?**  
   We currently match businesses with relevant Instagram, YouTube, and Facebook creators. We recommend the platform or platform mix based on your audience, content format, location, and campaign goal.
2. **How do you choose creators?**  
   We review category relevance, audience context, location, content quality, brand fit, platform fit, and campaign goals. Follower count is one input, not the decision.
3. **Do I need an influencer-marketing brief already?**  
   No. Share the business outcome and audience you want to reach. We will help turn that into a practical creator brief.
4. **What happens after I submit?**  
   We review the request, contact you to clarify the campaign, and explain the recommended next step, scope, and pricing before work starts.

Footer content: wordmark, one-sentence proposition, contact email, Privacy Notice, Terms, and copyright. Do not add empty social links or platform icons to the footer because Collaba does not yet link to owned platform profiles.

## 7. Visual design language and icon rules

### 7.1 Color direction

Use deep indigo, warm coral, and soft lavender neutrals.

- Indigo communicates trust and judgment.
- Coral adds human energy. Do not use coral for body text or primary buttons.
- Warm off-white prevents a sterile SaaS appearance.
- Use the 60/30/10 principle: about 60% neutral background, 30% white or raised surfaces and dark text, and no more than 10% indigo or coral emphasis.

### 7.2 Typography

Use the self-hosted Manrope variable family with system fallbacks. Use weight 700 for major headings, 600 for controls and subheadings, and 400 to 500 for body copy. Keep prose near 65 characters per line.

### 7.3 Shape and layout

- Use an 8px spacing base.
- Use 80 to 120px section spacing on desktop and 56 to 72px on mobile.
- Cards use 20px radius. Controls use 12px radius. Reserve pills for tags.
- Desktop content width is 1200px. Prose width is 720px.
- Borders provide separation. Shadows remain broad and low-opacity.
- The hero uses a 7-column copy area and 5-column visual area, then stacks below 768px.

### 7.4 Platform marks

Platform marks are the only exception to the rounded outline icon style.

- Use official SVG marks or the equivalent Simple Icons SVG for Instagram, YouTube, and Facebook.
- Store local assets at `/public/icons/platform/instagram.svg`, `/public/icons/platform/youtube.svg`, and `/public/icons/platform/facebook.svg`.
- Use the recognizable, unmodified mark shape. Do not redraw it in Lucide style.
- Render at 24px in platform cards and 20px in the hero.
- Use monochrome `currentColor` with Collaba semantic text colors. Do not create rainbow Instagram gradients or platform-colored cards.
- Keep the platform name visible beside or below every mark.
- Do not animate, rotate, crop, outline, place text inside, or combine marks with the Collaba logo.
- Do not use a platform mark as a link unless Collaba later has a real destination on that platform.
- Include a small footer note only if legal review requires it: platform names and marks belong to their respective owners.

### 7.5 Functional icons

Use Lucide outline icons with 1.75px stroke, `round` line caps, and `round` joins. Approved V2 icons are:

| Purpose | Lucide name | Size |
|---|---|---:|
| Primary CTA | `arrow-right` | 18px |
| Submit request | `send` | 18px |
| Campaign goal | `target` | 24px |
| Creator matching | `users-round` | 24px |
| Outcome review | `chart-no-axes-combined` | 24px |
| Relevance evaluation | `scan-search` | 24px or 32px |
| Human review | `badge-check` | 24px |
| Outcome focus | `chart-line` | 24px |
| FAQ disclosure | `chevron-down` | 20px |

Rules:

- Do not mix Lucide with another functional icon library.
- Do not use emoji as interface icons.
- Do not add leading icons to text fields.
- Icons that repeat visible text use `aria-hidden="true"`.
- Icon-only controls require an accessible name and a 44 by 44px target.
- Critical actions always retain a visible text label.

## 8. Interaction, responsive behavior, and accessibility

- Use native vertical scrolling. Do not add scroll hijacking, snap points, horizontal page scrolling, or parallax.
- Use smooth scrolling only for anchor links. Disable it under `prefers-reduced-motion`.
- Reveal sections once from opacity 0 to 1 and translateY 12px to 0 over 420ms.
- Stagger no more than three sibling cards by 60ms.
- Buttons move up by 1px on hover. Do not scale buttons.
- Keep the sticky header 64px tall on desktop and 56px on mobile.
- Offset anchor targets by the header height plus 16px.
- The page rhythm moves from the focused hero to platform recognition, process explanation, differentiation, a high-contrast matching panel, and a quiet form.

Responsive and accessibility requirements:

- Breakpoints: 480, 768, 1024, and 1280px.
- Minimum target: 44 by 44px.
- Base text: 16px with 1.6 line-height.
- Inputs stay at 16px or larger.
- Meet WCAG 2.2 AA contrast.
- Show 3px focus rings.
- Use semantic landmarks, one H1, ordered headings, persistent labels, and errors connected through `aria-describedby`.
- Announce form status through an `aria-live` region.
- Support keyboard input, 200% zoom, reduced motion, high contrast, and screen readers.
- Lighthouse mobile targets: Performance 90 or higher, Accessibility 95 or higher, Best Practices 95 or higher, SEO 90 or higher.

## 9. Firebase architecture

Use this lean setup:

- **Firebase Hosting:** static deployment, CDN, TLS, and preview channels.
- **Firebase Analytics with GA4:** acquisition and conversion measurement.
- **HTTPS Cloud Function:** validates and rate-limits submissions before writing to Firestore.
- **Cloud Firestore:** stores requests and processing status.
- **Firebase App Check:** reduces automated abuse. Add a honeypot and server-side rate limit.
- **Optional email provider:** sends an internal notification and applicant acknowledgement from the function. Never expose keys in the browser.

Do not allow direct unauthenticated reads or updates. If the prototype allows browser-to-Firestore creation, use create-only rules, App Check, field allowlisting, size limits, and server timestamps.

Store:

- `leadId`, normalized form fields, and `createdAt` server timestamp;
- `preferredPlatforms` as an allowlisted array containing `instagram`, `youtube`, `facebook`, or `not_sure`;
- source path, referrer domain, and UTM values;
- `consentVersion` and `consentedAt`;
- server-controlled status: `new`, `contacted`, `qualified`, `consultation_booked`, `campaign_started`, or `closed`;
- optional `duplicateOf` and `assignedTo`.

Do not send names, email addresses, phone numbers, public profile URLs, or open-text answers to Firebase Analytics. Restrict Firestore access to authorized operators and define retention before launch.

## 10. Analytics plan

### 10.1 Primary metric

**Qualified request conversion rate** equals unique visitors who submit a legitimate campaign request divided by unique landing-page visitors.

Human review determines qualification. Store qualification in Firestore or a CRM. Do not treat every form submission as qualified.

### 10.2 Funnel

1. `page_view`
2. `primary_cta_click`
3. `lead_form_start`
4. `lead_form_submit`
5. internal status `qualified`
6. internal status `consultation_booked`
7. internal status `campaign_started`

### 10.3 Events

| Event | Trigger | Safe parameters |
|---|---|---|
| `primary_cta_click` | Any campaign-request CTA | `placement`, `destination`, `label_id` |
| `section_view` | Major section is at least 50% visible for 1 second | `section_name` |
| `lead_form_start` | First field interaction | `form_id` |
| `platform_selection_change` | Preferred-platform selection changes | `platform_mix`, `platform_count` |
| `lead_form_error` | Client or server validation fails | `field_name`, `error_type` |
| `lead_form_submit` | Server confirms storage | `goal`, `timing`, `platform_mix`, `has_region`, `utm_source` |
| `faq_open` | FAQ expands | `question_id` |
| `outbound_contact_click` | Contact method selected | `contact_type`, `placement` |

Build `platform_mix` from a controlled, alphabetically sorted value such as `facebook_instagram`, `instagram_youtube`, or `not_sure`. Do not send a creator profile URL or other user-entered text.

Fire `lead_form_submit` only after the server confirms storage. Deduplicate with a submission ID.

Review weekly:

- visitors and acquisition by UTM campaign;
- hero CTA click-through rate;
- form start and completion rate;
- errors by field;
- platform interest and platform combinations;
- lead distribution by goal, business category, region, and timing;
- qualified request and campaign-start rate by acquisition source;
- objections recorded during outreach.

## 11. Form behavior and data quality

- Validate after field interaction and again on submit.
- Accept valid international phone formats.
- Normalize email and URLs server-side. Allow public social profile URLs.
- Limit ideal-customer text to 300 characters and additional context to 500 characters.
- Disable submit only while the request is in flight. Show **Sending...** without changing button width.
- Retain all values after network or server failure and provide retry.
- Return a generic success response for accepted duplicate handling while recording the reason server-side.
- Protect exports and operational notifications because they contain personal data.

## 12. SEO and sharing

- **Title:** Collaba.in | Instagram, YouTube and Facebook Creator Campaigns
- **Description:** Connect your business with relevant Instagram, YouTube and Facebook creators. Collaba.in helps match and coordinate creator campaigns around your audience and goals.
- **H1:** Reach the right audience through creators they already trust.
- Include canonical URL, Open Graph title, description and image, favicon, `robots.txt`, and sitemap.
- Add `Organization` structured data only with real contact details.
- Do not add a `meta keywords` tag. Search engines do not need it. Use platform terms naturally in visible headings and copy.
- Do not create thin platform-specific doorway pages for launch.
- Do not add fabricated review or aggregate-rating schema.

## 13. Launch acceptance criteria

The V2 site is ready when:

- the hero, platform cards, form options, FAQ, title, and description name Instagram, YouTube, and Facebook;
- no rendered page claims or implies a zero-price introductory campaign or service;
- `free-pilot` and `pilot-request` do not exist as DOM IDs, route fragments, analytics labels, component names, or test fixtures;
- primary CTAs use the approved campaign labels and link to `#campaign-request`;
- the high-contrast section uses `matching-criteria`, not offer content;
- platform marks load locally, have visible text labels, and do not imply endorsement;
- functional icons use only the approved Lucide names and accessibility treatment;
- platform selection follows the exclusive **Not sure yet** behavior;
- the form succeeds, fails, retries, retains data on failure, and blocks obvious abuse;
- analytics events appear in GA4 DebugView without personal information;
- Firestore blocks unauthenticated reads and updates;
- Privacy Notice, Terms, and consent version are published;
- keyboard, screen reader, 200% zoom, reduced motion, and mobile layouts pass review;
- production Lighthouse results meet the stated targets.

## 14. Decisions before launch

The V2 specification is implementable without these decisions. Product must still confirm:

1. **Service geography:** all India or selected launch cities.
2. **Initial categories:** broad intake or two to three focused categories.
3. **Response commitment:** confirm that one business day is sustainable.
4. **Contact mode:** email-first or WhatsApp-first.
5. **Platform scope:** confirm whether every listed format is supported at launch or whether the copy needs narrower format language.
6. **Trademark review:** confirm whether the selected local platform SVG assets and optional ownership note meet launch requirements.

These decisions can narrow copy. They must not reintroduce removed V1 offer language without a separate revision.
