/**
 * The Firestore handle and the submit-deadline helpers, shared by every form on
 * the site.
 *
 * Extracted out of lib/leads.ts when the creators page added a second form. The
 * handle has to live in one module and not two: `getFirestore(app)` hands back the
 * same instance to both callers, and `connectFirestoreEmulator` throws on the
 * second call against an instance that is already pointed at the emulator — so two
 * modules each doing their own setup is a crash in development the moment both are
 * loaded.
 *
 * Still not imported statically anywhere. Firestore is the heaviest thing Firebase
 * would put in the bundle, and a landing page's visitors mostly read it and leave,
 * so the form modules that depend on this reach for it with a dynamic `import()`.
 */
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore'
import { app } from './firebase'

export const db = getFirestore(app)

// `npm run emulators`, then VITE_USE_FIRESTORE_EMULATOR=true npm run dev, and the
// forms write to the local emulator instead of the live project — which is how to
// test a change to a form or to firestore.rules without leaving junk in the
// collections the team actually reads. Guarded on DEV so a stray env var in a
// production build cannot point real submissions at a host that isn't there.
if (import.meta.env.DEV && import.meta.env.VITE_USE_FIRESTORE_EMULATOR === 'true') {
  connectFirestoreEmulator(db, '127.0.0.1', 8080)
  console.info('[firestore] using local emulator at 127.0.0.1:8080')
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
