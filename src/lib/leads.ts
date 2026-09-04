/**
 * Writing a pilot request to Firestore.
 *
 * Kept out of LeadForm.tsx so the component stays about the form and this stays
 * about the document shape — the two change for different reasons, and the shape
 * has to be kept in step with firestore.rules rather than with the markup.
 */
import {
  addDoc,
  collection,
  connectFirestoreEmulator,
  getFirestore,
  serverTimestamp,
} from 'firebase/firestore'
import { app } from './firebase'

/**
 * Firestore is the heaviest thing Firebase would put in the bundle, and a landing
 * page's visitors mostly read it and leave. So it lives behind this module, which
 * LeadForm reaches for with a dynamic `import()` — prefetched the moment someone
 * starts typing, so it is already in memory by the time they press submit.
 */
const db = getFirestore(app)

// `npm run emulators`, then VITE_USE_FIRESTORE_EMULATOR=true npm run dev, and the
// form writes to the local emulator instead of the live project — which is how to
// test a change to the form or to firestore.rules without leaving junk leads in
// the collection the team actually reads. Guarded on DEV so a stray env var in a
// production build cannot point real submissions at a host that isn't there.
if (import.meta.env.DEV && import.meta.env.VITE_USE_FIRESTORE_EMULATOR === 'true') {
  connectFirestoreEmulator(db, '127.0.0.1', 8080)
  console.info('[firestore] using local emulator at 127.0.0.1:8080')
}

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

/**
 * How long to wait for the server to acknowledge a submission before telling the
 * visitor we could not confirm it.
 *
 * Firestore does not fail when it cannot reach the backend — it queues the write
 * and keeps the promise pending until connectivity returns, which could be
 * minutes or never. Without a deadline the submit button reads "Sending…" forever
 * on a dropped connection, which is the worst of both outcomes: no confirmation,
 * no error, nothing to act on.
 */
export const SUBMIT_CONFIRM_TIMEOUT_MS = 15_000

/** Carries the same `code` shape as a FirestoreError so callers can switch on one field. */
export class SubmitTimeoutError extends Error {
  readonly code = 'timeout'
  constructor() {
    super('Timed out waiting for the server to confirm the write.')
    this.name = 'SubmitTimeoutError'
  }
}

/**
 * Rejects with SubmitTimeoutError if `promise` has not settled within `ms`.
 *
 * The underlying write is deliberately not cancelled — Firestore has no way to
 * unqueue it, and we would not want to: it is the visitor's request, and it
 * should still land when their connection comes back. Callers are expected to
 * keep listening to the original promise and confirm late rather than treating a
 * timeout as a final failure.
 */
export function withSubmitTimeout<T>(promise: Promise<T>, ms = SUBMIT_CONFIRM_TIMEOUT_MS) {
  let timer: ReturnType<typeof setTimeout>
  const deadline = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new SubmitTimeoutError()), ms)
  })
  return Promise.race([promise, deadline]).finally(() => clearTimeout(timer))
}
