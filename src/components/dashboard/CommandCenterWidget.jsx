/**
 * CommandCenterWidget — the limited, dashboard-embedded view of the Command
 * Center inbox. Shows what needs the user (count + the top few actionable
 * items) and a link to open the full Command Center page separately.
 *
 * The full experience (autonomy dials, routines, bookkeeper intake, control
 * line, all insights) lives at /command-center. This is the glanceable slice.
 */
import { Link } from 'react-router-dom'
import { Inbox, ArrowUpRight, CheckCircle2, Brain, Info, AlertTriangle, AlertCircle } from 'lucide-react'
import { useAutonomyInbox } from '@/hooks/useAutonomy'
import { cn } from '@/utils/cn'

const INSIGHT_TONE = {
  critical: { Icon: AlertTriangle, text: 'text-negative' },
  warning:  { Icon: AlertCircle,   text: 'text-amber' },
  info:     { Icon: Info,          text: 'text-cyan' },
}

/* One compact row — an action awaiting approval, or an insight worth knowing. */
function MiniRow({ item }) {
  const isAction = item.kind === 'action'
  const tone = INSIGHT_TONE[item.level] || INSIGHT_TONE.info
  const Icon = isAction ? Brain : tone.Icon
  const row = (
    <div className="flex items-start gap-2.5 px-3 py-2.5 rounded-xl hover:bg-glass-hover transition-colors">
      <div className={cn('p-1.5 rounded-lg shrink-0', isAction ? 'bg-positive/12' : 'bg-glass-panel')}>
        <Icon className={cn('h-3.5 w-3.5', isAction ? 'text-positive' : tone.text)} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-semibold text-text-primary leading-snug truncate">{item.title}</p>
        {item.summary && (
          <p className="text-[12px] text-text-muted leading-snug truncate mt-0.5">{item.summary}</p>
        )}
      </div>
      {isAction && item.confidence != null && (
        <span className="text-[11px] font-bold text-cyan shrink-0 mt-0.5">{Math.round(item.confidence * 100)}%</span>
      )}
    </div>
  )
  return item.actionTo ? <Link to={item.actionTo} className="block">{row}</Link> : row
}

export default function CommandCenterWidget() {
  const { data, isLoading } = useAutonomyInbox()
  const items   = data?.items || []
  const counts  = data?.counts || {}
  const actions = items.filter(i => i.kind === 'action')
  const insights = items.filter(i => i.kind === 'insight')
  // Actions first (they need the user), then fill with insights — cap at 3.
  const preview = [...actions, ...insights].slice(0, 3)
  const waiting = counts.actions ?? actions.length
  const extra   = items.length - preview.length

  return (
    <div className="premium-card overflow-hidden">
      <div className="flex items-center justify-between px-4 sm:px-5 py-4 border-b border-glass">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-1.5 rounded-lg bg-cyan/15 shrink-0"><Inbox className="h-4 w-4 text-cyan" /></div>
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-text-primary leading-tight">Command Center</h3>
            <p className="text-[12.5px] text-text-muted leading-tight mt-0.5">
              {waiting > 0 ? `${waiting} waiting for you` : 'Your one inbox'}
            </p>
          </div>
        </div>
        <Link to="/command-center"
          className="flex items-center gap-1 text-[12.5px] text-cyan hover:underline font-medium shrink-0">
          Open <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="p-3">
        {isLoading ? (
          <div className="space-y-1.5">
            {[1, 2].map(i => <div key={i} className="h-12 rounded-xl bg-glass-panel animate-pulse" />)}
          </div>
        ) : preview.length === 0 ? (
          <div className="py-6 text-center">
            <CheckCircle2 className="h-6 w-6 text-positive mx-auto mb-2 opacity-70" />
            <p className="text-[13px] text-text-secondary">Nothing needs you right now.</p>
            <Link to="/command-center" className="inline-flex items-center gap-1 text-[12.5px] text-cyan font-semibold hover:underline mt-1.5">
              Open Command Center <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
        ) : (
          <div className="space-y-0.5">
            {preview.map(item => <MiniRow key={item.id} item={item} />)}
            {extra > 0 && (
              <Link to="/command-center"
                className="block w-full mt-1 text-center text-[12px] text-text-muted hover:text-cyan font-medium py-2 hover:bg-glass-hover rounded-lg transition-colors">
                + {extra} more in Command Center
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
