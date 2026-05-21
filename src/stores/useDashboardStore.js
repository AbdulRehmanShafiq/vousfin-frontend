import { create } from 'zustand'
import { startOfYear, endOfYear, format } from 'date-fns'
import dashboardService from '@/services/dashboard.service'

const defaultRange = () => ({
  startDate: format(startOfYear(new Date()), 'yyyy-MM-dd'),
  endDate: format(endOfYear(new Date()), 'yyyy-MM-dd'),
})

export const useDashboardStore = create((set, get) => ({
  kpis: null,
  revenueExpenses: [],
  cashFlowTrend: [],
  recentTransactions: [],
  loading: false,
  dateRange: defaultRange(),

  setDateRange: (range) => set({ dateRange: { ...get().dateRange, ...range } }),

  fetchAll: async () => {
    set({ loading: true })
    const params = get().dateRange
    try {
      const { data } = await dashboardService.getAll(params)
      const payload = data.data
      set({
        kpis: payload.kpis,
        revenueExpenses: payload.revenueVsExpenses || payload.revenueExpenses || [],
        cashFlowTrend: payload.cashFlowTrend || [],
        recentTransactions: payload.recentTransactions || [],
        loading: false,
      })
    } catch (e) {
      set({ loading: false })
      throw e
    }
  },
}))
