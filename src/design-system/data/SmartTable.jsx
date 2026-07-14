import { useMemo, useRef, useState } from 'react'
import { ArrowDown, ArrowUp, ArrowUpDown, Inbox, MoreHorizontal } from 'lucide-react'
import { cn } from '@/utils/cn'
import { useIsMobile } from '@/hooks/useIsMobile'
import ListCard from '@/components/mobile/ListCard'
import SwipeRow from '@/components/mobile/SwipeRow'
import EmptyState from '@/components/ui/EmptyState'

/**
 * SmartTable — the ONE Ledger data surface (2026-07-14 redesign spec §10.3).
 *
 * Drop-in superset of the retired DataTable AND QuietTable APIs, so legacy
 * call sites convert with an import swap. New capabilities are opt-in.
 *
 * Column: { key, header, render(row,i), className, cellClassName,
 *           sortable, sortKey, align: 'left'|'right'|'center',
 *           type: 'text'|'money'|'date'|'status'|'actions',   ← money ⇒ right + tabular mono
 *           mobile: 'title'|'subtitle'|'trailing'|'trailingSub'|'hide' }
 *
 * Ledger visuals: hairline rows, label-type headers, no zebra, 44px rows,
 * hover-revealed row actions. On phones (<768px) the SAME column model
 * renders as ListCard rows (mobile kit) — responsive by construction,
 * no per-page fork needed.
 *
 * New props:
 *  - rowActions(row) → [{ label, icon, onClick(row), tone?: 'danger' }]
 *  - selectable + selectedKeys + onSelectionChange(keysArray)
 *  - bulkActions: [{ label, icon, onClick(selectedRows) }] → BulkBar when selected
 *  - keyboard: j/k move · Enter open · x select (container-level, opt-out via keyboardNav={false})
 */
