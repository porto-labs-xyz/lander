// Preserve the production signup endpoint. No email is saved in browser storage.
export const signupEndpoint = 'https://formspree.io/f/xjgepgbg'

export function bindInterestForm(form, { fetchImpl = globalThis.fetch, timeoutMs = 15000 } = {}) {
  const email = form.querySelector('[name=email]')
  const product = form.querySelector('[name=product]')
  const updates = form.querySelector('[name=company_updates]')
  const button = form.querySelector('[type=submit]')
  const status = form.querySelector('#form-status')
  const controls = [email, product, updates, button]
  const label = button.textContent
  let pending = false, disposed = false, controller, timer

  async function submit(event) {
    event.preventDefault()
    if (pending || !form.reportValidity()) return
    pending = true
    controller = new AbortController()
    const payload = { email: email.value.trim(), product: product.value, company_updates: updates.checked ? 'yes' : 'no' }
    form.setAttribute('aria-busy', 'true')
    controls.forEach(control => { control.disabled = true })
    button.textContent = 'Sending…'
    status.hidden = true
    timer = setTimeout(() => controller.abort(), timeoutMs)
    try {
      const response = await fetchImpl(signupEndpoint, {
        method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload), signal: controller.signal,
      })
      if (!response.ok) throw new Error('Submission failed')
      if (disposed) return
      email.value = ''
      updates.checked = false
      status.dataset.state = 'success'
      status.textContent = 'Thanks. Your interest has been registered. We’ll be in touch.'
    } catch {
      if (disposed) return
      status.dataset.state = 'error'
      status.textContent = 'We couldn’t confirm your registration. Please try again or email richard@portolabs.xyz.'
    } finally {
      clearTimeout(timer)
      pending = false
      if (!disposed) {
        form.setAttribute('aria-busy', 'false')
        controls.forEach(control => { control.disabled = false })
        button.textContent = label
        status.hidden = false
        status.scrollIntoView({ block: 'nearest' })
      }
    }
  }
  form.addEventListener('submit', submit)
  return () => {
    disposed = true
    clearTimeout(timer)
    controller?.abort()
    form.removeEventListener('submit', submit)
  }
}
