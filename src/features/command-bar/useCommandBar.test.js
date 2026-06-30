import { describe, it, expect, beforeEach } from 'vitest'
import { useCommandBar, getResults } from './useCommandBar'

describe('useCommandBar store', () => {
  beforeEach(() => useCommandBar.setState({ open: false, query: '' }))

  it('opens and closes', () => {
    useCommandBar.getState().openBar()
    expect(useCommandBar.getState().open).toBe(true)
    useCommandBar.getState().closeBar()
    expect(useCommandBar.getState().open).toBe(false)
  })

  it('closing clears the query', () => {
    useCommandBar.getState().setQuery('invoices')
    useCommandBar.getState().closeBar()
    expect(useCommandBar.getState().query).toBe('')
  })
})

describe('getResults', () => {
  it('returns ranked, enablement-filtered entries', () => {
    const r = getResults('invoices', [], 5)
    expect(r[0].id).toBe('sales.invoices')
  })
  it('omits results for a disabled module', () => {
    const r = getResults('payslips', ['payroll'], 5)
    expect(r.some((e) => e.id === 'payroll.payslips')).toBe(false)
  })
})
