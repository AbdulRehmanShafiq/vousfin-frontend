/**
 * PartyInput — creatable customer/vendor combobox (Phase 3.5 Step 2).
 * Extracted verbatim from TransactionFormModal (Ledger phase-6 decomposition).
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Sparkles } from 'lucide-react'

export default function PartyInput({ label, suggestions, value, onChange, placeholder, parties = [], onSelectId, aiSuggested, selectedBalance }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const filtered = useMemo(() =>
    suggestions.filter(s => s.toLowerCase().includes((value || '').toLowerCase())).slice(0, 8)
  , [suggestions, value])
  const close = useCallback(() => setOpen(false), [])
  useEffect(() => {
    const handler = (e) => { if (!ref.current?.contains(e.target)) close() }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [close])

  const handleSelect = (name) => {
    onChange(name)
    setOpen(false)
    const match = parties.find(p => p.name.toLowerCase() === name.toLowerCase())
    if (onSelectId) onSelectId(match ? match.id : null)
  }

  const showNew = value?.trim() && !suggestions.some(s => s.toLowerCase() === value.trim().toLowerCase())

  const getBalance = (name) => {
    const p = parties.find(p => p.name.toLowerCase() === name.toLowerCase())
    return p?.balance
  }

  return (
    <div className="relative" ref={ref}>
      <div className="flex items-center justify-between mb-1">
        <label className="block text-xs font-medium text-text-secondary">{label}</label>
        {aiSuggested && value && (
          <span className="text-xs text-accent font-medium flex items-center gap-1">
            <Sparkles className="h-2.5 w-2.5" /> AI suggested
          </span>
        )}
      </div>
      <input
        type="text"
        autoComplete="off"
        className="w-full px-3 py-2 rounded-lg bg-glass-panel border border-glass text-text-primary text-sm placeholder:text-text-muted focus:border-accent focus:outline-none transition-colors"
        placeholder={placeholder}
        value={value || ''}
        onChange={e => { onChange(e.target.value); setOpen(true); if (onSelectId) onSelectId(null) }}
        onFocus={() => setOpen(true)}
      />
      {/* Outstanding balance badge when known party selected */}
      {value && selectedBalance != null && selectedBalance > 0 && (
        <p className="mt-1 text-small text-highlight font-medium">
          Outstanding balance: {selectedBalance.toLocaleString()}
        </p>
      )}
      {value && selectedBalance === 0 && (
        <p className="mt-1 text-small text-positive">No outstanding balance</p>
      )}
      {open && (filtered.length > 0 || showNew) && (
        <div className="absolute z-50 w-full mt-1 rounded-lg border border-glass bg-navy shadow-xl overflow-hidden">
          {filtered.map(name => {
            const bal = getBalance(name)
            return (
              <div key={name} onMouseDown={() => handleSelect(name)}
                className="px-3 py-2 text-sm text-text-primary hover:bg-glass-hover cursor-pointer flex items-center justify-between gap-2">
                <span>{name}</span>
                {bal != null && bal > 0 && (
                  <span className="text-xs text-highlight font-medium flex-shrink-0">
                    Due: {bal.toLocaleString()}
                  </span>
                )}
                {bal === 0 && (
                  <span className="text-xs text-positive flex-shrink-0">Paid</span>
                )}
              </div>
            )
          })}
          {showNew && (
            <div onMouseDown={() => handleSelect(value.trim())}
              className="px-3 py-2 text-sm text-accent hover:bg-accent/10 cursor-pointer border-t border-glass">
              + Add &quot;{value.trim()}&quot; as new
            </div>
          )}
        </div>
      )}
    </div>
  )
}
