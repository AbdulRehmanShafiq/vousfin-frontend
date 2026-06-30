/**
 * intent.js — detect a "how do I…" / "where do I…" question so the command bar
 * can offer a grounded AI answer (Tier 3) instead of just navigation results.
 */
export function isHowToQuery(query) {
  const s = String(query || '').trim().toLowerCase()
  if (s.length < 5) return false
  return /^(how|where|why|can i|what is|what's|should i)\b/.test(s) || /\bhow (to|do|can)\b/.test(s)
}
