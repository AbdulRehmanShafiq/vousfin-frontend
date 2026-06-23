/**
 * BenchmarkingPage — Phase 8 FR-09.3
 *
 * Compares your 8 key financial ratios against your industry's median.
 * Plain-language labels so any owner can understand the numbers.
 */
import { useQuery } from '@tanstack/react-query'
import { Target, TrendingUp, TrendingDown, Minus, RefreshCw, Loader2 } from 'lucide-react'
import benchmarkingService from '@/services/benchmarking.service'
import { getErrorMessage } from '@/utils/errorHandler'
import toast from 'react-hot-toast'

// ── Plain-language ratio names ────────────────────────────────────────────────
const RATIO_META = {
  currentRatio:     { label: 'Can you pay short-term bills?',        unit: 'x',  higherBetter: true  },
  quickRatio:       { label: 'Liquid assets vs short-term debts',    unit: 'x',  higherBetter: true  },
  debtToEquity:     { label: 'How much you borrow vs own',           unit: 'x',  higherBetter: false },
  grossMargin:      { label: 'Profit before overhead',               unit: '%',  higherBetter: true  },
  netMargin:        { label: 'Final profit per rupee of sales',       unit: '%',  higherBetter: true  },
  returnOnAssets:   { label: 'How hard your assets work',            unit: '%',  higherBetter: true  },
  assetTurnover:    { label: 'Sales generated per rupee of assets',  unit: 'x',  higherBetter: true  },
  interestCoverage: { label: 'Ability to pay interest',              unit: 'x',  higherBetter: true  },
}

const SECTOR_LABELS = {
  default:      'General business',
  retail:       'Retail & Trade',
  manufacturing:'Manufacturing',
  services:     'Professional Services',
  technology:   'Technology',
  construction: 'Construction',
  healthcare:   'Healthcare',
  food_beverage:'Food & Beverage',
  education:    'Education',
}

function fmt(value, unit) {
  if (value === null || value === undefined) return '—'
  const n = Number(value)
  if (!isFinite(n)) return '—'
  if (unit === '%') return `${(n * 100).toFixed(1)}%`
  return `${n.toFixed(2)}x`
}

function DirectionBadge({ direction }) {
  if (direction === 'above')   return <span className="flex items-center gap-0.5 text-emerald-400 text-xs font-semibold"><TrendingUp className="h-3.5 w-3.5" /> Above</span>
  if (direction === 'below')   return <span className="flex items-center gap-0.5 text-rose-400 text-xs font-semibold"><TrendingDown className="h-3.5 w-3.5" /> Below</span>
  if (direction === 'at')      return <span className="flex items-center gap-0.5 text-amber-400 text-xs font-semibold"><Minus className="h-3.5 w-3.5" /> At median</span>
  return <span className="text-text-muted text-xs">No data</span>
}

