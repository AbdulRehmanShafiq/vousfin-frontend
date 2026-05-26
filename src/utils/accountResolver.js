/**
 * Account auto-resolver
 *
 * Maps AI-suggested account name strings (e.g., "internet expense", "bike",
 * "salary payable") onto real ChartOfAccount documents from the live business
 * via a layered match strategy:
 *
 *   1. Exact name           (Levenshtein 0)     → 1.00
 *   2. Exact accountCode    ("1010", "2200")    → 1.00
 *   3. Common alias         (built-in keyword map)→ 0.95
 *   4. Substring containment (subtype-filtered) → 0.85
 *   5. Token-Jaccard overlap                     → 0.55–0.85
 *   6. Normalized Levenshtein                    → 0.40–0.80
 *
 * SAFETY:
 *   - Returns null (instead of guessing) when best vs runner-up gap < 0.06.
 *   - Filters to the expected accountType when caller passes one — avoids
 *     selecting "Sales" when caller is looking for a DR-side asset.
 *   - Threshold of 0.65 ensures wildly off-base suggestions are rejected.
 *
 * No DB dependency, no external libraries.
 */

const AUTO_SELECT_THRESHOLD   = 0.65
const AMBIGUITY_GAP_THRESHOLD = 0.06

/**
 * Built-in aliases — words/phrases that map to canonical account *families*.
 * Map shape: alias-token → { name?, subtype?, type? } hint(s).
 * Used as the third-tier matcher; if the input contains any of these tokens,
 * a strong score is awarded to accounts whose name/subtype matches the hint.
 */
const ALIAS_HINTS = {
  // ── Assets ──────────────────────────────────────────────────────────────
  bike:              { name: 'Company Car',          type: 'Asset' },
  motorbike:         { name: 'Company Car',          type: 'Asset' },
  motorcycle:        { name: 'Company Car',          type: 'Asset' },
  vehicle:           { name: 'Company Car',          type: 'Asset' },
  car:               { name: 'Company Car',          type: 'Asset' },
  laptop:            { name: 'Computer Equipment',   type: 'Asset' },
  computer:          { name: 'Computer Equipment',   type: 'Asset' },
  desktop:           { name: 'Computer Equipment',   type: 'Asset' },
  printer:           { name: 'Office Equipment',     type: 'Asset' },
  chair:             { name: 'Furniture and Fittings', type: 'Asset' },
  chairs:            { name: 'Furniture and Fittings', type: 'Asset' },
  desk:              { name: 'Furniture and Fittings', type: 'Asset' },
  table:             { name: 'Furniture and Fittings', type: 'Asset' },
  furniture:         { name: 'Furniture and Fittings', type: 'Asset' },
  inventory:         { name: 'Inventory',            type: 'Asset' },
  stock:             { name: 'Inventory',            type: 'Asset' },
  receivable:        { name: 'Accounts Receivable',  type: 'Asset' },
  debtor:            { name: 'Accounts Receivable',  type: 'Asset' },
  prepaid:           { name: 'Prepaid Expenses',     type: 'Asset' },
  cash:              { name: 'Cash at Bank',         type: 'Asset' },
  bank:              { name: 'Cash at Bank',         type: 'Asset' },
  // ── Liabilities ─────────────────────────────────────────────────────────
  payable:           { name: 'Accounts Payable',     type: 'Liability' },
  creditor:          { name: 'Accounts Payable',     type: 'Liability' },
  loan:              { name: 'Loan Payable',         type: 'Liability' },
  emi:               { name: 'Loan Payable',         type: 'Liability' },
  gst:               { name: 'GST Payable',          type: 'Liability' },
  wht:               { name: 'WHT Payable',          type: 'Liability' },
  accrued:           { name: 'Accrued Expenses',     type: 'Liability' },
  unearned:          { name: 'Unearned Revenue',     type: 'Liability' },
  // ── Revenue ─────────────────────────────────────────────────────────────
  sales:             { name: 'Sales',                type: 'Revenue' },
  revenue:           { name: 'Sales',                type: 'Revenue' },
  // ── Expenses ────────────────────────────────────────────────────────────
  salary:            { name: 'Wages and Salaries',   type: 'Expense', byType: { Liability: 'Wages Payable' } },
  salaries:          { name: 'Wages and Salaries',   type: 'Expense', byType: { Liability: 'Wages Payable' } },
  wages:             { name: 'Wages and Salaries',   type: 'Expense', byType: { Liability: 'Wages Payable' } },
  payroll:           { name: 'Wages and Salaries',   type: 'Expense', byType: { Liability: 'Wages Payable' } },
  rent:              { name: 'Rent Expense',         type: 'Expense' },
  electricity:       { name: 'Utilities',            type: 'Expense' },
  utility:           { name: 'Utilities',            type: 'Expense' },
  utilities:         { name: 'Utilities',            type: 'Expense' },
  gas:               { name: 'Utilities',            type: 'Expense' },
  water:             { name: 'Utilities',            type: 'Expense' },
  internet:          { name: 'Internet',             type: 'Expense' },
  wifi:              { name: 'Internet',             type: 'Expense' },
  fuel:              { name: 'Company Car Expenses', type: 'Expense' },
  petrol:            { name: 'Company Car Expenses', type: 'Expense' },
  insurance:         { name: 'Insurance',            type: 'Expense' },
  legal:             { name: 'Professional Fees',    type: 'Expense' },
  professional:      { name: 'Professional Fees',    type: 'Expense' },
  audit:             { name: 'Professional Fees',    type: 'Expense' },
  marketing:         { name: 'Advertising',          type: 'Expense' },
  advertising:       { name: 'Advertising',          type: 'Expense' },
  depreciation:      { name: 'Depreciation Expense', type: 'Expense' },
  interest:          { name: 'Interest Expense',     type: 'Expense' },
}

