import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('@/services/api', () => ({ default: { get: vi.fn() } }))
import api from '@/services/api'
import { searchCatalogSemantic } from './catalogApi'

beforeEach(() => vi.clearAllMocks())

describe('searchCatalogSemantic', () => {
  it('calls /search/catalog with the query, limit and disabled CSV, returns results', async () => {
    api.get.mockResolvedValue({ data: { data: { results: [{ id: 'sales.invoices', score: 0.8 }] } } })
    const r = await searchCatalogSemantic('who owes me money', { disabledModules: ['payroll'], limit: 5 })
    expect(api.get).toHaveBeenCalledWith('/search/catalog', {
      params: { q: 'who owes me money', limit: 5, disabled: 'payroll' },
    })
    expect(r[0].id).toBe('sales.invoices')
  })

  it('omits the disabled param when none are disabled and tolerates an empty response', async () => {
    api.get.mockResolvedValue({ data: { data: {} } })
    const r = await searchCatalogSemantic('x', {})
    expect(api.get).toHaveBeenCalledWith('/search/catalog', { params: { q: 'x', limit: 8 } })
    expect(r).toEqual([])
  })
})
