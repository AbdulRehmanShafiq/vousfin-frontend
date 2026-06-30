import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { useCommandBar } from './useCommandBar'

vi.mock('react-router-dom', async (orig) => ({
  ...(await orig()),
  useNavigate: () => vi.fn(),
}))
vi.mock('@/stores/useModulesStore', () => ({
  useModulesStore: (sel) => sel({ disabled: [] }),
}))
vi.mock('./catalogApi', () => ({ searchCatalogSemantic: vi.fn() }))

import { searchCatalogSemantic } from './catalogApi'
import { CommandBar } from './CommandBar'

const open = () => useCommandBar.setState({ open: true, query: '' })

describe('CommandBar — Tier 2 escalation', () => {
  beforeEach(() => { vi.clearAllMocks(); useCommandBar.setState({ open: false, query: '' }) })

  it('consults the semantic backend for a natural-language query and merges the hit', async () => {
    searchCatalogSemantic.mockResolvedValue([{ id: 'sales.receivables' }])
    open()
    render(<MemoryRouter><CommandBar /></MemoryRouter>)

    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'how do i get paid' } })

    await waitFor(() => expect(searchCatalogSemantic).toHaveBeenCalled())
    await waitFor(() => expect(screen.getByText('Receivables')).toBeInTheDocument())
  })

  it('does NOT call the backend for a strong single-keyword local hit', async () => {
    open()
    render(<MemoryRouter><CommandBar /></MemoryRouter>)
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'invoices' } })
    // Give any debounce a chance to (not) fire.
    await new Promise((r) => setTimeout(r, 300))
    expect(searchCatalogSemantic).not.toHaveBeenCalled()
  })
})
