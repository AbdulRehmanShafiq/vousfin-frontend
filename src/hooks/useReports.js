import { useQuery } from '@tanstack/react-query'
import api from '@/services/api'

// ── Cache times ────────────────────────────────────────────────────────────────
// Backend caches reports for 5 minutes (invalidated on every transaction write).
// Match the frontend staleTime to the backend TTL so React Query doesn't re-fetch
// within a window where the backend would return cached data anyway.
// gcTime (formerly cacheTime) keeps the data in the in-memory query cache for
// 10 minutes after the component unmounts, so re-navigation is instant.
const REPORT_STALE_TIME = 5 * 60 * 1000  // 5 minutes
const REPORT_GC_TIME    = 10 * 60 * 1000 // 10 minutes

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
    staleTime: REPORT_STALE_TIME,
    gcTime:    REPORT_GC_TIME,
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
    staleTime: REPORT_STALE_TIME,
    gcTime:    REPORT_GC_TIME,
  })
}

export function useCashFlow(dateRange) {
  return useQuery({
    queryKey: ['reports', 'cash-flow', dateRange],
    queryFn: async () => {
      const { data } = await api.get(`/reports/cash-flow?${buildParams(dateRange)}`)
      return data.data
    },
    staleTime: REPORT_STALE_TIME,
    gcTime:    REPORT_GC_TIME,
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
    staleTime: REPORT_STALE_TIME,
    gcTime:    REPORT_GC_TIME,
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
    staleTime: REPORT_STALE_TIME,
    gcTime:    REPORT_GC_TIME,
  })
}
