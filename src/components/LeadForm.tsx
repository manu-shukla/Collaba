import { useEffect, useRef, useState } from 'react'
import type { ChangeEvent, ComponentProps, FocusEvent, FormEvent } from 'react'
import { Reveal, SectionScene, TapButton } from './Motion'
import { IconAlert, IconCheck, IconCheckCircle } from './Icons'
import { PLATFORMS } from './PlatformIcons'
import { track } from '../lib/firebase'

/**
 * Loads the Firestore write path. Called on first interaction and again on submit;
 * the module registry makes the second call free, so submit never waits on a
 * download that first-keystroke already started.
 */
const loadLeads = () => import('../lib/leads')

const NOT_SURE = 'not_sure'

/** Platform choices, plus an exclusive escape hatch for businesses still deciding. */
const PLATFORM_OPTIONS: { value: string; label: string; Icon?: typeof PLATFORMS[number]['Icon'] }[] = [
  ...PLATFORMS.map(({ id, name, Icon }) => ({ value: id, label: name, Icon })),
  { value: NOT_SURE, label: 'Not sure yet' },
]

/**
 * Five fields plus consent, deliberately.
 *
 * The longer version also asked for a link, an ideal-customer paragraph and a
 * target region. Each one is another reason to abandon a form being filled in on
 * a phone, and each is a question that costs nothing to ask in the reply
 * instead — which is the only thing this form has to earn. Note that
 * product-design.md §G still specifies the longer set; update it to match.
 *
 * `email` rather than `workEmail`: plenty of Indian small businesses run on a
 * personal Gmail address, and a label demanding a *work* address reads as a
 * rejection to exactly the businesses this page is for.
 */
type FormValues = {
  businessName: string
  preferredPlatforms: string[]
  fullName: string
  email: string
  mobile: string
  consent: boolean
}

const initialValues: FormValues = {
  businessName: '',
  preferredPlatforms: [],
  fullName: '',
  email: '',
  mobile: '',
  consent: false,
}

type Errors = Partial<Record<keyof FormValues, string>>

const FIELD_LABELS: Record<string, string> = {
  businessName: 'Business name',
  preferredPlatforms: 'Preferred platforms',
  fullName: 'Full name',
  email: 'Email',
  mobile: 'Mobile number',
  consent: 'Consent',
}

function validateField(name: keyof FormValues, values: FormValues): string | undefined {
  const value = values[name]

  switch (name) {
    case 'businessName':
      if (!String(value).trim()) return 'Enter your business name.'
      return undefined
    case 'preferredPlatforms':
      if (!Array.isArray(value) || value.length === 0)
        return 'Select at least one platform or choose “Not sure yet”.'
      return undefined
    case 'fullName':
      if (!String(value).trim()) return 'Enter your full name.'
      return undefined
    case 'email': {
      const email = String(value).trim()
      if (!email) return 'Enter an email address so we can reply.'
      // Deliberately permissive: real normalization belongs server-side.
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return 'Enter a valid email address.'
      return undefined
    }
    case 'mobile': {
      const raw = String(value).trim()
      if (!raw) return 'Enter a mobile number so we can reach you.'
      // Only the characters people actually use when typing a number. Letters
      // usually mean a note landed in the field ("same as phone").
      if (!/^[+\d][\d\s\-()]*$/.test(raw))
        return 'Use only digits, spaces and an optional leading +.'
      // Counted on digits rather than matched against a shape, because
      // +91 98765 43210, 098765-43210 and 9876543210 are one number typed three
      // ways. 10 is the length of an Indian mobile number without its country
      // code; 15 is the E.164 ceiling, which covers every other country.
      const digits = raw.replace(/\D/g, '')
      if (digits.length < 10 || digits.length > 15)
        return 'Enter a full number — 10 digits, or with your country code.'
      return undefined
    }
    case 'consent':
      if (!value) return 'We need your agreement before we can review your request.'
      return undefined
    default:
      return undefined
  }
}

