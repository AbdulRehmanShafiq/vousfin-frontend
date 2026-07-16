import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { AlertTriangle, CalendarClock } from 'lucide-react'
import { useAgingReport } from '@/hooks/useReports'
import { formatCompactCurrency } from '@/utils/formatters'

/**
 * WhatsComing — the time dimension the totals above don't carry.
 *
 * OwedSnapshot says HOW MUCH is owed; this says WHEN. It splits the aging
 * report's buckets into the only two states that change what you do today:
 *   late    — every overdue bucket summed (1–30 … 90+) → chase / pay now
 *   not due — the `current` bucket                     → nothing to do yet
 *
 * Reads the same `/reports/aging` the Aging report reads, so the phone can't
 * quietly disagree with the report it links to. Renders nothing at all when
 * there is nothing owed either way — an empty card is worse than no card.
 */
function Line({ label, late, notDue, currency, to }) {
  const { t } = useTranslation()
  if (late <= 0 && notDue <= 0) return null

  return (
    <Link
      to={to}
      className="tap-target flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-glass-hover active:scale-[0.99]"
    >
      <span className="min-w-0">
        <span className="block text-xs font-semibold text-text-secondary">{label}</span>
        <span className="mt-0.5 flex items-center gap-1.5 text-xs text-text-muted">
          {late > 0 ? (
            <>
              <AlertTriangle className="h-3 w-3 shrink-0 text-negative" aria-hidden="true" />
              <span className="num font-semibold text-negative">{formatCompactCurrency(late, currency)}</span>
              <span>{t('home.late')}</span>
            </>
          ) : (
            <>
              <CalendarClock className="h-3 w-3 shrink-0" aria-hidden="true" />
              <span>{t('home.nothingLate')}</span>
            </>
          )}
        </span>
      </span>
      {notDue > 0 && (
        <span className="shrink-0 text-right">
          <span className="num block text-sm font-semibold text-text-primary">
            {formatCompactCurrency(notDue, currency)}
          </span>
          <span className="block text-xs text-text-muted">{t('home.notDueYet')}</span>
        </span>
      )}
    </Link>
  )
}

/**
 * Read the two figures from the authority — never re-derive them.
 *
 * `/reports/aging` already computes `overdueTotal` (the four overdue buckets,
 * summed and rounded to cents server-side). Summing the buckets again here
 * would create a second, competing definition of "late" that silently drifts
 * from the report this card links to the moment rounding or bucket boundaries
 * change. The authoritative figure exists; use it.
 */
function split(aging) {
  return {
    late: Number(aging?.overdueTotal) || 0,
    notDue: Number(aging?.buckets?.current?.total) || 0,
  }
}

export default function WhatsComing({ currency }) {
  const { t } = useTranslation()
  const { data: ar, isLoading: loadAr } = useAgingReport('receivable')
  const { data: ap, isLoading: loadAp } = useAgingReport('payable')

  if (loadAr || loadAp) {
    return <div className="h-[92px] animate-pulse rounded-2xl bg-glass-panel" />
  }

  const inbound = split(ar)
  const outbound = split(ap)
  const nothingOwed =
    inbound.late + inbound.notDue + outbound.late + outbound.notDue === 0

  if (nothingOwed) return null

  return (
    <div>
      <p className="mb-1.5 text-small font-semibold uppercase tracking-wider text-text-muted">
        {t('home.whatsComing')}
      </p>
      <div className="rounded-2xl bg-glass-panel p-1">
        {/* Both rows tap through to the same two hubs OwedSnapshot uses, so
            Home stays coherent: "how much" and "when" lead to one place to
            act, not two different report pages. */}
        <Line
          label={t('home.comingIn')}
          late={inbound.late}
          notDue={inbound.notDue}
          currency={currency}
          to="/sales/receivables"
        />
        <Line
          label={t('home.goingOut')}
          late={outbound.late}
          notDue={outbound.notDue}
          currency={currency}
          to="/purchases/payables"
        />
      </div>
    </div>
  )
}
