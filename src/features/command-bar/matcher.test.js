import { describe, it, expect } from 'vitest'
import { deriveCatalog } from './catalog'
import { withActions } from './actions'
import { searchCatalog } from './matcher'
import { MODULES } from '@/components/layout/nav.config.js'

const entries = withActions(deriveCatalog(MODULES))
const topId = (q) => searchCatalog(entries, q, { limit: 5 })[0]?.id

// Labeled query -> expected top result (per-persona relevance set)
const CASES = [
  ['invoices', 'sales.invoices'],
  ['new invoice', 'sales.new-invoice'],
  ['who owes me', 'sales.receivables'],
  ['what i owe', 'purchases.payables'],
  ['reconcile', 'banking.bank-reconciliation'],
  ['chart of accounts', 'accounting.chart-of-accounts'],
  ['profit and loss', 'reports.financial-statements'],
  ['payslips', 'payroll.payslips'],
]

describe('searchCatalog', () => {
  it.each(CASES)('ranks "%s" -> %s as the top result', (q, expected) => {
    expect(topId(q)).toBe(expected)
  })

  it('returns nothing for an empty query', () => {
    expect(searchCatalog(entries, '   ', {})).toEqual([])
  })

  it('respects the limit', () => {
    expect(searchCatalog(entries, 'a', { limit: 3 }).length).toBeLessThanOrEqual(3)
  })
})
