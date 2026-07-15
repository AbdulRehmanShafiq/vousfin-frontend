import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import inventoryService from '@/services/inventory.service'
import { getErrorMessage } from '@/utils/errorHandler'
import { invalidateLedgerQueries } from '@/utils/invalidateLedger'

export function useInventoryItems(params = { limit: 100 }) {
  return useQuery({
    queryKey: ['inventory-items', params],
    queryFn: async () => {
      const { data } = await inventoryService.listItems(params)
      return data.data
    },
    staleTime: 2 * 60 * 1000,
  })
}

export function useInventoryItem(id) {
  return useQuery({
    queryKey: ['inventory-item', id],
    enabled: !!id,
    queryFn: async () => {
      const { data } = await inventoryService.getItemById(id)
      return data.data
    },
    staleTime: 2 * 60 * 1000,
  })
}

export function useLowStockAlerts() {
  return useQuery({
    queryKey: ['inventory-low-stock'],
    queryFn: async () => {
      const { data } = await inventoryService.getLowStockAlerts()
      return data.data
    },
    staleTime: 60 * 1000,
  })
}

export function useInventoryValuation() {
  return useQuery({
    queryKey: ['inventory-valuation'],
    queryFn: async () => {
      const { data } = await inventoryService.getInventoryValuation()
      return data.data
    },
    staleTime: 60 * 1000,
  })
}

export function useCreateInventoryItem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (itemData) => {
      const { data } = await inventoryService.createItem(itemData)
      return data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-items'] })
      queryClient.invalidateQueries({ queryKey: ['inventory-valuation'] })
      toast.success('Inventory item created')
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  })
}

export function useUpdateInventoryItem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...data }) => {
      const { data: res } = await inventoryService.updateItem(id, data)
      return res.data
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['inventory-items'] })
      queryClient.invalidateQueries({ queryKey: ['inventory-item', vars.id] })
      toast.success('Item updated')
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  })
}

export function useAddStock() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, qty, costPerUnit, paymentMode, sourceAccountId, vendorId, notes, transactionDate }) => {
      const { data } = await inventoryService.addStock(id, {
        qty, costPerUnit, paymentMode, sourceAccountId, vendorId, notes, transactionDate,
      })
      return data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-items'] })
      queryClient.invalidateQueries({ queryKey: ['inventory-low-stock'] })
      // A stock purchase posts a journal entry → refresh every ledger-derived
      // view (Balance Sheet, P&L, Trial Balance, dashboard, accounts, …) so they
      // never show stale data. (Fixes: stock purchase not reflected on reports.)
      invalidateLedgerQueries(queryClient)
      toast.success('Stock added & journal posted')
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  })
}

/**
 * Stock adjustment (inventory engine phase 2): count / write-off / found /
 * revalue. Every adjustment posts a journal entry, so all ledger-derived views
 * refresh alongside the stock lists.
 */
export function useAdjustStock() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...body }) => {
      const { data } = await inventoryService.adjustStock(id, body)
      return data.data
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['inventory-items'] })
      queryClient.invalidateQueries({ queryKey: ['inventory-low-stock'] })
      queryClient.invalidateQueries({ queryKey: ['inventory-ledger'] })
      invalidateLedgerQueries(queryClient)
      toast.success(result?.noChange ? 'Everything already matches — nothing to change' : 'Stock updated and recorded in your books')
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  })
}

export function useToggleInventoryActive() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id) => {
      const { data } = await inventoryService.toggleActive(id)
      return data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-items'] })
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  })
}

