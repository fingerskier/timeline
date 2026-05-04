import { describe, it, expect, vi, afterEach } from 'vitest'
import { loadAllEvents } from '../events.js'

afterEach(() => {
  vi.unstubAllGlobals()
})

function mockFetch(map) {
  vi.stubGlobal('fetch', vi.fn((url) => {
    const file = url.split('/').pop()
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve(map[file] ?? []),
    })
  }))
}

describe('loadAllEvents', () => {
  it('merges all era files and sorts ascending by year', async () => {
    mockFetch({
      'prehistoric.json': [{ year: -10000, title: 'Cave painting' }],
      'ancient.json':     [{ year: 776, title: 'should not be here' }, { year: -776, title: 'Olympics' }],
      'medieval.json':    [{ year: 1066, title: 'Hastings' }],
      'modern.json':      [{ year: 1969, title: 'Apollo 11' }],
    })
    const events = await loadAllEvents('/timeline/')
    expect(events.map((e) => e.year)).toEqual([-10000, -776, 776, 1066, 1969])
  })

  it('keeps stable order for equal years', async () => {
    mockFetch({
      'prehistoric.json': [],
      'ancient.json': [
        { year: 0, title: 'A' },
        { year: 0, title: 'B' },
      ],
      'medieval.json': [],
      'modern.json': [{ year: 0, title: 'C' }],
    })
    const events = await loadAllEvents('/timeline/')
    expect(events.map((e) => e.title)).toEqual(['A', 'B', 'C'])
  })
})
