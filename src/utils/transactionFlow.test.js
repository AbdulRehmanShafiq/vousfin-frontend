import { describe, it, expect } from 'vitest'
import { isInflow, isOutflow } from './transactionFlow'

describe('transactionFlow', () => {
  it('classifies inventory sale as money coming in (the reported bug)', () => {
    expect(isInflow('Inventory Sale')).toBe(true)
    expect(isOutflow('Inventory Sale')).toBe(false)
  })

  it('classifies inventory purchase as money going out', () => {
    expect(isOutflow('Inventory Purchase')).toBe(true)
    expect(isInflow('Inventory Purchase')).toBe(false)
  })

  it('keeps the existing sale types as inflows', () => {
    for (const t of ['Cash Sale', 'Credit Sale', 'Payment Received', 'Income', 'FX Gain']) {
      expect(isInflow(t)).toBe(true)
    }
  })

  it('keeps the existing purchase/expense types as outflows', () => {
    for (const t of ['Expense', 'Cash Purchase', 'Credit Purchase', 'Payment Made', 'FX Loss']) {
      expect(isOutflow(t)).toBe(true)
    }
  })

  it('is case-insensitive and null-safe', () => {
    expect(isInflow('inventory sale')).toBe(true)
    expect(isInflow(null)).toBe(false)
    expect(isInflow(undefined)).toBe(false)
    expect(isOutflow('')).toBe(false)
  })

  it('treats non-cash / transfer types as neither inflow nor outflow', () => {
    for (const t of ['Transfer', 'Bank Transfer', 'Journal Entry', 'Depreciation', 'Opening Balance']) {
      expect(isInflow(t)).toBe(false)
      expect(isOutflow(t)).toBe(false)
    }
  })
})
