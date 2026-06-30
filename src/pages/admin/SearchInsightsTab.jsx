import { useEffect, useState } from 'react'
import { Search, RefreshCw, MousePointerClick, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '@/services/api'
import { getErrorMessage } from '@/utils/errorHandler'

function StatCard({ icon: Icon, label, value, hint }) {
  return (
    <div className="rounded-xl border border-glass bg-glass-panel p-4">
      <div className="flex items-center gap-2 text-[12px] uppercase tracking-wide text-text-muted">
        <Icon className="h-3.5 w-3.5" aria-hidden="true" /> {label}
      </div>
      <div className="mt-1 text-2xl font-bold text-text-primary">{value}</div>
      {hint ? <div className="text-[11px] text-text-muted">{hint}</div> : null}
    </div>
  )
}

function QueryList({ title, rows, emptyText }) {
  return (
    <div className="rounded-xl border border-glass bg-glass-panel p-4">
      <h3 className="mb-2 text-sm font-semibold text-text-primary">{title}</h3>
      {rows.length === 0 ? (
        <p className="text-[13px] text-text-muted">{emptyText}</p>
      ) : (
        <ul className="space-y-1">
          {rows.map((r) => (
            <li key={r.query} className="flex items-center justify-between gap-3 text-[13px]">
              <span className="truncate text-text-secondary">{r.query}</span>
              <span className="shrink-0 rounded bg-glass px-1.5 py-0.5 text-[11px] text-text-muted">{r.count}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

/**
 * Admin "Search Insights" — command-bar usage, click-through, and the
 * no-result content-gap backlog that drives help-content authoring. Includes a
 * one-click reindex of the global catalog + help corpus.
 */
export default function SearchInsightsTab() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [reindexing, setReindexing] = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await api.get('/search/insights', { params: { days: 30 } })
        if (!cancelled) setData(res.data.data)
      } catch (err) {
        if (!cancelled) toast.error(getErrorMessage(err))
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [])

  const reindex = async () => {
    setReindexing(true)
    try {
      const res = await api.post('/search/reindex')
      const d = res.data?.data || {}
      toast.success(`Reindexed ${d.catalog?.total || 0} catalog + ${d.help?.total || 0} help entries`)
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setReindexing(false)
    }
  }

  if (loading) return <p className="text-[13px] text-text-muted">Loading insights…</p>
  if (!data) return null

  const { totals, topQueries, gaps } = data

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[13px] text-text-muted">Command-bar usage over the last 30 days.</p>
        <button
          type="button"
          onClick={reindex}
          disabled={reindexing}
          className="inline-flex items-center gap-2 rounded-lg border border-glass bg-glass px-3 py-1.5 text-[13px] text-text-primary hover:bg-glass-hover disabled:opacity-60"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${reindexing ? 'animate-spin' : ''}`} aria-hidden="true" />
          {reindexing ? 'Reindexing…' : 'Reindex catalog + help'}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard icon={Search} label="Searches" value={totals.searches} />
        <StatCard icon={MousePointerClick} label="Click-through" value={`${totals.ctr}%`} hint={`${totals.clicks} opened`} />
        <StatCard icon={AlertCircle} label="No-result" value={totals.noResults} hint="content gaps" />
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <QueryList title="Top searches" rows={topQueries} emptyText="No searches recorded yet." />
        <QueryList title="No-result backlog (write help for these)" rows={gaps} emptyText="No content gaps — every search found something." />
      </div>
    </div>
  )
}
