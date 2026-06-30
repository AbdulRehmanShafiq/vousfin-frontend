/**
 * escalation.js — decide when the instant local matcher (Tier 1) is not enough
 * and the semantic backend (Tier 2) should be consulted, and how to merge them.
 */

function wordCount(q) {
  return q.trim().split(/\s+/).filter(Boolean).length
}

/**
 * Escalate to semantic search when the query is substantial AND either the local
 * matcher found nothing or the query reads like a natural-language question
 * (3+ words), where meaning-based retrieval tends to beat keyword matching.
 */
export function shouldEscalate(query, localResults = []) {
  const q = String(query || '').trim()
  if (q.length < 3) return false
  if (localResults.length === 0) return true
  return wordCount(q) >= 3
}

/** Local results first (instant, exact), then any NEW semantic ids, deduped. */
export function mergeResults(local = [], semantic = [], limit = 8) {
  const seen = new Set(local.map((e) => e.id))
  const merged = [...local]
  for (const e of semantic) {
    if (!seen.has(e.id)) {
      seen.add(e.id)
      merged.push(e)
    }
  }
  return merged.slice(0, limit)
}
