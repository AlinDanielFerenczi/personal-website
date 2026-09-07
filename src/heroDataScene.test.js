import assert from 'node:assert/strict'
import { getDataPhase, getFunnelPoint, getTrunkPoint } from './heroDataScene.js'

assert.equal(getDataPhase(0).name, 'cluster')
assert.equal(getDataPhase(3000).name, 'forming')
assert.equal(getDataPhase(6000).name, 'structure')
assert.equal(getDataPhase(7800).name, 'collapse')
assert.ok(getDataPhase(8450).amount < 0.15)
assert.ok(getDataPhase(9450).amount > 0.7)
assert.equal(getDataPhase(10000).name, 'singularity')
assert.equal(getDataPhase(10900).name, 'explode')
assert.ok(getDataPhase(10800).amount > 0.5)
assert.equal(getDataPhase(12000).name, 'reset')
assert.equal(getDataPhase(15100).name, 'cluster')

for (let index = 0; index < 80; index += 1) {
  const point = getFunnelPoint(index)
  const halfWidth = 0.19 * (1 - point.progress) ** 1.6
  assert.ok(Math.abs(point.x - 0.55) <= halfWidth + Number.EPSILON)
}

assert.equal(getTrunkPoint(80).x, 0.7)
assert.ok(getTrunkPoint(96).x > 0.75)
assert.ok(Math.abs(getTrunkPoint(111).x - 0.7) < Number.EPSILON * 2)
