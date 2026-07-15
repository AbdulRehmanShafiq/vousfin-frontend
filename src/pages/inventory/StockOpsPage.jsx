/**
 * StockOpsPage — the stock jobs that aren't buying or selling:
 *   Locations  — where your stock sits, and moving it between places
 *   Recipes    — what you make out of what, and building it
 *
 * (Inventory engine phases 5 and 9.) Moving stock between your own locations
 * costs nothing and earns nothing, so it never touches your books — only
 * building does, and only for the labour you add.
 */
import { useState } from 'react'
import { Warehouse, ArrowLeftRight, Hammer, Plus, ChevronRight } from 'lucide-react'
import {
  useWarehouses, useCreateWarehouse, useTransferStock, useStockByLocation,
  useInventoryItems, useBoms, useCreateBom, useBuildQuote, useBuild,
} from '@/hooks/useInventory'
import { useBusinessStore } from '@/stores/useBusinessStore'
import { formatCurrency } from '@/utils/formatters'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Modal from '@/components/modals/Modal'
import SmartTable from '@/design-system/data/SmartTable'
import { cn } from '@/utils/cn'

const asArray = (d) => (Array.isArray(d?.docs) ? d.docs : Array.isArray(d?.data) ? d.data : Array.isArray(d) ? d : [])

/* ── Add a location ─────────────────────────────────────────────────────── */
function WarehouseForm({ onClose }) {
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [address, setAddress] = useState('')
  const create = useCreateWarehouse()

  const submit = async (e) => {
    e.preventDefault()
    await create.mutateAsync({ name: name.trim(), code: code.trim() || undefined, address: address.trim() || undefined })
    onClose()
  }
  return (
    <form onSubmit={submit} className="space-y-4">
      <Input label="What do you call it?" placeholder="e.g. Main shop" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
      <Input label="Short code (optional)" placeholder="e.g. SHOP" value={code} onChange={(e) => setCode(e.target.value)} />
      <Input label="Address (optional)" value={address} onChange={(e) => setAddress(e.target.value)} />
      <div className="flex justify-end gap-3 border-t border-glass pt-4">
        <Button variant="ghost" type="button" onClick={onClose}>Cancel</Button>
        <Button type="submit" loading={create.isPending} disabled={!name.trim()}>Add location</Button>
      </div>
    </form>
  )
}

/* ── Move stock between locations ───────────────────────────────────────── */
function TransferForm({ warehouses, onClose }) {
  const currency = useBusinessStore((s) => s.currency)
  const { data: rawItems } = useInventoryItems({ limit: 200 })
  const items = asArray(rawItems)
  const [itemId, setItemId] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [qty, setQty] = useState('1')
  const transfer = useTransferStock()
  const { data: byLocation } = useStockByLocation(itemId || null)

  const atSource = (byLocation || []).find((b) => String(b.warehouseId) === String(from))
  const available = atSource?.qty ?? 0
  const item = items.find((i) => i._id === itemId)
  const n = parseFloat(qty) || 0
  const blocked = !itemId || !from || !to || from === to || n <= 0 || n > available

  const submit = async (e) => {
    e.preventDefault()
    await transfer.mutateAsync({ itemId, fromWarehouseId: from, toWarehouseId: to, qty: n })
    onClose()
  }

  const opts = warehouses.map((w) => ({ value: w._id, label: w.code ? `${w.name} (${w.code})` : w.name }))

  return (
    <form onSubmit={submit} className="space-y-4">
      <Select label="Which item?" placeholder="Choose an item" searchable
        options={items.map((i) => ({ value: i._id, label: `${i.name}${i.sku ? ` (${i.sku})` : ''}` }))}
        value={itemId} onChange={setItemId} />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Select label="From" placeholder="Choose a location" options={opts} value={from} onChange={setFrom} />
        <Select label="To" placeholder="Choose a location" options={opts} value={to} onChange={setTo} />
      </div>

      {itemId && from && (
        <p className="text-small text-text-muted">
          {available > 0
            ? `${available} ${item?.unit || 'units'} of ${item?.name} are at this location.`
            : `There is none of ${item?.name} at that location yet.`}
        </p>
      )}

      <Input label={`How many? (${item?.unit || 'units'})`} type="number" min="0" step="any"
        value={qty} onChange={(e) => setQty(e.target.value)} />

      {from && to && from === to && (
        <p className="text-small text-negative">Pick two different locations.</p>
      )}
      {n > available && from && (
        <p className="text-small text-negative">You only have {available} there.</p>
      )}

      <p className="rounded-card border border-glass bg-glass-panel px-4 py-3 text-sm text-text-secondary" role="note">
        Moving stock doesn’t change what it’s worth ({item ? formatCurrency(n * (item.unitCostPrice || 0), currency) : '—'}),
        so nothing is recorded in your books — only where it sits changes.
      </p>

      <div className="flex justify-end gap-3 border-t border-glass pt-4">
        <Button variant="ghost" type="button" onClick={onClose}>Cancel</Button>
        <Button type="submit" loading={transfer.isPending} disabled={blocked}>Move stock</Button>
      </div>
    </form>
  )
}

