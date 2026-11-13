import test from 'node:test'
import assert from 'node:assert/strict'
import { bindInterestForm, signupEndpoint } from './interest-form.mjs'

function fixture() {
  const fields = {
    '[name=email]': { value: ' studio@example.com ', disabled: false },
    '[name=product]': { value: 'Investing in Kiln', disabled: false },
    '[name=company_updates]': { checked: false, disabled: false },
    '[type=submit]': { textContent: 'Register interest ↗', disabled: false },
    '#form-status': { hidden: true, dataset: {}, scrollIntoView() {} },
  }
  const form = new EventTarget()
  form.querySelector = selector => fields[selector]
  form.reportValidity = () => true
  form.setAttribute = () => {}
  const submit = () => form.dispatchEvent(new Event('submit', { cancelable: true }))
  return { form, fields, submit }
}
const tick = () => new Promise(resolve => setImmediate(resolve))

test('sends the selected interest and explicit update preference once, then clears email on success', async () => {
  const { form, fields, submit } = fixture()
  let finish, calls = []
  const dispose = bindInterestForm(form, { fetchImpl: (url, options) => {
    calls.push({ url, options })
    return new Promise(resolve => { finish = resolve })
  } })
  submit(); submit()
  assert.equal(calls.length, 1)
  assert.equal(calls[0].url, signupEndpoint)
  assert.deepEqual(JSON.parse(calls[0].options.body), { email: 'studio@example.com', product: 'Investing in Kiln', company_updates: 'no' })
  assert.equal(fields['[type=submit]'].disabled, true)
  finish({ ok: true }); await tick()
  assert.equal(fields['[name=email]'].value, '')
  assert.equal(fields['#form-status'].dataset.state, 'success')
  assert.equal(fields['[type=submit]'].disabled, false)
  dispose()
})

for (const failure of ['rejected', 'network', 'timeout']) {
  test(`${failure} keeps email for retry and never reports success`, async () => {
    const { form, fields, submit } = fixture()
    const dispose = bindInterestForm(form, { timeoutMs: 5, fetchImpl: (_url, options) => {
      if (failure === 'rejected') return Promise.resolve({ ok: false })
      if (failure === 'network') return Promise.reject(new Error('offline'))
      return new Promise((_resolve, reject) => options.signal.addEventListener('abort', () => reject(new Error('timeout'))))
    } })
    submit()
    await new Promise(resolve => setTimeout(resolve, 15))
    assert.equal(fields['#form-status'].dataset.state, 'error')
    assert.equal(fields['[name=email]'].value, ' studio@example.com ')
    assert.equal(fields['[type=submit]'].disabled, false)
    dispose()
  })
}

test('unmount aborts a pending request and removes the submit handler', async () => {
  const { form, submit } = fixture()
  let signal, calls = 0
  const dispose = bindInterestForm(form, { fetchImpl: (_url, options) => {
    calls++; signal = options.signal
    return new Promise((_resolve, reject) => signal.addEventListener('abort', () => reject(new Error('aborted'))))
  } })
  submit(); dispose(); submit(); await tick()
  assert.equal(signal.aborted, true)
  assert.equal(calls, 1)
})
