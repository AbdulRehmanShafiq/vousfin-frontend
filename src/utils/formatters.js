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
