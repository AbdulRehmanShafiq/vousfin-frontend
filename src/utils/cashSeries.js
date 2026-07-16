/**
 * cashSeries — derive the cash *balance* series from the cash *flow* series.
 *
 * Why this exists: `/dashboard/all` returns `cashFlowTrend` as
 * `[{ period, netCashFlow }]` — the NET MOVEMENT within each period (a flow),
 * not the balance at the end of it (a stock). `kpis.cashBalance` is the stock,
 * as of today.
 *
 * Drawing the flow under a hero that reads "Cash on hand" would state
 * something false: a month where you netted −50k would render as a dip even if
 * you were never short of cash. So we reconstruct the true closing balance per
 * period from the two authoritative figures we already hold, rather than
 * plotting the wrong series because it was the one nearest to hand.
 *
 * Reconstruction (walking backwards from a known point):
 *   balance(last)  = cashBalance                 — the trend ends at today
 *   balance(i − 1) = balance(i) − netCashFlow(i) — undo period i's movement
 *
 * This is derived, never stored: the ledger stays the single source of truth.
 */

/**
 * @param {Array<{period: string, netCashFlow: number}>} trend  ascending by period
 * @param {number} currentBalance  kpis.cashBalance — the balance as of today
 * @returns {Array<{period: string, balance: number}>} closing balance per period
 */
export function closingBalances(trend, currentBalance) {
  if (!Array.isArray(trend) || trend.length === 0) return []
  const base = Number.isFinite(currentBalance) ? currentBalance : 0

  const out = new Array(trend.length)
  let running = base
  for (let i = trend.length - 1; i >= 0; i--) {
    out[i] = { period: trend[i].period, balance: running }
    const flow = Number(trend[i].netCashFlow)
    running -= Number.isFinite(flow) ? flow : 0
  }
  return out
}

/**
 * Direction of travel across the series, for colouring the sparkline.
 * @returns {'up'|'down'|'flat'}
 */
export function trendDirection(series) {
  if (!Array.isArray(series) || series.length < 2) return 'flat'
  const delta = series[series.length - 1].balance - series[0].balance
  if (delta > 0) return 'up'
  if (delta < 0) return 'down'
  return 'flat'
}
