import { cn } from '@/utils/cn'
import { formatCurrency, formatCompactCurrency } from '@/utils/formatters'
import { useBusinessStore } from '@/stores/useBusinessStore'

/**
 * Money — the ONE way to render an amount (Ledger spec §8.2).
 *
 * Tabular mono figures, business-currency aware, semantic flow colors.
 *   <Money value={1200} />                    → neutral ink
 *   <Money value={1200} flow="in" signed />   → jade  “+Rs 1,200”
 *   <Money value={800}  flow="out" signed />  → clay  “−Rs 800”
 *   <Money value={5.2e6} compact />           → “Rs 5.2M”
 *   emphasis: 'hero' | 'total' | 'body' (default)
 */
export default function Money({
  value,
  currency,
  flow,            // 'in' | 'out' | undefined (neutral)
  signed = false,  // prefix +/− by flow
  compact = false,
  emphasis = 'body',
  className,
}) {
  const bizCurrency = useBusinessStore((s) => s.currency)
  const cur = currency || bizCurrency || 'PKR'
  const fmt = compact ? formatCompactCurrency : formatCurrency
  const sign = signed ? (flow === 'out' ? '−' : flow === 'in' ? '+' : '') : ''

  return (
    <span
      className={cn(
        'num',
        emphasis === 'hero' && 'text-display font-semibold',
        emphasis === 'total' && 'text-heading font-semibold',
        flow === 'in' && 'text-money-in',
        flow === 'out' && 'text-money-out',
        !flow && 'text-text-primary',
        className,
      )}
    >
      {sign}{fmt(Math.abs(Number(value) || 0), cur)}
    </span>
  )
}
