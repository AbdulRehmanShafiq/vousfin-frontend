import api from '@/services/api'

/**
 * Tier 2 — semantic catalog search via the backend. Returns ranked entries
 * { id, type, title, path, href, moduleKey, score }. Icons are resolved on the
 * client from the local catalog by id (the backend stores no React components).
 */
export async function searchCatalogSemantic(query, { disabledModules = [], limit = 8 } = {}) {
  const params = { q: query, limit }
  if (disabledModules.length) params.disabled = disabledModules.join(',')
  const res = await api.get('/search/catalog', { params })
  return res?.data?.data?.results || []
}
