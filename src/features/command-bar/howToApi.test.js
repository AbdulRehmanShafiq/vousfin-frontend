import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('@/services/api', () => ({ default: { post: vi.fn() } }))
import api from '@/services/api'
import { askHowTo } from './howToApi'

beforeEach(() => vi.clearAllMocks())

describe('askHowTo', () => {
  it('POSTs the query to /search/howto and returns the grounded result', async () => {
    api.post.mockResolvedValue({ data: { data: { grounded: true, answer: '1. Open Sales.', href: '/sales/invoices', sources: [] } } })
    const r = await askHowTo('how do i create an invoice')
    expect(api.post).toHaveBeenCalledWith('/search/howto', { q: 'how do i create an invoice' })
    expect(r).toMatchObject({ grounded: true, href: '/sales/invoices' })
  })

  it('returns a safe default on an empty response', async () => {
    api.post.mockResolvedValue({ data: {} })
    const r = await askHowTo('x')
    expect(r).toMatchObject({ grounded: false, answer: '', href: null, sources: [] })
  })
})
