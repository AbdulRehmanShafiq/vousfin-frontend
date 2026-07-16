/**
 * MobileHome — the phone-native Home screen (Mobile-First Redesign, pass 1).
 * NOT a responsive collapse of the desktop Dashboard: a purpose-built screen
 * with one hero number, what needs you, money in/out, recent activity.
 * See docs/superpowers/specs/2026-07-12-mobile-first-redesign-design.md
 *
 * 2026-07-16 — the screen answers more, and asks for less:
 *  - The sticky "Record something" CTA is GONE. It duplicated the bottom bar's
 *    ⊕ sitting ~50px below it, and worse, the two disagreed: the CTA jumped
 *    straight to the transaction modal while the ⊕ opens the Capture sheet.
 *    One create surface, one destination — the ⊕ owns it.
 *  - Cash on hand now carries its own shape (sparkline), who owes what, and
 *    when it lands. Everything but WhatsComing rides the `useDashboardAll`
 *    query this page already made, so the additions cost one request total.
 */
import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useQueryClient } from '@tanstack/react-query'
import { Bell, ArrowDownLeft, ArrowUpRight, ChevronRight } from 'lucide-react'
import { useAuthStore } from '@/stores/useAuthStore'
import { useBusinessStore } from '@/stores/useBusinessStore'
import { useDashboardAll } from '@/hooks/useReports'
import { useTransactions } from '@/hooks/useTransactions'
import { useAutonomyInbox } from '@/hooks/useAutonomy'
import { formatCompactCurrency } from '@/utils/formatters'
import { usePermissions } from '@/hooks/usePermissions'
import MobilePage from '@/components/mobile/MobilePage'
import ListCard from '@/components/mobile/ListCard'
import PullToRefresh from '@/components/mobile/PullToRefresh'
import CashSparkline from '@/components/mobile/home/CashSparkline'
import OwedSnapshot from '@/components/mobile/home/OwedSnapshot'
import WhatsComing from '@/components/mobile/home/WhatsComing'
import Explain from '@/design-system/workflow/Explain'
import { isInflow as isInflowType } from '@/utils/transactionFlow'

const isInflow = (tx) => isInflowType(tx.transactionType)

