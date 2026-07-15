/**
 * AdjustStockForm — inventory engine phase 2 UI.
 *
 * Four plain-language jobs an owner actually has, mapped to the accounting
 * engine's adjustment types. Every choice posts a real journal entry; the
 * preview line says exactly what will happen before they commit.
 *
 *   I counted the stock   → count   (variance in/out)
 *   Some is damaged/lost  → write_off
 *   I found extra         → increase
 *   It's worth less now   → revalue (NRV write-down, weighted-average only)
 */
import { useState } from 'react'
import { ClipboardCheck, PackageX, PackagePlus, TrendingDown } from 'lucide-react'
import { useAdjustStock } from '@/hooks/useInventory'
import { formatCurrency } from '@/utils/formatters'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import { REASON_LABELS } from './movementLabels'
import { cn } from '@/utils/cn'

const JOBS = [
  { key: 'count',    icon: ClipboardCheck, label: 'I counted the stock', hint: 'Set the real number you have' },
  { key: 'writeoff', icon: PackageX,       label: 'Some is damaged or lost', hint: 'Take it out of stock' },
  { key: 'found',    icon: PackagePlus,    label: 'I found extra', hint: 'Put more into stock' },
  { key: 'revalue',  icon: TrendingDown,   label: 'It’s worth less now', hint: 'Lower the value you carry it at' },
]

// Labels live in movementLabels so the ledger and this form always agree.
const WRITE_OFF_REASONS = ['damaged', 'expired', 'lost', 'theft', 'other']
  .map((value) => ({ value, label: REASON_LABELS[value] }))

