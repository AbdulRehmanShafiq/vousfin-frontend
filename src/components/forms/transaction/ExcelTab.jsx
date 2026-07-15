/**
 * ExcelTab — Excel / CSV bulk import with preview, inline editing and a
 * never-silently-lose-rows partial-result screen.
 * Extracted verbatim from TransactionFormModal (Ledger phase-6 decomposition).
 */
import { useRef, useState } from 'react'
import { Upload, AlertTriangle, Download, Loader2, X, ChevronUp, ChevronDown } from 'lucide-react'
import Button from '@/components/ui/Button'
import { useExcelPreview, useExcelConfirm } from '@/hooks/useTransactions'
import { buildFailedImportCsv } from '@/utils/failedImportCsv'
import { downloadBlob } from '@/utils/exportHelpers'
import { ConfBadge } from './previews'

export default function ExcelTab({ onSuccess, onCancel }) {
  const [step, setStep]         = useState('upload')
  const [preview, setPreview]   = useState(null)
  const [rows, setRows]         = useState([])
  const [editingIdx, setEditingIdx] = useState(null)
  const [showErrors, setShowErrors] = useState(false)
  const [importResult, setImportResult] = useState(null) // { successful, pending, failed[] }
  const fileInputRef            = useRef(null)
  const [dragOver, setDragOver] = useState(false)

  const excelPreview = useExcelPreview()
  const excelConfirm = useExcelConfirm()

  const handleFile = async (file) => {
    if (!file) return
    const ext = file.name.split('.').pop().toLowerCase()
    if (!['xlsx', 'xls', 'csv'].includes(ext)) return
    const result = await excelPreview.mutateAsync(file)
    if (result) {
      setPreview(result)
      setRows(result.validRows ? [...result.validRows] : [])
      setStep('preview')
      setEditingIdx(null)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault(); setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  const handleConfirm = async () => {
    if (!rows.length) return
    const result = await excelConfirm.mutateAsync(rows)
    // If any rows couldn't be recorded, or were imported at only medium
    // confidence, keep the modal open and SHOW them — never close on a partial
    // or spot-check-worthy import as if everything succeeded cleanly.
    if (result?.failed?.length || result?.flagged > 0) {
      setImportResult(result)
      setStep('result')
      return
    }
    onSuccess()
  }

  // Export the rows that couldn't be recorded (full source data + reason) so the
  // user can fix and re-import them — nothing is silently lost.
  const handleDownloadFailed = () => {
    const csv = buildFailedImportCsv(importResult?.failed || [], rows)
    const stamp = new Date().toISOString().split('T')[0]
    downloadBlob(new Blob([csv], { type: 'text/csv;charset=utf-8;' }), `vousfin-unrecorded-rows-${stamp}.csv`)
  }

  const updateRow = (idx, field, value) =>
    setRows(prev => prev.map((r, i) => i === idx ? { ...r, [field]: value } : r))

  const fmtDate = (raw) => {
    if (!raw) return '—'
    const s = typeof raw === 'string' ? raw : new Date(raw).toISOString()
    return s.split('T')[0]
  }
  const fmtAmt = (n) => Number(n || 0).toLocaleString('en-PK')

  // Partial-import result: some rows recorded, some could not be. Surface exactly
  // which rows failed and why, so nothing is silently lost.
  if (step === 'result' && importResult) {
    const posted  = importResult.successful ?? 0
    const pending = importResult.pending ?? 0
    const failed  = importResult.failed ?? []
    const flagged = importResult.flagged ?? 0
    return (
      <div className="space-y-4 animate-fade-in">
        <div className="rounded-lg border border-glass bg-glass-panel px-4 py-3">
          <p className="text-sm font-semibold text-text-primary">Import finished</p>
          <div className="mt-1 flex flex-wrap gap-3 text-xs">
            <span className="text-positive">✓ {posted} recorded</span>
            {pending > 0 && <span className="text-highlight">🕓 {pending} sent for approval</span>}
            {failed.length > 0 && <span className="text-negative">✕ {failed.length} could not be recorded</span>}
          </div>
        </div>

        {flagged > 0 && (
          <div className="rounded-lg border border-highlight/20 bg-highlight/5 px-3 py-2 text-xs text-highlight">
            <AlertTriangle className="inline h-3 w-3 mr-1" />
            {flagged} row{flagged !== 1 ? 's were' : ' was'} imported at medium confidence — worth a quick spot-check in the transaction list.
          </div>
        )}

        {failed.length > 0 && (
        <div className="rounded-lg border border-negative/20 bg-negative/5">
          <div className="flex items-center justify-between gap-2 px-3 py-2">
            <span className="text-xs font-semibold text-negative">
              <AlertTriangle className="inline h-3 w-3 mr-1" />
              These rows were NOT recorded — fix them and import again:
            </span>
            <button type="button" onClick={handleDownloadFailed}
              className="inline-flex items-center gap-1 rounded-md border border-negative/30 px-2 py-1 text-label font-medium text-negative hover:bg-negative/10 transition-colors shrink-0">
              <Download className="h-3 w-3" /> Download these rows (CSV)
            </button>
          </div>
          <ul className="max-h-56 overflow-auto border-t border-negative/20 divide-y divide-negative/10">
            {failed.map((f, i) => (
              <li key={i} className="flex items-start gap-2 px-3 py-2 text-xs">
                <span className="font-mono text-text-muted shrink-0">{f.row != null ? `Row ${f.row}` : `#${(f.index ?? i) + 1}`}</span>
                <span className="text-text-secondary">{f.error || 'Unknown error'}</span>
              </li>
            ))}
          </ul>
        </div>
        )}

        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => { setImportResult(null); setStep('upload'); setPreview(null); setRows([]) }}>
            Import another file
          </Button>
          <Button onClick={onSuccess}>Done</Button>
        </div>
      </div>
    )
  }

  if (step === 'preview' && preview) {
    const stats = preview.confidenceStats || {}
    const fi    = preview.fileInfo        || {}
    const dupes = preview.duplicatesFound || 0

    return (
      <div className="space-y-4 animate-fade-in">
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-glass bg-glass-panel px-4 py-3">
          <div className="space-y-0.5">
            <p className="text-sm font-semibold text-text-primary">
              {rows.length} rows ready to import
              {preview.invalidCount > 0 && (
                <span className="ml-2 text-xs text-highlight">({preview.invalidCount} skipped)</span>
              )}
            </p>
            <div className="flex flex-wrap gap-2 text-xs">
              {fi.format && <span className="text-text-muted font-mono uppercase">{fi.format}</span>}
              {stats.high   > 0 && <span className="text-positive">● {stats.high} High</span>}
              {stats.medium > 0 && <span className="text-highlight">● {stats.medium} Medium</span>}
              {stats.low    > 0 && <span className="text-negative">● {stats.low} Low confidence</span>}
              {dupes        > 0 && <span className="text-highlight">⚠ {dupes} duplicate{dupes > 1 ? 's' : ''}</span>}
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => { setStep('upload'); setPreview(null); setRows([]) }}
            disabled={excelConfirm.isPending}>
            <X className="h-3.5 w-3.5 mr-1" /> Change file
          </Button>
        </div>

        {preview.errors?.length > 0 && (
          <div className="rounded-lg border border-negative/20 bg-negative/5">
            <button type="button" onClick={() => setShowErrors(v => !v)}
              className="flex w-full items-center justify-between px-3 py-2 text-xs font-semibold text-negative">
              <span><AlertTriangle className="inline h-3 w-3 mr-1" />{preview.errors.length} row{preview.errors.length > 1 ? 's' : ''} with errors — click to {showErrors ? 'hide' : 'view'}</span>
              {showErrors ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </button>
            {showErrors && (
              <ul className="max-h-36 overflow-auto border-t border-negative/20 divide-y divide-negative/10">
                {preview.errors.map((e, i) => (
                  <li key={i} className="px-3 py-1.5 text-xs text-negative">
                    <span className="font-semibold">Row {e.row}</span>
                    {e.field && e.field !== 'general' && <span className="ml-1 rounded bg-negative/10 px-1 font-mono text-xs">{e.field}</span>}
                    {' '}{e.message}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        <div className="overflow-x-auto scrollbar-thin rounded-lg border border-glass max-h-72">
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-bg3 border-b border-glass">
              <tr>
                {['#', 'Date', 'Description', 'Amount', 'Debit → Credit', 'Conf.'].map(h => (
                  <th key={h} className="px-2 py-2 text-left font-medium text-text-secondary uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-glass">
              {rows.map((row, idx) => {
                const isEditing   = editingIdx === idx
                const hasDupe     = row.isDuplicate
                const hasInferred = row.inferredFields?.length > 0
                const hasWarning  = row.warnings?.length > 0
                const isLowConf   = (row.confidenceScore ?? 100) < 70

                return (
                  <tr key={idx}
                    className={`transition-colors ${hasDupe ? 'bg-highlight/5' : ''} ${isLowConf && !hasDupe ? 'bg-negative/5' : ''} ${isEditing ? 'bg-accent/5' : 'hover:bg-glass-hover'}`}>
                    <td className="px-2 py-1.5 text-text-muted w-8 text-center">{row.originalRow ?? idx + 2}</td>
                    <td className="px-2 py-1.5 whitespace-nowrap text-text-secondary">
                      {isEditing ? (
                        <input type="date"
                          className="w-28 rounded bg-glass-panel border border-accent/40 px-1.5 py-0.5 text-text-primary focus:outline-none"
                          value={fmtDate(row.transactionDate)}
                          onChange={e => updateRow(idx, 'transactionDate', e.target.value)} />
                      ) : fmtDate(row.transactionDate)}
                    </td>
                    <td className="px-2 py-1.5 max-w-[180px]">
                      {isEditing ? (
                        <input autoFocus
                          className="w-full rounded bg-glass-panel border border-accent/40 px-1.5 py-0.5 text-text-primary focus:outline-none"
                          value={row.description || ''}
                          onChange={e => updateRow(idx, 'description', e.target.value)}
                          onBlur={() => setEditingIdx(null)}
                          onKeyDown={e => e.key === 'Enter' && setEditingIdx(null)} />
                      ) : (
                        <span className="block truncate text-text-primary cursor-text hover:text-accent"
                          title={`${row.description}${hasWarning ? '\n⚠ ' + row.warnings.join('\n⚠ ') : ''}`}
                          onClick={() => setEditingIdx(idx)}>
                          {row.description}
                          {hasInferred && <span title={`AI inferred: ${row.inferredFields.join(', ')}`} className="ml-1 text-accent">✦</span>}
                          {hasDupe     && <span title="Possible duplicate" className="ml-1 text-highlight">⚠</span>}
                        </span>
                      )}
                    </td>
                    <td className="px-2 py-1.5 font-medium text-text-primary whitespace-nowrap text-right">
                      {isEditing ? (
                        <input type="number"
                          className="w-24 rounded bg-glass-panel border border-accent/40 px-1.5 py-0.5 text-text-primary text-right focus:outline-none"
                          value={row.amount}
                          onChange={e => updateRow(idx, 'amount', parseFloat(e.target.value) || 0)} />
                      ) : fmtAmt(row.amount)}
                    </td>
                    <td className="px-2 py-1.5 text-text-secondary max-w-[160px]">
                      <span className="truncate block" title={`${row.debitAccountName} → ${row.creditAccountName}`}>
                        {(row.debitAccountName || '—').split(' ').slice(0,2).join(' ')}
                        <span className="text-text-muted mx-0.5">→</span>
                        {(row.creditAccountName || '—').split(' ').slice(0,2).join(' ')}
                      </span>
                    </td>
                    <td className="px-2 py-1.5 whitespace-nowrap">
                      <ConfBadge label={row.confidenceLabel || 'High'} score={row.confidenceScore ?? 100} />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {rows.length > 0 && (
          <p className="text-center text-xs text-text-muted">
            Click any description to edit inline · ✦ = AI-inferred · ⚠ = possible duplicate · <span className="text-negative">red row = fuzzy account match</span>
          </p>
        )}

        <div className="flex justify-between gap-3 pt-3 border-t border-glass">
          <Button variant="ghost" onClick={onCancel} disabled={excelConfirm.isPending}>Cancel</Button>
          <Button onClick={handleConfirm} loading={excelConfirm.isPending} disabled={!rows.length}>
            Import {rows.length} Transaction{rows.length !== 1 ? 's' : ''}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <p className="text-sm text-text-secondary">
        Upload a spreadsheet and VousFin will parse, validate, and let you review before saving.
      </p>
      <div
        className={`relative flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-10 transition-colors cursor-pointer ${
          dragOver ? 'border-accent bg-accent/5' : 'border-glass hover:border-accent/40 hover:bg-glass-hover'
        }`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        {excelPreview.isPending
          ? <Loader2 className="h-10 w-10 text-accent animate-spin" />
          : <Upload  className="h-10 w-10 text-text-muted" />
        }
        <div className="text-center">
          <p className="font-medium text-text-primary">Drop file here or click to browse</p>
          <p className="text-xs text-text-muted mt-1">.xlsx · .xls · .csv — max 10 MB</p>
        </div>
        <input ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv" className="sr-only"
          onChange={(e) => handleFile(e.target.files?.[0])} />
      </div>
      <div className="rounded-lg border border-glass bg-glass-panel p-3 text-xs">
        <p className="font-medium text-text-secondary mb-1">Required columns (in any order, fuzzy-matched):</p>
        <p className="font-mono text-text-muted">date · description · amount · debit account · credit account</p>
        <p className="font-mono text-text-muted mt-0.5 text-xs">Optional: type · mode · customer · vendor · reference · notes · tax · currency</p>
      </div>
      <div className="flex justify-end pt-2 border-t border-glass">
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
      </div>
    </div>
  )
}
