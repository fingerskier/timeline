import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import EventNode from '../EventNode.jsx'

const ev = { year: 1969, title: 'Apollo 11', description: 'Humans land on the Moon.', location: 'Moon', era: 'Modern' }

describe('EventNode', () => {
  it('renders SVG dot at dot mode', () => {
    const { container } = render(
      <svg><EventNode event={ev} mode="dot" x={100} onClick={() => {}} /></svg>
    )
    expect(container.querySelector('circle.event-dot')).toBeInTheDocument()
  })
  it('renders chip text at chip mode', () => {
    render(
      <svg><EventNode event={ev} mode="chip" x={100} onClick={() => {}} /></svg>
    )
    expect(screen.getByText(/1969/)).toBeInTheDocument()
    expect(screen.getByText(/Apollo 11/)).toBeInTheDocument()
  })
  it('renders full description at card mode', () => {
    render(
      <svg><EventNode event={ev} mode="card" x={100} onClick={() => {}} /></svg>
    )
    expect(screen.getByText(/Humans land on the Moon/)).toBeInTheDocument()
  })
  it('fires onClick when activated', () => {
    const onClick = vi.fn()
    render(
      <svg><EventNode event={ev} mode="dot" x={100} onClick={onClick} /></svg>
    )
    fireEvent.click(document.querySelector('.event-dot'))
    expect(onClick).toHaveBeenCalledWith(ev)
  })
  it('applies matched class when matched=true', () => {
    render(
      <svg><EventNode event={ev} mode="dot" x={100} matched onClick={() => {}} /></svg>
    )
    expect(document.querySelector('.event-dot')).toHaveClass('matched')
  })
})