/* ── Create a recipe ────────────────────────────────────────────────────── */
function BomForm({ onClose }) {
  const { data: rawItems } = useInventoryItems({ limit: 200 })
  const items = asArray(rawItems)
  const [itemId, setItemId] = useState('')
  const [outputQty, setOutputQty] = useState('1')
  const [labour, setLabour] = useState('0')
  const [rows, setRows] = useState([{ itemId: '', qtyPerUnit: '1' }])
  const create = useCreateBom()

  const setRow = (i, patch) => setRows((r) => r.map((x, j) => (j === i ? { ...x, ...patch } : x)))
  const valid = itemId && rows.some((r) => r.itemId && parseFloat(r.qtyPerUnit) > 0)

  const submit = async (e) => {
    e.preventDefault()
    await create.mutateAsync({
      itemId,
      outputQty: parseFloat(outputQty) || 1,
      labourCostPerRun: parseFloat(labour) || 0,
      components: rows.filter((r) => r.itemId && parseFloat(r.qtyPerUnit) > 0)
        .map((r) => ({ itemId: r.itemId, qtyPerUnit: parseFloat(r.qtyPerUnit) })),
    })
    onClose()
  }

  const itemOpts = items.map((i) => ({ value: i._id, label: `${i.name}${i.sku ? ` (${i.sku})` : ''}` }))

  return (
    <form onSubmit={submit} className="space-y-4">
      <Select label="What are you making?" placeholder="Choose the finished item" searchable
        options={itemOpts} value={itemId} onChange={setItemId} />
      <div className="grid grid-cols-2 gap-3">
        <Input label="How many does one batch make?" type="number" min="1" step="any"
          value={outputQty} onChange={(e) => setOutputQty(e.target.value)} />
        <Input label="Labour per batch (optional)" type="number" min="0" step="any"
          value={labour} onChange={(e) => setLabour(e.target.value)} />
      </div>

      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">What goes into it</p>
        {rows.map((r, i) => (
          <div key={i} className="grid grid-cols-[1fr_100px] gap-2">
            <Select placeholder="Choose a part" searchable options={itemOpts.filter((o) => o.value !== itemId)}
              value={r.itemId} onChange={(v) => setRow(i, { itemId: v })} />
            <Input type="number" min="0" step="any" placeholder="Qty"
              value={r.qtyPerUnit} onChange={(e) => setRow(i, { qtyPerUnit: e.target.value })} />
          </div>
        ))}
        <button type="button" onClick={() => setRows((r) => [...r, { itemId: '', qtyPerUnit: '1' }])}
          className="text-small font-semibold text-accent hover:underline">+ Add another part</button>
      </div>

      <div className="flex justify-end gap-3 border-t border-glass pt-4">
        <Button variant="ghost" type="button" onClick={onClose}>Cancel</Button>
        <Button type="submit" loading={create.isPending} disabled={!valid}>Save recipe</Button>
      </div>
    </form>
  )
}

