import { describe, it, expect } from 'vitest'
import { makeYearScale, centerYear, visibleYearRange } from '../yearScale.js'

const scale = makeYearScale({ domain: [-3000, 2000], range: [0, 1000] })

describe('makeYearScale', () => {
  it('maps domain endpoints to range endpoints', () => {
    expect(scale(-3000)).toBe(0)
    expect(scale(2000)).toBe(1000)
  })
  it('inverts', () => {
    expect(scale.invert(500)).toBe(-500)
  })
})

describe('centerYear', () => {
  it('returns scale-inverted center given identity transform', () => {
    const transform = { k: 1, x: 0 }
    const width = 1000
    expect(centerYear(scale, transform, width)).toBe(-500)
  })
  it('shifts with translation', () => {
    const transform = { k: 1, x: -200 }
    const width = 1000
    expect(centerYear(scale, transform, width)).toBe(500)
  })
  it('zooms tighter at higher k', () => {
    const transform = { k: 5, x: 0 }
    const width = 1000
    expect(centerYear(scale, transform, width)).toBe(scale.invert(100))
  })
})

describe('visibleYearRange', () => {
  it('returns [start, end] years inside viewport', () => {
    const transform = { k: 1, x: 0 }
    const [a, b] = visibleYearRange(scale, transform, 1000)
    expect(a).toBe(-3000)
    expect(b).toBe(2000)
  })
})
