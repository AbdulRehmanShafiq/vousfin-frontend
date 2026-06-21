/**
 * ReportBuilderPage — FR-02.5 custom report builder
 *
 * Two views:
 *   LIST   — cards of saved templates, "New report" base picker
 *   BUILDER — layout editor with reorder, show/hide, comparative, preview,
 *             save, schedule dialog, PDF/CSV export
 *
 * URL: /financial-reports/builder  (edit-in-place; no separate /:id route needed)
 */
import { useState, useRef, useCallback } from 'react'
import toast from 'react-hot-toast'
import {
  LayoutTemplate, Plus, Pencil, Trash2, ChevronUp, ChevronDown,
  Eye, EyeOff, X, Save, Calendar, FileDown, Loader2, PlayCircle,
} from 'lucide-react'
import { cn } from '@/utils/cn'
import {
  useReportTemplates,
  useSaveTemplate,
  useDeleteTemplate,
  useScheduleTemplate,
} from '@/hooks/useReports'
import reportService from '@/services/report.service'
import { useBusinessStore } from '@/stores/useBusinessStore'
import { getErrorMessage } from '@/utils/errorHandler'
import { formatCurrency } from '@/utils/formatters'

// ── helpers ──────────────────────────────────────────────────────────────────

const today = () => new Date().toISOString().split('T')[0]
const firstOfYear = () => `${new Date().getFullYear()}-01-01`

function defaultLayoutFor(baseType) {
  if (baseType === 'pl') {
    return [
      { id: 'r1', kind: 'section',       label: 'Revenue',          visible: true },
      { id: 'r2', kind: 'account-group', label: 'Revenue',          accountType: 'Revenue',  metric: 'flow', visible: true },
      { id: 'r3', kind: 'section',       label: 'Expenses',         visible: true },
      { id: 'r4', kind: 'account-group', label: 'Expenses',         accountType: 'Expense',  metric: 'flow', visible: true },
      { id: 'r5', kind: 'subtotal',      label: 'Net Income',       visible: true },
    ]
  }
  if (baseType === 'bs') {
    return [
      { id: 'r1', kind: 'section',       label: 'Assets',           visible: true },
      { id: 'r2', kind: 'account-group', label: 'Assets',           accountType: 'Asset',    metric: 'balance', visible: true },
      { id: 'r3', kind: 'section',       label: 'Liabilities',      visible: true },
      { id: 'r4', kind: 'account-group', label: 'Liabilities',      accountType: 'Liability',metric: 'balance', visible: true },
      { id: 'r5', kind: 'section',       label: 'Equity',           visible: true },
      { id: 'r6', kind: 'account-group', label: 'Equity',           accountType: 'Equity',   metric: 'balance', visible: true },
      { id: 'r7', kind: 'subtotal',      label: 'Total L + E',      visible: true },
    ]
  }
  // custom (blank)
  return [
    { id: 'r1', kind: 'section', label: 'Section 1', visible: true },
  ]
}

const BASE_LABELS = {
  pl:     'Profit & Loss',
  bs:     'Balance Sheet',
  custom: 'Custom',
}