/* ── Build from a recipe ────────────────────────────────────────────────── */
function BuildForm({ bom, onClose }) {
  const currency = useBusinessStore((s) => s.currency)
  const [runs, setRuns] = useState('1')
  const n = parseInt(runs, 10) || 1
  const { data: quote, isLoading } = useBuildQuote(bom._id, n)
  const build = useBuild()

  const submit = async (e) => {
    e.preventDefault()
    await build.mutateAsync({ id: bom._id, runs: n })
    onClose()
  }
  const money = (v) => formatCurrency(v || 0, currency)

  return (
    <form onSubmit={submit} className="space-y-4">
      <Input label="How many batches?" type="number" min="1" step="1" autoFocus
        value={runs} onChange={(e) => setRuns(e.target.value)} />

      {isLoading && <p className="text-sm text-text-muted">Working out what it takes…</p>}

      {quote && (
        <>
          <div className="rounded-card border border-glass bg-glass-panel">
            {quote.components.map((c) => (
              <div key={c.itemId} className="flex items-center justify-between border-b border-glass/60 px-4 py-2 last:border-0">
                <span className="text-sm text-text-primary">{c.name}</span>
                <span className={cn('num text-sm', c.short > 0 ? 'text-negative' : 'text-text-secondary')}>
                  {c.need} {c.unit || ''} {c.short > 0 && `· short ${c.short}`}
                </span>
              </div>
            ))}
          </div>

          <div className="rounded-card border border-glass bg-glass-panel px-4 py-3 text-sm">
            <div className="flex justify-between text-text-secondary">
              <span>Parts</span><span className="num">{money(quote.componentCost)}</span>
            </div>
            {quote.labourCost > 0 && (
              <div className="flex justify-between text-text-secondary">
                <span>Labour</span><span className="num">{money(quote.labourCost)}</span>
              </div>
            )}
            <div className="rule-total mt-1 flex justify-between pt-1.5 font-bold text-text-primary">
              <span>{quote.outputQty} finished · costs</span><span className="num">{money(quote.totalCost)}</span>
            </div>
            <p className="mt-1 text-xs text-text-muted">{money(quote.unitCost)} each</p>
          </div>

          {!quote.buildable && (
            <p className="rounded-card border border-negative/25 bg-negative/5 px-4 py-3 text-sm text-negative">
              You don’t have enough parts for this yet.
            </p>
          )}
        </>
      )}

      <div className="flex justify-end gap-3 border-t border-glass pt-4">
        <Button variant="ghost" type="button" onClick={onClose}>Cancel</Button>
        <Button type="submit" loading={build.isPending} disabled={!quote?.buildable}>Build it</Button>
      </div>
    </form>
  )
}

