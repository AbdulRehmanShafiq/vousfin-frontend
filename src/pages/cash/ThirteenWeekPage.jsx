/**
 * ThirteenWeekPage — Phase 8 FR-06.3
 *
 * Rolling 13-week cash flow projection. Weeks 1-4 are based on your
 * committed outstanding invoices and bills; weeks 5-13 are estimated
 * from your historical collection/payment rates.
 */
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { TrendingUp, AlertTriangle, RefreshCw, Loader2, ChevronDown, ChevronUp } from 'lucide-react'
import thirteenWeekService from '@/services/thirteenWeekCashFlow.service'
import { getErrorMessage } from '@/utils/errorHandler'
import toast from 'react-hot-toast'

const fmt = (n) => {
  if (n == null || !isFinite(n)) return '—'
  return `PKR ${Math.round(n).toLocaleString('en-PK')}`
}

const fmtDate = (d) => {
  if (!d) return '—'
  const dt = new Date(d)
  return dt.toLocaleDateString('en-PK', { month: 'short', day: 'numeric' })
}

function SummaryCard({ label, value, sub, accent }) {
  const accentClass = {
    green:  'border-positive/40 text-positive',
    red:    'border-rose-400/40 text-rose-400',
    yellow: 'border-highlight/40 text-highlight',
    cyan:   'border-accent/40 text-accent',
  }[accent] || 'border-glass text-text-primary'

  return (
    <div className={`premium-card p-4 border-l-4 ${accentClass}`}>
      <p className="text-label text-text-muted uppercase tracking-wide mb-1">{label}</p>
      <p className={`text-xl font-bold ${accentClass.split(' ')[1]}`}>{value}</p>
      {sub && <p className="text-label text-text-muted mt-0.5">{sub}</p>}
    </div>
  )
}

