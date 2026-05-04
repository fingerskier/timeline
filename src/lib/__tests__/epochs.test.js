import { describe, it, expect } from 'vitest'
import { EPOCHS, epochOf } from '../epochs.js'

describe('EPOCHS', () => {
  it('exposes 4 named epochs in order', () => {
    expect(EPOCHS.map((e) => e.name)).toEqual([
      'Prehistoric',
      'Ancient',
      'Medieval',
      'Modern',
    ])
  })
  it('each epoch has start, end, and color', () => {
    for (const e of EPOCHS) {
      expect(typeof e.start).toBe('number')
      expect(typeof e.end).toBe('number')
      expect(typeof e.color).toBe('string')
    }
  })
})

describe('epochOf', () => {
  it.each([
    [-5000, 'Prehistoric'],
    [-3001, 'Prehistoric'],
    [-3000, 'Ancient'],
    [499, 'Ancient'],
    [500, 'Medieval'],
    [1499, 'Medieval'],
    [1500, 'Modern'],
    [2026, 'Modern'],
  ])('year %i → %s', (year, name) => {
    expect(epochOf(year).name).toBe(name)
  })
})
