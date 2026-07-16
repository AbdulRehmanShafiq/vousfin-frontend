import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import MobileHome from './MobileHome'

vi.mock('@/stores/useAuthStore', () => ({
  useAuthStore: () => ({ user: { fullName: 'Abdul Rehman' } }),
}))
vi.mock('@/stores/useBusinessStore', () => ({
  useBusinessStore: () => ({ currency: 'PKR', activeBusiness: { businessName: 'FinTech Solutions' } }),
}))

let dashboardData = {
  kpis: {
    cashBalance: 2410300,
    revenue: 840000,
    expenses: 610000,
    accountsReceivable: 300000,
    accountsPayable: 100000,
  },
  cashFlowTrend: [
    { period: '2026-05', netCashFlow: 100000 },
    { period: '2026-06', netCashFlow: -40000 },
    { period: '2026-07', netCashFlow: 25000 },
  ],
}
let transactionsData = { docs: [{ _id: 't1', description: 'Payment from Ali', amount: 25000, transactionType: 'income', transactionDate: '2026-07-10' }] }
let inboxData = { counts: { actions: 3 } }
let agingData = {
  receivable: { overdueTotal: 50000, buckets: { current: { total: 250000 } } },
  payable: { overdueTotal: 0, buckets: { current: { total: 100000 } } },
}

vi.mock('@/hooks/useReports', () => ({
  useDashboardAll: () => ({ data: dashboardData, isLoading: false }),
  useAgingReport: (type) => ({ data: agingData[type], isLoading: false }),
}))
vi.mock('@/hooks/useTransactions', () => ({
  useTransactions: () => ({ data: transactionsData, isLoading: false }),
}))
vi.mock('@/hooks/useAutonomy', () => ({
  useAutonomyInbox: () => ({ data: inboxData }),
}))

function renderHome() {
  const qc = new QueryClient()
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter>
        <MobileHome />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('MobileHome', () => {
  it('renders the cash hero', () => {
    renderHome()
    expect(screen.getByText('Cash on hand')).toBeInTheDocument()
  })

  it('does NOT render its own Record CTA — the bottom bar ⊕ owns creating', () => {
    // The sticky CTA duplicated the ⊕ sitting ~50px below it, and the two
    // disagreed on destination. Regression guard: one create surface.
    renderHome()
    expect(screen.queryByText('Record something')).not.toBeInTheDocument()
  })

  it('renders the needs-you chip when the count is greater than 0', () => {
    renderHome()
    expect(screen.getByText(/things need you/)).toBeInTheDocument()
  })

  it('hides the needs-you chip when the count is 0', () => {
    inboxData = { counts: { actions: 0 } }
    renderHome()
    expect(screen.queryByText(/need you/)).not.toBeInTheDocument()
    inboxData = { counts: { actions: 3 } }
  })

  it('renders recent transactions as list cards', () => {
    renderHome()
    expect(screen.getByText('Payment from Ali')).toBeInTheDocument()
  })

  it('shows an empty state when there are no recent transactions', () => {
    transactionsData = { docs: [] }
    renderHome()
    expect(screen.getByText('Nothing recorded yet.')).toBeInTheDocument()
    transactionsData = { docs: [{ _id: 't1', description: 'Payment from Ali', amount: 25000, transactionType: 'income', transactionDate: '2026-07-10' }] }
  })

  it('surfaces who owes what, linked to the matching pages', () => {
    renderHome()
    expect(screen.getByText('Owed to you')).toBeInTheDocument()
    expect(screen.getByText('You owe')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Owed to you/ })).toHaveAttribute('href', '/sales/receivables')
    expect(screen.getByRole('link', { name: /You owe/ })).toHaveAttribute('href', '/purchases/payables')
  })

  it("surfaces what's coming, reading the API's overdue figure", () => {
    renderHome()
    expect(screen.getByText("What's coming")).toBeInTheDocument()
    expect(screen.getByText('Coming in')).toBeInTheDocument()
    expect(screen.getByText('Going out')).toBeInTheDocument()
    // Receivables carry a 50,000 overdueTotal → flagged late.
    expect(screen.getByText('late')).toBeInTheDocument()
    // Payables have none → say so, rather than printing a zero.
    expect(screen.getByText('Nothing late')).toBeInTheDocument()
  })

  it("hides What's coming entirely when nothing is owed either way", () => {
    const prev = agingData
    agingData = {
      receivable: { overdueTotal: 0, buckets: { current: { total: 0 } } },
      payable: { overdueTotal: 0, buckets: { current: { total: 0 } } },
    }
    renderHome()
    expect(screen.queryByText("What's coming")).not.toBeInTheDocument()
    agingData = prev
  })
})
