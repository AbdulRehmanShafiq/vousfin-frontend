/**
 * Transaction entry — zero-logic preview & badge components.
 * Extracted verbatim from TransactionFormModal (Ledger phase-6 decomposition).
 */
import { formatCurrency } from '@/utils/formatters'

// ─── Confidence pill (used in AI banner) ──────────────────────────────────────
export function NLConfBadge({ score }) {
  if (score == null) return null
  const pct = Math.round(score * 100)
  const cls =
    pct >= 75 ? 'bg-positive/15 text-positive border-positive/25' :
    pct >= 50 ? 'bg-highlight/15  text-highlight  border-highlight/25' :
                'bg-negative/15    text-negative    border-negative/25'
  const label = pct >= 75 ? 'High' : pct >= 50 ? 'Medium' : 'Low'
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold ${cls}`}>
      {label} · {pct}% confidence
    </span>
  )
}

// ─── Excel ConfBadge (legacy small badge) ─────────────────────────────────────
export function ConfBadge({ label, score }) {
  const cls =
    label === 'High'   ? 'bg-positive/10 text-positive border-positive/20' :
    label === 'Medium' ? 'bg-highlight/10 text-highlight border-highlight/20' :
                         'bg-negative/10 text-negative border-negative/20'
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-xs font-semibold leading-none ${cls}`}>
      {score}%
    </span>
  )
}

// ─── Live Journal Preview (Step 6 — real-time DR/CR feedback) ────────────────
/**
 * Shows a compact double-entry preview card whenever both accounts and an amount
 * are selected. Zero-logic component — purely cosmetic, zero API calls.
 * A balanced entry is always guaranteed here (same amount DR = CR).
 */
export function LiveJournalPreview({ debitAccount, creditAccount, amount, currency }) {
  if (!debitAccount || !creditAccount || !(amount > 0)) return null
  return (
    <div className="rounded-lg border border-glass bg-glass-panel px-4 py-3 animate-fade-in">
      <div className="flex items-center justify-between mb-2.5">
        <span className="text-xs font-bold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-accent inline-block" />
          Journal Entry Preview
        </span>
        <span className="text-xs font-semibold text-positive">✓ Balanced</span>
      </div>
      <div className="space-y-1.5 font-mono text-xs">
        <div className="flex items-center gap-3">
          <span className="text-accent font-bold w-6 flex-shrink-0">DR</span>
          <span className="flex-1 text-text-primary truncate font-sans">{debitAccount}</span>
          <span className="text-accent font-semibold flex-shrink-0">{formatCurrency(amount, currency)}</span>
        </div>
        <div className="flex items-center gap-3 border-t border-glass/50 pt-1.5">
          <span className="text-text-muted font-bold w-6 flex-shrink-0">CR</span>
          <span className="flex-1 text-text-secondary truncate font-sans">{creditAccount}</span>
          <span className="text-text-secondary font-semibold flex-shrink-0">{formatCurrency(amount, currency)}</span>
        </div>
      </div>
    </div>
  )
}