export default function MobileHome() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const { user } = useAuthStore()
  const { currency, activeBusiness } = useBusinessStore()

  const dateRange = useMemo(() => ({
    startDate: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
    endDate:   new Date().toISOString().split('T')[0],
  }), [])

  const { data: dashData, isLoading: loadDash } = useDashboardAll(dateRange)
  const { data: txData,   isLoading: loadTx   } = useTransactions({ limit: 3 })
  const { data: inbox }                          = useAutonomyInbox()

  const recentTxs = Array.isArray(txData?.docs)         ? txData.docs
    : Array.isArray(txData?.transactions)               ? txData.transactions
    : Array.isArray(txData)                             ? txData : []

  const kpis = dashData?.kpis || {}
  const cashTrend = dashData?.cashFlowTrend ?? []
  const needsYouCount = inbox?.counts?.actions ?? 0
  // Role-aware Home (Mobile Easy §4.1): staff see the work chip above the money
  const { roles, loaded: rolesLoaded } = usePermissions()
  const workFirst = rolesLoaded && roles.length > 0 && !roles.includes('owner')

  const hour = new Date().getHours()
  const greeting = hour < 12 ? t('home.goodMorning') : hour < 17 ? t('home.goodAfternoon') : t('home.goodEvening')
  const firstName = (user?.fullName || user?.name || 'there').split(' ')[0]

  const handleRefresh = async () => {
    // 'reports' covers the aging queries WhatsComing reads.
    await Promise.all(
      ['dashboard', 'transactions', 'autonomy', 'reports'].map((key) =>
        queryClient.invalidateQueries({ queryKey: [key] }),
      ),
    )
  }

  return (
    <MobilePage
      title={`${greeting}, ${firstName}`}
      subtitle={activeBusiness?.businessName || t('home.yourBusiness')}
    >
      <PullToRefresh onRefresh={handleRefresh} className="h-full">
        <div className="space-y-5 pb-4">
          {/* The answer + the work — staff see the work chip first (§4.1) */}
          {(() => {
            const hero = (
              <div key="hero">
                <p className="text-small font-semibold uppercase tracking-wider text-text-muted inline-flex items-center gap-0.5">
                  {t('home.cashOnHand')}
                  <Explain
                    title={t('home.cashOnHand')}
                    rows={[{ label: t('home.cashPlusBank'), value: formatCompactCurrency(kpis.cashBalance ?? 0, currency) }]}
                    note={t('home.cashNote')}
                    to="/accounts"
                    toLabel={t('home.seeAccounts')}
                  />
                </p>
                {loadDash ? (
                  <div className="mt-2 h-9 w-40 animate-pulse rounded-lg bg-glass-panel" />
                ) : (
                  <>
                    <p className="num mt-1 text-[34px] font-bold leading-none tracking-tight text-text-primary">
                      {formatCompactCurrency(kpis.cashBalance ?? 0, currency)}
                    </p>
                    {/* The shape behind the number — closing balance per month,
                        derived so it agrees with the figure above it. */}
                    <CashSparkline
                      className="mt-2"
                      trend={cashTrend}
                      currentBalance={kpis.cashBalance ?? 0}
                    />
                  </>
                )}
              </div>
            )
            const chip = needsYouCount > 0 && (
              <Link
                key="chip"
                to="/inbox"
                className="flex items-center gap-2 rounded-full bg-highlight/12 px-4 py-2.5 text-sm font-semibold text-highlight active:scale-[0.98] transition-transform"
              >
                <Bell className="h-4 w-4 flex-shrink-0" />
                {t('home.needsYou', { count: needsYouCount })}
                <ChevronRight className="ml-auto h-4 w-4 flex-shrink-0" />
              </Link>
            )
            return workFirst ? <>{chip}{hero}</> : <>{hero}{chip}</>
          })()}

          {/* Who owes what — the question owners actually open the app to ask.
              Free: reads the same `kpis` the hero above already used. */}
          <OwedSnapshot
            ar={kpis.accountsReceivable ?? 0}
            ap={kpis.accountsPayable ?? 0}
            currency={currency}
            loading={loadDash}
          />

          {/* When it lands — the time dimension the totals above don't carry. */}
          <WhatsComing currency={currency} />

          {/* Money in / out */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-glass-panel p-3.5">
              <p className="text-xs text-text-muted">{t('label.inflows')}</p>
              <p className="num mt-1 text-lg font-semibold text-positive">
                {formatCompactCurrency(kpis.revenue ?? 0, currency)}
              </p>
            </div>
            <div className="rounded-2xl bg-glass-panel p-3.5">
              <p className="text-xs text-text-muted">{t('label.outflows')}</p>
              <p className="num mt-1 text-lg font-semibold text-text-primary">
                {formatCompactCurrency(kpis.expenses ?? 0, currency)}
              </p>
            </div>
          </div>

          {/* Recent */}
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <p className="text-small font-semibold uppercase tracking-wider text-text-muted">{t('home.recent')}</p>
              <Link to="/transactions" className="text-small font-semibold text-accent">{t('home.seeAll')}</Link>
            </div>
            {loadTx ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => <div key={i} className="h-14 animate-pulse rounded-xl bg-glass-panel" />)}
              </div>
            ) : recentTxs.length === 0 ? (
              <p className="rounded-xl bg-glass-panel p-4 text-center text-sm text-text-muted">
                {t('msg.noTransactions')}
              </p>
            ) : (
              <div className="space-y-1">
                {recentTxs.slice(0, 3).map((tx) => {
                  const inflow = isInflow(tx)
                  return (
                    <ListCard
                      key={tx._id}
                      leading={
                        <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${inflow ? 'bg-positive-muted text-positive' : 'bg-negative-muted text-negative'}`}>
                          {inflow ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                        </div>
                      }
                      title={tx.description}
                      subtitle={new Date(tx.transactionDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      trailing={`${inflow ? '+' : '−'}${formatCompactCurrency(tx.amount, currency)}`}
                    />
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </PullToRefresh>
    </MobilePage>
  )
}
