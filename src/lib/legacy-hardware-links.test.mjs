import test from 'node:test'
import assert from 'node:assert/strict'
import { hardwareDestination } from './legacy-hardware-links.mjs'
test('old investor hardware anchors reach their matching product detail without redirect loops', () => {
  for (const id of ['inside-one', 'kiln-rear', 'one-finishes', 'one-configurations', 'back']) {
    assert.equal(hardwareDestination('/', `#${id}`), `/products/one/#${id}`)
    assert.equal(hardwareDestination('/products/one/', `#${id}`), null)
  }
  for (const hash of ['#hardware', '#local', '#interest', '', '#unknown']) assert.equal(hardwareDestination('/', hash), null)
})
