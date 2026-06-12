/**
 * Reconciliation Exception Queue — Step 3.5 (VF-IMPL-FR01-001)
 *
 * Table of UNMATCHED bank items sorted by age (oldest first).
 * Each row shows:
 *   - Date, Amount, Bank description, Days unmatched (red if > 7)
 *   - Top candidate GL entry with probability
 *   - Actions: Confirm match | Choose different | Mark manually cleared | Create GL entry
 *
 * Route: /reconciliation/exceptions
 */
import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import reconciliationApi from '@/services/ai/reconciliationService'

function BreakdownBar({ label, pts, max }) {
  return (
    <div className="flex items-center gap-1 text-xs">
      <span className="w-16 text-gray-500 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-400 rounded-full"
          style={{ width: `${(pts / max) * 100}%` }}
        />
      </div>
      <span className="text-gray-400 w-8 text-right">{pts}</span>
    </div>
  )
}

function ExceptionRow({ item, onResolved }) {
  const [expanded, setExpanded] = useState(false)
  const [loading, setLoading]   = useState(false)
  const qc = useQueryClient()

  const bl   = item.bank_line
  const top  = item.candidates?.[0]
  const isStale = bl.days_old > 7

  const confirmMatch = async (candidate) => {
    setLoading(true)
    try {
      await reconciliationApi.confirmMatch({
        bank_line_id:    bl.line_id,
        gl_entry_id:     candidate.gl_entry_id,
        bank_account_id: new URLSearchParams(window.location.search).get('account') ?? '',
      })
      toast.success('Match confirmed')
      onResolved()
    } catch { toast.error('Failed to confirm match') }
    finally { setLoading(false) }
  }

  const clearItem = async () => {
    setLoading(true)
    try {
      await reconciliationApi.clearLine(bl.line_id, {
        bank_account_id: new URLSearchParams(window.location.search).get('account') ?? '',
        notes: 'Manually cleared',
      })
      toast.success('Item cleared')
      onResolved()
    } catch { toast.error('Failed to clear item') }
    finally { setLoading(false) }
  }

  return (
    <div className="border border-gray-200 rounded-xl bg-white overflow-hidden">
      {/* Main row */}
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50"
        onClick={() => setExpanded(e => !e)}
      >
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">{bl.description || '—'}</p>
          <p className="text-xs text-gray-500">{bl.tx_date}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-sm font-bold text-gray-900">PKR {Number(bl.amount).toLocaleString()}</p>
          <p className={`text-xs font-medium ${isStale ? 'text-red-600' : 'text-gray-400'}`}>
            {bl.days_old}d old {isStale ? '⚠' : ''}
          </p>
        </div>
        {top && (
          <div className="text-right shrink-0 hidden md:block">
            <p className="text-xs text-gray-500">Best match</p>
            <p className="text-xs font-mono text-blue-600">{top.gl_narration?.slice(0, 24)}</p>
            <p className="text-xs text-gray-400">{Math.round(top.probability * 100)}% prob</p>
          </div>
        )}
        <span className="text-gray-300 text-sm">{expanded ? '▲' : '▼'}</span>
      </div>

      {/* Expanded candidates */}
      {expanded && (
        <div className="border-t border-gray-100 px-4 py-3 space-y-3 bg-gray-50">
          {item.candidates.length === 0 ? (
            <p className="text-xs text-gray-400">No GL candidates found in ±30 day window</p>
          ) : (
            item.candidates.map((c, i) => (
              <div key={c.gl_entry_id} className="bg-white rounded-lg p-3 border border-gray-200">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-xs font-medium text-gray-800">{c.gl_narration || '—'}</p>
                    <p className="text-xs text-gray-500">
                      {c.gl_date} · PKR {Number(c.gl_amount).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-blue-600">{Math.round(c.probability * 100)}%</p>
                    <p className="text-xs text-gray-400">score {c.raw_score}/100</p>
                  </div>
                </div>

                {/* Score breakdown */}
                <div className="space-y-1 mb-3">
                  <BreakdownBar label="Amount"    pts={c.breakdown.amount}    max={40} />
                  <BreakdownBar label="Date"      pts={c.breakdown.date}      max={30} />
                  <BreakdownBar label="Reference" pts={c.breakdown.reference} max={20} />
                  <BreakdownBar label="Narration" pts={c.breakdown.narration} max={10} />
                </div>

                <button
                  onClick={() => confirmMatch(c)}
                  disabled={loading}
                  className="w-full text-xs bg-green-600 hover:bg-green-700 text-white py-1.5 rounded-lg"
                >
                  Confirm this match
                </button>
              </div>
            ))
          )}

          <div className="flex gap-2">
            <button
              onClick={clearItem}
              disabled={loading}
              className="flex-1 text-xs border border-gray-200 text-gray-600 py-1.5 rounded-lg hover:bg-gray-100"
            >
              Mark manually cleared
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function ReconciliationExceptionQueuePage() {
  const [searchParams] = useSearchParams()
  const accountId      = searchParams.get('account') ?? ''
  const [page, setPage]= useState(1)
  const qc             = useQueryClient()

  const { data: items = [], isLoading } = useQuery({
    queryKey:  ['recon-exceptions', accountId, page],
    queryFn:   () => reconciliationApi.getExceptions(accountId, { page, limit: 10 }).then(r => r.data),
    enabled:   !!accountId,
    staleTime: 30_000,
  })

  const handleResolved = () => qc.invalidateQueries({ queryKey: ['recon-exceptions'] })

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Reconciliation Exception Queue</h1>
        <p className="text-sm text-gray-500 mt-1">
          Unmatched bank transactions sorted by age — oldest first
        </p>
      </div>

      {isLoading && (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 animate-pulse rounded-xl" />
          ))}
        </div>
      )}

      {!isLoading && items.length === 0 && (
        <div className="text-center py-20 text-gray-400">
          <p className="text-4xl mb-3">✓</p>
          <p className="text-sm">All bank transactions reconciled!</p>
        </div>
      )}

      <div className="space-y-3">
        {items.map(item => (
          <ExceptionRow key={item.bank_line.line_id} item={item} onResolved={handleResolved} />
        ))}
      </div>

      {items.length > 0 && (
        <div className="flex justify-center gap-2">
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
            className="text-xs px-3 py-1 border rounded disabled:opacity-40">← Prev</button>
          <span className="text-xs self-center text-gray-500">Page {page}</span>
          <button disabled={items.length < 10} onClick={() => setPage(p => p + 1)}
            className="text-xs px-3 py-1 border rounded disabled:opacity-40">Next →</button>
        </div>
      )}
    </div>
  )
}