// ── String helpers ────────────────────────────────────────────────────────
function norm(s) {
  return String(s || '').toLowerCase().trim().replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ')
}

function tokens(s) {
  const STOP = new Set(['the', 'a', 'an', 'of', 'for', 'on', 'in', 'to', 'and'])
  return norm(s).split(' ').filter(t => t && !STOP.has(t))
}

function jaccard(aTokens, bTokens) {
  if (!aTokens.length || !bTokens.length) return 0
  const A = new Set(aTokens), B = new Set(bTokens)
  let intersect = 0
  A.forEach(t => { if (B.has(t)) intersect++ })
  const union = A.size + B.size - intersect
  return union ? intersect / union : 0
}

function levenshtein(a, b) {
  if (a === b) return 0
  if (!a.length) return b.length
  if (!b.length) return a.length
  const dp = Array(b.length + 1).fill(0).map((_, i) => i)
  for (let i = 1; i <= a.length; i++) {
    let prev = dp[0]
    dp[0] = i
    for (let j = 1; j <= b.length; j++) {
      const tmp = dp[j]
      dp[j] = Math.min(
        dp[j] + 1,
        dp[j - 1] + 1,
        prev + (a[i - 1] === b[j - 1] ? 0 : 1)
      )
      prev = tmp
    }
  }
  return dp[b.length]
}

function normLev(a, b) {
  const max = Math.max(a.length, b.length)
  if (max === 0) return 1
  return 1 - levenshtein(a, b) / max
}

// ── Per-account scoring ───────────────────────────────────────────────────
/**
 * Score a single account against a normalized suggestion string + tokens.
 * Returns a number in [0, 1].
 */
function scoreAccount(account, sugNorm, sugTokens, aliasHint) {
  if (!account?.accountName) return 0
  const accNorm   = norm(account.accountName)
  const accTokens = tokens(account.accountName)

  // 1) Exact name
  if (accNorm === sugNorm) return 1.0

  // 2) Exact code
  if (account.accountCode && norm(account.accountCode) === sugNorm) return 1.0

  // 3) Alias hint match: caller passed e.g. ALIAS_HINTS['bike'] = { name:'Company Car' }
  if (aliasHint) {
    const hintNorm = norm(aliasHint.name || '')
    if (hintNorm && hintNorm === accNorm) return 0.95
    if (hintNorm && accNorm.includes(hintNorm)) return 0.92
  }

  // 4) Containment — either direction
  if (sugNorm && accNorm.includes(sugNorm)) return 0.88
  if (sugNorm && sugNorm.includes(accNorm) && accNorm.length >= 4) return 0.84

  // 5) Token-Jaccard
  const j = jaccard(sugTokens, accTokens)
  if (j >= 0.5) return 0.5 + j * 0.35  // 0.675 – 0.85

  // 6) Normalized Levenshtein
  const lev = normLev(sugNorm, accNorm)
  if (lev >= 0.6) return lev * 0.8  // dampened — Levenshtein is noisy on short names

  // 7) Token-substring at least matches one significant token
  for (const tk of sugTokens) {
    if (tk.length >= 4 && accNorm.includes(tk)) return 0.7
  }

  // 8) Per-token Levenshtein — catches typos like "recievable" vs "receivable"
  for (const sTok of sugTokens) {
    if (sTok.length < 5) continue
    for (const aTok of accTokens) {
      if (aTok.length < 5) continue
      const nl = normLev(sTok, aTok)
      if (nl >= 0.8) return 0.7 + (nl - 0.8) * 0.5 // 0.7 – 0.8
    }
  }

  return 0
}

