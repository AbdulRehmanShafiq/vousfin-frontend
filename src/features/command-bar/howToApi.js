import api from '@/services/api'

/**
 * Tier 3 — ask the backend for a grounded "how do I…" answer.
 * Returns { grounded, answer, href, sources }.
 */
export async function askHowTo(query) {
  const res = await api.post('/search/howto', { q: query })
  const d = res?.data?.data || {}
  return {
    grounded: d.grounded ?? false,
    answer: d.answer ?? '',
    href: d.href ?? null,
    sources: d.sources ?? [],
  }
}