/* ── Phase 5 — locations + transfers ───────────────────────────────────── */
export function useWarehouses() {
  return useQuery({
    queryKey: ['inventory-warehouses'],
    queryFn: async () => (await inventoryService.listWarehouses()).data.data,
    staleTime: 5 * 60 * 1000,
  })
}
export function useCreateWarehouse() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data) => (await inventoryService.createWarehouse(data)).data.data,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['inventory-warehouses'] }); toast.success('Location added') },
    onError: (e) => toast.error(getErrorMessage(e)),
  })
}
export function useUpdateWarehouse() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...data }) => (await inventoryService.updateWarehouse(id, data)).data.data,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['inventory-warehouses'] }); toast.success('Location updated') },
    onError: (e) => toast.error(getErrorMessage(e)),
  })
}
export function useStockByLocation(itemId) {
  return useQuery({
    queryKey: ['inventory-by-location', itemId || 'all'],
    queryFn: async () => (await inventoryService.getStockByLocation(itemId ? { itemId } : {})).data.data,
    staleTime: 60 * 1000,
  })
}
export function useTransferStock() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data) => (await inventoryService.transferStock(data)).data.data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['inventory-by-location'] })
      qc.invalidateQueries({ queryKey: ['inventory-ledger'] })
      // A move changes no value, so no ledger-derived report needs refreshing.
      toast.success('Stock moved')
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  })
}

/* ── Phase 4 — landed costs ────────────────────────────────────────────── */
export function useApplyLandedCost() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data) => (await inventoryService.applyLandedCost(data)).data.data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['inventory-items'] })
      qc.invalidateQueries({ queryKey: ['inventory-ledger'] })
      invalidateLedgerQueries(qc)
      toast.success('Costs added to your stock value')
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  })
}

/* ── Phase 6 — reservations / ATP ──────────────────────────────────────── */
export function useAtp(id) {
  return useQuery({
    queryKey: ['inventory-atp', id],
    enabled: !!id,
    queryFn: async () => (await inventoryService.getAtp(id)).data.data,
    staleTime: 30 * 1000,
  })
}
export function useBackorders() {
  return useQuery({
    queryKey: ['inventory-backorders'],
    queryFn: async () => (await inventoryService.getBackorders()).data.data,
    staleTime: 60 * 1000,
  })
}

/* ── Phase 7 — lots ────────────────────────────────────────────────────── */
export function useLots(id) {
  return useQuery({
    queryKey: ['inventory-lots', id],
    enabled: !!id,
    queryFn: async () => (await inventoryService.getLots(id)).data.data,
    staleTime: 60 * 1000,
  })
}

/* ── Phase 9 — recipes + builds ────────────────────────────────────────── */
export function useBoms() {
  return useQuery({
    queryKey: ['inventory-boms'],
    queryFn: async () => (await inventoryService.listBoms()).data.data,
    staleTime: 60 * 1000,
  })
}
export function useCreateBom() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data) => (await inventoryService.createBom(data)).data.data,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['inventory-boms'] }); toast.success('Recipe saved') },
    onError: (e) => toast.error(getErrorMessage(e)),
  })
}
export function useBuildQuote(id, runs) {
  return useQuery({
    queryKey: ['inventory-build-quote', id, runs],
    enabled: !!id,
    queryFn: async () => (await inventoryService.quoteBuild(id, runs)).data.data,
    staleTime: 0,
  })
}
export function useBuild() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...data }) => (await inventoryService.build(id, data)).data.data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['inventory-items'] })
      qc.invalidateQueries({ queryKey: ['inventory-ledger'] })
      qc.invalidateQueries({ queryKey: ['inventory-build-quote'] })
      invalidateLedgerQueries(qc)
      toast.success('Built and added to your stock')
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  })
}

/* ── Phase 10 — reports (all derived from the stock ledger) ────────────── */
export function useInventoryReport(kind, params = {}) {
  const fn = {
    valuation:  () => inventoryService.reportValuation(params),
    turnover:   () => inventoryService.reportTurnover(params),
    aging:      () => inventoryService.reportAging(),
    margin:     () => inventoryService.reportMargin(params),
    slowMovers: () => inventoryService.reportSlowMovers(params),
    expiring:   () => inventoryService.reportExpiring(params),
  }[kind]
  return useQuery({
    queryKey: ['inventory-report', kind, params],
    enabled: !!fn,
    queryFn: async () => (await fn()).data.data,
    staleTime: 60 * 1000,
  })
}

export function useStockLedger(id) {
  return useQuery({
    queryKey: ['inventory-ledger', id],
    enabled: !!id,
    queryFn: async () => {
      const { data } = await inventoryService.getStockLedger(id)
      return data.data
    },
    staleTime: 60 * 1000,
  })
}
