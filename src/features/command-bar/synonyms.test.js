import { describe, it, expect } from 'vitest'
import { deriveCatalog } from './catalog'
import { MODULES } from '@/components/layout/nav.config.js'

const byId = (id) => deriveCatalog(MODULES).find((e) => e.id === id)

describe('synonyms', () => {
  it('maps the plain phrase "who owes me" onto Receivables', () => {
    expect(byId('sales.receivables').synonyms).toContain('who owes me')
  })
  it('maps "what i owe" onto Payables', () => {
    expect(byId('purchases.payables').synonyms).toContain('what i owe')
  })
  it('maps "reconcile" onto Bank Reconciliation', () => {
    expect(byId('banking.bank-reconciliation').synonyms).toContain('reconcile')
  })
})
