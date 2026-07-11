import { describe, it, expect } from 'vitest'
import { nlResultToFormValues } from './nlFormMapping'

describe('nlResultToFormValues — inventory passthrough', () => {
  it('carries the inventory block and line items', () => {
    const v = nlResultToFormValues({
      amount: 5000, transactionType: 'Inventory Purchase',
      inventory: { mode: 'existing', itemId: 'i1', quantity: 10 },
      lineItems: [{ name: 'rice', quantity: 10 }],
    }, 'bought rice')
    expect(v._inventory).toEqual({ mode: 'existing', itemId: 'i1', quantity: 10 })
    expect(v._lineItems).toHaveLength(1)
    expect(v.amount).toBe(5000)
  })

  it('defaults to mode none when the parser sent nothing', () => {
    const v = nlResultToFormValues({ amount: 100 }, 'x')
    expect(v._inventory).toEqual({ mode: 'none' })
    expect(v._lineItems).toEqual([])
  })
})
