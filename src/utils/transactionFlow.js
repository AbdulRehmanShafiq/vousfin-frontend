/**
 * transactionFlow — the single source of truth for "is this transaction money
 * coming IN or going OUT?" used for row icons/signs AND for the Money in/out
 * KPI sums on the transactions list.
 *
 * This is a display / rough-glance classifier (revenue vs expense direction),
 * NOT a formal cash-flow statement — financing, transfers, tax remittances and
 * other non-cash/neutral entries are deliberately neither in nor out.
 *
 * Was previously duplicated (and inconsistent) across Dashboard, MobileHome,
 * TransactionsList and MobileTransactions — "Inventory Sale" was in none of the
 * copies, so it rendered as an outflow and was omitted from both KPI totals.
 */
const INFLOW_TYPES = new Set([
  'income',
  'cash sale',
  'credit sale',
  'inventory sale',
  'payment received',
  'fx gain',
])

const OUTFLOW_TYPES = new Set([
  'expense',
  'cash purchase',
  'credit purchase',
  'inventory purchase',
  'payment made',
  'fx loss',
])

const norm = (transactionType) => String(transactionType || '').toLowerCase()

export function isInflow(transactionType) {
  return INFLOW_TYPES.has(norm(transactionType))
}

export function isOutflow(transactionType) {
  return OUTFLOW_TYPES.has(norm(transactionType))
}

export { INFLOW_TYPES, OUTFLOW_TYPES }