// ─── Installment GAAP Journal Preview (shared) ────────────────────────────────
function buildClientAmortization({ principal, count, frequency, annualRatePct, method = 'reducing_balance' }) {
  if (!principal || principal <= 0 || !count || count < 1) {
    return { schedule: [], emi: 0, totalInterest: 0 }
  }
  const round2 = (n) => Math.round((isFinite(n) ? n : 0) * 100) / 100
  const periodsPerYear =
    frequency === 'weekly'    ? 52 :
    frequency === 'biweekly'  ? 26 :
    frequency === 'quarterly' ?  4 : 12
  const rate = (annualRatePct || 0) / 100 / periodsPerYear

  let emi, totalInterest
  if ((annualRatePct || 0) > 0 && method === 'reducing_balance' && rate > 0) {
    const pow = Math.pow(1 + rate, count)
    emi = principal * rate * pow / (pow - 1)
    totalInterest = (emi * count) - principal
  } else if ((annualRatePct || 0) > 0 && method === 'flat') {
    const years = count / periodsPerYear
    totalInterest = principal * (annualRatePct / 100) * years
    emi = (principal + totalInterest) / count
  } else {
    emi = principal / count
    totalInterest = 0
  }
  emi = round2(emi)
  totalInterest = round2(totalInterest)

  const schedule = []
  let opening = principal
  let pSum = 0, iSum = 0
  for (let i = 1; i <= count; i++) {
    let principalDue, interestDue
    if (method === 'reducing_balance' && (annualRatePct || 0) > 0) {
      interestDue  = round2(opening * rate)
      principalDue = round2(emi - interestDue)
    } else if (method === 'flat' && (annualRatePct || 0) > 0) {
      principalDue = round2(principal / count)
      interestDue  = round2(totalInterest / count)
    } else {
      principalDue = round2(principal / count)
      interestDue  = 0
    }
    if (i === count) {
      principalDue = round2(principal - pSum)
      interestDue  = round2(totalInterest - iSum)
    }
    const closing = round2(Math.max(0, opening - principalDue))
    schedule.push({ i, principalDue, interestDue, opening: round2(opening), closing })
    pSum += principalDue
    iSum += interestDue
    opening = closing
  }
  return { schedule, emi, totalInterest }
}

