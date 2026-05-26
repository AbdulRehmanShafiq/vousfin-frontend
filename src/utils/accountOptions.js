/**
 * Helpers for turning raw ChartOfAccount documents into Select-component
 * options, with optional grouping by accountSubtype, code prefix, and
 * preset-based filtering.
 *
 * The new account schema adds: accountCode, accountSubtype. Older accounts
 * (pre-migration) may not have these — we fall back to accountType.
 */

const SUBTYPE_ORDER = [
  'Bank and Cash',
  'Current Assets',
  'Non-current Assets',
  'Current Liabilities',
  'Non-current Liabilities',
  'Equity',
  'Revenue',
  'Direct Cost',
  'Expenses',
]

const TYPE_ORDER = ['Asset', 'Liability', 'Equity', 'Revenue', 'Expense']

/** Subtype label used when account is missing the new field. */
function fallbackSubtypeOf(account) {
  switch (account?.accountType) {
    case 'Asset':     return 'Current Assets'
    case 'Liability': return 'Current Liabilities'
    case 'Equity':    return 'Equity'
    case 'Revenue':   return 'Revenue'
    case 'Expense':   return 'Expenses'
    default:          return 'Other'
  }
}

/**
 * Format a single account into a Select option.
 *
 *  - value      : account _id
 *  - label      : "Cash at Bank"       — CLEAN name only; no code in standard view
 *  - group      : "Bank and Cash"      (subtype, drives sticky group headers)
 *  - accountCode: "1010"               (available for tooltip / accountant mode)
 *  - subtitle   : "Bank and Cash"      (subtype rendered as dim secondary text in dropdown)
 *
 * WHY no code in the label?
 *   SME users recognise accounts by name, not by accounting codes. Codes are
 *   internal reference numbers that clutter the UI for non-accountants. They
 *   are surfaced in the Chart of Accounts management page, not in transaction entry.
 */
export function toAccountOption(account) {
  const group = account.accountSubtype || fallbackSubtypeOf(account)
  const subtitle = account.accountCode ? `${account.accountCode} · ${group}` : group
  return {
    value:    account._id,
    label:    account.accountName,    // clean name — no code appended
    subtitle,                         // "1010 · Bank and Cash" — code helps accountants identify accounts
    group,
    /* Carried for client-side filtering by presets */
    accountType: account.accountType,
    accountSubtype: group,
    accountName: account.accountName,
    accountCode: account.accountCode,
  }
}

/**
 * Build grouped, sorted account options for a Select.
 *
 *  @param {Array} accounts            — raw account docs
 *  @param {(opt) => boolean} predicate — optional filter (e.g., for presets)
 */
export function buildGroupedAccountOptions(accounts, predicate) {
  const opts = (accounts || []).map(toAccountOption)
  const filtered = predicate ? opts.filter(predicate) : opts

  /* Sort: by subtype order, then by code (lexical, but 4-digit codes are
     already alphabetical), then by name as final tiebreaker. */
  filtered.sort((a, b) => {
    const ga = SUBTYPE_ORDER.indexOf(a.group)
    const gb = SUBTYPE_ORDER.indexOf(b.group)
    const gaSafe = ga === -1 ? 999 : ga
    const gbSafe = gb === -1 ? 999 : gb
    if (gaSafe !== gbSafe) return gaSafe - gbSafe
    const ca = a.accountCode || 'ZZZ'
    const cb = b.accountCode || 'ZZZ'
    if (ca !== cb) return ca.localeCompare(cb)
    return a.accountName.localeCompare(b.accountName)
  })

  return filtered
}

/* ── Sub-type to top-level type mapping (for preset filtering) ─────────── */
export const SUBTYPE_TO_TYPE = {
  'Bank and Cash':            'Asset',
  'Current Assets':           'Asset',
  'Non-current Assets':       'Asset',
  'Current Liabilities':      'Liability',
  'Non-current Liabilities':  'Liability',
  'Equity':                   'Equity',
  'Revenue':                  'Revenue',
  'Direct Cost':              'Expense',
  'Expenses':                 'Expense',
}

export { SUBTYPE_ORDER, TYPE_ORDER }