const FREQ_OPTIONS = [
  { value: 'daily',   label: 'Every day' },
  { value: 'weekly',  label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
]

const KIND_LABELS = {
  section:       'Section heading',
  'account-group': 'Account group',
  account:       'Single account',
  subtotal:      'Subtotal',
  spacer:        'Spacer',
}

// ── Schedule dialog ───────────────────────────────────────────────────────────

function ScheduleDialog({ onClose, onSave, existing }) {
  const [enabled, setEnabled]         = useState(existing?.enabled ?? true)
  const [frequency, setFrequency]     = useState(existing?.frequency ?? 'monthly')
  const [dayOfWeek, setDayOfWeek]     = useState(existing?.dayOfWeek ?? 1)
  const [dayOfMonth, setDayOfMonth]   = useState(existing?.dayOfMonth ?? 1)
  const [hour, setHour]               = useState(existing?.hour ?? 8)
  const [recipients, setRecipients]   = useState((existing?.recipients || []).join(', '))

  const handleSave = () => {
    const emails = recipients.split(',').map(s => s.trim()).filter(Boolean)
    onSave({ enabled, frequency, dayOfWeek, dayOfMonth, hour, recipients: emails })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="premium-card w-full max-w-md space-y-4 p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-text-primary">Schedule this report</h3>
          <button onClick={onClose} className="text-text-secondary hover:text-text-primary">
            <X className="h-4 w-4" />
          </button>
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={enabled}
            onChange={e => setEnabled(e.target.checked)}
            className="accent-cyan h-4 w-4 rounded"
          />
          <span className="text-sm text-text-primary">Enable scheduled delivery</span>
        </label>

        <div className="space-y-3">
          <div>
            <label className="block text-xs text-text-secondary mb-1">How often</label>
            <select
              value={frequency}
              onChange={e => setFrequency(e.target.value)}
              className="input-base w-full"
            >
              {FREQ_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          {frequency === 'weekly' && (
            <div>
              <label className="block text-xs text-text-secondary mb-1">Day of week</label>
              <select
                value={dayOfWeek}
                onChange={e => setDayOfWeek(Number(e.target.value))}
                className="input-base w-full"
              >
                <option value={0}>Sunday</option>
                <option value={1}>Monday</option>
                <option value={2}>Tuesday</option>
                <option value={3}>Wednesday</option>
                <option value={4}>Thursday</option>
                <option value={5}>Friday</option>
                <option value={6}>Saturday</option>
              </select>
            </div>
          )}

          {frequency === 'monthly' && (
            <div>
              <label className="block text-xs text-text-secondary mb-1">Day of month (1–28)</label>
              <input
                type="number" min={1} max={28}
                value={dayOfMonth}
                onChange={e => setDayOfMonth(Number(e.target.value))}
                className="input-base w-full"
              />
            </div>
          )}

          <div>
            <label className="block text-xs text-text-secondary mb-1">Hour (0–23, UTC)</label>
            <input
              type="number" min={0} max={23}
              value={hour}
              onChange={e => setHour(Number(e.target.value))}
              className="input-base w-full"
            />
          </div>

          <div>
            <label className="block text-xs text-text-secondary mb-1">Email recipients (comma-separated)</label>
            <input
              type="text"
              value={recipients}
              onChange={e => setRecipients(e.target.value)}
              placeholder="you@example.com, team@example.com"
              className="input-base w-full"
            />
          </div>
        </div>

        <div className="flex gap-2 justify-end">
          <button onClick={onClose} className="btn-outline px-4 py-2 text-sm rounded-lg">Cancel</button>
          <button onClick={handleSave} className="btn-gradient px-4 py-2 text-sm rounded-lg">Save schedule</button>
        </div>
      </div>
    </div>
  )
}

// ── Preview table ─────────────────────────────────────────────────────────────

function PreviewTable({ result, currency }) {
  if (!result) return null
  const { columns = [], rows = [] } = result
  const comparative = columns.length > 1

  return (
    <div className="overflow-x-auto rounded-xl border border-glass">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-glass bg-glass-panel">
            <th className="px-4 py-2 text-left text-text-secondary font-medium">Label</th>
            {columns.map(col => (
              <th key={col.key} className="px-4 py-2 text-right text-text-secondary font-medium">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => {
            const isSect = row.kind === 'section'
            const isSub  = row.kind === 'subtotal'
            return (
              <tr
                key={row.id || i}
                className={cn(
                  'border-b border-glass/50 transition-colors',
                  isSect ? 'bg-glass-panel/50' : 'hover:bg-glass-hover',
                  !row.visible && 'opacity-40',
                )}
              >
                <td className={cn(
                  'px-4 py-2 text-text-primary',
                  isSect && 'font-semibold text-cyan uppercase text-xs tracking-wider',
                  isSub  && 'font-bold',
                )}>
                  {isSect ? '' : ''}{row.label}
                </td>
                {comparative ? (
                  <>
                    <td className="px-4 py-2 text-right text-text-primary tabular-nums">
                      {row.current != null && Number.isFinite(row.current)
                        ? formatCurrency(row.current, currency)
                        : '—'}
                    </td>
                    <td className="px-4 py-2 text-right text-text-secondary tabular-nums">
                      {row.prior != null && Number.isFinite(row.prior)
                        ? formatCurrency(row.prior, currency)
                        : '—'}
                    </td>
                    <td className="px-4 py-2 text-right tabular-nums">
                      {row.change != null && Number.isFinite(row.change)
                        ? <span className={cn(row.change >= 0 ? 'text-positive' : 'text-negative')}>
                            {row.change >= 0 ? '+' : ''}{formatCurrency(row.change, currency)}
                          </span>
                        : '—'}
                    </td>
                    <td className="px-4 py-2 text-right tabular-nums">
                      {row.changePct != null && Number.isFinite(row.changePct)
                        ? <span className={cn(row.changePct >= 0 ? 'text-positive' : 'text-negative')}>
                            {row.changePct >= 0 ? '+' : ''}{Number(row.changePct).toFixed(1)}%
                          </span>
                        : '—'}
                    </td>
                  </>
                ) : (
                  <td className="px-4 py-2 text-right text-text-primary tabular-nums font-medium">
                    {formatCurrency(row.current ?? row.balance ?? 0, currency)}
                  </td>
                )}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// ── List view ─────────────────────────────────────────────────────────────────

function TemplateCard({ tpl, onEdit, onDelete }) {
  const { _id, name, baseType, schedule } = tpl
  return (
    <div className="premium-card flex items-start justify-between gap-4 p-4">
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-text-primary truncate">{name}</p>
        <div className="mt-1 flex flex-wrap gap-2">
          <span className="rounded-full bg-cyan/10 px-2 py-0.5 text-xs text-cyan font-medium">
            {BASE_LABELS[baseType] ?? baseType}
          </span>
          {schedule?.enabled && (
            <span className="rounded-full bg-amber/10 px-2 py-0.5 text-xs text-amber-2 font-medium">
              Scheduled · {schedule.frequency}
            </span>
          )}
        </div>
      </div>
      <div className="flex gap-2 shrink-0">
        <button
          onClick={() => onEdit(tpl)}
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs btn-outline"
        >
          <Pencil className="h-3.5 w-3.5" /> Edit
        </button>
        <button
          onClick={() => onDelete(_id)}
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs bg-negative-muted text-negative border border-negative/20 hover:bg-negative/20"
        >
          <Trash2 className="h-3.5 w-3.5" /> Delete
        </button>
      </div>
    </div>
  )
}

function BasePickerPanel({ onSelect }) {
  const bases = [
    { key: 'pl',     label: 'Profit & Loss',  desc: 'Revenue minus expenses — your bottom line' },
    { key: 'bs',     label: 'Balance Sheet',  desc: 'What you own, owe, and what\'s left for owners' },
    { key: 'custom', label: 'Custom',         desc: 'Start from scratch — add any rows you need' },
  ]
  return (
    <div className="premium-card p-6 space-y-4">
      <h3 className="font-bold text-text-primary">Choose a starting point</h3>
      <div className="grid gap-3 sm:grid-cols-3">
        {bases.map(b => (
          <button
            key={b.key}
            onClick={() => onSelect(b.key)}
            className="flex flex-col gap-1 rounded-xl border border-glass p-4 text-left transition-all hover:border-cyan/50 hover:bg-glass-hover"
          >
            <span className="font-semibold text-text-primary">{b.label}</span>
            <span className="text-xs text-text-secondary">{b.desc}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

// ── Builder view ──────────────────────────────────────────────────────────────

function LayoutRow({ row, index, total, onMove, onToggle, onLabelChange, onRemove }) {
  return (
    <div className={cn(
      'flex items-center gap-3 rounded-xl border border-glass p-3 transition-all',
      row.kind === 'section' ? 'bg-glass-panel/60' : 'bg-glass-panel/20',
      !row.visible && 'opacity-60',
    )}>
      {/* Move controls */}
      <div className="flex flex-col gap-0.5 shrink-0">
        <button
          disabled={index === 0}
          onClick={() => onMove(index, -1)}
          className="rounded p-0.5 text-text-secondary hover:text-text-primary disabled:opacity-30"
          aria-label="Move up"
        >
          <ChevronUp className="h-3.5 w-3.5" />
        </button>
        <button
          disabled={index === total - 1}
          onClick={() => onMove(index, 1)}
          className="rounded p-0.5 text-text-secondary hover:text-text-primary disabled:opacity-30"
          aria-label="Move down"
        >
          <ChevronDown className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Kind badge */}
      <span className="shrink-0 text-xs text-text-secondary font-medium w-28 hidden sm:block">
        {KIND_LABELS[row.kind] ?? row.kind}
      </span>

      {/* Label editor */}
      <input
        value={row.label}
        onChange={e => onLabelChange(row.id, e.target.value)}
        className="flex-1 min-w-0 input-base text-sm py-1"
        placeholder="Label…"
      />

      {/* Show/hide */}
      <button
        onClick={() => onToggle(row.id)}
        className={cn(
          'shrink-0 rounded-lg p-1.5 transition-colors',
          row.visible
            ? 'text-text-secondary hover:text-text-primary'
            : 'text-text-disabled hover:text-text-secondary',
        )}
        aria-label={row.visible ? 'Hide' : 'Show'}
        title={row.visible ? 'Hide' : 'Show'}
      >
        {row.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
      </button>

      {/* Remove */}
      <button
        onClick={() => onRemove(row.id)}
        className="shrink-0 rounded-lg p-1.5 text-text-secondary hover:text-negative transition-colors"
        aria-label="Remove row"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function ReportBuilderPage() {
  const [view, setView]                   = useState('list')   // 'list' | 'builder'
  const [showBasePicker, setShowBasePicker] = useState(false)

  // Builder state
  const [templateId, setTemplateId]       = useState(null)
  const [name, setName]                   = useState('')
  const [baseType, setBaseType]           = useState('pl')
  const [layout, setLayout]               = useState([])
  const [comparative, setComparative]     = useState({ enabled: false, mode: 'prior-period' })
  const [startDate, setStartDate]         = useState(firstOfYear)
  const [endDate, setEndDate]             = useState(today)

  const [previewResult, setPreviewResult] = useState(null)
  const [previewing, setPreviewing]       = useState(false)
  const [saving, setSaving]               = useState(false)
  const [exporting, setExporting]         = useState(null) // 'pdf' | 'csv' | null
  const [showSchedule, setShowSchedule]   = useState(false)
  const [scheduleExisting, setScheduleExisting] = useState(null)

  const idCounter = useRef(100)

  const currency    = useBusinessStore(s => s.currency)
  const { data: templates = [], isLoading } = useReportTemplates()
  const saveTemplate    = useSaveTemplate()
  const deleteTemplate  = useDeleteTemplate()
  const scheduleTemplate = useScheduleTemplate()

  // ── Layout helpers ────────────────────────────────────────────────────────

  const moveRow = useCallback((index, dir) => {
    setLayout(prev => {
      const next = [...prev]
      const target = index + dir
      if (target < 0 || target >= next.length) return prev
      ;[next[index], next[target]] = [next[target], next[index]]
      return next
    })
  }, [])

  const toggleRow = useCallback((id) => {
    setLayout(prev => prev.map(r => r.id === id ? { ...r, visible: !r.visible } : r))
  }, [])

  const changeLabelRow = useCallback((id, label) => {
    setLayout(prev => prev.map(r => r.id === id ? { ...r, label } : r))
  }, [])

  const removeRow = useCallback((id) => {
    setLayout(prev => prev.filter(r => r.id !== id))
  }, [])

  const addRow = useCallback((kind) => {
    idCounter.current += 1
    const id = `new-${idCounter.current}`
    setLayout(prev => [
      ...prev,
      { id, kind, label: KIND_LABELS[kind] ?? kind, visible: true },
    ])
  }, [])

  // ── Navigation ────────────────────────────────────────────────────────────

  const openNewWithBase = useCallback((base) => {
    setTemplateId(null)
    setName('')
    setBaseType(base)
    setLayout(defaultLayoutFor(base))
    setComparative({ enabled: false, mode: 'prior-period' })
    setStartDate(firstOfYear())
    setEndDate(today())
    setPreviewResult(null)
    setShowBasePicker(false)
    setView('builder')
  }, [])

  const openEdit = useCallback((tpl) => {
    setTemplateId(tpl._id)
    setName(tpl.name || '')
    setBaseType(tpl.baseType || 'custom')
    setLayout(tpl.layout || defaultLayoutFor(tpl.baseType || 'custom'))
    setComparative(tpl.comparative || { enabled: false, mode: 'prior-period' })
    setStartDate(firstOfYear())
    setEndDate(today())
    setPreviewResult(null)
    setScheduleExisting(tpl.schedule ?? null)
    setView('builder')
  }, [])

  const goBack = useCallback(() => {
    setView('list')
    setShowBasePicker(false)
    setPreviewResult(null)
  }, [])

  // ── Actions ───────────────────────────────────────────────────────────────

  const handleDelete = useCallback(async (id) => {
    if (!window.confirm('Delete this report template?')) return
    try {
      await deleteTemplate.mutateAsync(id)
      toast.success('Template deleted')
    } catch (err) {
      toast.error(getErrorMessage(err) || 'Could not delete template')
    }
  }, [deleteTemplate])

  const handlePreview = useCallback(async () => {
    setPreviewing(true)
    setPreviewResult(null)
    try {
      const body = { baseType, layout, comparative, startDate, endDate }
      if (templateId) {
        const { data } = await reportService.renderTemplate(templateId, { startDate, endDate })
        setPreviewResult(data.data)
      } else {
        const { data } = await reportService.previewTemplate(body)
        setPreviewResult(data.data)
      }
    } catch (err) {
      toast.error(getErrorMessage(err) || 'Preview failed')
    } finally {
      setPreviewing(false)
    }
  }, [baseType, layout, comparative, startDate, endDate, templateId])

  const handleSave = useCallback(async () => {
    if (!name.trim()) { toast.error('Give the report a name first'); return }
    setSaving(true)
    try {
      const body = { name: name.trim(), baseType, layout, comparative }
      const saved = await saveTemplate.mutateAsync({ id: templateId, body })
      if (!templateId && saved?._id) setTemplateId(saved._id)
      toast.success('Report saved')
    } catch (err) {
      toast.error(getErrorMessage(err) || 'Could not save report')
    } finally {
      setSaving(false)
    }
  }, [name, baseType, layout, comparative, templateId, saveTemplate])

  const handleScheduleSave = useCallback(async (scheduleBody) => {
    if (!templateId) { toast.error('Save the report first before scheduling'); return }
    setShowSchedule(false)
    try {
      await scheduleTemplate.mutateAsync({ id: templateId, body: scheduleBody })
      toast.success('Schedule saved')
    } catch (err) {
      toast.error(getErrorMessage(err) || 'Could not save schedule')
    }
  }, [templateId, scheduleTemplate])

  const handleExport = useCallback(async (format) => {
    if (!templateId) { toast.error('Save the report first before exporting'); return }
    setExporting(format)
    try {
      const response = await reportService.exportTemplate(templateId, { format, startDate, endDate })
      const mime = format === 'pdf' ? 'application/pdf' : 'text/csv'
      const blob = new Blob([response.data], { type: mime })
      const url  = window.URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href     = url
      a.download = `report-${templateId}-${endDate}.${format}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
      toast.success(`Report downloaded as ${format.toUpperCase()}`)
    } catch (err) {
      toast.error(getErrorMessage(err) || `Export as ${format.toUpperCase()} failed`)
    } finally {
      setExporting(null)
    }
  }, [templateId, startDate, endDate])

  // ── Comparative helper ────────────────────────────────────────────────────

  const comparativeModeLabel = (mode) => {
    if (mode === 'prior-period') return 'Compare to last period'
    if (mode === 'prior-year')   return 'Compare to last year'
    return 'No comparison'
  }

  // ══════════════════════════════════════════════════════════════════════════
  // RENDER — LIST VIEW
  // ══════════════════════════════════════════════════════════════════════════
  if (view === 'list') {
    return (
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-black text-text-primary tracking-tight">
              <LayoutTemplate className="h-6 w-6 text-cyan" />
              Report Builder
            </h1>
            <p className="mt-1 text-sm text-text-secondary">
              Build custom layouts, compare periods, and schedule delivery.
            </p>
          </div>
          <button
            onClick={() => setShowBasePicker(v => !v)}
            className="btn-gradient flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold"
          >
            <Plus className="h-4 w-4" /> New report
          </button>
        </div>

        {/* Base picker */}
        {showBasePicker && (
          <BasePickerPanel onSelect={openNewWithBase} />
        )}

        {/* Template cards */}
        {isLoading ? (
          <div className="space-y-3">
            {[1,2,3].map(n => (
              <div key={n} className="h-20 rounded-xl bg-glass-panel animate-pulse" />
            ))}
          </div>
        ) : templates.length === 0 ? (
          <div className="premium-card flex flex-col items-center justify-center py-16 text-center gap-3">
            <LayoutTemplate className="h-10 w-10 text-text-disabled" />
            <p className="text-text-secondary">No saved reports yet. Create your first one above.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {templates.map(tpl => (
              <TemplateCard
                key={tpl._id}
                tpl={tpl}
                onEdit={openEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    )
  }

  // ══════════════════════════════════════════════════════════════════════════
  // RENDER — BUILDER VIEW
  // ══════════════════════════════════════════════════════════════════════════
  return (
    <>
      {showSchedule && (
        <ScheduleDialog
          existing={scheduleExisting}
          onClose={() => setShowSchedule(false)}
          onSave={handleScheduleSave}
        />
      )}

      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={goBack}
              className="rounded-lg p-2 text-text-secondary hover:text-text-primary hover:bg-glass-hover"
              aria-label="Back to list"
            >
              <ChevronUp className="h-4 w-4 rotate-[-90deg]" />
            </button>
            <div>
              <h1 className="flex items-center gap-2 text-xl font-black text-text-primary tracking-tight">
                <LayoutTemplate className="h-5 w-5 text-cyan" />
                {templateId ? 'Edit report' : 'New report'}
              </h1>
              <span className="ml-1 rounded-full bg-cyan/10 px-2 py-0.5 text-xs text-cyan font-medium">
                {BASE_LABELS[baseType] ?? baseType}
              </span>
            </div>
          </div>

          {/* Action bar */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handlePreview}
              disabled={previewing}
              className="btn-outline flex items-center gap-2 px-3 py-2 rounded-lg text-sm"
            >
              {previewing ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlayCircle className="h-4 w-4" />}
              Preview
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn-gradient flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save
            </button>
            <button
              onClick={() => setShowSchedule(true)}
              disabled={!templateId}
              className="btn-outline flex items-center gap-2 px-3 py-2 rounded-lg text-sm disabled:opacity-40"
              title={!templateId ? 'Save first to schedule' : 'Set delivery schedule'}
            >
              <Calendar className="h-4 w-4" /> Schedule
            </button>
            <button
              onClick={() => handleExport('pdf')}
              disabled={!templateId || exporting === 'pdf'}
              className="btn-outline flex items-center gap-2 px-3 py-2 rounded-lg text-sm disabled:opacity-40"
            >
              {exporting === 'pdf' ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}
              PDF
            </button>
            <button
              onClick={() => handleExport('csv')}
              disabled={!templateId || exporting === 'csv'}
              className="btn-outline flex items-center gap-2 px-3 py-2 rounded-lg text-sm disabled:opacity-40"
            >
              {exporting === 'csv' ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}
              CSV
            </button>
          </div>
        </div>

        {/* Report settings */}
        <div className="premium-card p-5 space-y-4">
          <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">Report settings</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Name */}
            <div className="sm:col-span-2">
              <label className="block text-xs text-text-secondary mb-1">Report name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Monthly P&L with comparison"
                className="input-base w-full"
              />
            </div>

            {/* Date range */}
            <div>
              <label className="block text-xs text-text-secondary mb-1">From</label>
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="input-base w-full"
              />
            </div>
            <div>
              <label className="block text-xs text-text-secondary mb-1">To</label>
              <input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="input-base w-full"
              />
            </div>

            {/* Comparative */}
            <div className="sm:col-span-2">
              <label className="block text-xs text-text-secondary mb-1">Comparison</label>
              <select
                value={comparative.enabled ? comparative.mode : 'none'}
                onChange={e => {
                  const v = e.target.value
                  if (v === 'none') setComparative({ enabled: false, mode: 'prior-period' })
                  else setComparative({ enabled: true, mode: v })
                }}
                className="input-base w-full"
              >
                <option value="none">No comparison</option>
                <option value="prior-period">Compare to last period</option>
                <option value="prior-year">Compare to last year</option>
              </select>
            </div>
          </div>
        </div>

        {/* Layout editor */}
        <div className="premium-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">Layout rows</h2>
            <div className="flex gap-2">
              {['section', 'account-group', 'subtotal', 'spacer'].map(kind => (
                <button
                  key={kind}
                  onClick={() => addRow(kind)}
                  className="rounded-lg border border-glass px-2.5 py-1 text-xs text-text-secondary hover:text-text-primary hover:bg-glass-hover"
                >
                  + {KIND_LABELS[kind]}
                </button>
              ))}
            </div>
          </div>

          {layout.length === 0 ? (
            <p className="text-sm text-text-secondary text-center py-6">No rows yet. Add one above.</p>
          ) : (
            <div className="space-y-2">
              {layout.map((row, i) => (
                <LayoutRow
                  key={row.id}
                  row={row}
                  index={i}
                  total={layout.length}
                  onMove={moveRow}
                  onToggle={toggleRow}
                  onLabelChange={changeLabelRow}
                  onRemove={removeRow}
                />
              ))}
            </div>
          )}
        </div>

        {/* Preview result */}
        {previewResult && (
          <div className="premium-card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">Preview</h2>
              {comparative.enabled && (
                <span className="rounded-full bg-cyan/10 px-2 py-0.5 text-xs text-cyan">
                  {comparativeModeLabel(comparative.mode)}
                </span>
              )}
            </div>
            <PreviewTable result={previewResult} currency={currency} />
          </div>
        )}
      </div>
    </>
  )
}
