/**
 * chartTheme.js — shared Recharts configuration ("Nocturne Ledger")
 * Import these constants into any chart component for visual consistency.
 *
 * Series semantics: money in = jade, money out = coral, cash = champagne gold.
 */

export const CHART_COLORS = {
  revenue:  '#3DDC97',
  expenses: '#F2705B',
  profit:   '#6FE8B4',
  cash:     '#D4A94E',
  neutral:  '#6C7A71',
}

export const GRID_PROPS = {
  strokeDasharray: '3 3',
  stroke: 'rgba(233,239,234,0.06)',
  vertical: false,
}

export const AXIS_TICK = { fontSize: 11, fill: '#6C7A71' }

export const AXIS_STYLE = { axisLine: false, tickLine: false }

export const TOOLTIP_WRAPPER = {
  contentStyle: {
    background: 'rgba(13,20,17,0.95)',
    border: '1px solid rgba(233,239,234,0.16)',
    borderRadius: '12px',
    backdropFilter: 'blur(12px)',
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05), 0 16px 40px rgba(0,0,0,0.6)',
    padding: '10px 14px',
    fontSize: '12px',
  },
  labelStyle: { color: '#E9EFEA', fontWeight: 700, marginBottom: '4px' },
  itemStyle:  { color: '#A3B0A8' },
}

/** Format Y-axis tick values as K / M */
export function kFmt(v) {
  const abs = Math.abs(v)
  if (abs >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`
  if (abs >= 1_000)     return `${(v / 1_000).toFixed(0)}K`
  return String(Math.round(v))
}
