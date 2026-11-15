export const signupEndpoint = 'https://formspree.io/f/xjgepgbg'
export const consentText = 'Email me Kiln product and launch updates. I can unsubscribe at any time.'

export function enquiryPayload(kind, fields) {
  if (!['interest', 'contact'].includes(kind)) throw new Error('Please choose a valid enquiry type.')
  if (fields.website) throw new Error('We could not accept this submission.')
  if (kind === 'interest' && fields.consent !== 'on') throw new Error('Please confirm you would like product and launch updates.')
  return {
    email: String(fields.email || '').trim(),
    kind,
    product: fields.product || 'Still exploring',
    ...(kind === 'contact' ? { organisation: fields.organisation || '', reason: fields.reason || '', message: fields.message || '' } : {}),
    company_updates: kind === 'interest' ? 'yes' : 'no',
    consent_text: kind === 'interest' ? consentText : '',
    privacy_version: '2026-11-14',
    _subject: kind === 'interest' ? 'Kiln: new registration' : `Kiln enquiry: ${fields.reason || 'General question'}`,
  }
}

export function bindEnquiryForm(form, { fetchImpl = globalThis.fetch, timeoutMs = 15000, readFields = () => Object.fromEntries(new FormData(form)) } = {}) {
  let pending = false, disposed = false, controller, timer
  const button = form.querySelector('[type=submit]')
  const label = button.querySelector?.('[data-submit-label]')
  const error = form.querySelector('.form-error')
  const status = form.closest('dialog').querySelector('.form-status')
  const controls = [...form.querySelectorAll('input,select,textarea,button')]
  async function submit(event) {
    event.preventDefault()
    if (pending || !form.reportValidity()) return
    error.hidden = true
    let payload
    try { payload = enquiryPayload(form.dataset.enquiryKind, readFields()) }
    catch (failure) { error.textContent = failure.message; error.hidden = false; return }
    pending = true
    controller = new AbortController()
    timer = setTimeout(() => controller.abort(), timeoutMs)
    controls.forEach(control => { control.disabled = true })
    form.setAttribute('aria-busy', 'true')
    if (label) label.textContent = 'Sending…'
    try {
      const response = await fetchImpl(signupEndpoint, {
        method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload), signal: controller.signal,
      })
      const result = await response.json().catch(() => null)
      if (!response.ok || !result || result.errors?.length) throw new Error('We couldn’t confirm your submission. Please try again or email richard@portolabs.xyz.')
      if (disposed) return
      form.reset(); form.hidden = true; status.hidden = false
      status.querySelector('.dialog-done').focus()
    } catch (failure) {
      if (disposed) return
      error.textContent = failure.name === 'AbortError' ? 'The connection took too long. Your details are still here. Please try again.' : 'We couldn’t confirm your submission. Your details are still here. Please retry or email richard@portolabs.xyz.'
      error.hidden = false
    } finally {
      clearTimeout(timer); pending = false
      if (!disposed) { controls.forEach(control => { control.disabled = false }); form.removeAttribute('aria-busy'); if (label) label.textContent = 'Send message' }
    }
  }
  form.addEventListener('submit', submit)
  return () => { disposed = true; clearTimeout(timer); controller?.abort(); form.removeEventListener('submit', submit) }
}
