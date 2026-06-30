import { describe, it, expect } from 'vitest'
import { deriveCatalog } from './catalog'
import { withActions } from './actions'
import { MODULES } from '@/components/layout/nav.config.js'

const entries = withActions(deriveCatalog(MODULES))
const byId = (id) => entries.find((e) => e.id === id)

describe('withActions', () => {
  it('types a create-flow page as an action', () => {
    expect(byId('sales.new-invoice').type).toBe('action')
  })
  it('types "Run Payroll" as an action', () => {
    expect(byId('payroll.run-payroll').type).toBe('action')
  })
  it('leaves a normal page as a page', () => {
    expect(byId('sales.invoices').type).toBe('page')
  })
})
