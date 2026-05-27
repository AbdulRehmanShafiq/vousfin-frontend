/**
 * CurrencyRatesPage — Exchange Rate Management
 *
 * Features:
 *  • View / search all configured exchange rates
 *  • Add new rate (form: fromCurrency, toCurrency, rate, date)
 *  • Edit / delete existing rates
 *  • Trigger month-end FX revaluation
 *  • Visual latest-rate summary cards per currency pair
 */
import { useState, useMemo } from 'react'
import { DollarSign, Plus, Trash2, RefreshCw, Edit2, X, Check, TrendingUp } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import {
  useFxRates, useLatestRates,
  useCreateFxRate, useUpdateFxRate, useDeleteFxRate, useRunRevaluation,
} from '@/hooks/useFxRates'
import { useBusinessStore } from '@/stores/useBusinessStore'
import Button     from '@/components/ui/Button'
import Input      from '@/components/ui/Input'
import CurrencyBadge from '@/components/ui/CurrencyBadge'
import { formatDate } from '@/utils/formatters'

// ── Zod schema ────────────────────────────────────────────────────────────────
const rateSchema = z.object({
  fromCurrency: z.string().length(3, 'Must be a 3-letter code').toUpperCase(),
  toCurrency:   z.string().length(3, 'Must be a 3-letter code').toUpperCase(),
  rate:         z.coerce.number().positive('Rate must be positive'),
  rateDate:     z.string().min(1, 'Date required'),
  notes:        z.string().max(200).optional(),
}).refine(d => d.fromCurrency !== d.toCurrency, {
  message: 'From and To currencies must differ',
  path: ['toCurrency'],
})

