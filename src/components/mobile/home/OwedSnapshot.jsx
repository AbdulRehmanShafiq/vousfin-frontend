import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowDownRight, ArrowUpRight, ChevronRight } from 'lucide-react'
import { formatCompactCurrency } from '@/utils/formatters'

/**
 * OwedSnapshot — "who owes what", phone-native.
 *
 * The same two figures and the same net bar the desktop dashboard shows
 * (Dashboard.jsx → FinancialSnapshot), read from the same `kpis` the page has
 * already fetched — so this costs no extra request and cannot disagree with
 * desktop. Colour carries meaning, not decoration: accent = owed to you,
 * highlight = you owe, matching the rail's money-in / money-out accents.
 *
 * `Math.abs` mirrors desktop: AP is a credit-balance account, so its ledger
 * balance can arrive negative. We show magnitude and let the label carry the
 * direction, rather than printing "−Rs 40,000" under "Money you owe".
 */
function Row({ to, icon: Icon, label, amount, currency, tone }) {
  const tint = tone === 'in' ? 'accent' : 'highlight'
  return (
    <Link
      to={to}
      className="tap-target flex items-center gap-3 rounded-2xl border px-3.5 py-3 transition-colors active:scale-[0.99]"
      style={{
        background: `rgb(var(--c-${tint}) / 0.06)`,
        borderColor: `rgb(var(--c-${tint}) / 0.15)`,
      }}
    >
      <span
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
        style={{ background: `rgb(var(--c-${tint}) / 0.15)`, color: `rgb(var(--c-${tint}))` }}
        aria-hidden="true"
      >
        <Icon className="h-4 w-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span
          className="block text-xs font-semibold uppercase tracking-wider"
          style={{ color: `rgb(var(--c-${tint}))` }}
        >
          {label}
        </span>
        <span className="num block text-base font-semibold leading-tight text-text-primary">
          {formatCompactCurrency(Math.abs(amount), currency)}
        </span>
      </span>
      <ChevronRight className="h-4 w-4 shrink-0 text-text-muted" aria-hidden="true" />
    </Link>
  )
}

export default function OwedSnapshot({ ar = 0, ap = 0, currency, loading }) {
  const { t } = useTranslation()

  if (loading) {
    return (
      <div className="space-y-2">
        <div className="h-[62px] animate-pulse rounded-2xl bg-glass-panel" />
        <div className="h-[62px] animate-pulse rounded-2xl bg-glass-panel" />
      </div>
    )
  }

  const a = Math.abs(ar)
  const b = Math.abs(ap)
  const total = a + b
  const arPct = total > 0 ? (a / total) * 100 : 50

  return (
    <div className="space-y-2">
      <Row
        to="/sales/receivables"
        icon={ArrowDownRight}
        label={t('home.owedToYou')}
        amount={ar}
        currency={currency}
        tone="in"
      />
      <Row
        to="/purchases/payables"
        icon={ArrowUpRight}
        label={t('home.youOwe')}
        amount={ap}
        currency={currency}
        tone="out"
      />

      {/* Net exposure — which way you lean, at a glance */}
      {total > 0 && (
        <div className="px-0.5 pt-1">
          <div className="flex h-1.5 overflow-hidden rounded-full bg-glass-panel">
            <div
              className="rounded-l-full transition-all duration-700"
              style={{ width: `${arPct}%`, background: 'rgb(var(--c-accent))' }}
            />
            <div className="flex-1 rounded-r-full" style={{ background: 'rgb(var(--c-highlight))' }} />
          </div>
          <p className="mt-1.5 text-xs text-text-muted">
            {t('home.netSplit', { in: Math.round(arPct), out: 100 - Math.round(arPct) })}
          </p>
        </div>
      )}
    </div>
  )
}
