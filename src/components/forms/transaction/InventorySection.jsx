/**
 * InventorySection — inventory linkage for sale/purchase entries: pick an
 * existing item (with live stock/COGS projections mirroring the backend) or
 * review a consented brand-new item arriving from the NL parse.
 * Extracted verbatim from TransactionFormModal (Ledger phase-6 decomposition).
 */
import { X } from 'lucide-react'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import { formatCurrency } from '@/utils/formatters'
import { cn } from '@/utils/cn'

const INVENTORY_TX_TYPES = ['Inventory Sale', 'Inventory Purchase', 'Cash Sale', 'Credit Sale', 'Cash Purchase', 'Credit Purchase', 'Income']

export default function InventorySection({
  transactionType, amount, currency,
  inventoryItems,
  selectedInventoryItemId, onSelectItem,
  inventoryQty, onQtyChange,
  pendingNewItem, onChangePendingNewItem,
}) {
  // Shown for any sale or purchase type so stock stays in sync; visible even
  // with zero items because the new-item card is the zero-item path.
  if (!(pendingNewItem || INVENTORY_TX_TYPES.includes(transactionType))) return null

  return (
    <div className="animate-fade-in p-4 rounded-xl bg-positive/5 border border-positive/20 space-y-3">
      <p className="text-xs font-semibold text-positive uppercase tracking-wide">
        Inventory Item
      </p>

      {/* Consented NEW item card — created atomically with the save */}
      {pendingNewItem && (
        <div className="rounded-lg border border-accent/25 bg-accent/5 px-4 py-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-accent uppercase tracking-wider">New item — will be added to your inventory</span>
            <button type="button" className="text-text-muted hover:text-text-primary" aria-label="Remove new item"
              onClick={() => onChangePendingNewItem(null)}>
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <Input label="Item name" value={pendingNewItem.name}
              onChange={e => onChangePendingNewItem({ ...pendingNewItem, name: e.target.value })} />
            <Input label="Quantity" type="number" min="0.01" step="any" value={pendingNewItem.quantity}
              onChange={e => onChangePendingNewItem({ ...pendingNewItem, quantity: parseFloat(e.target.value) || 0 })} />
            <Input label="Unit (e.g. bags)" value={pendingNewItem.unit}
              onChange={e => onChangePendingNewItem({ ...pendingNewItem, unit: e.target.value })} />
            <Input label="Cost per unit" type="number" min="0" step="any" value={pendingNewItem.unitCostPrice ?? ''}
              placeholder="auto from amount"
              onChange={e => onChangePendingNewItem({ ...pendingNewItem, unitCostPrice: parseFloat(e.target.value) || null })} />
          </div>
          <p className="text-xs text-text-muted">
            Saving this transaction also adds “{pendingNewItem.name || 'this item'}” to your inventory with the stock above.
          </p>
        </div>
      )}

      {!pendingNewItem && inventoryItems.length === 0 && (
        <p className="text-small text-text-muted">
          No items in your inventory yet. Use the AI entry tab and it will offer to add one, or add items on the Inventory page.
        </p>
      )}

      {!pendingNewItem && inventoryItems.length > 0 && (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="sm:col-span-2">
          <Select
            label="Select Item"
            options={[
              { value: '', label: '— Select inventory item —' },
              ...inventoryItems.map(i => ({
                value: i._id,
                label: `${i.name}${i.sku ? ` (${i.sku})` : ''} — Stock: ${i.currentStock} ${i.unit || 'units'}`,
                subtitle: `Cost: ${i.unitCostPrice.toLocaleString()} per unit${i.currentStock <= i.reorderLevel ? ' · LOW STOCK' : ''}`,
              }))
            ]}
            value={selectedInventoryItemId || ''}
            onChange={(val) => onSelectItem(val || null)}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1">Quantity</label>
          <input
            type="number" min="1" step="1"
            value={inventoryQty}
            onChange={e => onQtyChange(Math.max(1, parseInt(e.target.value, 10) || 1))}
            className="w-full px-3 py-2 rounded-lg bg-glass-panel border border-glass text-text-primary text-sm focus:border-accent focus:outline-none transition-colors"
          />
        </div>
      </div>
      )}
      {selectedInventoryItemId && (() => {
        const item = inventoryItems.find(i => i._id === selectedInventoryItemId)
        if (!item) return null
        const qty   = Math.max(0, Number(inventoryQty) || 0)
        const unit  = item.unit || 'units'
        const isPurchase = ['Inventory Purchase', 'Cash Purchase', 'Credit Purchase'].includes(transactionType)
        const valuationBefore = Math.round(item.currentStock * item.unitCostPrice * 100) / 100

        // ── Purchase: project new stock + weighted-avg cost (mirrors backend 7a) ──
        if (isPurchase) {
          // Backend infers cost/unit = amount / qty when no explicit unit cost is sent.
          const costPerUnit = qty > 0 && amount > 0
            ? Math.round((amount / qty) * 100) / 100
            : item.unitCostPrice
          const newStock   = item.currentStock + qty
          const newAvgCost = newStock > 0
            ? Math.round(((item.currentStock * item.unitCostPrice + qty * costPerUnit) / newStock) * 100) / 100
            : item.unitCostPrice
          const valuationAfter = Math.round(newStock * newAvgCost * 100) / 100
          return (
            <div className="pt-2 border-t border-positive/15 space-y-2">
              <div className="grid grid-cols-3 gap-2 text-small">
                <div>
                  <span className="block text-text-muted">Stock</span>
                  <span className="text-text-primary font-semibold tabular-nums">
                    {item.currentStock} → <span className="text-positive">{newStock}</span> {unit}
                  </span>
                </div>
                <div>
                  <span className="block text-text-muted">Avg cost / {unit}</span>
                  <span className="text-text-primary font-semibold tabular-nums">
                    {formatCurrency(item.unitCostPrice, currency)}
                    {newAvgCost !== item.unitCostPrice && (
                      <> → <span className="text-accent">{formatCurrency(newAvgCost, currency)}</span></>
                    )}
                  </span>
                </div>
                <div>
                  <span className="block text-text-muted">Stock value</span>
                  <span className="text-text-primary font-semibold tabular-nums">
                    {formatCurrency(valuationAfter, currency)}
                  </span>
                  <span className="ml-1 text-positive text-xs">
                    +{formatCurrency(Math.round((valuationAfter - valuationBefore) * 100) / 100, currency)}
                  </span>
                </div>
              </div>
              <p className="text-small text-text-muted">
                Stock will be <span className="text-positive font-medium">incremented</span> at a
                weighted-average cost (DR Inventory). No separate journal — this transaction funds it.
              </p>
            </div>
          )
        }

        // ── Sale: project remaining stock, COGS, and stock-out / low-stock warnings ──
        const cogsEst        = Math.round(qty * item.unitCostPrice * 100) / 100
        const newStock       = item.currentStock - qty
        const insufficient   = qty > item.currentStock
        const valuationAfter = Math.round(Math.max(0, newStock) * item.unitCostPrice * 100) / 100
        const crossesReorder = newStock >= 0 && newStock <= item.reorderLevel && item.currentStock > item.reorderLevel
        return (
          <div className="pt-2 border-t border-positive/15 space-y-2">
            <div className="grid grid-cols-3 gap-2 text-small">
              <div>
                <span className="block text-text-muted">Stock</span>
                <span className="text-text-primary font-semibold tabular-nums">
                  {item.currentStock} → <span className={cn(insufficient ? 'text-negative' : 'text-highlight')}>{newStock}</span> {unit}
                </span>
              </div>
              <div>
                <span className="block text-text-muted">Est. COGS</span>
                <span className="text-highlight font-semibold tabular-nums">{formatCurrency(cogsEst, currency)}</span>
              </div>
              <div>
                <span className="block text-text-muted">Stock value</span>
                <span className="text-text-primary font-semibold tabular-nums">{formatCurrency(valuationAfter, currency)}</span>
              </div>
            </div>
            {insufficient ? (
              <p className="text-small text-negative font-semibold">
                ⚠ Insufficient stock — only {item.currentStock} {unit} available. This sale will be rejected.
              </p>
            ) : crossesReorder ? (
              <p className="text-small text-negative font-medium">
                ⚠ This sale drops stock to the reorder level ({item.reorderLevel} {unit}) — a reorder alert will fire.
              </p>
            ) : item.currentStock <= item.reorderLevel ? (
              <p className="text-small text-negative">⚠ Already below reorder level — {item.currentStock} {unit} remaining.</p>
            ) : null}
            <p className="text-small text-text-muted">
              Stock will be <span className="text-highlight font-medium">decremented</span> and COGS auto-posted
              (DR Cost of Goods Sold · CR Inventory).
            </p>
          </div>
        )
      })()}
    </div>
  )
}
