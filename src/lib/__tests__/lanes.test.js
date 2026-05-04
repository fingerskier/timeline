import { describe, it, expect } from 'vitest'
import { assignLanes } from '../lanes.js'

describe('assignLanes', () => {
  it('puts non-overlapping spans on lane 0', () => {
    const out = assignLanes([
      { year: 100, endYear: 200, title: 'A' },
      { year: 200, endYear: 300, title: 'B' },
      { year: 300, endYear: 400, title: 'C' },
    ])
    expect(out.map((s) => s.lane)).toEqual([0, 0, 0])
  })

  it('stacks overlapping spans into separate lanes', () => {
    const out = assignLanes([
      { year: 100, endYear: 400, title: 'big' },
      { year: 150, endYear: 250, title: 'inner1' },
      { year: 200, endYear: 350, title: 'inner2' },
    ])
    const byTitle = Object.fromEntries(out.map((s) => [s.title, s.lane]))
    expect(byTitle.big).toBe(0)
    expect(byTitle.inner1).toBe(1)
    expect(byTitle.inner2).toBe(2)
  })

  it('reuses an emptied lane once it is free', () => {
    const out = assignLanes([
      { year: 0, endYear: 100, title: 'A' },
      { year: 50, endYear: 150, title: 'B' },
      { year: 100, endYear: 200, title: 'C' },
    ])
    const byTitle = Object.fromEntries(out.map((s) => [s.title, s.lane]))
    expect(byTitle.A).toBe(0)
    expect(byTitle.B).toBe(1)
    expect(byTitle.C).toBe(0)
  })

  it('is stable when given the same input', () => {
    const input = [
      { year: 1939, endYear: 1945, title: 'WWII' },
      { year: 1947, endYear: 1991, title: 'Cold War' },
      { year: 1914, endYear: 1918, title: 'WWI' },
    ]
    const a = assignLanes(input)
    const b = assignLanes(input)
    expect(a).toEqual(b)
  })

  it('orders by start year then by endYear when starts tie', () => {
    const out = assignLanes([
      { year: 100, endYear: 300, title: 'longer' },
      { year: 100, endYear: 200, title: 'shorter' },
    ])
    const byTitle = Object.fromEntries(out.map((s) => [s.title, s.lane]))
    expect(byTitle.shorter).toBe(0)
    expect(byTitle.longer).toBe(1)
  })
})
