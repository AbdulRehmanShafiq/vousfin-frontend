import { create } from 'zustand'
import transactionService from '@/services/transaction.service'

export const useTransactionStore = create((set, get) => ({
  transactions: [],
  pagination: { page: 1, limit: 25, total: 0, totalPages: 0 },
  filters: {},
  loading: false,
  selected: null,

  setFilters: (filters) => set({ filters: { ...get().filters, ...filters } }),

  fetchTransactions: async (overrides = {}) => {
    set({ loading: true })
    const { filters, pagination } = get()
    const params = {
      page: pagination.page,
      limit: pagination.limit,
      ...filters,
      ...overrides,
    }
    try {
      const { data } = await transactionService.list(params)
      const result = data.data
      set({
        transactions: result.transactions || result.items || [],
        pagination: {
          page: result.page || params.page,
          limit: result.limit || params.limit,
          total: result.total || 0,
          totalPages: result.totalPages || 1,
        },
        loading: false,
      })
    } catch (e) {
      set({ loading: false })
      throw e
    }
  },

  fetchById: async (id) => {
    const { data } = await transactionService.getById(id)
    set({ selected: data.data })
    return data.data
  },

  create: async (payload) => {
    const { data } = await transactionService.create(payload)
    return data.data
  },

  reverse: async (id) => transactionService.reverse(id),
}))
