import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import App from '../App.jsx'

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn((url) => {
    const file = url.split('/').pop()
    const data = {
      'prehistoric.json': [{ year: -10000, title: 'Test Pre', description: 'd', era: 'Prehistoric', location: 'l' }],
      'ancient.json':     [{ year: -776, title: 'Test Anc', description: 'd', era: 'Ancient',     location: 'l' }],
      'medieval.json':    [{ year: 1066, title: 'Test Med', description: 'd', era: 'Medieval',    location: 'l' }],
      'modern.json':      [{ year: 1969, title: 'Test Mod', description: 'd', era: 'Modern',      location: 'l' }],
    }[file] ?? []
    return Promise.resolve({ ok: true, json: () => Promise.resolve(data) })
  }))
})

describe('App smoke', () => {
  it('renders the timeline shell after data loads', async () => {
    render(<App />)
    await waitFor(() => expect(screen.getByText('Cosmic Timeline')).toBeInTheDocument())
    expect(screen.getByText(/k =/)).toBeInTheDocument()
  })

  it('renders error banner when fetch fails', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({ ok: false, status: 500 })))
    render(<App />)
    await waitFor(() => expect(screen.getByText(/Couldn't load timeline data/)).toBeInTheDocument())
  })
})
