import { create } from 'zustand'
import reportService from '@/services/report.service'

export const useReportStore = create((set) => ({
  incomeStatement: null,
  balanceSheet: null,
  cashFlow: null,
  loading: false,
  dateRange: { startDate: '', endDate: '' },

  setDateRange: (range) => set({ dateRange: range }),

  fetchIncomeStatement: async (params) => {
    set({ loading: true })
    try {
      const { data } = await reportService.incomeStatement(params)
      set({ incomeStatement: data.data, loading: false })
      return data.data
    } catch (e) {
      set({ loading: false })
      throw e
    }
  },

  fetchBalanceSheet: async (params) => {
    set({ loading: true })
    try {
      const { data } = await reportService.balanceSheet(params)
      set({ balanceSheet: data.data, loading: false })
      return data.data
    } catch (e) {
      set({ loading: false })
      throw e
    }
  },

  fetchCashFlow: async (params) => {
    set({ loading: true })
    try {
      const { data } = await reportService.cashFlow(params)
      set({ cashFlow: data.data, loading: false })
      return data.data
    } catch (e) {
      set({ loading: false })
      throw e
    }
  },
}))
