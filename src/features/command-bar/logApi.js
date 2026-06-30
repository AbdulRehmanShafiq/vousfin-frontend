import api from '@/services/api'

/**
 * Fire-and-forget command-bar analytics. Never throws into the UI and never
 * blocks navigation — failures are swallowed. No personal data is sent; the
 * backend stores the query text (non-sensitive nav phrases) with no userId.
 */
export function logSearchEvent({ kind = 'catalog', query, resultClickedId = null, noResult = false }) {
  if (!query || !String(query).trim()) return
  try {
    api.post('/search/log', { kind, query, resultClickedId, noResult }).catch(() => {})
  } catch {
    /* ignore */
  }
}