function RatioCard({ ratioKey, ratio }) {
  const meta      = RATIO_META[ratioKey] || { label: ratioKey, unit: 'x', higherBetter: true }
  const bizVal    = fmt(ratio.business, meta.unit)
  const benchVal  = fmt(ratio.benchmark, meta.unit)
  const hasData   = ratio.business !== null && ratio.business !== undefined && ratio.benchmark

  // Bar widths: scale both values to percentage of max
  const rawBiz   = ratio.business  != null ? Math.abs(Number(ratio.business))  : 0
  const rawBench = ratio.benchmark != null ? Math.abs(Number(ratio.benchmark)) : 0
  const maxVal   = Math.max(rawBiz, rawBench, 0.001)
  const bizPct   = Math.min(100, (rawBiz / maxVal) * 100)
  const bPct     = Math.min(100, (rawBench / maxVal) * 100)

  const borderColor = {
    above:   'border-l-emerald-400',
    below:   'border-l-rose-400',
    at:      'border-l-amber-400',
    no_data: 'border-l-glass',
  }[ratio.direction] || 'border-l-glass'

  return (
    <div className={`premium-card p-4 border-l-4 ${borderColor} space-y-3`}>
      <div className="flex items-start justify-between gap-2">
        <p className="text-[13px] font-medium text-text-primary leading-tight">{meta.label}</p>
        <DirectionBadge direction={ratio.direction} />
      </div>

      {/* Values row */}
      <div className="flex items-center gap-4 text-sm">
        <div className="flex-1">
          <p className="text-[11px] text-text-muted mb-0.5">Your value</p>
          <p className="text-lg font-bold text-text-primary">{bizVal}</p>
        </div>
        <div className="w-px h-8 bg-glass" />
        <div className="flex-1">
          <p className="text-[11px] text-text-muted mb-0.5">Industry median</p>
          <p className="text-lg font-semibold text-text-secondary">{benchVal}</p>
        </div>
      </div>

      {/* Bar comparison */}
      {hasData && (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-text-muted w-16 shrink-0">Yours</span>
            <div className="flex-1 h-1.5 rounded-full bg-glass/40">
              <div
                className="h-full rounded-full bg-cyan/70 transition-all duration-500"
                style={{ width: `${bizPct.toFixed(1)}%` }}
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-text-muted w-16 shrink-0">Industry</span>
            <div className="flex-1 h-1.5 rounded-full bg-glass/40">
              <div
                className="h-full rounded-full bg-glass/70 transition-all duration-500"
                style={{ width: `${bPct.toFixed(1)}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function BenchmarkingPage() {
  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ['benchmarking'],
    queryFn:  () => benchmarkingService.getBenchmark().then(r => r.data?.data),
    staleTime: 5 * 60 * 1000,
    onError:  (e) => toast.error(getErrorMessage(e)),
  })

  const ratios      = data?.ratios || {}
  const sector      = data?.sector  || 'default'
  const score       = data?.overallScore ?? 0
  const measured    = data?.measuredRatios ?? 0
  const sectorLabel = SECTOR_LABELS[sector] || sector
  const ratioKeys   = Object.keys(RATIO_META)

  return (
    <div className="animate-fade-in pb-10 space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-amber-500/15">
            <Target className="h-5 w-5 text-amber-400" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-text-primary tracking-tight">Industry benchmarking</h1>
            <p className="text-sm text-text-secondary mt-0.5">
              How your ratios compare to your industry — sector: <span className="text-text-primary font-medium">{sectorLabel}</span>
            </p>
          </div>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="btn-gradient inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12.5px] font-semibold disabled:opacity-60"
        >
          {isFetching ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
          Refresh
        </button>
      </div>

      {/* Overall score card */}
      {!isLoading && !isError && (
        <div className="premium-card p-4 flex items-center gap-4">
          <div className="text-3xl font-bold text-cyan">{score}</div>
          <div>
            <p className="text-sm font-medium text-text-primary">of {measured} measured ratios above your industry median</p>
            <p className="text-xs text-text-muted mt-0.5">
              {measured < ratioKeys.length
                ? `${ratioKeys.length - measured} ratios need more transaction data to compute.`
                : 'All ratios measured.'}
            </p>
          </div>
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {ratioKeys.map(k => (
            <div key={k} className="premium-card h-40 animate-pulse" />
          ))}
        </div>
      )}

      {/* Error state */}
      {isError && (
        <div className="premium-card p-6 text-center">
          <p className="text-text-secondary text-sm">{getErrorMessage(error)}</p>
          <button onClick={() => refetch()} className="mt-3 text-cyan text-sm hover:underline">Try again</button>
        </div>
      )}

      {/* Ratio grid 2×4 */}
      {!isLoading && !isError && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {ratioKeys.map(k => (
            <RatioCard
              key={k}
              ratioKey={k}
              ratio={ratios[k] || { business: null, benchmark: null, direction: 'no_data' }}
            />
          ))}
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-text-muted pt-2">
        <span className="flex items-center gap-1"><TrendingUp className="h-3 w-3 text-emerald-400" /> Above your sector median — good</span>
        <span className="flex items-center gap-1"><TrendingDown className="h-3 w-3 text-rose-400" /> Below your sector median — worth reviewing</span>
        <span className="flex items-center gap-1"><Minus className="h-3 w-3 text-amber-400" /> At the median (within 2%)</span>
      </div>
    </div>
  )
}
