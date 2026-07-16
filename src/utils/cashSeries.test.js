import { describe, it, expect } from 'vitest'
import { closingBalances, trendDirection } from './cashSeries'

describe('closingBalances', () => {
  it('ends at the known current balance', () => {
    const trend = [
      { period: '2026-01', netCashFlow: 100 },
      { period: '2026-02', netCashFlow: 50 },
    ]
    const out = closingBalances(trend, 1000)
    expect(out[out.length - 1].balance).toBe(1000)
  })

  it('undoes each period movement walking backwards', () => {
    // Closed Feb at 1000 having netted +50 → closed Jan at 950.
    // Closed Jan at 950 having netted +100 → opened at 850.
    const trend = [
      { period: '2026-01', netCashFlow: 100 },
      { period: '2026-02', netCashFlow: 50 },
    ]
    expect(closingBalances(trend, 1000)).toEqual([
      { period: '2026-01', balance: 950 },
      { period: '2026-02', balance: 1000 },
    ])
  })

  it('handles negative flows without confusing flow for stock', () => {
    // Netting −500 in Feb while still holding 200 at close means Jan closed at
    // 700 — a dip in FLOW, but the BALANCE never went negative. This is the
    // whole reason the function exists.
    const trend = [
      { period: '2026-01', netCashFlow: 300 },
      { period: '2026-02', netCashFlow: -500 },
    ]
    const out = closingBalances(trend, 200)
    expect(out).toEqual([
      { period: '2026-01', balance: 700 },
      { period: '2026-02', balance: 200 },
    ])
    expect(out.every((p) => p.balance > 0)).toBe(true)
  })

  it('returns an empty series for empty or non-array input', () => {
    expect(closingBalances([], 1000)).toEqual([])
    expect(closingBalances(undefined, 1000)).toEqual([])
    expect(closingBalances(null, 1000)).toEqual([])
  })

  it('treats a single period as the current balance', () => {
    expect(closingBalances([{ period: '2026-01', netCashFlow: 900 }], 1000)).toEqual([
      { period: '2026-01', balance: 1000 },
    ])
  })

  it('survives non-finite flows and balances rather than emitting NaN', () => {
    const trend = [
      { period: '2026-01', netCashFlow: null },
      { period: '2026-02', netCashFlow: undefined },
    ]
    const out = closingBalances(trend, undefined)
    expect(out.every((p) => Number.isFinite(p.balance))).toBe(true)
  })
})

describe('trendDirection', () => {
  const at = (balance, period = 'p') => ({ period, balance })

  it('reads rising, falling and flat series', () => {
    expect(trendDirection([at(1), at(2)])).toBe('up')
    expect(trendDirection([at(2), at(1)])).toBe('down')
    expect(trendDirection([at(2), at(2)])).toBe('flat')
  })

  it('compares endpoints, not the path between them', () => {
    expect(trendDirection([at(100), at(5), at(300)])).toBe('up')
  })

  it('is flat when there is nothing to compare', () => {
    expect(trendDirection([])).toBe('flat')
    expect(trendDirection([at(5)])).toBe('flat')
    expect(trendDirection(undefined)).toBe('flat')
  })
})