// ── Add / Edit form (inline) ──────────────────────────────────────────────────
function RateForm({ defaultValues, onSave, onCancel, isPending }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(rateSchema),
    defaultValues: defaultValues ?? {
      fromCurrency: '',
      toCurrency:   '',
      rate:         '',
      rateDate:     new Date().toISOString().slice(0, 10),
      notes:        '',
    },
  })

  return (
    <form onSubmit={handleSubmit(onSave)} className="grid grid-cols-2 sm:grid-cols-5 gap-3 p-4 bg-glass-panel/60 rounded-xl border border-glass">
      <div>
        <Input
          label="From" placeholder="USD"
          {...register('fromCurrency')}
          error={errors.fromCurrency?.message}
          className="uppercase"
        />
      </div>
      <div>
        <Input
          label="To" placeholder="PKR"
          {...register('toCurrency')}
          error={errors.toCurrency?.message}
          className="uppercase"
        />
      </div>
      <div>
        <Input
          label="Rate" type="number" step="0.000001" placeholder="280.50"
          {...register('rate')}
          error={errors.rate?.message}
        />
      </div>
      <div>
        <Input
          label="Date" type="date"
          {...register('rateDate')}
          error={errors.rateDate?.message}
        />
      </div>
      <div className="flex items-end gap-2 col-span-2 sm:col-span-1">
        <Button type="submit" size="sm" icon={Check} loading={isPending} className="flex-1">
          Save
        </Button>
        <Button type="button" variant="secondary" size="sm" icon={X} onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function CurrencyRatesPage() {
  const baseCurrency = useBusinessStore(s => s.currency || s.baseCurrency || 'PKR')

  const [showAddForm, setShowAddForm]   = useState(false)
  const [editTarget,  setEditTarget]    = useState(null)   // { id, ...values }
  const [searchFrom,  setSearchFrom]    = useState('')
  const [searchTo,    setSearchTo]      = useState('')

  const params = useMemo(() => ({
    ...(searchFrom ? { fromCurrency: searchFrom.toUpperCase() } : {}),
    ...(searchTo   ? { toCurrency:   searchTo.toUpperCase()   } : {}),
    limit: 100,
  }), [searchFrom, searchTo])

  const { data: ratesData, isLoading }  = useFxRates(params)
  const { data: latestRates }           = useLatestRates()

  const createMutation    = useCreateFxRate()
  const updateMutation    = useUpdateFxRate()
  const deleteMutation    = useDeleteFxRate()
  const revaluateMutation = useRunRevaluation()

  const rates = ratesData?.data ?? []

  const handleCreate = (values) => {
    createMutation.mutate(values, { onSuccess: () => setShowAddForm(false) })
  }

  const handleUpdate = (values) => {
    updateMutation.mutate(
      { id: editTarget._id, data: values },
      { onSuccess: () => setEditTarget(null) }
    )
  }

  const handleDelete = (id) => {
    if (!window.confirm('Delete this exchange rate?')) return
    deleteMutation.mutate(id)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-black text-text-primary tracking-tight sm:text-2xl">
            <DollarSign className="h-5 w-5 text-cyan sm:h-6 sm:w-6" />
            Exchange Rates
          </h1>
          <p className="text-text-secondary text-sm mt-0.5">
            Manage daily FX rates — base currency: <CurrencyBadge code={baseCurrency} />
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary" size="sm" icon={TrendingUp}
            loading={revaluateMutation.isPending}
            onClick={() => revaluateMutation.mutate(null)}
            title="Run month-end unrealised FX revaluation for all open foreign-currency AR/AP"
          >
            Run Revaluation
          </Button>
          <Button size="sm" icon={Plus} onClick={() => { setShowAddForm(true); setEditTarget(null) }}>
            Add Rate
          </Button>
        </div>
      </div>

      {/* ── Latest rates summary ─────────────────────────────────────────── */}
      {latestRates?.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
            Latest Rates
          </p>
          <div className="flex flex-wrap gap-2">
            {latestRates.map(r => (
              <div key={`${r.fromCurrency}-${r.toCurrency}`}
                className="flex items-center gap-2 rounded-lg border border-glass bg-glass-panel px-3 py-2 text-sm">
                <CurrencyBadge code={r.fromCurrency} baseCurrency={baseCurrency} />
                <span className="text-text-muted text-xs">→</span>
                <CurrencyBadge code={r.toCurrency} baseCurrency={baseCurrency} />
                <span className="font-mono font-bold text-text-primary tabular-nums">
                  {r.rate.toLocaleString(undefined, { maximumFractionDigits: 6 })}
                </span>
                <span className="text-[10px] text-text-muted">{formatDate(r.rateDate)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Add form ─────────────────────────────────────────────────────── */}
      {showAddForm && !editTarget && (
        <RateForm
          onSave={handleCreate}
          onCancel={() => setShowAddForm(false)}
          isPending={createMutation.isPending}
        />
      )}

      {/* ── Search ───────────────────────────────────────────────────────── */}
      <div className="flex gap-3">
        <Input
          placeholder="Filter from (USD)"
          value={searchFrom}
          onChange={e => setSearchFrom(e.target.value)}
          containerClassName="w-40"
          className="uppercase"
        />
        <Input
          placeholder="Filter to (PKR)"
          value={searchTo}
          onChange={e => setSearchTo(e.target.value)}
          containerClassName="w-40"
          className="uppercase"
        />
      </div>

      {/* ── Rates table ──────────────────────────────────────────────────── */}
      <div className="premium-card overflow-hidden">
        {isLoading ? (
          <div className="py-12 text-center text-sm text-text-muted">Loading rates…</div>
        ) : rates.length === 0 ? (
          <div className="py-12 text-center">
            <DollarSign className="h-8 w-8 text-text-muted mx-auto mb-3 opacity-40" />
            <p className="text-sm text-text-muted">No exchange rates configured yet.</p>
            <p className="text-xs text-text-muted mt-1">
              Add your first rate above to enable multi-currency transactions.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-glass-panel text-[10px] uppercase text-text-muted tracking-wider">
                <tr>
                  <th className="px-4 py-2.5 font-semibold">From</th>
                  <th className="px-4 py-2.5 font-semibold">To</th>
                  <th className="px-4 py-2.5 font-semibold text-right">Rate</th>
                  <th className="px-4 py-2.5 font-semibold">Date</th>
                  <th className="px-4 py-2.5 font-semibold hidden md:table-cell">Source</th>
                  <th className="px-4 py-2.5 font-semibold hidden lg:table-cell">Notes</th>
                  <th className="px-4 py-2.5 w-20"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-glass">
                {rates.map(r => (
                  editTarget?._id === r._id ? (
                    <tr key={r._id}>
                      <td colSpan={7} className="p-0">
                        <RateForm
                          defaultValues={{
                            fromCurrency: r.fromCurrency,
                            toCurrency:   r.toCurrency,
                            rate:         r.rate,
                            rateDate:     new Date(r.rateDate).toISOString().slice(0, 10),
                            notes:        r.notes || '',
                          }}
                          onSave={handleUpdate}
                          onCancel={() => setEditTarget(null)}
                          isPending={updateMutation.isPending}
                        />
                      </td>
                    </tr>
                  ) : (
                    <tr key={r._id} className="hover:bg-glass-hover transition-colors text-text-secondary">
                      <td className="px-4 py-3">
                        <CurrencyBadge code={r.fromCurrency} baseCurrency={baseCurrency} size="sm" />
                      </td>
                      <td className="px-4 py-3">
                        <CurrencyBadge code={r.toCurrency} baseCurrency={baseCurrency} size="sm" />
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-text-primary tabular-nums">
                        {r.rate.toLocaleString(undefined, { maximumFractionDigits: 6 })}
                      </td>
                      <td className="px-4 py-3 text-xs">{formatDate(r.rateDate)}</td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className={`text-[10px] rounded px-1.5 py-px font-medium ${
                          r.source === 'imported'
                            ? 'bg-cyan/10 text-cyan'
                            : 'bg-glass-panel text-text-muted border border-glass'
                        }`}>
                          {r.source || 'manual'}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell text-xs text-text-muted truncate max-w-[160px]">
                        {r.notes || '—'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => { setEditTarget(r); setShowAddForm(false) }}
                            className="rounded p-1.5 text-text-muted hover:text-cyan hover:bg-glass-hover transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(r._id)}
                            className="rounded p-1.5 text-text-muted hover:text-red-400 hover:bg-red-500/10 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Help text ────────────────────────────────────────────────────── */}
      <div className="rounded-xl border border-glass bg-glass-panel/40 px-4 py-3">
        <p className="text-xs text-text-muted leading-relaxed">
          <strong className="text-text-secondary">IAS 21 compliant:</strong> Rates entered here are
          used automatically when recording foreign-currency transactions. The system looks up the
          most recent rate on or before the transaction date. Use <em>Run Revaluation</em> at
          month-end to generate unrealised FX gain/loss adjusting entries for open AR/AP positions.
        </p>
      </div>
    </div>
  )
}
