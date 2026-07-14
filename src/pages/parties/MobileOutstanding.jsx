/**
 * MobileOutstanding — phone-native Receivables / Payables list (Mobile-First
 * Redesign, pass 2). Shared by both directions (kind='receivable'|'payable');
 * the only differences are wording and which normalized party/doc fields a row
 * carries. Owns its own "record payment" sheet so the page render-split stays
 * tiny — the payment mutation is the same hook the desktop inline form uses,
 * so there is one settlement path.
 */
import { useState } from 'react'
import { Wallet, Search, AlertTriangle, CheckCircle2, DollarSign } from 'lucide-react'
import { useRecordPayment } from '@/hooks/useParties'
import { formatCurrency, formatDate } from '@/utils/formatters'
import MobilePage from '@/components/mobile/MobilePage'
import ListCard from '@/components/mobile/ListCard'
import PullToRefresh from '@/components/mobile/PullToRefresh'
import Sheet from '@/components/mobile/Sheet'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Button from '@/components/ui/Button'

function daysSince(dateStr) {
  if (!dateStr) return 0
  return Math.max(0, Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000))
}
function ageLabel(days) {
  if (days <= 0) return { label: 'Current', cls: 'bg-positive-muted text-positive' }
  if (days <= 30) return { label: '1–30 d', cls: 'bg-cyan/12 text-cyan' }
  if (days <= 90) return { label: `${days} d`, cls: 'bg-amber/12 text-amber' }
  return { label: `${days} d`, cls: 'bg-negative-muted text-negative' }
}

function PaymentSheet({ row, kind, currency, bankAccounts, onClose }) {
  const record = useRecordPayment()
  const [amount, setAmount] = useState(String(row?._outstanding ?? ''))
  const [acctId, setAcctId] = useState(bankAccounts[0]?.value || '')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [notes, setNotes] = useState('')

  const max = row?._outstanding ?? 0
  const valid = parseFloat(amount) > 0 && parseFloat(amount) <= max && acctId
  const partyName = row?._customerName || row?._vendorName || ''

  const submit = async () => {
    if (!valid) return
    await record.mutateAsync({
      parentTransactionId: row._id,
      amount: parseFloat(amount),
      paymentAccountId: acctId,
      transactionDate: date,
      notes: notes.trim() || undefined,
    })
    onClose()
  }

  return (
    <Sheet isOpen={!!row} onClose={onClose} title={kind === 'receivable' ? 'Record a payment in' : 'Record a payment out'}>
      <div className="space-y-3 pb-2">
        <p className="text-[13px] text-text-muted">
          Outstanding: <span className="font-semibold text-text-primary">{formatCurrency(max, currency)}</span>
          {partyName && <> · <span className="text-cyan">{partyName}</span></>}
        </p>
        <div className="grid grid-cols-2 gap-2">
          <Input label="Amount" type="number" step="0.01" min="0.01" max={max} value={amount} onChange={(e) => setAmount(e.target.value)} />
          <Input label="Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <Select label={kind === 'receivable' ? 'Deposit into' : 'Pay from'} options={bankAccounts} value={acctId} onChange={setAcctId} />
        <Input label="Notes (optional)" placeholder="Cheque no., reference…" value={notes} onChange={(e) => setNotes(e.target.value)} />
        <Button onClick={submit} loading={record.isPending} disabled={!valid} className="w-full">
          <CheckCircle2 className="mr-1 h-4 w-4" /> Save payment
        </Button>
      </div>
    </Sheet>
  )
}

export default function MobileOutstanding({
  kind, rows, currency, isLoading, query, onQuery,
  totalOutstanding, overdueCount, partyCount, bankAccounts, onRefresh,
}) {
  const [payingRow, setPayingRow] = useState(null)
  const isReceivable = kind === 'receivable'

  return (
    <MobilePage
      title={isReceivable ? 'Money owed to you' : 'Money you owe'}
      subtitle={isReceivable ? "Invoices customers haven't paid" : "Bills you haven't paid yet"}
    >
      <PullToRefresh onRefresh={onRefresh} className="h-full">
        <div className="space-y-4 pb-4">
          {/* Summary */}
          <div className="rounded-2xl bg-glass-panel p-4">
            <p className="text-[12px] text-text-muted">{isReceivable ? 'Total owed to you' : 'Total you owe'}</p>
            <p className={`num mt-1 text-[28px] font-bold leading-none ${isReceivable ? 'text-positive' : 'text-text-primary'}`}>
              {formatCurrency(totalOutstanding, currency)}
            </p>
            <div className="mt-3 flex gap-4 text-[12.5px]">
              <span className="text-text-muted">{partyCount} {isReceivable ? 'customers' : 'vendors'}</span>
              <span className={overdueCount > 0 ? 'font-semibold text-amber' : 'text-text-muted'}>
                {overdueCount > 0 ? `${overdueCount} overdue` : 'All on time'}
              </span>
            </div>
          </div>

          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            <input
              value={query}
              onChange={(e) => onQuery(e.target.value)}
              placeholder="Search…"
              className="w-full rounded-xl bg-glass-panel border border-glass py-2.5 pl-9 pr-3 text-sm text-text-primary placeholder:text-text-muted focus:border-cyan focus:outline-none"
            />
          </div>

          {isLoading && !rows.length ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => <div key={i} className="h-16 animate-pulse rounded-xl bg-glass-panel" />)}
            </div>
          ) : rows.length === 0 ? (
            <div className="rounded-xl border border-positive/20 bg-positive/5 p-6 text-center text-sm text-positive">
              <CheckCircle2 className="mx-auto mb-1 h-5 w-5" />
              {isReceivable ? 'Everyone has paid — nothing outstanding.' : "You're all paid up — nothing owed."}
            </div>
          ) : (
            <div className="space-y-1.5">
              {rows.map((r) => {
                const age = ageLabel(daysSince(r._dueDate || r._date))
                const party = r._customerName || r._vendorName || '—'
                const doc = r._invoice || r._bill
                return (
                  <ListCard
                    key={r._id}
                    onClick={() => setPayingRow(r)}
                    leading={
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan/12 text-cyan">
                        <Wallet className="h-4 w-4" />
                      </div>
                    }
                    title={party}
                    subtitle={
                      <span className="inline-flex items-center gap-1.5">
                        <span className={`rounded-full px-1.5 py-0.5 text-[11px] font-semibold ${age.cls}`}>{age.label}</span>
                        {doc ? <span className="font-mono">{doc}</span> : formatDate(r._date)}
                      </span>
                    }
                    trailing={formatCurrency(r._outstanding, currency)}
                    trailingSub="tap to pay"
                  />
                )
              })}
            </div>
          )}
        </div>
      </PullToRefresh>

      {/* key by row id so the form's initial state (amount = outstanding,
          default account) is re-seeded each time a different row is tapped —
          without the key the useState initializers keep the first row's values. */}
      <PaymentSheet
        key={payingRow?._id || 'none'}
        row={payingRow}
        kind={kind}
        currency={currency}
        bankAccounts={bankAccounts}
        onClose={() => setPayingRow(null)}
      />
    </MobilePage>
  )
}
