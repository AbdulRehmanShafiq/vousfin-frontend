import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ListCard from './ListCard'

describe('ListCard', () => {
  it('renders title, subtitle and trailing value', () => {
    render(<ListCard title="Payment from Ali" subtitle="Today" trailing="+25,000" />)
    expect(screen.getByText('Payment from Ali')).toBeInTheDocument()
    expect(screen.getByText('Today')).toBeInTheDocument()
    expect(screen.getByText('+25,000')).toBeInTheDocument()
  })

  it('fires onClick when tapped', () => {
    const onClick = vi.fn()
    render(<ListCard title="Row" onClick={onClick} />)
    fireEvent.click(screen.getByText('Row'))
    expect(onClick).toHaveBeenCalled()
  })

  it('renders as a non-interactive div when no onClick is given', () => {
    render(<ListCard title="Row" />)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('has a minimum tap-target height class', () => {
    const { container } = render(<ListCard title="Row" onClick={() => {}} />)
    expect(container.firstChild.className).toMatch(/min-h-\[56px\]/)
  })
})
