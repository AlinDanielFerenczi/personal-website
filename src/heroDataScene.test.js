import assert from 'node:assert/strict'
import { getFunnelPoint, getJourneyState, getTrunkPoint } from './heroDataScene.js'

const sectionTops = [0, 1000, 4000, 6000, 8000, 10000]
const viewportHeight = 1000
assert.deepEqual(getJourneyState(0, sectionTops, viewportHeight), { scene: 0, next: 1, local: 0, transition: 0 })
assert.equal(getJourneyState(400, sectionTops, viewportHeight).scene, 0)
assert.ok(getJourneyState(400, sectionTops, viewportHeight).transition > 0)
assert.equal(getJourneyState(1001, sectionTops, viewportHeight).scene, 1)
assert.equal(getJourneyState(3000, sectionTops, viewportHeight).transition, 0)
assert.equal(getJourneyState(3500, sectionTops, viewportHeight).next, 2)
assert.equal(getJourneyState(5001, sectionTops, viewportHeight).scene, 2)
assert.deepEqual(getJourneyState(12000, sectionTops, viewportHeight), { scene: 5, next: 5, local: 0, transition: 0 })

for (let index = 0; index < 80; index += 1) {
  const point = getFunnelPoint(index)
  const halfWidth = 0.19 * (1 - point.progress) ** 1.6
  assert.ok(Math.abs(point.x - 0.55) <= halfWidth + Number.EPSILON)
}

assert.equal(getTrunkPoint(80).x, 0.7)
assert.ok(getTrunkPoint(96).x > 0.75)
assert.ok(Math.abs(getTrunkPoint(111).x - 0.7) < Number.EPSILON * 2)
