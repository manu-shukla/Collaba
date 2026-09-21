import { useEffect, useRef, useState } from 'react'
import type { ChangeEvent, ComponentProps, FocusEvent, FormEvent } from 'react'
import { Reveal, SectionScene, TapButton } from './Motion'
import { IconAlert, IconCheckCircle } from './Icons'
import { PLATFORMS } from './PlatformIcons'
import { track } from '../lib/firebase'

/**
 * The creator side of the pilot-request form.
 *
 * Structurally a sibling of LeadForm rather than a generalisation of it. The two
 * share the same validation-on-blur, error-summary and timeout behaviour, and the
 * same CSS, but they ask different questions of different people — and the one
 * abstraction that would cover both (a schema-driven form) would hide exactly the
 * per-field judgement that makes either of them worth filling in. When a change
 * belongs in both, it has to be made twice on purpose.
 */
const loadCreators = () => import('../lib/creators')

const FORM_ID = 'creator_application'

/** No "Not sure yet" escape hatch here, unlike the lead form: a creator knows where they post. */
const PLATFORM_OPTIONS = PLATFORMS.map(({ id, name, Icon }) => ({ value: id, label: name, Icon }))

type FormValues = {
  fullName: string
  city: string
  platforms: string[]
  profileLink: string
  email: string
  mobile: string
  consent: boolean
}

const initialValues: FormValues = {
  fullName: '',
  city: '',
  platforms: [],
  profileLink: '',
  email: '',
  mobile: '',
  consent: false,
}

type Errors = Partial<Record<keyof FormValues, string>>

const FIELD_LABELS: Record<string, string> = {
  fullName: 'Full name',
  city: 'City',
  platforms: 'Where you post',
  profileLink: 'Profile link or handle',
  email: 'Email',
  mobile: 'Mobile number',
  consent: 'Consent',
}

/** GA4-friendly field names: snake_case versions of the camelCase form keys. */
const FIELD_ANALYTICS_NAMES: Record<keyof FormValues, string> = {
  fullName: 'full_name',
  city: 'city',
  platforms: 'platforms',
  profileLink: 'profile_link',
  email: 'email',
  mobile: 'mobile',
  consent: 'consent',
}

function validateField(name: keyof FormValues, values: FormValues): string | undefined {
  const value = values[name]

  switch (name) {
    case 'fullName':
      if (!String(value).trim()) return 'Enter your full name.'
      return undefined
    case 'city':
      if (!String(value).trim()) return 'Enter the city you are based in.'
      return undefined
    case 'platforms':
      if (!Array.isArray(value) || value.length === 0)
        return 'Select at least one platform you post on.'
      return undefined
    case 'profileLink': {
      const raw = String(value).trim()
      if (!raw) return 'Add a link or handle so we can see your work.'
      // Deliberately permissive. A handle (@kettleandco), a bare domain
      // (instagram.com/kettleandco) and a full URL are all answers a person
      // reasonably gives, and rejecting two of the three to get a tidy field
      // turns the one question this form cannot do without into a fight. The
      // only thing ruled out is an answer too short to identify anybody.
      if (raw.length < 3) return 'That looks too short — paste the full link or handle.'
      return undefined
    }
    case 'email': {
      const email = String(value).trim()
      if (!email) return 'Enter an email address so we can reply.'
      // Same permissive shape as the lead form; real normalization belongs server-side.
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return 'Enter a valid email address.'
      return undefined
    }
    case 'mobile': {
      const raw = String(value).trim()
      if (!raw) return 'Enter a mobile number so we can reach you.'
      if (!/^[+\d][\d\s\-()]*$/.test(raw))
        return 'Use only digits, spaces and an optional leading +.'
      // Counted on digits rather than matched against a shape — see the same note
      // in LeadForm. 10 is an Indian mobile without its country code, 15 the
      // E.164 ceiling.
      const digits = raw.replace(/\D/g, '')
      if (digits.length < 10 || digits.length > 15)
        return 'Enter a full number — 10 digits, or with your country code.'
      return undefined
    }
    case 'consent':
      if (!value) return 'We need your agreement before we can review your application.'
      return undefined
    default:
      return undefined
  }
}

