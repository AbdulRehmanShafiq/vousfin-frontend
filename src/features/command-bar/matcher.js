/**
 * matcher.js — hand-rolled, dependency-free ranking for the command bar.
 * Scoring tiers (high → low): exact title, title prefix, whole-word token,
 * synonym phrase, then subsequence (fuzzy). Transparent and unit-tested so
 * relevance is tunable without a black-box library.
 */
function normalize(s) {
  return String(s || '').toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim()
}

function isSubsequence(needle, haystack) {
  let i = 0
  for (let j = 0; j < haystack.length && i < needle.length; j++) {
    if (needle[i] === haystack[j]) i++
  }
  return i === needle.length
}

export function scoreEntry(entry, q) {
  if (!q) return 0
  const title = normalize(entry.title)
  const titleTokens = title.split(' ')
  const synonyms = (entry.synonyms || []).map(normalize)
  const haystack = [title, ...entry.path.map(normalize), ...synonyms].join(' ')

  if (title === q) return 100
  if (title.startsWith(q)) return 85
  if (titleTokens.some((t) => t.startsWith(q))) return 70
  if (synonyms.some((s) => s === q)) return 65
  if (synonyms.some((s) => s.includes(q))) return 55
  if (haystack.includes(q)) return 45
  // multi-word query: every word must appear somewhere in the haystack
  const words = q.split(' ').filter(Boolean)
  if (words.length > 1 && words.every((w) => haystack.includes(w))) return 40
  if (isSubsequence(q.replace(/\s/g, ''), title.replace(/\s/g, ''))) return 20
  return 0
}

export function searchCatalog(entries, query, { limit = 8 } = {}) {
  const q = normalize(query)
  if (!q) return []
  return entries
    .map((e) => ({ e, s: scoreEntry(e, q) }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s || a.e.title.length - b.e.title.length)
    .slice(0, limit)
    .map((x) => x.e)
}
