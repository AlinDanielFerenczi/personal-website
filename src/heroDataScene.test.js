import assert from 'node:assert/strict'
import { getDataPhase } from './heroDataScene.js'

assert.equal(getDataPhase(0).name, 'cluster')
assert.equal(getDataPhase(3000).name, 'forming')
assert.equal(getDataPhase(6000).name, 'structure')
assert.equal(getDataPhase(7800).name, 'explode')
assert.equal(getDataPhase(10000).name, 'reset')
assert.equal(getDataPhase(12000).name, 'cluster')