/**
 * Validated on submit, in the order they appear on screen — the error summary is
 * built from this array, and a summary ordered differently than the form is a
 * puzzle rather than a guide. Every field on this form is required, so this is all
 * of them.
 */
const REQUIRED_FIELDS: (keyof FormValues)[] = [
  'fullName',
  'city',
  'platforms',
  'profileLink',
  'email',
  'mobile',
  'consent',
]

function scrollBehavior(): ScrollBehavior {
  return typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ? 'auto'
    : 'smooth'
}

/** Same split as the lead form's: what to do next differs by cause. */
function submitErrorMessage(code: string | null) {
  switch (code) {
    case 'timeout':
      return 'Your connection is taking too long to answer, so we cannot confirm this yet. Keep this page open — we are still sending, and this will turn into a confirmation as soon as it goes through.'
    case 'unavailable':
    case 'deadline-exceeded':
      return 'We could not reach our servers — that is usually a patchy connection. Your answers are still here, so press the button again in a moment.'
    case 'permission-denied':
      return 'Something on our end refused the request. Nothing you did wrong, and nothing you can fix by retrying — please try again a little later.'
    default:
      return 'We could not send your application just now. Your answers are still here — please try again.'
  }
}

export function CreatorForm() {
  const [values, setValues] = useState<FormValues>(initialValues)
  const [errors, setErrors] = useState<Errors>({})
  const [touched, setTouched] = useState<Partial<Record<keyof FormValues, boolean>>>({})
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')
  const [submitted, setSubmitted] = useState<{ firstName: string } | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const summaryRef = useRef<HTMLDivElement | null>(null)
  const successRef = useRef<HTMLDivElement | null>(null)
  const failureRef = useRef<HTMLDivElement | null>(null)
  const startedRef = useRef(false)
  /** See LeadForm: lets a late write tell whether it is still the one on screen. */
  const attemptRef = useRef(0)
  const focusedFieldsRef = useRef<Set<keyof FormValues>>(new Set())
  const blurredFieldsRef = useRef<Set<keyof FormValues>>(new Set())

  const fieldHasValue = (field: keyof FormValues, vals: FormValues): boolean => {
    const v = vals[field]
    if (Array.isArray(v)) return v.length > 0
    if (typeof v === 'boolean') return v
    return String(v).trim().length > 0
  }

  const trackFieldFocus = (field: keyof FormValues) => {
    if (focusedFieldsRef.current.has(field)) return
    focusedFieldsRef.current.add(field)
    track('field_focus', { form_id: FORM_ID, field_name: FIELD_ANALYTICS_NAMES[field] })
  }

  const trackFieldBlur = (field: keyof FormValues, vals: FormValues) => {
    if (blurredFieldsRef.current.has(field)) return
    blurredFieldsRef.current.add(field)
    track('field_blur', {
      form_id: FORM_ID,
      field_name: FIELD_ANALYTICS_NAMES[field],
      has_value: fieldHasValue(field, vals),
      is_valid: !validateField(field, vals),
    })
  }

  const markStarted = (field: keyof FormValues) => {
    if (startedRef.current) return
    startedRef.current = true
    track('form_start', { form_id: FORM_ID, first_field: FIELD_ANALYTICS_NAMES[field] })
    // Warm the Firestore chunk while they finish filling the form. A rejection
    // here is not worth surfacing — submit will retry the import and report it.
    void loadCreators().catch(() => {})
  }

  // The form runs several viewport-heights long on a phone, so replacing it with
  // the much shorter confirmation leaves the scroll position stranded in the
  // footer — the creator submits and appears to see nothing happen.
  useEffect(() => {
    const node = successRef.current
    if (status !== 'success' || !node) return
    node.scrollIntoView({ block: 'start', behavior: scrollBehavior() })
    node.focus({ preventScroll: true })
  }, [status])

  useEffect(() => {
    const node = failureRef.current
    if (status !== 'error' || !node) return
    node.scrollIntoView({ block: 'center', behavior: scrollBehavior() })
    node.focus({ preventScroll: true })
  }, [status])

  const showError = (name: keyof FormValues) => (touched[name] ? errors[name] : undefined)

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const target = event.target
    const name = target.name as keyof FormValues
    markStarted(name)
    const next: FormValues = {
      ...values,
      [name]: target.type === 'checkbox' ? target.checked : target.value,
    }
    setValues(next)

    // Re-validate a field that already showed an error so it clears as it is fixed.
    if (touched[name]) {
      setErrors((prev) => ({ ...prev, [name]: validateField(name, next) }))
    }
  }

  const handleFocus = (event: FocusEvent<HTMLInputElement>) => {
    trackFieldFocus(event.target.name as keyof FormValues)
  }

  const handleBlur = (event: FocusEvent<HTMLInputElement>) => {
    const name = event.target.name as keyof FormValues
    trackFieldBlur(name, values)
    setTouched((prev) => ({ ...prev, [name]: true }))
    setErrors((prev) => ({ ...prev, [name]: validateField(name, values) }))
  }

  /** Multi-value, so it bypasses handleChange. Nothing here is exclusive. */
  const togglePlatform = (option: string) => {
    markStarted('platforms')
    const current = values.platforms
    const next = current.includes(option)
      ? current.filter((item) => item !== option)
      : [...current, option]

    const nextValues: FormValues = { ...values, platforms: next }
    setValues(nextValues)
    setTouched((prev) => ({ ...prev, platforms: true }))
    setErrors((prev) => ({ ...prev, platforms: validateField('platforms', nextValues) }))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    track('form_submit', { form_id: FORM_ID, attempt_number: attemptRef.current + 1 })

    const nextErrors: Errors = {}
    REQUIRED_FIELDS.forEach((field) => {
      const message = validateField(field, values)
      if (message) nextErrors[field] = message
    })

    setErrors(nextErrors)
    setTouched(
      REQUIRED_FIELDS.reduce(
        (acc, field) => ({ ...acc, [field]: true }),
        {} as Record<string, boolean>,
      ),
    )

    if (Object.keys(nextErrors).length > 0) {
      track('form_invalid', {
        form_id: FORM_ID,
        // Field names only — never the values someone typed into them.
        fields: Object.keys(nextErrors).join(','),
        error_count: Object.keys(nextErrors).length,
      })
      requestAnimationFrame(() => summaryRef.current?.focus())
      return
    }

    setStatus('sending')
    setSubmitError(null)

    const attempt = ++attemptRef.current

    try {
      const { submitCreator, withSubmitTimeout } = await loadCreators()

      const write = submitCreator(values)

      /** Shows the confirmation, unless a retry or a reset has moved on since. */
      const confirm = (id: string) => {
        if (attemptRef.current !== attempt) return
        // GA4 gives `sign_up` its own reporting treatment, and a creator joining
        // the roster is a sign-up rather than a lead — keeping it off
        // `generate_lead` is what stops the two funnels being read as one number.
        track('sign_up', {
          method: 'creator_form',
          form_id: FORM_ID,
          application_id: id,
          // Categorical, not personal.
          platforms: values.platforms.join(','),
        })
        setSubmitted({ firstName: values.fullName.trim().split(' ')[0] })
        setStatus('success')
      }

      try {
        confirm(await withSubmitTimeout(write))
      } catch (error) {
        // A timeout is not a failure, only an unanswered question — the write is
        // queued. Keep waiting on the original promise so the "we could not
        // confirm this" notice turns into a real confirmation when it lands.
        if (error instanceof Error && error.name === 'SubmitTimeoutError') {
          void write.then(confirm).catch(() => {})
        }
        throw error
      }
    } catch (error) {
      // Values are deliberately left in place so a retry is one tap, not a retype.
      const code =
        typeof error === 'object' && error !== null && 'code' in error
          ? String((error as { code: unknown }).code)
          : 'unknown'

      if (import.meta.env.DEV) console.error('[creator] submit failed', error)
      track('form_error', { form_id: FORM_ID, error_code: code })
      setSubmitError(code)
      setStatus('error')
    }
  }

  /** Jumps from the error summary to the offending control. */
  const focusField = (field: keyof FormValues) => {
    // The platform group is a <fieldset>, which cannot take focus; aim at its
    // first checkbox instead. Every other field's input id is its name.
    const id = field === 'platforms' ? `creator-platform-${PLATFORM_OPTIONS[0].value}` : field
    const node = document.getElementById(id)
    if (!node) return
    node.scrollIntoView({ block: 'center', behavior: scrollBehavior() })
    node.focus({ preventScroll: true })
  }

  const errorList = REQUIRED_FIELDS.filter((field) => errors[field]).map((field) => ({
    field,
    message: errors[field] as string,
  }))

  return (
    <section className="section" id="creator-application">
      {/* No fade-out: the submit button sits where the exit range would start, so
          the form would be dimming at the moment someone commits to it. */}
      <SectionScene className="container" fadeOut={false}>
        <Reveal className="section__head section__head--center">
          <h2 className="h2">Apply to join the creator roster.</h2>
          <p className="lede" style={{ marginTop: 'var(--sp-2)', marginInline: 'auto' }}>
            A few basics about you and where you post. We review every application
            ourselves and reply within two business days.
          </p>
        </Reveal>

        <Reveal className="form-shell">
          {status === 'success' && submitted ? (
            <div className="success" role="status" tabIndex={-1} ref={successRef}>
              <span className="success__badge">
                <IconCheckCircle size={30} />
              </span>
              <h3 className="h3">You&apos;re on the list — thanks, {submitted.firstName}.</h3>
              <p>
                We&apos;ll look through your profile and reply within two business days. When a
                brand brief fits what you make, you hear from us directly — no bidding, no
                auto-blasts.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              {status === 'error' && (
                <div className="alert alert--error" role="alert" tabIndex={-1} ref={failureRef}>
                  <IconAlert />
                  <div>
                    <strong>
                      {submitError === 'timeout'
                        ? 'Still sending your application'
                        : 'Your application did not go through'}
                    </strong>
                    <p>{submitErrorMessage(submitError)}</p>
                  </div>
                </div>
              )}

              {errorList.length > 0 && (
                <div className="alert alert--error" role="alert" tabIndex={-1} ref={summaryRef}>
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

              <div className="field-grid">
                <div className="field-grid field-grid--two">
                  <Field
                    name="fullName"
                    label="Full name"
                    required
                    value={values.fullName}
                    error={showError('fullName')}
                    onChange={handleChange}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    autoComplete="name"
                    autoCapitalize="words"
                    autoCorrect="off"
                    spellCheck={false}
                    enterKeyHint="next"
                  />
                  <Field
                    name="city"
                    label="City"
                    required
                    value={values.city}
                    error={showError('city')}
                    onChange={handleChange}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    placeholder="e.g. Pune"
                    autoComplete="address-level2"
                    autoCapitalize="words"
                    hint="Some briefs are local, so this matters more than you would think."
                    enterKeyHint="next"
                  />
                </div>

                <fieldset
                  className={`checkgroup${showError('platforms') ? ' checkgroup--invalid' : ''}`}
                  aria-describedby={
                    showError('platforms') ? 'platforms-error' : 'platforms-hint'
                  }
                  onFocusCapture={(e) => {
                    // relatedTarget is what just lost focus — if it is inside this
                    // fieldset, focus is only moving between checkboxes and this
                    // is not a new interaction.
                    if (e.relatedTarget instanceof Node && e.currentTarget.contains(e.relatedTarget))
                      return
                    trackFieldFocus('platforms')
                  }}
                  onBlurCapture={(e) => {
                    if (e.relatedTarget instanceof Node && e.currentTarget.contains(e.relatedTarget))
                      return
                    trackFieldBlur('platforms', values)
                  }}
                >
                  <legend className="field__label">
                    Where you post{' '}
                    <span className="field__req" title="Required">
                      *<span className="visually-hidden"> required</span>
                    </span>
                  </legend>

                  <div className="checkgroup__options">
                    {PLATFORM_OPTIONS.map(({ value, label, Icon }) => {
                      const id = `creator-platform-${value}`
                      const checked = values.platforms.includes(value)
                      return (
                        <div className="checkoption" key={value} data-checked={checked}>
                          <input
                            id={id}
                            type="checkbox"
                            name="platforms"
                            value={value}
                            checked={checked}
                            onChange={() => togglePlatform(value)}
                          />
                          <label htmlFor={id}>
                            <Icon size={18} />
                            {label}
                          </label>
                        </div>
                      )
                    })}
                  </div>

                  {showError('platforms') ? (
                    <p className="field__error" id="platforms-error">
                      <IconAlert size={16} /> {showError('platforms')}
                    </p>
                  ) : (
                    <p className="field__hint" id="platforms-hint">
                      Pick every platform you post on regularly.
                    </p>
                  )}
                </fieldset>

                <Field
                  name="profileLink"
                  label="Profile link or handle"
                  required
                  type="url"
                  value={values.profileLink}
                  error={showError('profileLink')}
                  onChange={handleChange}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  placeholder="instagram.com/yourhandle or @yourhandle"
                  hint="Your main account. Paste a link, or just the handle — either is fine."
                  inputMode="url"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  enterKeyHint="next"
                />

                {/* The two reply channels, paired — they answer the same question. */}
                <div className="field-grid field-grid--two">
                  <Field
                    name="email"
                    label="Email"
                    required
                    type="email"
                    value={values.email}
                    error={showError('email')}
                    onChange={handleChange}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    autoComplete="email"
                    placeholder="you@example.com"
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
                    onFocus={handleFocus}
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
                  onFocus={() => trackFieldFocus('consent')}
                  onBlur={(e) => {
                    trackFieldBlur('consent', values)
                    handleBlur(e)
                  }}
                  aria-describedby={showError('consent') ? 'consent-error' : undefined}
                />
                <label htmlFor="consent">
                  <span className="field__req" aria-hidden="true">
                    *
                  </span>{' '}
                  I agree that Collaba.in may use this information to review my application and
                  contact me about brand collaborations.
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
                      ? 'Submit my application'
                      : // Still-sending is not a failure, so it does not ask to
                        // "try again" — pressing this sends a second copy, which
                        // is a reasonable escape hatch but not the first advice.
                        submitError === 'timeout'
                        ? 'Send again'
                        : 'Try again'}
                </TapButton>
                <p className="form-actions__fine">
                  Free to join. No exclusivity, and no fee taken from you.
                </p>
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

function describedBy(name: string, error?: string, hint?: string) {
  const ids = [error ? `${name}-error` : null, hint && !error ? `${name}-hint` : null].filter(
    Boolean,
  )
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
  onFocus,
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
  onFocus?: (e: FocusEvent<HTMLInputElement>) => void
  onBlur: (e: FocusEvent<HTMLInputElement>) => void
  type?: string
  autoComplete?: string
  /* Mobile keyboard hints. Phone browsers pick a layout from these, and iOS
     autocapitalises and autocorrects text inputs by default — which mangles URLs
     and email addresses unless they are turned off per field. */
  inputMode?: ComponentProps<'input'>['inputMode']
  autoCapitalize?: string
  autoCorrect?: string
  spellCheck?: boolean
  enterKeyHint?: ComponentProps<'input'>['enterKeyHint']
}) {
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
      <input
        className="input"
        id={name}
        name={name}
        /* type="url" would make the browser reject "@handle" on its own terms and
           show its own message, which is exactly the rejection validateField is
           written to avoid — so the URL field asks for a url keyboard via
           inputMode and stays a text input. */
        type={type === 'url' ? 'text' : type}
        value={value}
        onChange={onChange}
        onFocus={onFocus}
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
    </div>
  )
}