export default function AdjustStockForm({ item, currency, onClose }) {
  const [job, setJob] = useState('count')
  const [countedQty, setCountedQty] = useState(String(item.currentStock ?? 0))
  const [qty, setQty] = useState('1')
  const [reason, setReason] = useState('damaged')
  const [newUnitCost, setNewUnitCost] = useState(String(item.unitCostPrice ?? 0))
  const [notes, setNotes] = useState('')
  const adjust = useAdjustStock()

  const isFifo = item.valuationMethod === 'fifo'
  const n = (v) => (Number.isFinite(parseFloat(v)) ? parseFloat(v) : 0)
  const unit = item.unit || 'units'

  // What will actually happen — in the owner's words, before they commit.
  const preview = (() => {
    if (job === 'count') {
      const delta = n(countedQty) - (item.currentStock || 0)
      if (Math.abs(delta) < 0.0001) return 'Your count matches the books — nothing will change.'
      return delta > 0
        ? `Stock goes up by ${delta} ${unit} — worth about ${formatCurrency(delta * (item.unitCostPrice || 0), currency)}.`
        : `Stock goes down by ${Math.abs(delta)} ${unit} — a cost of about ${formatCurrency(Math.abs(delta) * (item.unitCostPrice || 0), currency)}.`
    }
    if (job === 'writeoff') {
      const q = n(qty)
      if (q <= 0) return null
      if (q > (item.currentStock || 0)) return `You only have ${item.currentStock} ${unit} in stock.`
      return `Takes ${q} ${unit} out of stock — a cost of about ${formatCurrency(q * (item.unitCostPrice || 0), currency)}.`
    }
    if (job === 'found') {
      const q = n(qty)
      if (q <= 0) return null
      return `Adds ${q} ${unit} to stock — worth about ${formatCurrency(q * (item.unitCostPrice || 0), currency)}.`
    }
    const delta = (item.currentStock || 0) * (n(newUnitCost) - (item.unitCostPrice || 0))
    if (Math.abs(delta) < 0.01) return 'That’s the value you already carry it at — nothing will change.'
    if (delta > 0) return 'To raise the value you carry stock at, use a stock purchase or ask your accountant — this option only lowers it.'
    return `Lowers what your stock is worth by ${formatCurrency(Math.abs(delta), currency)}.`
  })()

  const blocked =
    (job === 'writeoff' && (n(qty) <= 0 || n(qty) > (item.currentStock || 0))) ||
    (job === 'found' && n(qty) <= 0) ||
    (job === 'revalue' && (isFifo || n(newUnitCost) >= (item.unitCostPrice || 0)))

  const submit = async (e) => {
    e.preventDefault()
    const body =
      job === 'count'    ? { type: 'count', countedQty: n(countedQty), reason: 'count_correction' }
      : job === 'writeoff' ? { type: 'write_off', qty: n(qty), reason }
      : job === 'found'    ? { type: 'increase', qty: n(qty), reason: 'found' }
      :                      { type: 'revalue', newUnitCost: n(newUnitCost), reason: 'nrv_write_down' }
    await adjust.mutateAsync({ id: item._id, ...body, notes: notes.trim() || undefined })
    onClose()
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <p className="text-sm text-text-secondary">
          {item.name} — you have <span className="font-semibold text-text-primary num">{item.currentStock} {unit}</span> at{' '}
          {formatCurrency(item.unitCostPrice || 0, currency)} each.
        </p>
      </div>

      {/* The job, not the accounting term */}
      <div className="grid grid-cols-2 gap-2">
        {JOBS.map(({ key, icon: Icon, label, hint }) => (
          <button
            key={key}
            type="button"
            onClick={() => setJob(key)}
            aria-pressed={job === key}
            className={cn(
              'tap-target flex flex-col items-start gap-1 rounded-card border p-3 text-left transition-colors',
              job === key ? 'border-accent/40 bg-accent-soft' : 'border-glass bg-glass-panel hover:bg-glass-hover',
            )}
          >
            <Icon className={cn('h-4 w-4', job === key ? 'text-accent' : 'text-text-muted')} aria-hidden="true" />
            <span className={cn('text-sm font-semibold', job === key ? 'text-accent' : 'text-text-primary')}>{label}</span>
            <span className="text-xs text-text-muted">{hint}</span>
          </button>
        ))}
      </div>

      {job === 'count' && (
        <Input
          label={`How many do you actually have? (${unit})`}
          type="number" min="0" step="any" autoFocus
          value={countedQty} onChange={(e) => setCountedQty(e.target.value)}
        />
      )}

      {job === 'writeoff' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label={`How many? (${unit})`} type="number" min="0" step="any" autoFocus
            value={qty} onChange={(e) => setQty(e.target.value)}
          />
          <Select label="Why?" options={WRITE_OFF_REASONS} value={reason} onChange={setReason} />
        </div>
      )}

      {job === 'found' && (
        <Input
          label={`How many did you find? (${unit})`} type="number" min="0" step="any" autoFocus
          value={qty} onChange={(e) => setQty(e.target.value)}
        />
      )}

      {job === 'revalue' && (
        isFifo ? (
          <p className="rounded-card border border-highlight/25 bg-highlight/10 px-4 py-3 text-sm text-highlight">
            This item tracks each batch’s own cost (FIFO), so its value can’t be lowered in one go here. Write off the
            old stock and add it back at the new cost instead.
          </p>
        ) : (
          <Input
            label={`What is one ${unit.replace(/s$/, '')} worth now? (${currency})`}
            type="number" min="0" step="any" autoFocus
            value={newUnitCost} onChange={(e) => setNewUnitCost(e.target.value)}
          />
        )
      )}

      <Input
        label="Note (optional)" placeholder="e.g. water damage in the back room"
        value={notes} onChange={(e) => setNotes(e.target.value)}
      />

      {preview && (
        <p className="rounded-card border border-glass bg-glass-panel px-4 py-3 text-sm text-text-secondary" role="note">
          {preview}
        </p>
      )}

      <div className="flex justify-end gap-3 border-t border-glass pt-4">
        <Button variant="ghost" type="button" onClick={onClose} disabled={adjust.isPending}>Cancel</Button>
        <Button type="submit" loading={adjust.isPending} disabled={blocked}>Save</Button>
      </div>
    </form>
  )
}