/**
 * Fields validated on submit, listed in the order they appear on screen — the
 * error summary is built from this array, and a summary that lists problems in a
 * different order than the form presents them is a puzzle rather than a guide.
 */
const REQUIRED_FIELDS: (keyof FormValues)[] = [
  'businessName',
  'preferredPlatforms',
  'fullName',
  'email',
  'mobile',
  'consent',
]

/**
 * `behavior: 'smooth'` passed from JS overrides the CSS `scroll-behavior: auto`
 * that the reduced-motion block sets, so the preference has to be read here too.
 */
function scrollBehavior(): ScrollBehavior {
  return typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ? 'auto'
    : 'smooth'
}

/**
 * What to tell the visitor when the Firestore write fails.
 *
 * Split by cause because the useful next step differs: a network failure is
 * theirs to retry, a rejected write is ours to fix and retrying will not help
 * until we do. The raw code is never shown — it means nothing to a business owner
 * and reads as a crash.
 */
function submitErrorMessage(code: string | null) {
  switch (code) {
    // The write is queued, not lost, and this notice replaces itself with the
    // confirmation if it lands — so the wording must not send someone off to
    // start again, and must not promise it definitely arrived either.
    case 'timeout':
      return 'Your connection is taking too long to answer, so we cannot confirm this yet. Keep this page open — we are still sending, and this will turn into a confirmation as soon as it goes through.'
    case 'unavailable':
    case 'deadline-exceeded':
      return 'We could not reach our servers — that is usually a patchy connection. Your answers are still here, so press the button again in a moment.'
    case 'permission-denied':
      return 'Something on our end refused the request. Nothing you did wrong, and nothing you can fix by retrying — please try again a little later.'
    default:
      return 'We could not send your request just now. Your answers are still here — please try again.'
  }
}

function maskEmail(email: string) {
  const [user = '', domain = ''] = email.split('@')
  const head = user.slice(0, 2)
  return `${head}${'•'.repeat(Math.max(user.length - 2, 2))}@${domain}`
}

