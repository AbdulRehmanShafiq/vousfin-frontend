import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { useCommandBar } from './useCommandBar'

const navigate = vi.fn()
vi.mock('react-router-dom', async (orig) => ({ ...(await orig()), useNavigate: () => navigate }))
vi.mock('@/stores/useModulesStore', () => ({ useModulesStore: (sel) => sel({ disabled: [] }) }))
vi.mock('./catalogApi', () => ({ searchCatalogSemantic: vi.fn().mockResolvedValue([]) }))
vi.mock('./howToApi', () => ({ askHowTo: vi.fn() }))
vi.mock('./logApi', () => ({ logSearchEvent: vi.fn() }))

import { askHowTo } from './howToApi'
import { CommandBar } from './CommandBar'

const open = () => useCommandBar.setState({ open: true, query: '' })

describe('CommandBar — Tier 3 how-to', () => {
  beforeEach(() => { vi.clearAllMocks(); navigate.mockClear(); useCommandBar.setState({ open: false, query: '' }) })

  it('offers an "Ask AI" row for a how-to question and renders the grounded answer', async () => {
    askHowTo.mockResolvedValue({ grounded: true, answer: '1. Open Sales → Invoices.', href: '/sales/invoices', sources: [] })
    open()
    render(<MemoryRouter><CommandBar /></MemoryRouter>)

    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'how do i create an invoice' } })
    const askRow = await screen.findByText(/Ask AI:/)
    fireEvent.mouseDown(askRow)

    await waitFor(() => expect(askHowTo).toHaveBeenCalledWith('how do i create an invoice'))
    await waitFor(() => expect(screen.getByText(/Open Sales → Invoices/)).toBeInTheDocument())

    fireEvent.mouseDown(screen.getByText(/Go to page/))
    expect(navigate).toHaveBeenCalledWith('/sales/invoices')
  })

  it('does NOT offer Ask AI for a plain keyword query', async () => {
    open()
    render(<MemoryRouter><CommandBar /></MemoryRouter>)
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'invoices' } })
    expect(screen.queryByText(/Ask AI:/)).not.toBeInTheDocument()
  })
})
