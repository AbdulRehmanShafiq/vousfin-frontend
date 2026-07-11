import { describe, it, expect } from 'vitest'
import { buildPlainSummary } from './plainSummary'

describe('buildPlainSummary', () => {
  it('describes a stock purchase with quantity and stock movement', () => {
    const s = buildPlainSummary({
      transactionType: 'Inventory Purchase', amount: 5000, currency: 'PKR', paymentMethod: 'cash',
      inventory: { mode: 'existing', itemName: 'Rice (bag)', quantity: 10, unit: 'bags', currentStock: 12 },
    })
    expect(s).toContain('10 bags')
    expect(s).toContain('Rice (bag)')
    expect(s).toContain('Stock will go up by 10')
  })

  it('describes a new-item purchase', () => {
    const s = buildPlainSummary({
      transactionType: 'Inventory Purchase', amount: 5000, currency: 'PKR', paymentMethod: 'cash',
      inventory: { mode: 'create', itemName: 'Flour', quantity: 20, unit: 'bags' },
    })
    expect(s).toContain('Flour')
    expect(s).toContain('new item')
  })

  it('describes a stock sale with remaining stock', () => {
    const s = buildPlainSummary({
      transactionType: 'Inventory Sale', amount: 4000, currency: 'PKR', paymentMethod: 'cash',
      inventory: { mode: 'existing', itemName: 'Rice (bag)', quantity: 5, unit: 'bags', currentStock: 12 },
    })
    expect(s).toContain('Stock will go down by 5')
    expect(s).toContain('12 in stock')
  })

  it('plain expense → simple sentence, no stock talk', () => {
    const s = buildPlainSummary({
      transactionType: 'Expense', amount: 5000, currency: 'PKR', paymentMethod: 'bank',
      inventory: { mode: 'none' },
    })
    expect(s).toContain('5,000')
    expect(s).not.toMatch(/stock/i)
  })

  it('returns null without an amount', () => {
    expect(buildPlainSummary({ transactionType: 'Expense', amount: 0, inventory: { mode: 'none' } })).toBeNull()
  })
})
