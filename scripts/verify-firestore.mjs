/**
 * Checks firestore.rules against the lead-write path.
 *
 * Submits the exact document shape src/lib/leads.ts produces and confirms it is
 * accepted, then confirms every write that must not be allowed is refused —
 * reading leads back from the client above all, since that would publish every
 * submitter's name, email and phone number.
 *
 * The rules name no fields, so this script does not check field-level validation
 * either; that lives in the form. See the note at the bottom.
 *
 *   npm run emulators                     # in one terminal
 *   npm run verify:rules                  # emulator on 127.0.0.1:8080
 *   node scripts/verify-firestore.mjs --prod
 *
 * The --prod run writes one lead labelled "TEST — delete me" to the real project
 * and cannot clean up after itself (the rules deny delete, by design). Use it to
 * confirm a rules deployment landed, then delete that lead from the console.
 *
 * Expect "evaluation error at L…" lines from the emulator on the rejected writes.
 * They are noise, not a rules defect: a write carrying serverTimestamp() is
 * evaluated twice, and the first pass cannot read request.resource.data until the
 * transform resolves. The second pass is the one that decides.
 */
import { initializeApp } from 'firebase/app'
import {
  addDoc,
  collection,
  connectFirestoreEmulator,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  serverTimestamp,
  terminate,
} from 'firebase/firestore'

const useProd = process.argv.includes('--prod')

// Repeated from src/lib/firebase.ts rather than imported, because that file is
// TypeScript and this script runs on bare node. Only projectId matters for the
// emulator; the rest is here so --prod addresses the same project the site does.
const app = initializeApp({
  apiKey: 'AIzaSyANtMt__5UMVyQuIqr7TM1cVH5sVBMb4pc',
  authDomain: 'collaba-cfe51.firebaseapp.com',
  projectId: 'collaba-cfe51',
  storageBucket: 'collaba-cfe51.firebasestorage.app',
  messagingSenderId: '670573962434',
  appId: '1:670573962434:web:6ca2f5d4f26b88d98d475b',
  measurementId: 'G-80K3Z37C64',
})

const db = getFirestore(app)
if (!useProd) connectFirestoreEmulator(db, '127.0.0.1', 8080)
console.log(`target: ${useProd ? 'PRODUCTION collaba-cfe51' : 'emulator 127.0.0.1:8080'}\n`)

/** What the form sends for a filled-in, consented submission. */
const validLead = () => ({
  businessName: useProd ? 'TEST — delete me (integration check)' : 'Kettle & Co.',
  preferredPlatforms: ['instagram', 'youtube'],
  fullName: 'Test Submission',
  email: 'test@example.com',
  mobile: '+91 98765 43210',
  mobileDigits: '919876543210',
  consent: true,
  createdAt: serverTimestamp(),
  source: 'collaba.in-landing',
  pagePath: '/',
  referrer: null,
  userAgent: 'verify-firestore.mjs',
  status: 'new',
})

let failures = 0
const leads = collection(db, 'leads')

async function expectAllowed(name, run) {
  try {
    const result = await run()
    console.log(`  PASS  ${name}${result ? ` → ${result}` : ''}`)
    return result
  } catch (error) {
    failures++
    console.log(`  FAIL  ${name} — expected success, got ${error.code ?? error.message}`)
  }
}

async function expectDenied(name, run) {
  try {
    await run()
    failures++
    console.log(`  FAIL  ${name} — expected rejection, write succeeded`)
  } catch (error) {
    if (error.code === 'permission-denied') {
      console.log(`  PASS  ${name} — rejected`)
    } else {
      failures++
      console.log(`  FAIL  ${name} — expected permission-denied, got ${error.code ?? error.message}`)
    }
  }
}

console.log('what the form does:')
const id = await expectAllowed('submit a valid lead', async () => (await addDoc(leads, validLead())).id)

console.log('\nwhat the rules must refuse:')
await expectDenied('read a lead back from the client', () => getDocs(leads))
if (id) {
  await expectDenied('read one lead by id', () => getDoc(doc(db, 'leads', id)))
  // Not attempted against the real project. If the rules are open enough for this
  // to succeed, the check would be deleting a live document to prove a point — and
  // the point is already made by the read above failing.
  if (useProd) {
    console.log('  SKIP  delete a lead — not attempted against production')
  } else {
    await expectDenied('delete a lead', () => deleteDoc(doc(db, 'leads', id)))
  }
}
await expectDenied('write to another collection', () =>
  addDoc(collection(db, 'anythingElse'), { a: 1 }),
)
// The one limit on create. 40 fields is over the 30-field cap; the exact number
// does not matter, only that some ceiling exists.
await expectDenied('stuff a document with far too many fields', () =>
  addDoc(leads, Object.fromEntries(Array.from({ length: 40 }, (_, i) => [`f${i}`, i]))),
)

// Not checked here, because the rules deliberately allow them: a lead with a
// malformed email, no consent, an empty business name, a client-set createdAt or
// unexpected extra fields. Those are all rejected by the form in the browser, and
// the rules stay out of it so that renaming a field never means editing this file
// or firestore.rules. Add checks here only if the rules start validating content
// again.

console.log(failures === 0 ? '\nALL CHECKS PASSED' : `\n${failures} CHECK(S) FAILED`)
if (failures > 0) process.exitCode = 1
await terminate(db)