export function InstallmentJournalPreview({
  total, downPayment, installmentCount, installmentFrequency,
  interestRate, interestMethod, firstPaymentDate, assetName, currency,
}) {
  const amt       = total       || 0
  const down      = downPayment || 0
  const financed  = Math.max(0, amt - down)
  const n         = Math.max(1, installmentCount || 1)
  const annualRate = interestRate || 0
  const method    = interestMethod || 'reducing_balance'
  const freqLabel =
    installmentFrequency === 'weekly'    ? 'weekly'    :
    installmentFrequency === 'biweekly'  ? 'bi-weekly' :
    installmentFrequency === 'quarterly' ? 'quarterly' : 'monthly'

  const { schedule, emi, totalInterest } = buildClientAmortization({
    principal: financed, count: n, frequency: installmentFrequency, annualRatePct: annualRate, method,
  })
  const totalPayable = financed + totalInterest
  const balanced = Math.abs(amt - down - financed) < 0.01

  const showRows = schedule.length <= 4
    ? schedule
    : [...schedule.slice(0, 3), schedule[schedule.length - 1]]

  return (
    <div className="rounded-lg border border-accent/20 bg-navy/40 overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-accent/15 bg-accent/5">
        <div>
          <span className="text-xs font-bold text-accent uppercase tracking-wider">GAAP / IFRS — Compound Journal Entry</span>
          <span className="ml-1.5 text-small text-accent/50 normal-case tracking-normal">(accounting standards)</span>
        </div>
        <span className="ml-auto text-xs text-text-muted">at purchase date</span>
      </div>

      <div className="px-3 py-2 space-y-1">
        <div className="flex items-center gap-2 text-xs">
          <span className="font-mono font-bold text-accent w-5 flex-shrink-0">DR</span>
          <span className="flex-1 text-text-primary font-medium truncate">{assetName || 'Asset Account'}</span>
          <span className="font-mono text-accent font-semibold flex-shrink-0">{formatCurrency(amt, currency)}</span>
        </div>
        {down > 0 && (
          <div className="flex items-center gap-2 text-xs pl-4">
            <span className="font-mono font-bold text-text-muted w-5 flex-shrink-0">CR</span>
            <span className="flex-1 text-text-secondary truncate">Cash / Bank</span>
            <span className="font-mono text-text-secondary flex-shrink-0">{formatCurrency(down, currency)}</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-xs pl-4">
          <span className="font-mono font-bold text-highlight w-5 flex-shrink-0">CR</span>
          <span className="flex-1 text-highlight truncate font-medium">Loan Payable <span className="text-small text-highlight/70">(liability created)</span></span>
          <span className="font-mono text-highlight font-semibold flex-shrink-0">{formatCurrency(financed, currency)}</span>
        </div>
        <div className="border-t border-glass mt-1 pt-1 flex justify-between text-xs text-text-muted">
          <span>Balance check</span>
          <span className={`font-medium ${balanced ? 'text-positive' : 'text-negative'}`}>
            {balanced ? '✓ Balanced' : '✗ Unbalanced'}
          </span>
        </div>
      </div>

      {financed > 0 && (
        <div className="border-t border-accent/15 bg-highlight/5 px-3 py-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-small">
          <div>
            <span className="text-highlight/80 block">Liability Created</span>
            <span className="font-semibold text-highlight">{formatCurrency(financed, currency)}</span>
          </div>
          <div>
            <span className="text-text-muted block">EMI</span>
            <span className="font-semibold text-text-primary">{formatCurrency(emi, currency)}</span>
            <span className="text-text-muted ml-0.5">/{freqLabel}</span>
          </div>
          {annualRate > 0 && (
            <>
              <div>
                <span className="text-text-muted block">Total Interest</span>
                <span className="font-semibold text-highlight">{formatCurrency(totalInterest, currency)}</span>
              </div>
              <div>
                <span className="text-text-muted block">Total Payable</span>
                <span className="font-semibold text-text-primary">{formatCurrency(totalPayable, currency)}</span>
              </div>
            </>
          )}
          {annualRate === 0 && (
            <div>
              <span className="text-text-muted block">Interest</span>
              <span className="text-positive font-medium">Interest-free</span>
            </div>
          )}
          {firstPaymentDate && (
            <div>
              <span className="text-text-muted block">First Payment</span>
              <span className="font-semibold text-text-primary">{firstPaymentDate}</span>
            </div>
          )}
        </div>
      )}

      {schedule.length > 0 && financed > 0 && (
        <div className="border-t border-accent/15">
          <div className="px-3 py-1.5 bg-glass-panel text-xs font-bold text-text-secondary uppercase tracking-wider">
            Amortization {schedule.length > 4 ? `(first 3 + last of ${schedule.length})` : `(${schedule.length} payments)`}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-small">
              <thead className="bg-glass-panel text-text-muted">
                <tr>
                  <th className="px-2 py-1 text-left font-medium">#</th>
                  <th className="px-2 py-1 text-right font-medium">Principal</th>
                  <th className="px-2 py-1 text-right font-medium">Interest</th>
                  <th className="px-2 py-1 text-right font-medium">Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-glass">
                {showRows.map((row, idx) => {
                  const showEllipsis = schedule.length > 4 && idx === 3
                  return (
                    <>
                      {showEllipsis && (
                        <tr key={`ellipsis-${idx}`} className="text-text-muted">
                          <td colSpan="4" className="px-2 py-0.5 text-center text-xs">⋯</td>
                        </tr>
                      )}
                      <tr key={row.i} className="text-text-secondary">
                        <td className="px-2 py-1 font-mono text-text-muted">{row.i}</td>
                        <td className="px-2 py-1 font-mono text-right text-accent">{formatCurrency(row.principalDue, currency)}</td>
                        <td className="px-2 py-1 font-mono text-right text-highlight">{formatCurrency(row.interestDue, currency)}</td>
                        <td className="px-2 py-1 font-mono text-right">{formatCurrency(row.closing, currency)}</td>
                      </tr>
                    </>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Section label divider ────────────────────────────────────────────────────
export function SectionLabel({ label, note }) {
  return (
    <div className="flex items-center gap-3 pt-1">
      <span className="text-xs font-bold text-text-muted uppercase tracking-widest whitespace-nowrap">
        {label}
      </span>
      {note && <span className="text-xs text-text-muted/60">{note}</span>}
      <div className="flex-1 h-px bg-glass" />
    </div>
  )
}
