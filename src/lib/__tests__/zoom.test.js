import { describe, it, expect } from 'vitest'
import { lodBand, LOD_THRESHOLDS } from '../zoom.js'

describe('lodBand', () => {
  it.each([
    [1, 'epoch'],
    [3.99, 'epoch'],
    [4, 'millennium'],
    [29.99, 'millennium'],
    [30, 'century'],
    [199.99, 'century'],
    [200, 'decade'],
    [1499.99, 'decade'],
    [1500, 'year'],
    [10000, 'year'],
  ])('k=%s → %s', (k, band) => {
    expect(lodBand(k)).toBe(band)
  })
  it('clamps below 1 to epoch', () => {
    expect(lodBand(0.5)).toBe('epoch')
  })
})

describe('LOD_THRESHOLDS', () => {
  it('exposes ascending thresholds', () => {
    const ts = LOD_THRESHOLDS.map((t) => t.minK)
    expect(ts).toEqual([...ts].sort((a, b) => a - b))
  })
})
