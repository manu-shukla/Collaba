/**
 * Writing a creator application to Firestore.
 *
 * The sibling of lib/leads.ts, and deliberately a separate module and a separate
 * collection rather than a `type: 'creator'` field on a lead. The two are read by
 * different people for different reasons — leads are a sales queue, these are a
 * roster — and one collection holding both means every query on either has to
 * remember to filter. It also keeps the creators page from pulling the lead form's
 * chunk, and vice versa.
 *
 * Reuses lib/firestore.ts's timeout helpers rather than restating them; see the
 * notes on `withSubmitTimeout` there for why a pending write is not a failure.
 */
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { db } from './firestore'

/** Firestore collection this form writes to. Also named in firestore.rules. */
export const CREATORS_COLLECTION = 'creators'

export type CreatorInput = {
  fullName: string
  city: string
  platforms: string[]
  profileLink: string
  email: string
  mobile: string
  consent: boolean
}

/**
 * Writes one creator application and returns its document id.
 *
 * Normalised the same way a lead is — trimmed, email lowercased, mobile kept both
 * as typed and as bare digits — so the two collections can be searched with the
 * same habits. `profileLink` is stored as typed: a handle and a URL are both
 * acceptable answers, and guessing which one someone meant (prefixing `https://`,
 * stripping an `@`) is how a working link becomes a broken one.
 *
 * Throws on failure. Callers must surface that.
 */
export async function submitCreator(input: CreatorInput): Promise<string> {
  const mobile = input.mobile.trim()

  const doc = await addDoc(collection(db, CREATORS_COLLECTION), {
    fullName: input.fullName.trim(),
    city: input.city.trim(),
    platforms: input.platforms,
    profileLink: input.profileLink.trim(),
    email: input.email.trim().toLowerCase(),
    mobile,
    mobileDigits: mobile.replace(/\D/g, ''),
    consent: input.consent,

    createdAt: serverTimestamp(),

    source: 'collaba.in-creators',
    pagePath: typeof window === 'undefined' ? null : window.location.pathname,
    referrer: typeof document === 'undefined' ? null : document.referrer || null,
    userAgent: typeof navigator === 'undefined' ? null : navigator.userAgent,

    status: 'new',
  })

  return doc.id
}

export { SUBMIT_CONFIRM_TIMEOUT_MS, SubmitTimeoutError, withSubmitTimeout } from './firestore'