function WeekRow({ week }) {
  const isAlert     = week.isAlert
  const isProbable  = week.source === 'probabilistic'
  const netPositive = week.netCashFlow >= 0

  return (
    <tr className={`border-b border-glass/20 text-sm ${isAlert ? 'bg-rose-500/5' : ''}`}>
      <td className="px-3 py-2.5 font-medium text-text-primary whitespace-nowrap">
        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold mr-2 ${isAlert ? 'bg-rose-500/20 text-rose-400' : 'bg-glass/20 text-text-muted'}`}>
          {week.weekNumber}
        </span>
        {fmtDate(week.weekStartDate)}
      </td>
      <td className="px-3 py-2.5 text-right text-positive">
        {fmt(week.inflows)}
      </td>
      <td className="px-3 py-2.5 text-right text-rose-400">
        {fmt(week.outflows)}
      </td>
      <td className={`px-3 py-2.5 text-right font-medium ${netPositive ? 'text-positive' : 'text-rose-400'}`}>
        {netPositive ? '+' : ''}{fmt(week.netCashFlow)}
      </td>
      <td className={`px-3 py-2.5 text-right font-semibold ${isAlert ? 'text-rose-400' : 'text-text-primary'}`}>
        {isAlert && <AlertTriangle className="inline h-3.5 w-3.5 mr-1" />}
        {fmt(week.closingBalance)}
      </td>
      <td className="px-3 py-2.5 text-right">
        <span className={`text-label px-1.5 py-0.5 rounded font-medium ${isProbable ? 'bg-highlight/15 text-highlight' : 'bg-accent/15 text-accent'}`}>
          {isProbable ? 'Estimate' : 'Committed'}
        </span>
      </td>
    </tr>
  )
}

export default function ThirteenWeekPage() {
  const [floorInput, setFloorInput] = useState('')
  const [activeFloor, setActiveFloor] = useState(0)
  const [showAll, setShowAll] = useState(false)

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ['thirteen-week-cash', activeFloor],
    queryFn:  () => thirteenWeekService.getForecast(activeFloor).then(r => r.data?.data),
    staleTime: 5 * 60 * 1000,
    onError:  (e) => toast.error(getErrorMessage(e)),
  })

  const handleRefresh = () => {
    const f = Math.max(0, Number(floorInput) || 0)
    setActiveFloor(f)
    refetch()
  }

  const weeks        = data?.weeks || []
  const currentCash  = data?.currentCashBalance ?? null
  const lowest       = data?.lowestPoint
  const weeksUntil   = data?.weeksUntilFloor
  const alertCount   = weeks.filter(w => w.isAlert).length

  const displayWeeks = showAll ? weeks : weeks.slice(0, 13)

  return (
    <div className="animate-fade-in pb-10 space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-accent/15">
            <TrendingUp className="h-5 w-5 text-accent" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-text-primary tracking-tight">13-Week Cash Projection</h1>
            <p className="text-sm text-text-secondary mt-0.5">Rolling 13-week forecast — weeks 1–4 from your open invoices and bills, weeks 5–13 estimated</p>
          </div>
        </div>
      </div>

      {/* Floor input + refresh */}
      <div className="premium-card p-4 flex flex-wrap items-end gap-3">
        <div>
          <label className="block text-label text-text-muted mb-1 uppercase tracking-wide">Alert me when cash drops below (PKR)</label>
          <input
            type="number"
            min="0"
            value={floorInput}
            onChange={e => setFloorInput(e.target.value)}
            placeholder="0 — no floor"
            className="px-3 py-2 rounded-lg border border-glass bg-glass-panel/40 text-small text-text-primary focus:outline-none focus:border-accent/40 w-48"
          />
        </div>
        <button
          onClick={handleRefresh}
          disabled={isFetching}
          className="btn-gradient inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-small font-semibold disabled:opacity-60"
        >
          {isFetching ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
          Refresh
        </button>
      </div>

      {/* Summary cards */}
      {!isLoading && !isError && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <SummaryCard
            label="Current cash balance"
            value={fmt(currentCash)}
            accent="cyan"
          />
          <SummaryCard
            label="Lowest point in 13 weeks"
            value={lowest ? fmt(lowest.balance) : '—'}
            sub={lowest ? `Week ${lowest.weekNumber}` : ''}
            accent={alertCount > 0 ? 'red' : 'green'}
          />
          <SummaryCard
            label={alertCount > 0 ? 'Liquidity risk' : 'No liquidity risk'}
            value={weeksUntil ? `Week ${weeksUntil}` : '—'}
            sub={weeksUntil ? 'First week balance drops below floor' : 'No liquidity risk in 13 weeks'}
            accent={weeksUntil ? 'red' : 'green'}
          />
        </div>
      )}

      {/* Loading skeleton */}
      {isLoading && (
        <div className="space-y-2">
          {[1,2,3].map(i => <div key={i} className="premium-card h-10 animate-pulse" />)}
        </div>
      )}

      {/* Error state */}
      {isError && (
        <div className="premium-card p-6 text-center">
          <p className="text-text-secondary text-sm">{getErrorMessage(error)}</p>
          <button onClick={handleRefresh} className="mt-3 text-accent text-sm hover:underline">Try again</button>
        </div>
      )}

      {/* Alert banner */}
      {!isLoading && !isError && alertCount > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-400/30">
          <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0" />
          <p className="text-sm text-rose-300">
            <span className="font-semibold">{alertCount} week{alertCount > 1 ? 's' : ''}</span> where projected cash drops below your floor of {fmt(activeFloor)}.
            {weeksUntil && ` First shortfall at week ${weeksUntil}.`}
          </p>
        </div>
      )}

      {/* Table */}
      {!isLoading && !isError && weeks.length > 0 && (
        <div className="premium-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-glass/30 text-label text-text-muted uppercase tracking-wide">
                  <th className="px-3 py-3 text-left">Week / Start</th>
                  <th className="px-3 py-3 text-right">Inflows</th>
                  <th className="px-3 py-3 text-right">Outflows</th>
                  <th className="px-3 py-3 text-right">Net</th>
                  <th className="px-3 py-3 text-right">Closing balance</th>
                  <th className="px-3 py-3 text-right">Source</th>
                </tr>
              </thead>
              <tbody>
                {displayWeeks.map(w => <WeekRow key={w.weekNumber} week={w} />)}
              </tbody>
            </table>
          </div>

          {weeks.length > 13 && (
            <div className="px-4 py-3 border-t border-glass/20">
              <button
                onClick={() => setShowAll(!showAll)}
                className="text-accent text-sm flex items-center gap-1 hover:underline"
              >
                {showAll ? <><ChevronUp className="h-3.5 w-3.5" /> Show less</> : <><ChevronDown className="h-3.5 w-3.5" /> Show all</>}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs text-text-muted">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-accent/60 inline-block" /> Committed — based on your open invoices/bills
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-highlight/60 inline-block" /> Estimated — based on your collection/payment history
        </span>
        <span className="flex items-center gap-1.5">
          <AlertTriangle className="h-3 w-3 text-rose-400" /> Balance drops below floor
        </span>
      </div>
    </div>
  )
}
