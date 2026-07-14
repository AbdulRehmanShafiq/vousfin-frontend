import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import ClosePage from './ClosePage'

vi.mock('@/services/approval.service', () => ({
  default: { count: vi.fn(() => Promise.resolve({ data: { data: { pending: 3 } } })) },
}))
vi.mock('@/services/ai/classifierService', () => ({
  default: { getDrafts: vi.fn(() => Promise.resolve({ data: [] })) },
}))
vi.mock('@/hooks/useArApIntegrity', () => ({
  useArApVerification: () => ({ data: { ok: true } }),
}))

function renderPage() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter>
        <ClosePage />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('ClosePage — the month-end Close Cockpit', () => {
  it('renders the checklist with live and guided steps', async () => {
    renderPage()
    expect(screen.getByText('Close the month')).toBeInTheDocument()
    expect(screen.getByText('Clear pending approvals')).toBeInTheDocument()
    expect(screen.getByText('Empty the AI review queue')).toBeInTheDocument()
    expect(screen.getByText('Reconcile every bank account')).toBeInTheDocument()
    expect(screen.getByText('Lock the period')).toBeInTheDocument()
  })

  it('shows the pending-approvals count and links each step to its surface', async () => {
    renderPage()
    expect(await screen.findByText('3')).toBeInTheDocument() // approvals badge
    expect(screen.getByText('Clear pending approvals').closest('a')).toHaveAttribute('href', '/approvals')
    expect(screen.getByText('Lock the period').closest('a')).toHaveAttribute('href', '/accounting/fiscal-years')
  })
})