/**
 * Resolve a suggested account name to a real account.
 *
 *  @param {string} suggestion          - AI's account name suggestion
 *  @param {Array}  accounts            - Live ChartOfAccount docs
 *  @param {object} [opts]
 *  @param {'Asset'|'Liability'|'Equity'|'Revenue'|'Expense'} [opts.preferType]
 *  @param {string} [opts.preferSubtype]
 *
 *  @returns {{ account: object|null, score: number, ambiguous: boolean, candidates: Array }}
 *
 *  - account: the resolved account doc (or null if confidence too low)
 *  - score:   confidence in [0, 1]
 *  - ambiguous: true when best vs runner-up gap < 0.06 (do NOT auto-select)
 *  - candidates: top-3 matches with their scores (UI can offer these as options)
 */
export function resolveAccount(suggestion, accounts, opts = {}) {
  if (!suggestion || !Array.isArray(accounts) || accounts.length === 0) {
    return { account: null, score: 0, ambiguous: false, candidates: [] }
  }
  const sugNorm = norm(suggestion)
  const sugTokens = tokens(suggestion)

  // Find ALL alias hints from suggestion tokens, then prefer one matching preferType.
  // Example: "salary payable" → token "salary" hints Expense, token "payable" hints
  // Liability. With preferType=Liability we pick the "payable" hint.
  const allAliasHints = sugTokens.map(tk => ALIAS_HINTS[tk]).filter(Boolean)
  let aliasHint = null
  if (opts.preferType) {
    // Prefer the MOST SPECIFIC hint: a byType remap on a semantic token (like
    // "salary" → "Wages Payable" when caller asked for Liability) beats a
    // generic token-type match (like "payable" → "Accounts Payable").
    const remapped = allAliasHints.find(h => h.byType && h.byType[opts.preferType])
    if (remapped) aliasHint = { name: remapped.byType[opts.preferType], type: opts.preferType }
    else          aliasHint = allAliasHints.find(h => h.type === opts.preferType) || allAliasHints[0] || null
  } else {
    aliasHint = allAliasHints[0] || null
  }

  // Score every account
  let scored = accounts.map(acc => ({
    account: acc,
    score: scoreAccount(acc, sugNorm, sugTokens, aliasHint),
  }))

  // Apply type filter — HARD filter when set (caller is asking specifically).
  // Returning a wrong-side account silently corrupts double-entry, so we
  // prefer to return null over the wrong type.
  if (opts.preferType) {
    scored = scored.filter(s => s.account.accountType === opts.preferType)
  }

  // Subtype priority — soft boost (+0.05)
  if (opts.preferSubtype) {
    scored = scored.map(s => ({
      ...s,
      score: s.account.accountSubtype === opts.preferSubtype ? s.score + 0.05 : s.score,
    }))
  }

  scored.sort((a, b) => b.score - a.score)
  const best = scored[0]
  const runnerUp = scored[1]
  const topCandidates = scored.filter(s => s.score > 0.4).slice(0, 3)

  if (!best || best.score < AUTO_SELECT_THRESHOLD) {
    return { account: null, score: best?.score || 0, ambiguous: false, candidates: topCandidates }
  }

  const ambiguous = runnerUp && best.score - runnerUp.score < AMBIGUITY_GAP_THRESHOLD
  if (ambiguous) {
    return { account: null, score: best.score, ambiguous: true, candidates: topCandidates }
  }
  return { account: best.account, score: Math.min(1, best.score), ambiguous: false, candidates: topCandidates }
}

/**
 * Resolve a DR/CR pair. Avoids picking the same account on both sides.
 *
 *  @returns {{
 *    debit:  { account: object|null, score: number, ambiguous: boolean },
 *    credit: { account: object|null, score: number, ambiguous: boolean },
 *  }}
 */
export function resolveDebitCreditPair(debitSuggestion, creditSuggestion, accounts, opts = {}) {
  const debit  = resolveAccount(debitSuggestion,  accounts, { preferType: opts.debitType  })
  const credit = resolveAccount(creditSuggestion, accounts, { preferType: opts.creditType })

  // Prevent same account on both sides — drop the lower-confidence side
  if (debit.account && credit.account && debit.account._id === credit.account._id) {
    if (debit.score >= credit.score) {
      return { debit, credit: { account: null, score: credit.score, ambiguous: true, candidates: credit.candidates || [] } }
    } else {
      return { debit: { account: null, score: debit.score, ambiguous: true, candidates: debit.candidates || [] }, credit }
    }
  }
  return { debit, credit }
}

// Constants for external use (tests, UI hints)
export const RESOLVER_CONSTANTS = {
  AUTO_SELECT_THRESHOLD,
  AMBIGUITY_GAP_THRESHOLD,
}
