import { useMemo, useState } from 'react'
import { ArrowLeft, Plus, Minus, Search, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { formatCurrency } from '@/utils/formatters'
import { getErrorMessage } from '@/utils/errorHandler'
import { vibrate } from '@/design-system/haptics'
import MobilePage from '@/components/mobile/MobilePage'
import ListCard from '@/components/mobile/ListCard'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { cn } from '@/utils/cn'

/**
 * MobileDocFlow — send an invoice (or record a bill) in under a minute
 * (Mobile Easy §4.4). Three steps, one question each, sticky Next:
 *
 *   1. WHO   — party picker, recent first, inline "+ New"
 *   2. WHAT  — line cards (name · qty stepper · price), running total pinned
 *   3. SEND  — due-date chips, plain summary, Save draft / Save & submit
 *
 * A RENDERER over the same draft/create/submit hooks the desktop editor
 * uses — the accounting path is identical (no new pipelines). Tax % lives
 * under "More" per line; defaults stay simple.
 */

const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
const plusDays = (n) => { const d = new Date(); d.setDate(d.getDate() + n); return iso(d) }
const emptyLine = () => ({ _id: `l-${Math.random().toString(36).slice(2, 8)}`, name: '', quantity: 1, unitPrice: 0, taxRate: 0, more: false })

const DUE_CHIPS = [
  { label: 'Today', days: 0 },
  { label: 'In 7 days', days: 7 },
  { label: 'In 30 days', days: 30 },
]

export default function MobileDocFlow({
  kind = 'invoice',            // 'invoice' | 'bill'
  parties = [],                 // customers or vendors
  currency = 'PKR',
  onCreateDraft,               // async (payload) => id
  onSubmit,                    // async (id) => void
  onAddParty,                  // () => void (opens PartyFormModal)
  defaultPartyId = null,
  onDone,                      // (kind: 'draft'|'submitted') => void
  onBack,                      // () => void
}) {
  const isInvoice = kind === 'invoice'
  const [step, setStep] = useState(defaultPartyId ? 2 : 1)
  const [partyId, setPartyId] = useState(defaultPartyId || '')
  const [search, setSearch] = useState('')
  const [lines, setLines] = useState([emptyLine()])
  const [dueDate, setDueDate] = useState(plusDays(isInvoice ? 7 : 30))
  const [saving, setSaving] = useState(false)

  const party = parties.find((p) => p._id === partyId)
  const partyName = (p) => p?.businessName || p?.fullName || p?.name || 'Unnamed'
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return parties
    return parties.filter((p) => partyName(p).toLowerCase().includes(q))
  }, [parties, search])

  const validLines = lines.filter((l) => l.name.trim() && Number(l.quantity) > 0 && Number(l.unitPrice) > 0)
  const total = validLines.reduce((s, l) => s + Number(l.quantity) * Number(l.unitPrice) * (1 + (Number(l.taxRate) || 0) / 100), 0)

  const patchLine = (id, patch) => setLines((ls) => ls.map((l) => (l._id === id ? { ...l, ...patch } : l)))
  const removeLine = (id) => setLines((ls) => (ls.length > 1 ? ls.filter((l) => l._id !== id) : ls))

  const buildPayload = () => ({
    [isInvoice ? 'customerId' : 'vendorId']: partyId,
    issueDate: iso(new Date()),
    dueDate,
    currencyCode: currency,
    exchangeRate: 1,
    lineItems: validLines.map((l, i) => ({
      itemType: 'custom',
      name: l.name.trim(),
      description: '',
      quantity: Number(l.quantity),
      unitPrice: Number(l.unitPrice),
      discountType: null,
      discountValue: 0,
      taxRate: Number(l.taxRate) || 0,
      taxInclusive: false,
      sortOrder: i,
    })),
  })

  const save = async (submit) => {
    setSaving(true)
    try {
      const id = await onCreateDraft(buildPayload())
      if (submit && id) await onSubmit(id)
      vibrate()
      toast.success(submit ? (isInvoice ? 'Invoice sent for approval' : 'Bill submitted') : 'Draft saved')
      onDone?.(submit ? 'submitted' : 'draft')
    } catch (e) {
      toast.error(getErrorMessage(e))
    } finally {
      setSaving(false)
    }
  }

  const titles = {
    1: isInvoice ? 'Who is it for?' : 'Who is it from?',
    2: isInvoice ? 'What did you sell?' : 'What did you buy?',
    3: 'When should it be paid?',
  }

  return (
    <MobilePage
      title={isInvoice ? 'New invoice' : 'New bill'}
      subtitle={`Step ${step} of 3 — ${titles[step]}`}
      right={
        <button
          type="button"
          onClick={() => (step > 1 ? setStep(step - 1) : onBack?.())}
          aria-label={step > 1 ? 'Previous step' : 'Cancel'}
          className="tap-target flex items-center gap-1 rounded-control px-2 py-1.5 text-sm font-medium text-text-secondary hover:bg-glass-hover"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> {step > 1 ? 'Back' : 'Cancel'}
        </button>
      }
      cta={
        step === 1 ? (
          <Button className="w-full" disabled={!partyId} onClick={() => setStep(2)}>Next — what for?</Button>
        ) : step === 2 ? (
          <div className="space-y-1.5">
            <p className="text-center text-small text-text-muted">
              Total so far: <span className="num font-bold text-text-primary">{formatCurrency(total, currency)}</span>
            </p>
            <Button className="w-full" disabled={validLines.length === 0} onClick={() => setStep(3)}>Next — when to pay?</Button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Button variant="secondary" className="flex-1" loading={saving} onClick={() => save(false)}>Save draft</Button>
            <Button className="flex-1" loading={saving} onClick={() => save(true)}>
              {isInvoice ? 'Save & submit' : 'Submit bill'}
            </Button>
          </div>
        )
      }
    >
      {/* ── Step 1: WHO ── */}
      {step === 1 && (
        <div className="space-y-3 pt-1">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" aria-hidden="true" />
            <Input placeholder={isInvoice ? 'Search customers…' : 'Search suppliers…'} value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          <button
            type="button"
            onClick={onAddParty}
            className="tap-target flex w-full items-center gap-2 rounded-card border border-dashed border-glass-2 px-4 py-3 text-sm font-semibold text-accent hover:bg-glass-hover"
          >
            <Plus className="h-4 w-4" aria-hidden="true" /> {isInvoice ? 'New customer' : 'New supplier'}
          </button>
          <div className="space-y-1.5">
            {filtered.map((p) => (
              <ListCard
                key={p._id}
                title={partyName(p)}
                subtitle={p.email || p.phone || undefined}
                trailing={partyId === p._id ? '✓' : undefined}
                onClick={() => { setPartyId(p._id); vibrate() }}
                className={cn(partyId === p._id && 'border border-accent/40 bg-accent-soft')}
              />
            ))}
            {filtered.length === 0 && (
              <p className="py-8 text-center text-sm text-text-muted">No one matches — add them with the button above.</p>
            )}
          </div>
        </div>
      )}

      {/* ── Step 2: WHAT ── */}
      {step === 2 && (
        <div className="space-y-3 pt-1">
          {lines.map((l, i) => (
            <div key={l._id} className="rounded-card border border-glass bg-glass-panel p-3.5 space-y-2.5">
              <div className="flex items-center gap-2">
                <Input
                  placeholder={isInvoice ? 'What did you sell?' : 'What did you buy?'}
                  value={l.name}
                  onChange={(e) => patchLine(l._id, { name: e.target.value })}
                  containerClassName="flex-1"
                  aria-label={`Line ${i + 1} name`}
                />
                {lines.length > 1 && (
                  <button type="button" aria-label="Remove line" onClick={() => removeLine(l._id)}
                    className="tap-target rounded-control p-2 text-text-muted hover:text-negative hover:bg-glass-hover">
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2.5">
                <div className="flex items-center rounded-control border border-glass" role="group" aria-label="Quantity">
                  <button type="button" aria-label="Less" onClick={() => patchLine(l._id, { quantity: Math.max(1, Number(l.quantity) - 1) })}
                    className="tap-target px-3 py-2 text-text-secondary hover:text-text-primary"><Minus className="h-4 w-4" /></button>
                  <span className="num min-w-[2ch] text-center text-base font-semibold text-text-primary">{l.quantity}</span>
                  <button type="button" aria-label="More" onClick={() => patchLine(l._id, { quantity: Number(l.quantity) + 1 })}
                    className="tap-target px-3 py-2 text-text-secondary hover:text-text-primary"><Plus className="h-4 w-4" /></button>
                </div>
                <Input
                  type="number" inputMode="decimal" min="0" step="0.01"
                  placeholder="Price each"
                  value={l.unitPrice || ''}
                  onChange={(e) => patchLine(l._id, { unitPrice: e.target.value })}
                  containerClassName="flex-1"
                  aria-label={`Line ${i + 1} unit price`}
                />
              </div>
              <button type="button" onClick={() => patchLine(l._id, { more: !l.more })}
                className="text-xs font-medium text-text-muted hover:text-text-secondary">
                {l.more ? 'Hide options' : 'More options (tax)'}
              </button>
              {l.more && (
                <Input
                  type="number" inputMode="decimal" min="0" max="100" step="0.01"
                  label="Tax %" value={l.taxRate || ''}
                  onChange={(e) => patchLine(l._id, { taxRate: e.target.value })}
                />
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => setLines((ls) => [...ls, emptyLine()])}
            className="tap-target flex w-full items-center justify-center gap-2 rounded-card border border-dashed border-glass-2 px-4 py-3 text-sm font-semibold text-text-secondary hover:bg-glass-hover"
          >
            <Plus className="h-4 w-4" aria-hidden="true" /> Add another
          </button>
        </div>
      )}

      {/* ── Step 3: SEND ── */}
      {step === 3 && (
        <div className="space-y-4 pt-1">
          <div className="flex flex-wrap gap-2" role="group" aria-label="Due date">
            {DUE_CHIPS.map((c) => (
              <button
                key={c.label}
                type="button"
                aria-pressed={dueDate === plusDays(c.days)}
                onClick={() => setDueDate(plusDays(c.days))}
                className={cn(
                  'tap-target rounded-full border px-4 py-2 text-sm font-semibold transition-colors',
                  dueDate === plusDays(c.days) ? 'border-accent/40 bg-accent-soft text-accent' : 'border-glass text-text-secondary hover:bg-glass-hover',
                )}
              >
                {c.label}
              </button>
            ))}
          </div>
          <Input label="Or pick a date" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />

          {/* Plain summary — what will happen */}
          <div className="rounded-card border border-glass bg-glass-panel p-4 space-y-1.5">
            <p className="text-sm text-text-secondary">
              {isInvoice ? 'Invoice for' : 'Bill from'} <span className="font-semibold text-text-primary">{partyName(party)}</span>
            </p>
            {validLines.map((l) => (
              <p key={l._id} className="flex justify-between text-sm text-text-secondary">
                <span className="truncate">{l.quantity} × {l.name}</span>
                <span className="num text-text-primary">{formatCurrency(Number(l.quantity) * Number(l.unitPrice), currency)}</span>
              </p>
            ))}
            <p className="rule-total flex justify-between pt-2 text-sm font-bold text-text-primary">
              <span>Total{validLines.some((l) => Number(l.taxRate) > 0) ? ' (with tax)' : ''}</span>
              <span className="num">{formatCurrency(total, currency)}</span>
            </p>
            <p className="text-xs text-text-muted">Due {dueDate} · goes through the same books and approvals as always.</p>
          </div>
        </div>
      )}
    </MobilePage>
  )
}
