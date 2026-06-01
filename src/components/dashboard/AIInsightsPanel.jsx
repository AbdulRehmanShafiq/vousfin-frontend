/**
 * AIInsightsPanel — the "AI Accountant"
 *
 * Action-focused, NOT a number re-display. The dashboard already shows the raw
 * figures (Key Metrics), the health scores (Business Intelligence) and balances
 * (Financial Position), so this panel deliberately avoids repeating them. It
 * answers one question: "what should I look at / do?"
 *
 *   1. Recommendations — from /ai/cashflow-recommendations
 *   2. Things to review — real insights from /ai/financial-insights (severity-sorted)
 *   3. Quick actions    — jump to the matching workflow
 */
import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Brain, AlertTriangle, AlertCircle, Info, CheckCircle2,
  ChevronDown, ChevronUp, ArrowRight, RefreshCw, Zap,
  Bell, DollarSign, CreditCard, FileText,
} from 'lucide-react'
import { useFinancialInsights, useAIRecommendations } from '@/hooks/useAI'
import { cn } from '@/utils/cn'

/* ══ Recommendations ═════════════════════════════════════════════════ */
function AIRecommendations({ recs, loading }) {
  if (loading) {
    return (
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-2">Recommended next steps</p>
        <div className="space-y-1.5">
          {[1, 2].map(i => <div key={i} className="h-8 animate-pulse rounded-lg bg-white/[0.04]" />)}
        </div>
      </div>
    )
  }
  if (!recs || recs.length === 0) return null

  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-2">Recommended next steps</p>
      <div className="space-y-1.5">
        {recs.slice(0, 3).map((rec, i) => {
          const text = rec.recommendation || rec.message || rec.text || rec.suggestion || String(rec)
          const cat  = rec.category || rec.type || ''
          return (
            <div key={i} className="flex items-start gap-2.5 p-2.5 rounded-lg border border-cyan/20 bg-cyan/5">
              <Zap className="h-3 w-3 text-cyan flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-text-secondary leading-snug">{text}</p>
                {cat && <p className="text-[9px] text-text-muted mt-0.5 uppercase tracking-wide">{cat}</p>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ══ Insight card (expandable) ═══════════════════════════════════════ */
const SEV = {
  critical: { Icon: AlertTriangle, color: 'text-red-400',    bg: 'bg-red-400/10',    border: 'border-red-400/25',    badge: 'bg-red-400/20 text-red-300',     label: 'Needs action' },
  warning:  { Icon: AlertCircle,  color: 'text-amber-400',  bg: 'bg-amber-400/10',  border: 'border-amber-400/25',  badge: 'bg-amber-400/20 text-amber-300', label: 'Worth a look' },
  info:     { Icon: Info,         color: 'text-cyan',        bg: 'bg-cyan/10',        border: 'border-cyan/25',        badge: 'bg-cyan/20 text-cyan',           label: 'Heads up'     },
  success:  { Icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/25', badge: 'bg-emerald-400/20 text-emerald-300', label: 'Good'     },
}
const PRIORITY = { critical: 0, warning: 1, info: 2, success: 3 }

function InsightCard({ insight }) {
  const [open, setOpen] = useState(false)
  const sev = insight.severity || insight.type || 'info'
  const cfg = SEV[sev] || SEV.info

  return (
    <button
      type="button"
      onClick={() => setOpen(o => !o)}
      className={cn('w-full text-left border rounded-xl p-3 transition-all duration-200 group', cfg.bg, cfg.border, open && 'shadow-lg')}
    >
      <div className="flex items-start gap-2.5">
        <div className={cn('p-1 rounded-lg flex-shrink-0 mt-0.5', cfg.bg)}>
          <cfg.Icon className={cn('h-3 w-3', cfg.color)} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
            <span className={cn('text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded', cfg.badge)}>{cfg.label}</span>
            {insight.category && <span className="text-[9px] text-text-muted uppercase tracking-wider">{insight.category}</span>}
          </div>
          <p className="text-xs font-semibold text-text-primary leading-snug">
            {insight.title || insight.message || insight.insight}
          </p>
          {open && (
            <div className="mt-2 space-y-1.5">
              {insight.detail && <p className="text-[11px] text-text-secondary leading-relaxed">{insight.detail}</p>}
              {insight.message && insight.title && insight.message !== insight.title && (
                <p className="text-[11px] text-text-secondary leading-relaxed">{insight.message}</p>
              )}
              {insight.suggestion && (
                <p className="text-[11px] text-text-muted">
                  <span className="text-cyan font-semibold">What to do: </span>{insight.suggestion}
                </p>
              )}
              {insight.action && (
                <span className="inline-flex items-center gap-1 text-[11px] text-cyan font-medium">
                  {insight.action} <ArrowRight className="h-2.5 w-2.5" />
                </span>
              )}
            </div>
          )}
        </div>
        <div className="flex-shrink-0">
          {open
            ? <ChevronUp className="h-3 w-3 text-text-muted" />
            : <ChevronDown className="h-3 w-3 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />}
        </div>
      </div>
    </button>
  )
}

/* ══ Quick actions ═══════════════════════════════════════════════════ */
const SMART_ACTIONS = [
  { label: 'Chase a payment', to: '/sales/receivables',  Icon: Bell,       color: '#fbbf24' },
  { label: 'Record payment',  to: '/transactions',        Icon: DollarSign, color: '#34d399' },
  { label: 'Pay a bill',      to: '/purchases/payables', Icon: CreditCard, color: '#f87171' },
  { label: 'New invoice',     to: '/customers',           Icon: FileText,   color: '#06b6d4' },
]

function SmartActionsBar() {
  return (
    <div className="pt-3 border-t border-glass mt-auto">
      <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-2">Quick actions</p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
        {SMART_ACTIONS.map(({ label, to, Icon, color }) => (
          <Link
            key={label}
            to={to}
            className="flex flex-col items-center gap-1 p-2 rounded-lg border border-white/[0.06] hover:border-white/[0.14] hover:bg-white/[0.04] transition-all group active:scale-95"
          >
            <div className="p-1.5 rounded-md" style={{ background: color + '18' }}>
              <Icon className="h-3 w-3" style={{ color }} />
            </div>
            <span className="text-[9px] font-semibold text-text-muted group-hover:text-text-secondary transition-colors text-center leading-tight">
              {label}
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}

/* ══ Main panel ══════════════════════════════════════════════════════ */
export default function AIInsightsPanel() {
  const { data: raw,  isLoading, isError, refetch, isFetching } = useFinancialInsights()
  const { data: recs, isLoading: recsLoading }                  = useAIRecommendations()
  const [showAll, setShowAll] = useState(false)

  const all = Array.isArray(raw?.insights) ? raw.insights : Array.isArray(raw) ? raw : []
  const sorted = [...all].sort((a, b) => {
    const pa = PRIORITY[a.severity || a.type] ?? 2
    const pb = PRIORITY[b.severity || b.type] ?? 2
    return pa - pb
  })
  const criticals = sorted.filter(i => (i.severity || i.type) === 'critical').length
  const warnings  = sorted.filter(i => (i.severity || i.type) === 'warning').length
  const visible   = showAll ? sorted : sorted.slice(0, 3)
  const recommendations = Array.isArray(recs) ? recs : []

  return (
    <div className="premium-card p-5 flex flex-col w-full bg-gradient-to-br from-glass-panel via-transparent to-cyan/5 border-cyan/20">

      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-cyan/15">
            <Brain className="h-4 w-4 text-cyan" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-text-primary flex items-center gap-2 flex-wrap">
              AI Accountant
              {criticals > 0 && (
                <span className="bg-red-400/20 text-red-300 text-[9px] font-bold px-1.5 py-0.5 rounded-full">{criticals} need action</span>
              )}
              {warnings > 0 && (
                <span className="bg-amber-400/20 text-amber-300 text-[9px] font-bold px-1.5 py-0.5 rounded-full">{warnings} to review</span>
              )}
            </h2>
            <p className="text-[11px] text-text-muted">Reviews your books for risks &amp; opportunities</p>
          </div>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="p-1.5 rounded-lg hover:bg-white/[0.06] transition-colors text-text-muted hover:text-text-secondary"
          title="Re-check"
        >
          <RefreshCw className={cn('h-3.5 w-3.5', isFetching && 'animate-spin')} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col gap-4 min-h-0 overflow-y-auto scrollbar-thin pr-0.5">

        <AIRecommendations recs={recommendations} loading={recsLoading} />

        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map(i => <div key={i} className="h-12 rounded-xl animate-pulse bg-white/[0.04]" />)}
          </div>
        ) : isError ? (
          <div className="flex items-center gap-2.5 p-2.5 rounded-xl border border-amber-400/20 bg-amber-400/5">
            <Zap className="h-3.5 w-3.5 text-amber-400 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-text-secondary">Couldn&apos;t check right now</p>
              <p className="text-[10px] text-text-muted">The review service is temporarily unavailable</p>
            </div>
            <button onClick={() => refetch()} className="text-[11px] text-cyan hover:underline font-medium flex-shrink-0">Retry</button>
          </div>
        ) : all.length === 0 ? (
          /* Honest single all-clear — reflects the REAL insights engine result
             (it actually checked spending, tax and cash flow), not 4 fake ticks. */
          <div className="flex items-start gap-2.5 p-3 rounded-xl border border-emerald-400/20 bg-emerald-400/8">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-text-primary">Nothing needs your attention</p>
              <p className="text-[11px] text-text-secondary leading-relaxed mt-0.5">
                We checked your spending, cash flow and tax position — no risks or unusual activity right now.
              </p>
            </div>
          </div>
        ) : (
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-2">Things to review</p>
            <div className="space-y-1.5">
              {visible.map((insight, i) => (
                <InsightCard key={insight.id || insight._id || i} insight={insight} />
              ))}
            </div>
            {sorted.length > 3 && (
              <button
                onClick={() => setShowAll(s => !s)}
                className="mt-2 w-full text-[11px] text-text-muted hover:text-text-secondary font-medium py-1.5 hover:bg-white/[0.04] rounded-lg transition-colors"
              >
                {showAll ? '↑ Show fewer' : `↓ Show ${sorted.length - 3} more`}
              </button>
            )}
          </div>
        )}
      </div>

      <SmartActionsBar />
    </div>
  )
}
