import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import MoneyInOutCard from './MoneyInOutCard'

const renderCard = (props) =>
  render(<MemoryRouter><MoneyInOutCard currency="PKR" {...props} /></MemoryRouter>)

describe('MoneyInOutCard', () => {
  it('shows money coming in and going out in plain words', () => {
    renderCard({ income: 100000, expenses: 60000, net: 40000 })
    // Exact labels — avoids matching the subtitle sentence that also mentions them
    expect(screen.getByText('Money coming in')).toBeInTheDocument()
    expect(screen.getByText('Money going out')).toBeInTheDocument()
    expect(screen.getByText("What's left")).toBeInTheDocument()
  })

  it("computes what's left as income − expenses when net is not given", () => {
    renderCard({ income: 100000, expenses: 60000 })
    // 40,000 left — compact formatter renders "40,000" or "40K"; assert the card
    // exposes the computed value via a testid for a stable check
    expect(screen.getByTestId('money-left').textContent).toMatch(/40/)
  })

  it('flags a loss when expenses exceed income', () => {
    renderCard({ income: 50000, expenses: 80000 })
    expect(screen.getByTestId('money-left')).toHaveAttribute('data-negative', 'true')
  })

  it('shows a loading skeleton and no figures while loading', () => {
    renderCard({ loading: true })
    expect(screen.getByTestId('money-inout-skeleton')).toBeInTheDocument()
    expect(screen.queryByTestId('money-left')).not.toBeInTheDocument()
  })
})
