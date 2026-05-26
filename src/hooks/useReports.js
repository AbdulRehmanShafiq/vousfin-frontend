import { useQuery } from '@tanstack/react-query'
import api from '@/services/api'
import { useAuthStore } from '@/stores/useAuthStore'

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
  const businessId = useAuthStore(s => s.user?.businessId)
  return useQuery({
    queryKey: ['reports', 'income-statement', businessId, dateRange],
    queryFn: async () => {
      const { data } = await api.get(`/reports/income-statement?${buildParams(dateRange)}`)
      return data.data
    },
    staleTime: REPORT_STALE_TIME,
    gcTime:    REPORT_GC_TIME,
    enabled:   !!businessId,
  })
}

export function useBalanceSheet(dateRange) {
  const businessId = useAuthStore(s => s.user?.businessId)
  return useQuery({
    queryKey: ['reports', 'balance-sheet', businessId, dateRange],
    queryFn: async () => {
      const params = new URLSearchParams()
      const asOf = dateRange?.asOfDate || dateRange?.endDate
      if (asOf) params.append('asOfDate', asOf)
      const { data } = await api.get(`/reports/balance-sheet?${params.toString()}`)
      return data.data
    },
    staleTime: REPORT_STALE_TIME,
    gcTime:    REPORT_GC_TIME,
    enabled:   !!businessId,
  })
}

export function useCashFlow(dateRange) {
  const businessId = useAuthStore(s => s.user?.businessId)
  return useQuery({
    queryKey: ['reports', 'cash-flow', businessId, dateRange],
    queryFn: async () => {
      const { data } = await api.get(`/reports/cash-flow?${buildParams(dateRange)}`)
      return data.data
    },
    staleTime: REPORT_STALE_TIME,
    gcTime:    REPORT_GC_TIME,
    enabled:   !!businessId,
  })
}

export function useTrialBalance(dateRange) {
  const businessId = useAuthStore(s => s.user?.businessId)
  return useQuery({
    queryKey: ['reports', 'trial-balance', businessId, dateRange],
    queryFn: async () => {
      const params = new URLSearchParams()
      const asOf = dateRange?.asOfDate || dateRange?.endDate
      if (asOf) params.append('asOfDate', asOf)
      const { data } = await api.get(`/reports/trial-balance?${params.toString()}`)
      return data.data
    },
    staleTime: REPORT_STALE_TIME,
    gcTime:    REPORT_GC_TIME,
    enabled:   !!businessId,
  })
}

export function useDashboardAll(dateRange) {
  const businessId = useAuthStore(s => s.user?.businessId)
  return useQuery({
    queryKey: ['dashboard', 'all', businessId, dateRange],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (dateRange?.startDate) params.append('startDate', dateRange.startDate)
      if (dateRange?.endDate) params.append('endDate', dateRange.endDate)
      const { data } = await api.get(`/dashboard/all?${params.toString()}`)
      return data.data
    },
    staleTime: REPORT_STALE_TIME,
    gcTime:    REPORT_GC_TIME,
    enabled:   !!businessId,
  })
}
