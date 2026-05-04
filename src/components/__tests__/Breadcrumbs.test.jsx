import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Breadcrumbs from '../Breadcrumbs.jsx'

describe('Breadcrumbs', () => {
  it('shows only Epoch at the epoch band', () => {
    render(<Breadcrumbs band="epoch" centerYear={1969} onJumpTo={() => {}} />)
    expect(screen.getByText('Modern')).toBeInTheDocument()
    expect(screen.queryByText(/2nd Mill/i)).not.toBeInTheDocument()
  })

  it('shows Epoch › Millennium at millennium band', () => {
    render(<Breadcrumbs band="millennium" centerYear={1969} onJumpTo={() => {}} />)
    expect(screen.getByText('Modern')).toBeInTheDocument()
    expect(screen.getByText(/2nd Mill/)).toBeInTheDocument()
  })

  it('shows full chain at year band', () => {
    render(<Breadcrumbs band="year" centerYear={1969} onJumpTo={() => {}} />)
    expect(screen.getByText('Modern')).toBeInTheDocument()
    expect(screen.getByText(/2nd Mill/)).toBeInTheDocument()
    expect(screen.getByText(/20th c\./)).toBeInTheDocument()
    expect(screen.getByText('1960s')).toBeInTheDocument()
    expect(screen.getByText('1969')).toBeInTheDocument()
  })

  it('shows BCE for negative years', () => {
    render(<Breadcrumbs band="century" centerYear={-44} onJumpTo={() => {}} />)
    expect(screen.getByText('Ancient')).toBeInTheDocument()
    expect(screen.getByText(/1st c\. BCE/)).toBeInTheDocument()
  })
})
