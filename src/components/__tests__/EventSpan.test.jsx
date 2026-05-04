import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
import EventSpan from '../EventSpan.jsx'

const ev = {
  year: 1939,
  endYear: 1945,
  title: 'World War II',
  description: 'Global war.',
  era: 'Modern',
}

describe('EventSpan', () => {
  it('renders a rect spanning x1..x2', () => {
    const { container } = render(
      <svg><EventSpan event={ev} x1={100} x2={300} onClick={() => {}} /></svg>,
    )
    const rect = container.querySelector('rect')
    expect(rect).toBeInTheDocument()
    expect(rect.getAttribute('x')).toBe('100')
    expect(rect.getAttribute('width')).toBe('200')
  })

  it('shows label when width is >=80 px', () => {
    const { container } = render(
      <svg><EventSpan event={ev} x1={0} x2={120} onClick={() => {}} /></svg>,
    )
    const label = container.querySelector('text.span-label')
    expect(label).toBeInTheDocument()
    expect(label.textContent).toContain('World War II')
    expect(label.textContent).toContain('1939')
    expect(label.textContent).toContain('1945')
  })

  it('omits label when too narrow', () => {
    const { container } = render(
      <svg><EventSpan event={ev} x1={0} x2={20} onClick={() => {}} /></svg>,
    )
    expect(container.querySelector('text.span-label')).toBeNull()
  })

  it('clamps width to a 2px minimum so degenerate spans stay visible', () => {
    const { container } = render(
      <svg><EventSpan event={ev} x1={50} x2={50} onClick={() => {}} /></svg>,
    )
    expect(container.querySelector('rect').getAttribute('width')).toBe('2')
  })

  it('fires onClick when activated', () => {
    const onClick = vi.fn()
    const { container } = render(
      <svg><EventSpan event={ev} x1={0} x2={100} onClick={onClick} /></svg>,
    )
    fireEvent.click(container.querySelector('.event-span'))
    expect(onClick).toHaveBeenCalledWith(ev)
  })

  it('applies matched class when matched', () => {
    const { container } = render(
      <svg><EventSpan event={ev} x1={0} x2={100} matched onClick={() => {}} /></svg>,
    )
    expect(container.querySelector('.event-span')).toHaveClass('matched')
  })

  it('applies era-specific class', () => {
    const { container } = render(
      <svg><EventSpan event={ev} x1={0} x2={100} onClick={() => {}} /></svg>,
    )
    expect(container.querySelector('.event-span')).toHaveClass('span-modern')
  })
})
