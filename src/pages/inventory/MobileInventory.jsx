/**
 * MobileInventory — phone-native Inventory list (Mobile-First Redesign, pass 2).
 * Presentational: InventoryPage owns data + all the item modals (create/edit,
 * add-stock, stock-ledger). Tapping an item opens an actions sheet — with four
 * per-item actions, that reads cleaner than a wide swipe reveal.
 */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PackageOpen, Plus, Search, AlertTriangle, History, Edit, Power, ClipboardCheck, PackageSearch } from 'lucide-react'
import { formatCurrency } from '@/utils/formatters'
import MobilePage from '@/components/mobile/MobilePage'
import ListCard from '@/components/mobile/ListCard'
import PullToRefresh from '@/components/mobile/PullToRefresh'
import Sheet from '@/components/mobile/Sheet'
import { useRegisterFabActions } from '@/hooks/useRegisterFabActions'
import { cn } from '@/utils/cn'

export default function MobileInventory({
  rows, currency, isLoading, valuation, lowStockCount, query, onQuery,
  showInactive, onShowInactive, onRefresh, onNew, onAddStock, onAdjust, onHistory, onEdit, onToggleActive,
}) {
  const [actionItem, setActionItem] = useState(null)
  const navigate = useNavigate()

  // The ⊕ on Inventory: create an item, or jump to the stock reports. Two
  // actions → it opens the Quick-actions sheet. `onNew` is the same create the
  // page's own header button uses, so the two never diverge.
  useRegisterFabActions([
    { id: 'new-item',      labelKey: 'create.item',        icon: Plus,          run: onNew },
    { id: 'stock-reports', labelKey: 'action.stockReports', icon: PackageSearch, run: () => navigate('/inventory/reports') },
  ])

  const act = (fn) => { setActionItem(null); fn() }

  return (
    <MobilePage
      title="Inventory"
      subtitle="What you buy and sell"
      cta={
        <button
          type="button"
          onClick={onNew}
          className="tap-target flex w-full items-center justify-center gap-2 rounded-2xl btn-gradient text-md font-semibold"
        >
          <Plus className="h-5 w-5" />
          Add item
        </button>
      }
    >
      <PullToRefresh onRefresh={onRefresh} className="h-full">
        <div className="space-y-4 pb-4">
          {/* Summary */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-glass-panel p-3.5">
              <p className="text-xs text-text-muted">Stock value</p>
              <p className="num mt-1 text-lg font-semibold text-text-primary">
                {formatCurrency(valuation?.totalValue ?? 0, currency)}
              </p>
            </div>
            <div className="rounded-2xl bg-glass-panel p-3.5">
              <p className="text-xs text-text-muted">Running low</p>
              <p className={cn('num mt-1 text-lg font-semibold', lowStockCount > 0 ? 'text-negative' : 'text-text-primary')}>
                {lowStockCount ?? 0}
              </p>
            </div>
          </div>

          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            <input
              value={query}
              onChange={(e) => onQuery(e.target.value)}
              placeholder="Search name, SKU, barcode…"
              className="w-full rounded-xl bg-glass-panel border border-glass py-2.5 pl-9 pr-3 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none"
            />
          </div>

          <label className="flex items-center gap-2 text-small text-text-secondary">
            <input type="checkbox" className="rounded" checked={showInactive} onChange={(e) => onShowInactive(e.target.checked)} />
            Show inactive items
          </label>

          {isLoading && !rows.length ? (
            <div className="space-y-2">
              {[1, 2, 3, 4].map((i) => <div key={i} className="h-16 animate-pulse rounded-xl bg-glass-panel" />)}
            </div>
          ) : rows.length === 0 ? (
            <p className="rounded-xl bg-glass-panel p-6 text-center text-sm text-text-muted">
              {query ? 'No items match your search.' : 'Nothing here yet. Tap "Add item" to add your first one.'}
            </p>
          ) : (
            <div className="space-y-1.5">
              {rows.map((r) => {
                const isLow = r.currentStock <= r.reorderLevel
                const inactive = r.isActive === false
                return (
                  <ListCard
                    key={r._id}
                    onClick={() => setActionItem(r)}
                    className={inactive ? 'opacity-55' : ''}
                    leading={
                      <div className={cn('flex h-9 w-9 items-center justify-center rounded-xl', isLow ? 'bg-negative-muted text-negative' : 'bg-positive-muted text-positive')}>
                        <PackageOpen className="h-4 w-4" />
                      </div>
                    }
                    title={r.name}
                    subtitle={
                      <span className="inline-flex items-center gap-1.5">
                        <span className={isLow ? 'font-semibold text-negative' : ''}>{r.currentStock} {r.unit}</span>
                        {isLow && <AlertTriangle className="h-3 w-3 text-negative" />}
                        {r.category && <span className="text-accent">· {r.category}</span>}
                      </span>
                    }
                    trailing={formatCurrency(r.currentStock * r.unitCostPrice, currency)}
                    trailingSub={r.unitSalePrice ? `sells ${formatCurrency(r.unitSalePrice, currency)}` : undefined}
                  />
                )
              })}
            </div>
          )}
        </div>
      </PullToRefresh>

      {/* Per-item actions */}
      <Sheet isOpen={!!actionItem} onClose={() => setActionItem(null)} title={actionItem?.name}>
        <div className="space-y-1 pb-2">
          <ActionRow icon={Plus} tone="positive" label="Add stock" onClick={() => act(() => onAddStock(actionItem._id))} />
          <ActionRow icon={ClipboardCheck} label="Fix the count" onClick={() => act(() => onAdjust(actionItem._id))} />
          <ActionRow icon={History} label="Stock history" onClick={() => act(() => onHistory(actionItem._id))} />
          <ActionRow icon={Edit} tone="cyan" label="Edit item" onClick={() => act(() => onEdit(actionItem))} />
          <ActionRow
            icon={Power}
            label={actionItem?.isActive === false ? 'Activate' : 'Deactivate'}
            onClick={() => act(() => onToggleActive(actionItem._id))}
          />
        </div>
      </Sheet>
    </MobilePage>
  )
}

function ActionRow({ icon: Icon, label, tone, onClick }) {
  const toneCls = tone === 'positive' ? 'text-positive' : tone === 'cyan' ? 'text-accent' : 'text-text-primary'
  return (
    <button
      type="button"
      onClick={onClick}
      className="tap-target flex w-full items-center gap-3 rounded-xl px-3 text-sm font-semibold hover:bg-glass-hover"
    >
      <Icon className={cn('h-4 w-4', toneCls)} />
      <span className={toneCls}>{label}</span>
    </button>
  )
}