export function LeadForm() {
  const [values, setValues] = useState<FormValues>(initialValues)
  const [errors, setErrors] = useState<Errors>({})
  const [touched, setTouched] = useState<Partial<Record<keyof FormValues, boolean>>>({})
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')
  const [submitted, setSubmitted] = useState<{ firstName: string; email: string } | null>(null)
  /** Firestore error code, kept only to choose the wording of the failure message. */
  const [submitError, setSubmitError] = useState<string | null>(null)
  const summaryRef = useRef<HTMLDivElement | null>(null)
  const successRef = useRef<HTMLDivElement | null>(null)
  const failureRef = useRef<HTMLDivElement | null>(null)
  // One `form_start` per visit, not one per keystroke. A ref rather than state
  // because nothing on screen depends on it and a re-render would be wasted.
  const startedRef = useRef(false)
  /**
   * Counts submit attempts, so a write that lands after we stopped waiting for it
   * can tell whether it is still the one the visitor is looking at — or whether
   * they have since retried or started a fresh request, in which case its late
   * confirmation would be describing a submission that is no longer on screen.
   */
  const attemptRef = useRef(0)

  const markStarted = (field: keyof FormValues) => {
    if (startedRef.current) return
    startedRef.current = true
    track('form_start', { form_id: 'pilot_request', first_field: field })
    // Warm the Firestore chunk while they finish filling the form. A rejection
    // here is not worth surfacing — submit will retry the import and report it.
    void loadLeads().catch(() => {})
  }

  // On a phone the form runs several viewport-heights long, so replacing it with
  // the much shorter confirmation leaves the browser's scroll position stranded
  // down in the FAQ or footer — the user submits and appears to see nothing
  // happen. Pull the confirmation into view and put focus on it.
  useEffect(() => {
    const node = successRef.current
    if (status !== 'success' || !node) return
    node.scrollIntoView({ block: 'start', behavior: scrollBehavior() })
    node.focus({ preventScroll: true })
  }, [status])

  // Same problem as the confirmation, one screen earlier: the failure notice sits
  // at the top of a form that is taller than a phone, and the submit button the
  // visitor just pressed is at the bottom of it.
  useEffect(() => {
    const node = failureRef.current
    if (status !== 'error' || !node) return
    node.scrollIntoView({ block: 'center', behavior: scrollBehavior() })
    node.focus({ preventScroll: true })
  }, [status])

  const showError = (name: keyof FormValues) => (touched[name] ? errors[name] : undefined)

  // Inputs only — the textarea went with the ideal-customer field, so the union
  // and the instanceof narrowing it forced are both gone.
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const target = event.target
    const name = target.name as keyof FormValues
    markStarted(name)
    const next: FormValues = {
      ...values,
      [name]: target.type === 'checkbox' ? target.checked : target.value,
    }
    setValues(next)

    // Re-validate a field that already showed an error so the message clears as it is fixed.
    if (touched[name]) {
      setErrors((prev) => ({ ...prev, [name]: validateField(name, next) }))
    }
  }

  const handleBlur = (event: FocusEvent<HTMLInputElement>) => {
    const name = event.target.name as keyof FormValues
    setTouched((prev) => ({ ...prev, [name]: true }))
    setErrors((prev) => ({ ...prev, [name]: validateField(name, values) }))
  }

  // Checkboxes are multi-value and "Not sure yet" is exclusive, so they bypass handleChange.
  const togglePlatform = (option: string) => {
    markStarted('preferredPlatforms')
    const current = values.preferredPlatforms
    let next: string[]

    if (option === NOT_SURE) {
      next = current.includes(NOT_SURE) ? [] : [NOT_SURE]
    } else if (current.includes(option)) {
      next = current.filter((item) => item !== option)
    } else {
      next = [...current.filter((item) => item !== NOT_SURE), option]
    }

    const nextValues: FormValues = { ...values, preferredPlatforms: next }
    setValues(nextValues)
    setTouched((prev) => ({ ...prev, preferredPlatforms: true }))
    setErrors((prev) => ({ ...prev, preferredPlatforms: validateField('preferredPlatforms', nextValues) }))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const nextErrors: Errors = {}
    REQUIRED_FIELDS.forEach((field) => {
      const message = validateField(field, values)
      if (message) nextErrors[field] = message
    })

    setErrors(nextErrors)
    setTouched(
      REQUIRED_FIELDS.reduce((acc, field) => ({ ...acc, [field]: true }), {} as Record<string, boolean>),
    )

    if (Object.keys(nextErrors).length > 0) {
      track('form_invalid', {
        form_id: 'pilot_request',
        // Field names only — never the values someone typed into them.
        fields: Object.keys(nextErrors).join(','),
        error_count: Object.keys(nextErrors).length,
      })
      // Move focus to the error summary so keyboard and screen-reader users hear it.
      requestAnimationFrame(() => summaryRef.current?.focus())
      return
    }

    setStatus('sending')
    setSubmitError(null)

    const attempt = ++attemptRef.current

    try {
      const { submitLead, withSubmitTimeout } = await loadLeads()

      const write = submitLead(values)

      /** Shows the confirmation, unless a retry or a reset has moved on since. */
      const confirm = (id: string) => {
        if (attemptRef.current !== attempt) return
        track('generate_lead', {
          form_id: 'pilot_request',
          lead_id: id,
          // Categorical, not personal: which platforms were asked for and how many.
          platforms: values.preferredPlatforms.join(','),
          platform_count: values.preferredPlatforms.length,
        })
        setSubmitted({ firstName: values.fullName.trim().split(' ')[0], email: values.email.trim() })
        setStatus('success')
      }

      try {
        confirm(await withSubmitTimeout(write))
      } catch (error) {
        // A timeout is not a failure, only an unanswered question: Firestore has
        // the write queued and will flush it when the connection returns. Keep
        // waiting on the original promise so the "we could not confirm this"
        // notice turns into a real confirmation the moment it lands.
        if (error instanceof Error && error.name === 'SubmitTimeoutError') {
          void write.then(confirm).catch(() => {})
        }
        throw error
      }
    } catch (error) {
      // Values are deliberately left in place: the write failed, so the visitor
      // needs to be able to retry without typing everything a second time.
      const code =
        typeof error === 'object' && error !== null && 'code' in error
          ? String((error as { code: unknown }).code)
          : 'unknown'

      if (import.meta.env.DEV) console.error('[lead] submit failed', error)
      track('form_error', { form_id: 'pilot_request', error_code: code })
      setSubmitError(code)
      setStatus('error')
    }
  }

  /**
   * Jumps from the error summary to the offending control. The form is long
   * enough on a phone that naming the field is not much help on its own — the
   * visitor still has to hunt for it.
   */
  const focusField = (field: keyof FormValues) => {
    // The platform group is a <fieldset>, which cannot take focus; aim at its
    // first checkbox instead. Every other field's input id is its name.
    const id = field === 'preferredPlatforms' ? `platform-${PLATFORM_OPTIONS[0].value}` : field
    const node = document.getElementById(id)
    if (!node) return
    node.scrollIntoView({ block: 'center', behavior: scrollBehavior() })
    node.focus({ preventScroll: true })
  }

  const resetForm = () => {
    setValues(initialValues)
    setErrors({})
    setTouched({})
    setSubmitted(null)
    setSubmitError(null)
    setStatus('idle')
    startedRef.current = false
  }

  const errorList = REQUIRED_FIELDS.filter((field) => errors[field]).map((field) => ({
    field,
    message: errors[field] as string,
  }))

  return (
    <section className="section" id="pilot-request">
      {/* No fade-out: the submit button sits at the bottom of this section, which
          is exactly where the exit range starts, so the form would be dimming and
          drifting at the moment someone commits to it. */}
      <SectionScene className="container" fadeOut={false}>
        <Reveal className="section__head section__head--center">
          <h2 className="h2">Tell us what you want to grow.</h2>
          <p className="lede" style={{ marginTop: 'var(--sp-2)', marginInline: 'auto' }}>
            Give us the basics. We will review the fit and contact you personally within one business
            day.
          </p>
        </Reveal>

        <Reveal className="form-shell">
          {status === 'success' && submitted ? (
            <div className="success" role="status" tabIndex={-1} ref={successRef}>
              <span className="success__badge">
                <IconCheckCircle size={30} />
              </span>
              <h3 className="h3">You&apos;re in — thanks, {submitted.firstName}.</h3>
              <p>
                We&apos;ll review your request and reply within one business day. A copy has been
                sent to{' '}
                {/* The mask is one unbreakable token (ma••••••••@yourbusiness.com) and
                    pushed the card wider than a 320px screen without this. */}
                <span className="breakable">{maskEmail(submitted.email)}</span>.
              </p>

              <ul className="success__next">
                <li>
                  <IconCheck /> We read your brief and check creator-audience fit in your category.
                </li>
                <li>
                  <IconCheck /> You get a short reply with a suggested pilot direction.
                </li>
                <li>
                  <IconCheck /> Nothing starts until you approve the scope in writing.
                </li>
              </ul>

              <div className="success__actions">
                <button type="button" className="link-quiet" onClick={resetForm}>
                  Submit another business
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              {status === 'error' && (
                <div className="alert alert--error" role="alert" tabIndex={-1} ref={failureRef}>
                  <IconAlert />
                  <div>
                    <strong>
                      {submitError === 'timeout'
                        ? 'Still sending your request'
                        : 'Your request did not go through'}
                    </strong>
                    <p>{submitErrorMessage(submitError)}</p>
                  </div>
                </div>
              )}

              {errorList.length > 0 && (
                <div
                  className="alert alert--error"
                  role="alert"
                  tabIndex={-1}
                  ref={summaryRef}
                >
                  <IconAlert />
                  <div>
                    <strong>
                      {errorList.length === 1
                        ? 'One field needs attention'
                        : `${errorList.length} fields need attention`}
                    </strong>
                    <ul>
                      {errorList.map((item) => (
                        <li key={item.field}>
                          <button
                            type="button"
                            className="alert__jump"
                            onClick={() => focusField(item.field)}
                          >
                            {FIELD_LABELS[item.field]}
                          </button>
                          : {item.message}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* No group legends. With four fields there is nothing left to
                  group, and "Your business / Your campaign / How to reach you"
                  standing over one field each made a short form read as a long
                  one — which is the whole problem this shape exists to avoid. */}
              <div className="field-grid">
                <Field
                  name="businessName"
                  label="Business name"
                  required
                  value={values.businessName}
                  error={showError('businessName')}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="e.g. Kettle & Co."
                  autoComplete="organization"
                  autoCapitalize="words"
                  enterKeyHint="next"
                />

                <fieldset
                  className={`checkgroup${showError('preferredPlatforms') ? ' checkgroup--invalid' : ''}`}
                  aria-describedby={
                    showError('preferredPlatforms')
                      ? 'preferredPlatforms-error'
                      : 'preferredPlatforms-hint'
                  }
                >
                  <legend className="field__label">
                    Preferred platforms{' '}
                    <span className="field__req" title="Required">
                      *<span className="visually-hidden"> required</span>
                    </span>
                  </legend>

                  <div className="checkgroup__options">
                    {PLATFORM_OPTIONS.map(({ value, label, Icon }) => {
                      const id = `platform-${value}`
                      const checked = values.preferredPlatforms.includes(value)
                      return (
                        <div className="checkoption" key={value} data-checked={checked}>
                          <input
                            id={id}
                            type="checkbox"
                            name="preferredPlatforms"
                            value={value}
                            checked={checked}
                            onChange={() => togglePlatform(value)}
                          />
                          <label htmlFor={id}>
                            {Icon ? <Icon size={18} /> : null}
                            {label}
                          </label>
                        </div>
                      )
                    })}
                  </div>

                  {showError('preferredPlatforms') ? (
                    <p className="field__error" id="preferredPlatforms-error">
                      <IconAlert size={16} /> {showError('preferredPlatforms')}
                    </p>
                  ) : (
                    <p className="field__hint" id="preferredPlatforms-hint">
                      Pick as many as apply. If you are unsure, choose “Not sure yet” and we will
                      recommend one.
                    </p>
                  )}
                </fieldset>

                <Field
                  name="fullName"
                  label="Full name"
                  required
                  value={values.fullName}
                  error={showError('fullName')}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  autoComplete="name"
                  autoCapitalize="words"
                  autoCorrect="off"
                  spellCheck={false}
                  enterKeyHint="next"
                />

                {/* The two reply channels, paired — they answer the same question
                    and collapse to one column on a phone anyway. */}
                <div className="field-grid field-grid--two">
                  <Field
                    name="email"
                    label="Email"
                    required
                    type="email"
                    value={values.email}
                    error={showError('email')}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    autoComplete="email"
                    placeholder="you@yourbusiness.com"
                    inputMode="email"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    enterKeyHint="next"
                  />
                  <Field
                    name="mobile"
                    label="Mobile number"
                    required
                    type="tel"
                    value={values.mobile}
                    error={showError('mobile')}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    autoComplete="tel"
                    placeholder="98765 43210"
                    hint="Usually the fastest way to reach you."
                    /* type="tel" alone gives Android a keypad but not iOS, which
                       needs inputMode. "tel" rather than "numeric" so the leading
                       + for a country code is reachable. */
                    inputMode="tel"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    /* Last text input in the form — only the consent checkbox and
                       the submit button follow, and neither takes typing, so
                       "next" would be a lie. */
                    enterKeyHint="done"
                  />
                </div>
              </div>

              <div className={`consent${showError('consent') ? ' consent--invalid' : ''}`}>
                <input
                  id="consent"
                  name="consent"
                  type="checkbox"
                  checked={values.consent}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  aria-describedby={showError('consent') ? 'consent-error' : undefined}
                />
                <label htmlFor="consent">
                  <span className="field__req" aria-hidden="true">
                    *
                  </span>{' '}
                  {/* The Privacy Notice link was dropped with the footer links — restore it here
                      once a real privacy page exists. */}
                  I agree that Collaba.in may use this information to evaluate my request and
                  contact me about this service.
                </label>
              </div>
              {showError('consent') && (
                <p className="field__error" id="consent-error" style={{ marginTop: 'var(--sp-1)' }}>
                  <IconAlert size={16} /> {showError('consent')}
                </p>
              )}

              <div className="form-actions">
                <TapButton
                  type="submit"
                  className="btn btn--primary btn--block"
                  disabled={status === 'sending'}
                >
                  {status === 'sending'
                    ? 'Sending…'
                    : status !== 'error'
                      ? 'Request my free pilot'
                      : // Still-sending is not a failure, so it does not ask to
                        // "try again" — pressing this sends a second copy, which
                        // is a reasonable escape hatch but not the first advice.
                        submitError === 'timeout'
                        ? 'Send again'
                        : 'Try again'}
                </TapButton>
                <p className="form-actions__fine">No payment details. No marketing spam.</p>
              </div>
            </form>
          )}
        </Reveal>
      </SectionScene>
    </section>
  )
}

/* ---------------------------------------------------------------- fields */

type CommonFieldProps = {
  name: keyof FormValues
  label: string
  required?: boolean
  error?: string
  hint?: string
  placeholder?: string
}

function FieldFrame({
  name,
  label,
  required,
  error,
  hint,
  children,
  trailing,
}: CommonFieldProps & { children: React.ReactNode; trailing?: React.ReactNode }) {
  return (
    <div className={`field${error ? ' field--invalid' : ''}`}>
      <label className="field__label" htmlFor={name}>
        {label}{' '}
        {required ? (
          <span className="field__req" title="Required">
            *<span className="visually-hidden"> required</span>
          </span>
        ) : (
          <span className="field__optional">(optional)</span>
        )}
      </label>
      {children}
      {hint && !error && (
        <p className="field__hint" id={`${name}-hint`}>
          {hint}
        </p>
      )}
      {error && (
        <p className="field__error" id={`${name}-error`}>
          <IconAlert size={16} /> {error}
        </p>
      )}
      {trailing}
    </div>
  )
}

function describedBy(name: string, error?: string, hint?: string) {
  const ids = [error ? `${name}-error` : null, hint && !error ? `${name}-hint` : null].filter(Boolean)
  return ids.length ? ids.join(' ') : undefined
}

function Field({
  name,
  label,
  required,
  error,
  hint,
  placeholder,
  value,
  onChange,
  onBlur,
  type = 'text',
  autoComplete,
  inputMode,
  autoCapitalize,
  autoCorrect,
  spellCheck,
  enterKeyHint,
}: CommonFieldProps & {
  value: string
  onChange: (e: ChangeEvent<HTMLInputElement>) => void
  onBlur: (e: FocusEvent<HTMLInputElement>) => void
  type?: string
  autoComplete?: string
  /* Mobile keyboard hints. Phone browsers pick a keyboard layout from these, and
     iOS autocapitalises and autocorrects text inputs by default — which mangles
     URLs and email addresses unless they are turned off per field. */
  inputMode?: ComponentProps<'input'>['inputMode']
  autoCapitalize?: string
  autoCorrect?: string
  spellCheck?: boolean
  enterKeyHint?: ComponentProps<'input'>['enterKeyHint']
}) {
  return (
    <FieldFrame name={name} label={label} required={required} error={error} hint={hint}>
      <input
        className="input"
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        autoComplete={autoComplete}
        inputMode={inputMode}
        autoCapitalize={autoCapitalize}
        autoCorrect={autoCorrect}
        spellCheck={spellCheck}
        enterKeyHint={enterKeyHint}
        aria-required={required || undefined}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(name, error, hint)}
      />
    </FieldFrame>
  )
}