/* ── Page ───────────────────────────────────────────────────────────────── */
export default function StockOpsPage() {
  const currency = useBusinessStore((s) => s.currency)
  const [tab, setTab] = useState('locations')
  const [showWarehouse, setShowWarehouse] = useState(false)
  const [showTransfer, setShowTransfer] = useState(false)
  const [showBom, setShowBom] = useState(false)
  const [buildBom, setBuildBom] = useState(null)

  const { data: warehouses = [], isLoading: loadingWh } = useWarehouses()
  const { data: byLocation = [], isLoading: loadingLoc } = useStockByLocation(null)
  const { data: boms = [], isLoading: loadingBoms } = useBoms()

  const money = (v) => formatCurrency(v || 0, currency)

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-black tracking-tight text-text-primary">
            <Warehouse className="h-6 w-6 text-accent" />
            Stock jobs
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            Where your stock sits, and what you make out of it.
          </p>
        </div>
        <div className="flex gap-2">
          {tab === 'locations' ? (
            <>
              <Button variant="ghost" icon={ArrowLeftRight} onClick={() => setShowTransfer(true)} disabled={warehouses.length < 2}>
                Move stock
              </Button>
              <Button icon={Plus} onClick={() => setShowWarehouse(true)}>Add location</Button>
            </>
          ) : (
            <Button icon={Plus} onClick={() => setShowBom(true)}>New recipe</Button>
          )}
        </div>
      </div>

      <div className="flex gap-1 rounded-xl border border-glass bg-glass-panel p-1">
        {[
          { key: 'locations', label: 'Locations', icon: Warehouse },
          { key: 'recipes', label: 'Recipes', icon: Hammer },
        ].map((t) => (
          <button key={t.key} type="button" onClick={() => setTab(t.key)} aria-pressed={tab === t.key}
            className={cn('flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-small font-semibold transition-colors',
              tab === t.key ? 'bg-accent text-ink-on-accent' : 'text-text-secondary hover:bg-glass-hover hover:text-text-primary')}>
            <t.icon className="h-4 w-4" aria-hidden="true" />
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'locations' && (
        <>
          {!loadingWh && warehouses.length === 0 && (
            <p className="rounded-card border border-glass bg-glass-panel p-6 text-center text-sm text-text-muted">
              No locations yet. Add one if you keep stock in more than one place — a shop and a store room, say.
              Until then everything is simply “in stock”.
            </p>
          )}
          {warehouses.length > 0 && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {warehouses.map((w) => (
                <div key={w._id} className="premium-card p-4">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-text-primary">{w.name}</p>
                    {w.isDefault && <span className="rounded bg-accent-soft px-1.5 py-px text-xs font-semibold text-accent">Default</span>}
                  </div>
                  {w.code && <p className="mt-0.5 font-mono text-xs text-text-muted">{w.code}</p>}
                  {w.address && <p className="mt-1 text-xs text-text-muted">{w.address}</p>}
                </div>
              ))}
            </div>
          )}

          <div className="premium-card overflow-x-auto">
            <SmartTable
              data={byLocation}
              isLoading={loadingLoc}
              getRowKey={(r, i) => `${r.warehouseId || 'none'}-${r.itemId}-${i}`}
              emptyMessage="No stock has been placed in a location yet."
              columns={[
                { key: 'warehouseName', header: 'Location', mobile: 'title' },
                { key: 'qty', header: 'On hand', align: 'right', mobile: 'subtitle' },
                { key: 'value', header: 'Worth', type: 'money', render: (r) => money(r.value), mobile: 'trailing' },
              ]}
            />
          </div>
        </>
      )}

      {tab === 'recipes' && (
        <>
          {!loadingBoms && boms.length === 0 && (
            <p className="rounded-card border border-glass bg-glass-panel p-6 text-center text-sm text-text-muted">
              No recipes yet. Add one if you build or assemble something out of other stock — the parts come out and
              the finished item goes in, at what it actually cost you.
            </p>
          )}
          <div className="space-y-2">
            {boms.map((b) => (
              <button key={b._id} type="button" onClick={() => setBuildBom(b)}
                className="flex w-full items-center gap-3 rounded-card border border-glass bg-glass-panel px-4 py-3 text-left transition-colors hover:bg-glass-hover">
                <Hammer className="h-4 w-4 flex-shrink-0 text-accent" aria-hidden="true" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold text-text-primary">
                    {b.itemId?.name || b.name || 'Recipe'}
                  </span>
                  <span className="text-xs text-text-muted">
                    makes {b.outputQty} · {b.components?.length || 0} part{b.components?.length === 1 ? '' : 's'}
                    {b.labourCostPerRun > 0 && ` · labour ${money(b.labourCostPerRun)}`}
                  </span>
                </span>
                <span className="text-small font-semibold text-accent">Build</span>
                <ChevronRight className="h-4 w-4 flex-shrink-0 text-text-muted" aria-hidden="true" />
              </button>
            ))}
          </div>
        </>
      )}

      <Modal isOpen={showWarehouse} onClose={() => setShowWarehouse(false)} title="Add a location" className="sm:max-w-md">
        {showWarehouse && <WarehouseForm onClose={() => setShowWarehouse(false)} />}
      </Modal>
      <Modal isOpen={showTransfer} onClose={() => setShowTransfer(false)} title="Move stock" className="sm:max-w-lg">
        {showTransfer && <TransferForm warehouses={warehouses} onClose={() => setShowTransfer(false)} />}
      </Modal>
      <Modal isOpen={showBom} onClose={() => setShowBom(false)} title="New recipe" className="sm:max-w-lg">
        {showBom && <BomForm onClose={() => setShowBom(false)} />}
      </Modal>
      <Modal isOpen={!!buildBom} onClose={() => setBuildBom(null)}
        title={buildBom ? `Build ${buildBom.itemId?.name || 'item'}` : ''} className="sm:max-w-lg">
        {buildBom && <BuildForm bom={buildBom} onClose={() => setBuildBom(null)} />}
      </Modal>
    </div>
  )
}
