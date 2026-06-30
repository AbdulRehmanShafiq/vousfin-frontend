import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('@/services/api', () => ({ default: { post: vi.fn(() => Promise.resolve({})) } }))
import api from '@/services/api'
import { logSearchEvent } from './logApi'

beforeEach(() => vi.clearAllMocks())

describe('logSearchEvent', () => {
  it('posts the event payload to /search/log', () => {
    logSearchEvent({ kind: 'catalog', query: 'invoices', resultClickedId: 'sales.invoices' })
    expect(api.post).toHaveBeenCalledWith('/search/log', { kind: 'catalog', query: 'invoices', resultClickedId: 'sales.invoices', noResult: false })
  })

  it('skips empty queries', () => {
    logSearchEvent({ query: '  ' })
    expect(api.post).not.toHaveBeenCalled()
  })

  it('never throws even if the request rejects', () => {
    api.post.mockReturnValue(Promise.reject(new Error('offline')))
    expect(() => logSearchEvent({ query: 'x' })).not.toThrow()
  })
})