export default function SmartTable({
  columns = [],
  data,
  rows, // QuietTable alias
  isLoading,
  loading, // QuietTable alias
  emptyMessage = 'No data available',
  emptyState,
  emptyTitle, // QuietTable alias
  emptyDescription,
  emptyIcon: EmptyIcon = Inbox,
  onRowClick,
  className,
  sortBy,
  sortOrder = 'desc',
  onSort,
  stickyHeader = false,
  dense = false,
  getRowKey,
  rowKey, // QuietTable alias
  loadingRowCount = 5,
  rowActions,
  selectable = false,
  selectedKeys,
  onSelectionChange,
  bulkActions = [],
  keyboardNav = true,
  mobileCards = true,
  // Accepted-and-ignored legacy props (visual language is fixed now)
  zebra, stackOnMobile, // eslint-disable-line no-unused-vars
}) {
  const isMobile = useIsMobile()
  const busy = isLoading ?? loading ?? false
  const list = data ?? rows ?? []
  const keyOf = getRowKey || rowKey || ((r, i) => r._id || r.id || i)
  const containerRef = useRef(null)
  const [focusIdx, setFocusIdx] = useState(-1)
  // Perf guard: big ledgers render incrementally instead of all at once.
  const [visibleCap, setVisibleCap] = useState(150)

  /* selection (controlled) */
  const selected = useMemo(() => new Set(selectedKeys || []), [selectedKeys])
  const toggleKey = (k) => {
    if (!onSelectionChange) return
    const next = new Set(selected)
    next.has(k) ? next.delete(k) : next.add(k)
    onSelectionChange([...next])
  }
  const toggleAll = () => {
    if (!onSelectionChange) return
    onSelectionChange(selected.size === list.length ? [] : list.map(keyOf))
  }
  const selectedRows = useMemo(() => list.filter((r, i) => selected.has(keyOf(r, i))), [list, selected, keyOf])

  const alignClass = (c) =>
    (c.type === 'money' || c.align === 'right') ? 'text-right'
      : c.align === 'center' ? 'text-center' : 'text-left'
  const moneyClass = (c) => (c.type === 'money' ? 'num whitespace-nowrap' : '')
  const cellPad = dense ? 'px-4 py-2.5' : 'px-4 py-3'

  const renderSortIcon = (col) => {
    if (!col.sortable) return null
    const active = sortBy && sortBy === (col.sortKey || col.key)
    if (!active) return <ArrowUpDown className="ml-1.5 inline-block h-3 w-3 opacity-40" aria-hidden="true" />
    return sortOrder === 'asc'
      ? <ArrowUp className="ml-1.5 inline-block h-3 w-3 text-accent" aria-hidden="true" />
      : <ArrowDown className="ml-1.5 inline-block h-3 w-3 text-accent" aria-hidden="true" />
  }

  /* keyboard: j/k move focus, Enter opens, x selects */
  const onKeyDown = (e) => {
    if (!keyboardNav || busy || !list.length) return
    if (e.target.closest('input, textarea, select, [contenteditable]')) return
    if (e.key === 'j' || e.key === 'ArrowDown') {
      e.preventDefault(); setFocusIdx((i) => Math.min(i + 1, list.length - 1))
    } else if (e.key === 'k' || e.key === 'ArrowUp') {
      e.preventDefault(); setFocusIdx((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter' && focusIdx >= 0 && onRowClick) {
      e.preventDefault(); onRowClick(list[focusIdx])
    } else if (e.key === 'x' && focusIdx >= 0 && selectable) {
      e.preventDefault(); toggleKey(keyOf(list[focusIdx], focusIdx))
    }
  }

  /* ── mobile: the same column model renders as cards ── */
  if (isMobile && mobileCards && !busy && list.length > 0) {
    const pick = (slot, fallbackIdx) => {
      const col = columns.find((c) => c.mobile === slot)
      if (col) return col
      if (slot === 'title') return columns[0]
      if (slot === 'trailing') return columns.find((c) => c.type === 'money' || c.align === 'right') || null
      if (slot === 'subtitle') return columns.filter((c) => c.mobile !== 'hide')[fallbackIdx] || null
      return null
    }
    const titleCol = pick('title')
    const subCol = pick('subtitle', 1)
    const trailCol = pick('trailing')
    const trailSubCol = columns.find((c) => c.mobile === 'trailingSub')
    const cellOf = (col, row, i) => (col ? (col.render ? col.render(row, i) : row[col.key]) : null)
    return (
      <div className={cn('space-y-2', className)}>
        {list.slice(0, visibleCap).map((row, i) => {
          const actions = (rowActions?.(row) || []).map((a) => ({ ...a, onClick: () => a.onClick(row) }))
          const card = (
            <ListCard
              title={cellOf(titleCol, row, i)}
              subtitle={subCol && subCol !== titleCol ? cellOf(subCol, row, i) : undefined}
              trailing={trailCol ? <span className={cn(moneyClass(trailCol) || 'num')}>{cellOf(trailCol, row, i)}</span> : undefined}
              trailingSub={trailSubCol ? cellOf(trailSubCol, row, i) : undefined}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
            />
          )
          return actions.length
            ? <SwipeRow key={keyOf(row, i)} actions={actions}>{card}</SwipeRow>
            : <div key={keyOf(row, i)}>{card}</div>
        })}
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className={cn('relative w-full overflow-x-auto scrollbar-thin', className)}
      onKeyDown={onKeyDown}
    >
      <table className="min-w-full text-left text-sm text-text-secondary">
        <thead className={cn('text-label uppercase text-text-muted', stickyHeader && 'sticky top-0 z-10 bg-navy-2')}>
          <tr className="border-b border-glass">
            {selectable && (
              <th className={cn('w-10', cellPad)}>
                <input
                  type="checkbox"
                  aria-label="Select all rows"
                  checked={list.length > 0 && selected.size === list.length}
                  onChange={toggleAll}
                  className="h-4 w-4 rounded border-glass-2 cursor-pointer"
                />
              </th>
            )}
            {columns.map((col, i) => (
              <th
                key={col.key || i}
                onClick={() => col.sortable && onSort && onSort(col.sortKey || col.key)}
                aria-sort={
                  col.sortable && sortBy === (col.sortKey || col.key)
                    ? (sortOrder === 'asc' ? 'ascending' : 'descending')
                    : col.sortable ? 'none' : undefined
                }
                className={cn(
                  'whitespace-nowrap font-semibold tracking-wider',
                  cellPad, alignClass(col),
                  col.sortable && onSort && 'cursor-pointer select-none hover:text-text-secondary transition-colors',
                  col.className,
                )}
              >
                <span className="inline-flex items-center">{col.header}{renderSortIcon(col)}</span>
              </th>
            ))}
            {rowActions && <th className={cn('w-12', cellPad)} aria-label="Row actions" />}
          </tr>
        </thead>

        <tbody>
          {busy ? (
            Array.from({ length: loadingRowCount }).map((_, r) => (
              <tr key={`sk-${r}`} className="border-b border-glass/60">
                {selectable && <td className={cellPad} />}
                {columns.map((col, c) => (
                  <td key={c} className={cn(cellPad, alignClass(col))}>
                    <div className={cn('h-3.5 animate-pulse rounded bg-glass-panel', c === 0 ? 'w-3/4' : 'w-4/5')} />
                  </td>
                ))}
                {rowActions && <td className={cellPad} />}
              </tr>
            ))
          ) : list.length === 0 ? (
            <tr>
              <td colSpan={columns.length + (selectable ? 1 : 0) + (rowActions ? 1 : 0)} className="px-6 py-12">
                {emptyState ?? (
                  emptyTitle
                    ? <EmptyState title={emptyTitle} description={emptyDescription} icon={EmptyIcon} />
                    : (
                      <div className="flex flex-col items-center justify-center text-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-glass-hover">
                          <EmptyIcon className="h-6 w-6 text-text-muted" aria-hidden="true" />
                        </div>
                        <p className="text-sm text-text-muted">{emptyMessage}</p>
                      </div>
                    )
                )}
              </td>
            </tr>
          ) : (
            list.slice(0, visibleCap).map((row, rowIndex) => {
              const k = keyOf(row, rowIndex)
              const interactive = !!onRowClick
              const actions = rowActions?.(row) || []
              return (
                <tr
                  key={k}
                  onClick={() => interactive && onRowClick(row)}
                  onKeyDown={(e) => {
                    if (interactive && (e.key === 'Enter' || e.key === ' ') && e.target.tagName === 'TR') {
                      e.preventDefault(); onRowClick(row)
                    }
                  }}
                  tabIndex={interactive ? 0 : undefined}
                  className={cn(
                    'group border-b border-glass/60 transition-colors',
                    interactive && 'cursor-pointer hover:bg-glass-hover focus:bg-glass-hover focus:outline-none',
                    focusIdx === rowIndex && 'bg-glass-hover ring-1 ring-inset ring-accent/30',
                    selected.has(k) && 'bg-accent-soft',
                  )}
                >
                  {selectable && (
                    <td className={cellPad} onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        aria-label="Select row"
                        checked={selected.has(k)}
                        onChange={() => toggleKey(k)}
                        className="h-4 w-4 rounded border-glass-2 cursor-pointer"
                      />
                    </td>
                  )}
                  {columns.map((col, colIndex) => (
                    <td
                      key={colIndex}
                      className={cn(cellPad, alignClass(col), moneyClass(col), col.cellClassName)}
                    >
                      {col.render ? col.render(row, rowIndex) : row[col.key]}
                    </td>
                  ))}
                  {rowActions && (
                    <td className={cn(cellPad, 'text-right')} onClick={(e) => e.stopPropagation()}>
                      <RowActionMenu actions={actions} row={row} />
                    </td>
                  )}
                </tr>
              )
            })
          )}
        </tbody>
      </table>

      {!busy && list.length > visibleCap && (
        <div className="flex justify-center border-t border-glass/60 py-2.5">
          <button
            type="button"
            onClick={() => setVisibleCap((c) => c + 300)}
            className="rounded-control px-3 py-1.5 text-sm font-medium text-text-secondary hover:bg-glass-hover hover:text-text-primary transition-colors"
          >
            Show more ({list.length - visibleCap} remaining)
          </button>
        </div>
      )}

      {selectable && selected.size > 0 && bulkActions.length > 0 && (
        <div className="sticky bottom-3 z-20 mx-auto mt-3 flex w-fit items-center gap-2 rounded-overlay border border-glass-2 bg-charcoal px-4 py-2.5 shadow-elevated animate-fade-in">
          <span className="text-sm font-semibold text-text-primary">{selected.size} selected</span>
          <span className="h-4 w-px bg-glass" aria-hidden="true" />
          {bulkActions.map((a) => (
            <button
              key={a.label}
              type="button"
              onClick={() => a.onClick(selectedRows)}
              className="inline-flex items-center gap-1.5 rounded-control px-2.5 py-1.5 text-sm font-medium text-text-secondary hover:bg-glass-hover hover:text-text-primary transition-colors"
            >
              {a.icon && <a.icon className="h-3.5 w-3.5" aria-hidden="true" />}
              {a.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => onSelectionChange?.([])}
            className="ml-1 text-xs text-text-muted hover:text-text-secondary"
          >
            Clear
          </button>
        </div>
      )}
    </div>
  )
}

/* Hover-revealed row actions: first two as icon buttons, rest behind ⋯ */
function RowActionMenu({ actions, row }) {
  const [open, setOpen] = useState(false)
  if (!actions.length) return null
  const inline = actions.slice(0, 2)
  const overflow = actions.slice(2)
  return (
    <span className="relative inline-flex items-center gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
      {inline.map((a) => (
        <button
          key={a.label}
          type="button"
          title={a.label}
          aria-label={a.label}
          onClick={() => a.onClick(row)}
          className={cn(
            'rounded-control p-1.5 transition-colors hover:bg-glass-hover',
            a.tone === 'danger' ? 'text-negative/80 hover:text-negative' : 'text-text-muted hover:text-text-primary',
          )}
        >
          {a.icon ? <a.icon className="h-4 w-4" aria-hidden="true" /> : a.label}
        </button>
      ))}
      {overflow.length > 0 && (
        <span className="relative">
          <button
            type="button"
            aria-label="More actions"
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
            onBlur={() => setTimeout(() => setOpen(false), 120)}
            className="rounded-control p-1.5 text-text-muted hover:bg-glass-hover hover:text-text-primary transition-colors"
          >
            <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
          </button>
          {open && (
            <span className="absolute right-0 top-full z-30 mt-1 w-44 rounded-card border border-glass-2 bg-charcoal p-1 shadow-elevated">
              {overflow.map((a) => (
                <button
                  key={a.label}
                  type="button"
                  onClick={() => { setOpen(false); a.onClick(row) }}
                  className={cn(
                    'flex w-full items-center gap-2 rounded-control px-2.5 py-1.5 text-left text-sm transition-colors hover:bg-glass-hover',
                    a.tone === 'danger' ? 'text-negative' : 'text-text-secondary hover:text-text-primary',
                  )}
                >
                  {a.icon && <a.icon className="h-3.5 w-3.5" aria-hidden="true" />}
                  {a.label}
                </button>
              ))}
            </span>
          )}
        </span>
      )}
    </span>
  )
}
