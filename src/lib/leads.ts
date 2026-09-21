/**
 * Writing a pilot request to Firestore.
 *
 * Kept out of LeadForm.tsx so the component stays about the form and this stays
 * about the document shape — the two change for different reasons, and the shape
 * has to be kept in step with firestore.rules rather than with the markup.
 */
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { db } from './firestore'

/**
 * Firestore is the heaviest thing Firebase would put in the bundle, and a landing
 * page's visitors mostly read it and leave. So it lives behind this module, which
 * LeadForm reaches for with a dynamic `import()` — prefetched the moment someone
 * starts typing, so it is already in memory by the time they press submit.
 *
 * The db handle and the submit-deadline helpers moved to lib/firestore.ts when the
 * creators page added a second form; they are re-exported at the foot of this file
 * so LeadForm's single `import('../lib/leads')` still reaches everything it needs.
 */

/** Firestore collection the form writes to. Also named in firestore.rules. */
export const LEADS_COLLECTION = 'leads'

export type LeadInput = {
  businessName: string
  preferredPlatforms: string[]
  fullName: string
  email: string
  mobile: string
  consent: boolean
}

/**
 * Writes one lead and returns its document id.
 *
 * Values are normalised here rather than in the form so what lands in Firestore
 * is consistent no matter which surface submitted it: trimmed strings, a
 * lowercased email (addresses are case-insensitive in practice, and
 * `Priya@` / `priya@` arriving as two different leads is a duplicate to sort out
 * by hand), and the mobile number kept both as typed and as bare digits — the
 * first is what the sender recognises, the second is what you can search on.
 *
 * Throws on failure. Callers must surface that: silently swallowing a rejected
 * write means a business fills in the form, is told "you're in", and never hears
 * from anyone.
 */
export async function submitLead(input: LeadInput): Promise<string> {
  const mobile = input.mobile.trim()

  const doc = await addDoc(collection(db, LEADS_COLLECTION), {
    businessName: input.businessName.trim(),
    preferredPlatforms: input.preferredPlatforms,
    fullName: input.fullName.trim(),
    email: input.email.trim().toLowerCase(),
    mobile,
    mobileDigits: mobile.replace(/\D/g, ''),
    consent: input.consent,

    // Set by the server, so it survives a device with the wrong clock and cannot
    // be back- or forward-dated by whoever is sending the request.
    createdAt: serverTimestamp(),

    // Enough context to answer "where did this come from?" without a separate
    // analytics lookup. No cookies, no fingerprinting, no id that outlives the
    // submission.
    source: 'collaba.in-landing',
    pagePath: typeof window === 'undefined' ? null : window.location.pathname,
    referrer: typeof document === 'undefined' ? null : document.referrer || null,
    userAgent: typeof navigator === 'undefined' ? null : navigator.userAgent,

    // Untouched by the form; the inbox workflow owns it from here.
    status: 'new',
  })

  return doc.id
}

export { SUBMIT_CONFIRM_TIMEOUT_MS, SubmitTimeoutError, withSubmitTimeout } from './firestore'
