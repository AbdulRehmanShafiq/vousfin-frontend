import { useEffect, useCallback, useState } from 'react'
import {
  ShieldAlert, RefreshCw, AlertTriangle, CheckCircle2,
  Flag, Activity, Database,
} from 'lucide-react'
import toast from 'react-hot-toast'
import AnomalyAlerts from '@/components/ai/AnomalyAlerts'
import Button from '@/components/ui/Button'
import { useAIStore } from '@/stores/useAIStore'
import { getErrorMessage } from '@/utils/errorHandler'
import { cn } from '@/utils/cn'

// ─── Stats card ────────────────────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, colorClass }) {
  return (
    <div className="premium-card p-5 flex items-center gap-4">
      <div className={cn('p-3 rounded-xl', colorClass)}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-2xl font-black text-text-primary">{value ?? '—'}</p>
        <p className="text-xs text-text-muted mt-0.5">{label}</p>
      </div>
    </div>
  )
}

// ─── Filter tabs ───────────────────────────────────────────────────────────────

const TABS = [
  { key: 'scan',    label: 'Latest Scan' },
  { key: 'pending', label: 'Pending Review' },
  { key: 'history', label: 'All Alerts' },
]

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function AnomalyReviewPage() {
  const {
    anomalies,
    anomalyStats,
    lastScanResult,
    fetchAnomalies,
    fetchStoredAlerts,
    fetchAnomalyStats,
    reviewAnomaly,
    loading,
  } = useAIStore()

  const [activeTab, setActiveTab] = useState('scan')

  // Load stats once on mount
  useEffect(() => { fetchAnomalyStats() }, [fetchAnomalyStats])

  // Run a fresh scan on mount
  useEffect(() => {
    runScan()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const runScan = useCallback(async () => {
    try {
      await fetchAnomalies()
      setActiveTab('scan')
      toast.success('Isolation Forest scan complete')
    } catch (e) {
      toast.error(getErrorMessage(e))
    }
  }, [fetchAnomalies])

  const handleTabChange = useCallback(async (tab) => {
    setActiveTab(tab)
    if (tab === 'scan') return // already in store from last scan
    try {
      const status = tab === 'pending' ? 'pending' : null
      await fetchStoredAlerts(status)
    } catch (e) {
      toast.error(getErrorMessage(e))
    }
  }, [fetchStoredAlerts])

  const handleClassify = useCallback(async (anomaly, action) => {
    const alertId = anomaly.alertId || anomaly.id
    if (!alertId) {
      // scan result only — no alertId yet; just give feedback
      if (action === 'fraud') toast.error('Flagged as potential fraud')
      else toast.success('Marked as legitimate')
      return
    }
    try {
      await reviewAnomaly(String(alertId), action)
      if (action === 'fraud') {
        toast.error('Transaction flagged as potential fraud')
      } else {
        toast.success('Transaction marked as legitimate')
      }
    } catch (e) {
      toast.error(getErrorMessage(e))
    }
  }, [reviewAnomaly])

  const pending = anomalyStats?.pending ?? null
  const confirmed = anomalyStats?.confirmed_issue ?? null
  const reviewed = anomalyStats?.valid ?? null
  const totalAlerts = pending != null && confirmed != null && reviewed != null
    ? pending + confirmed + reviewed
    : null

  const scanTotal = lastScanResult?.totalScanned ?? null
  const scanFound = lastScanResult?.anomaliesFound ?? null

  return (
    <div className="space-y-8 animate-fade-in">

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-black text-text-primary tracking-tight">
            <ShieldAlert className="h-6 w-6 text-cyan" />
            Anomaly Detection
          </h1>
          <p className="text-text-secondary mt-1 text-sm">
            Isolation Forest ML model analyses your last 90 days of transactions for fraud and irregularities.
          </p>
        </div>
        <Button onClick={runScan} loading={loading} icon={RefreshCw}>
          Run Scan
        </Button>
      </div>

      {/* ── Stats cards ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Database}
          label="Transactions Scanned"
          value={scanTotal}
          colorClass="bg-cyan/10 text-cyan"
        />
        <StatCard
          icon={AlertTriangle}
          label="Flagged in Last Scan"
          value={scanFound}
          colorClass="bg-orange-400/10 text-orange-400"
        />
        <StatCard
          icon={Activity}
          label="Pending Review"
          value={pending}
          colorClass="bg-yellow-400/10 text-yellow-400"
        />
        <StatCard
          icon={Flag}
          label="Confirmed Fraud"
          value={confirmed}
          colorClass="bg-red-400/10 text-red-400"
        />
      </div>

      {/* ── Active anomaly alert banner ───────────────────────────────────── */}
      {!loading && Array.isArray(anomalies) && anomalies.length > 0 && (
        <div className="flex items-center gap-3 px-5 py-3 rounded-xl border border-red-400/30 bg-red-400/10 text-red-400">
          <ShieldAlert className="h-5 w-5 flex-shrink-0" />
          <p className="font-bold text-sm">
            {anomalies.length} anomal{anomalies.length === 1 ? 'y' : 'ies'} detected — review and classify below
          </p>
        </div>
      )}

      {/* ── All-clear banner ─────────────────────────────────────────────── */}
      {!loading && Array.isArray(anomalies) && anomalies.length === 0 && activeTab === 'scan' && lastScanResult && (
        <div className="flex items-center gap-3 px-5 py-3 rounded-xl border border-emerald-400/30 bg-emerald-400/10 text-emerald-400">
          <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
          <p className="font-bold text-sm">
            {lastScanResult.message || 'No anomalies detected. All transactions look normal.'}
          </p>
        </div>
      )}

      {/* ── Tab bar ──────────────────────────────────────────────────────── */}
      <div className="flex gap-1 p-1 rounded-xl bg-glass-panel border border-glass w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => handleTabChange(tab.key)}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-all',
              activeTab === tab.key
                ? 'bg-cyan text-navy font-bold shadow-sm'
                : 'text-text-secondary hover:text-text-primary'
            )}
          >
            {tab.label}
            {tab.key === 'pending' && pending != null && pending > 0 && (
              <span className="ml-2 px-1.5 py-0.5 rounded-full bg-yellow-400/20 text-yellow-400 text-[10px] font-bold">
                {pending}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Anomaly list ─────────────────────────────────────────────────── */}
      {loading ? (
        <div className="premium-card p-12 text-center">
          <div className="inline-flex flex-col items-center gap-4">
            <div className="h-10 w-10 rounded-full border-2 border-cyan border-t-transparent animate-spin" />
            <p className="text-text-secondary text-sm">
              Running Isolation Forest analysis…
            </p>
          </div>
        </div>
      ) : (
        <AnomalyAlerts anomalies={anomalies} onClassify={handleClassify} />
      )}

    </div>
  )
}
