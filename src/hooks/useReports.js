import { useQuery } from '@tanstack/react-query'
import api from '@/services/api'

// Helper to construct query string
const buildParams = (dateRange) => {
  const params = new URLSearchParams()
  if (dateRange?.startDate) params.append('startDate', dateRange.startDate)
  if (dateRange?.endDate) params.append('endDate', dateRange.endDate)
  return params.toString()
}

export function useIncomeStatement(dateRange) {
  return useQuery({
    queryKey: ['reports', 'income-statement', dateRange],
    queryFn: async () => {
      const { data } = await api.get(`/reports/income-statement?${buildParams(dateRange)}`)
      return data.data
    },
  })
}

export function useBalanceSheet(dateRange) {
  return useQuery({
    queryKey: ['reports', 'balance-sheet', dateRange],
    queryFn: async () => {
      const params = new URLSearchParams()
      const asOf = dateRange?.asOfDate || dateRange?.endDate
      if (asOf) params.append('asOfDate', asOf)
      const { data } = await api.get(`/reports/balance-sheet?${params.toString()}`)
      return data.data
    },
  })
}

export function useCashFlow(dateRange) {
  return useQuery({
    queryKey: ['reports', 'cash-flow', dateRange],
    queryFn: async () => {
      const { data } = await api.get(`/reports/cash-flow?${buildParams(dateRange)}`)
      return data.data
    },
  })
}

export function useTrialBalance(dateRange) {
  return useQuery({
    queryKey: ['reports', 'trial-balance', dateRange],
    queryFn: async () => {
      const params = new URLSearchParams()
      const asOf = dateRange?.asOfDate || dateRange?.endDate
      if (asOf) params.append('asOfDate', asOf)
      const { data } = await api.get(`/reports/trial-balance?${params.toString()}`)
      return data.data
    },
  })
}

export function useDashboardAll(dateRange) {
  return useQuery({
    queryKey: ['dashboard', 'all', dateRange],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (dateRange?.startDate) params.append('startDate', dateRange.startDate)
      if (dateRange?.endDate) params.append('endDate', dateRange.endDate)
      const { data } = await api.get(`/dashboard/all?${params.toString()}`)
      return data.data
    },
    staleTime: 2 * 60 * 1000, // 2 min cache for dashboard
  })
}
