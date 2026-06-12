/**
 * invalidateLedger.js
 *
 * One place that invalidates every client query whose data is DERIVED from the
 * general ledger. Call this from any mutation that writes a journal entry
 * (record transaction, add stock, approve invoice/bill, record payment, post a
 * recognition entry, recalculate inventory, etc.) so the UI never shows a stale
 * Balance Sheet / P&L / Trial Balance / dashboard after a ledger-affecting action.
 *
 * Why a shared helper: the bug class is "a mutation in module A changes the
 * ledger but only invalidates module A's queries", leaving reports/dashboard
 * stale. Routing every ledger write through this list keeps them in lock-step.
 *
 * @param {import('@tanstack/react-query').QueryClient} queryClient
 */
export function invalidateLedgerQueries(queryClient) {
  const keys = [
    ['reports'],               // Balance Sheet, P&L, Trial Balance, GL, Tax, Aging
    ['dashboard'],             // KPI tiles + charts
    ['accounts'],              // Chart of Accounts running balances
    ['transactions'],          // Transactions ledger
    ['outstanding-balances'],  // AR/AP widgets
    ['outstanding'],
    ['inventory-valuation'],   // inventory value feeds the Balance Sheet
  ]
  for (const key of keys) {
    queryClient.invalidateQueries({ queryKey: key })
  }
}

export default invalidateLedgerQueries
