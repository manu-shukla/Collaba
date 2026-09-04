/**
 * Firebase app, Firestore and Analytics for the landing page.
 *
 * The config below is not a secret. Every Firebase web app ships these values in
 * its JS bundle by design — the API key identifies the project, it does not
 * authorise anything. What actually protects the data is the Firestore security
 * rules (see firestore.rules at the repo root), which allow creating a lead and
 * nothing else. Treat that file, not this one, as the security boundary.
 */
import { initializeApp } from 'firebase/app'
import type { FirebaseApp } from 'firebase/app'
import type { Analytics } from 'firebase/analytics'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
}

export const app: FirebaseApp = initializeApp(firebaseConfig)

/* -------------------------------------------------------------- analytics */

/**
 * Analytics is off on localhost by default: a dev server reloading forty times an
 * afternoon would otherwise sit in the same GA4 property as real visitors and
 * quietly skew every number on the page. Set VITE_ANALYTICS_IN_DEV=true in a
 * .env.local to opt in while testing the wiring itself.
 */
const analyticsEnabled = import.meta.env.PROD || import.meta.env.VITE_ANALYTICS_IN_DEV === 'true'

/**
 * Resolves to the Analytics instance, or null when it is disabled or the browser
 * cannot support it (no cookies, no IndexedDB, SSR, some in-app webviews).
 *
 * Loaded with a dynamic import so the measurement bundle is fetched after the
 * page's own JS rather than competing with the first paint, and is never fetched
 * at all in development.
 */
let analyticsPromise: Promise<Analytics | null> | null = null

function loadAnalytics(): Promise<Analytics | null> {
  if (analyticsPromise) return analyticsPromise

  analyticsPromise = (async () => {
    if (!analyticsEnabled || typeof window === 'undefined') return null
    try {
      const { getAnalytics, isSupported } = await import('firebase/analytics')
      if (!(await isSupported())) return null
      return getAnalytics(app)
    } catch (error) {
      // Ad and tracking blockers make this throw for a good share of visitors.
      // Analytics failing must never take a page — or a lead — down with it.
      if (import.meta.env.DEV) console.warn('[analytics] unavailable', error)
      return null
    }
  })()

  return analyticsPromise
}

/** Starts the Analytics load (and the automatic page_view) without blocking. */
export function initAnalytics() {
  void loadAnalytics()
}

/**
 * Fire-and-forget GA4 event. Never throws and never rejects, so call sites can
 * treat it as a statement rather than something to wrap in try/catch.
 *
 * Event names must be snake_case and under 40 characters; GA4 silently drops
 * anything else. `generate_lead` and `sign_up` are recommended names that get
 * their own reporting treatment — prefer those over inventing a synonym.
 */
export function track(event: string, params?: Record<string, unknown>) {
  void loadAnalytics()
    .then((analytics) => {
      if (!analytics) {
        if (import.meta.env.DEV) console.debug('[analytics] (disabled)', event, params ?? {})
        return
      }
      // Imported here rather than at module scope: pulling logEvent in statically
      // would defeat the dynamic import above and load the bundle anyway.
      return import('firebase/analytics').then(({ logEvent }) => {
        logEvent(analytics, event, params)
      })
    })
    .catch((error) => {
      if (import.meta.env.DEV) console.warn('[analytics] event failed', event, error)
    })
}
