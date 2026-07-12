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
vi.mock('@/stores/useUIStore', () => ({
  useUIStore: (sel) => sel({ openTxModal: vi.fn() }),
}))

let dashboardData = { kpis: { cashBalance: 2410300, revenue: 840000, expenses: 610000 } }
let transactionsData = { docs: [{ _id: 't1', description: 'Payment from Ali', amount: 25000, transactionType: 'income', transactionDate: '2026-07-10' }] }
let inboxData = { counts: { actions: 3 } }

vi.mock('@/hooks/useReports', () => ({
  useDashboardAll: () => ({ data: dashboardData, isLoading: false }),
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
  it('renders the cash hero and the Record CTA', () => {
    renderHome()
    expect(screen.getByText('Cash on hand')).toBeInTheDocument()
    expect(screen.getByText('Record something')).toBeInTheDocument()
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
})
