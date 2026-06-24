import { format, parseISO, isValid } from 'date-fns'

export function formatCurrency(amount, currency = 'PKR') {
  const value = Number(amount) || 0
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value)
}

/**
 * Compact, currency-aware money formatter — the SINGLE source of truth for
 * abbreviated money across the app (replaces the old per-page fmtAmt /
 * compactMoney duplicates). Rs 57.2M · $8K · Rs 940.
 */
const CURRENCY_SYMBOLS = { PKR: 'Rs', USD: '$', EUR: '€', GBP: '£', AED: 'AED', SAR: 'SAR' }
export function currencySymbol(currency = 'PKR') {
  return CURRENCY_SYMBOLS[currency] || currency
}

export function formatCompactCurrency(amount, currency = 'PKR') {
  const sym = currencySymbol(currency)
  const val = Number(amount) || 0
  const abs = Math.abs(val)
  const sign = val < 0 ? '−' : ''
  if (abs >= 1_000_000) return `${sign}${sym} ${(abs / 1_000_000).toFixed(1)}M`
  if (abs >= 1_000) return `${sign}${sym} ${(abs / 1_000).toFixed(0)}K`
  return formatCurrency(val, currency)
}

export function formatNumber(value, decimals = 0) {
  return new Intl.NumberFormat('en-PK', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(Number(value) || 0)
}

export function formatPercent(value) {
  const num = Number(value) || 0
  return `${num.toFixed(1)}%`
}

export function formatDate(date, pattern = 'MMM d, yyyy') {
  if (!date) return '?'
  const d = typeof date === 'string' ? parseISO(date) : new Date(date)
  if (!isValid(d)) return '?'
  return format(d, pattern)
}

export function formatDateTime(date) {
  return formatDate(date, 'MMM d, yyyy h:mm a')
}
