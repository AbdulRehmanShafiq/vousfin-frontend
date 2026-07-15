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
