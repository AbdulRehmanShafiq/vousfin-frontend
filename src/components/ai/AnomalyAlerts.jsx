import { AlertTriangle, CheckCircle, Flag, ShieldAlert, Activity } from 'lucide-react'
import { cn } from '@/utils/cn'
import { formatCurrency, formatDate } from '@/utils/formatters'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'

// ─── Config ────────────────────────────────────────────────────────────────────

const SEVERITY = {
  critical: {
    border: 'border-red-500/40',
    bg: 'bg-red-500/5',
    icon: 'text-red-400',
    scoreBg: 'bg-red-500/20 text-red-300',
    badge: 'danger',
  },
  high: {
    border: 'border-orange-400/40',
    bg: 'bg-orange-400/5',
    icon: 'text-orange-400',
    scoreBg: 'bg-orange-400/20 text-orange-300',
    badge: 'warning',
  },
  medium: {
    border: 'border-yellow-400/40',
    bg: 'bg-yellow-400/5',
    icon: 'text-yellow-400',
    scoreBg: 'bg-yellow-400/20 text-yellow-300',
    badge: 'warning',
  },
  low: {
    border: 'border-glass',
    bg: 'bg-glass-panel',
    icon: 'text-text-muted',
    scoreBg: 'bg-white/5 text-text-muted',
    badge: 'default',
  },
}

const RISK_COLOR = {
  critical: 'text-red-400',
  high: 'text-orange-400',
  medium: 'text-yellow-400',
  low: 'text-emerald-400',
}

const STATUS_LABEL = {
  potentially_fraudulent: 'Potential Fraud',
  highly_suspicious: 'Highly Suspicious',
  suspicious: 'Suspicious',
}

// ─── Component ─────────────────────────────────────────────────────────────────

export default function AnomalyAlerts({ anomalies = [], onClassify }) {
  if (!Array.isArray(anomalies) || anomalies.length === 0) {
    return (
      <div className="premium-card p-12 text-center">
        <ShieldAlert className="h-10 w-10 text-text-muted mx-auto mb-3" />
        <p className="text-text-primary font-medium">No anomalies detected</p>
        <p className="text-text-muted text-sm mt-1">
          Run a scan to check your transaction patterns for irregularities.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {anomalies.map((a, i) => {
        const cfg = SEVERITY[a.severity] || SEVERITY.medium
        const riskColor = RISK_COLOR[a.fraudRiskLevel] || RISK_COLOR.medium
        const statusLabel = STATUS_LABEL[a.anomalyStatus] || 'Suspicious'
        const score = typeof a.anomalyScore === 'number' ? a.anomalyScore : null

        return (
          <div
            key={a.alertId || a.id || i}
            className={cn('rounded-xl border p-4 transition-colors', cfg.border, cfg.bg)}
          >
            {/* Header row */}
            <div className="flex items-start gap-3">
              <AlertTriangle className={cn('h-5 w-5 flex-shrink-0 mt-0.5', cfg.icon)} />

              <div className="flex-1 min-w-0">
                {/* Title + severity badge */}
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="font-bold text-text-primary text-sm truncate">
                    {a.title || a.description || 'Unknown Transaction'}
                  </span>
                  <Badge variant={cfg.badge} className="text-[10px] capitalize shrink-0">
                    {a.severity || 'medium'}
                  </Badge>
                  {a.anomalyStatus && (
                    <span className="text-[10px] font-medium text-text-muted capitalize shrink-0">
                      · {statusLabel}
                    </span>
                  )}
                </div>

                {/* Reason */}
                <p className="text-sm text-text-secondary leading-relaxed">
                  {a.reason || a.explanation || 'Unusual pattern detected by ML model.'}
                </p>

                {/* Meta row */}
                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-text-muted">
                  {a.date && (
                    <span>{formatDate(a.date)}</span>
                  )}
                  {a.amount != null && (
                    <span className="font-semibold text-text-primary">
                      {formatCurrency(a.amount)}
                    </span>
                  )}
                  {a.transactionType && (
                    <span className="capitalize">{a.transactionType}</span>
                  )}
                  {/* Anomaly score pill */}
                  {score !== null && (
                    <span
                      className={cn(
                        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold',
                        cfg.scoreBg
                      )}
                    >
                      <Activity className="h-3 w-3" />
                      Score {score}
                    </span>
                  )}
                  {/* Fraud risk */}
                  {a.fraudRiskLevel && (
                    <span className={cn('font-medium capitalize', riskColor)}>
                      {a.fraudRiskLevel} risk
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="mt-3 flex gap-2 pl-8">
              <Button
                variant="ghost"
                icon={CheckCircle}
                onClick={() => onClassify?.(a, 'legitimate')}
                className="text-emerald-400 hover:bg-emerald-400/10 border border-emerald-400/30 !py-1.5 !px-3 text-xs"
              >
                Legitimate
              </Button>
              <Button
                variant="ghost"
                icon={Flag}
                onClick={() => onClassify?.(a, 'fraud')}
                className="text-red-400 hover:bg-red-400/10 border border-red-400/30 !py-1.5 !px-3 text-xs"
              >
                Flag as Fraud
              </Button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
