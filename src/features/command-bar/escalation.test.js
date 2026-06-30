import { describe, it, expect } from 'vitest'
import { shouldEscalate, mergeResults } from './escalation'

describe('shouldEscalate', () => {
  it('does not escalate a short query', () => {
    expect(shouldEscalate('in', [{ id: 'x' }])).toBe(false)
  })
  it('escalates when local found nothing', () => {
    expect(shouldEscalate('billing statement', [])).toBe(true)
  })
  it('escalates a natural-language (3+ word) query', () => {
    expect(shouldEscalate('who owes me money', [{ id: 'x' }])).toBe(true)
  })
  it('does not escalate a strong short keyword hit', () => {
    expect(shouldEscalate('invoices', [{ id: 'sales.invoices' }])).toBe(false)
  })
})

describe('mergeResults', () => {
  it('keeps local results first, then appends new semantic ones, deduped by id', () => {
    const local = [{ id: 'a' }, { id: 'b' }]
    const semantic = [{ id: 'b' }, { id: 'c' }]
    const merged = mergeResults(local, semantic, 8)
    expect(merged.map((e) => e.id)).toEqual(['a', 'b', 'c'])
  })
  it('respects the limit', () => {
    const local = [{ id: 'a' }, { id: 'b' }]
    const semantic = [{ id: 'c' }, { id: 'd' }, { id: 'e' }]
    expect(mergeResults(local, semantic, 3).map((e) => e.id)).toEqual(['a', 'b', 'c'])
  })
})
