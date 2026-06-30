import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { useCommandBar } from './useCommandBar'

const navigate = vi.fn()
vi.mock('react-router-dom', async (orig) => ({
  ...(await orig()),
  useNavigate: () => navigate,
}))
vi.mock('@/stores/useModulesStore', () => ({
  useModulesStore: (sel) => sel({ disabled: [] }),
}))

import { CommandBar } from './CommandBar'

const open = () => useCommandBar.setState({ open: true, query: '' })

describe('CommandBar', () => {
  beforeEach(() => { navigate.mockClear(); useCommandBar.setState({ open: false, query: '' }) })

  it('renders an accessible combobox when open', () => {
    open()
    render(<MemoryRouter><CommandBar /></MemoryRouter>)
    const input = screen.getByRole('combobox')
    expect(input).toHaveAttribute('aria-expanded')
  })

  it('shows ranked results and announces the count', () => {
    open()
    render(<MemoryRouter><CommandBar /></MemoryRouter>)
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'invoices' } })
    expect(screen.getByRole('listbox')).toBeInTheDocument()
    expect(screen.getByText('Invoices')).toBeInTheDocument()
    expect(screen.getByRole('status').textContent).toMatch(/result/i)
  })

  it('navigates to the top result on Enter', () => {
    open()
    render(<MemoryRouter><CommandBar /></MemoryRouter>)
    const input = screen.getByRole('combobox')
    fireEvent.change(input, { target: { value: 'invoices' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(navigate).toHaveBeenCalledWith('/sales/invoices')
    expect(useCommandBar.getState().open).toBe(false)
  })

  it('closes on Escape', () => {
    open()
    render(<MemoryRouter><CommandBar /></MemoryRouter>)
    fireEvent.keyDown(screen.getByRole('combobox'), { key: 'Escape' })
    expect(useCommandBar.getState().open).toBe(false)
  })
})
