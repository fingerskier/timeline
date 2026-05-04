import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import AxisRibbon from '../AxisRibbon.jsx'
import { makeYearScale } from '../../lib/yearScale.js'

const scale = makeYearScale({ domain: [-3000, 2000], range: [0, 5000] })

describe('AxisRibbon', () => {
  it('renders 4 epoch washes regardless of band', () => {
    const { container } = render(
      <svg><AxisRibbon scale={scale} band="epoch" visibleYears={[-3000, 2000]} width={5000} /></svg>
    )
    expect(container.querySelectorAll('rect.epoch-wash')).toHaveLength(4)
  })
  it('renders no millennium ticks at epoch band', () => {
    const { container } = render(
      <svg><AxisRibbon scale={scale} band="epoch" visibleYears={[-3000, 2000]} width={5000} /></svg>
    )
    expect(container.querySelectorAll('text.tick-label.millennium')).toHaveLength(0)
  })
  it('renders millennium ticks at millennium band', () => {
    const { container } = render(
      <svg><AxisRibbon scale={scale} band="millennium" visibleYears={[-3000, 2000]} width={5000} /></svg>
    )
    expect(container.querySelectorAll('text.tick-label.millennium').length).toBeGreaterThan(0)
  })
  it('renders century ticks at century band', () => {
    const { container } = render(
      <svg><AxisRibbon scale={scale} band="century" visibleYears={[1500, 2000]} width={5000} /></svg>
    )
    expect(container.querySelectorAll('text.tick-label.century').length).toBeGreaterThan(3)
  })
})
