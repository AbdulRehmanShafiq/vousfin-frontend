import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import fxRateService from '@/services/fxRate.service'
import toast from 'react-hot-toast'

const QUERY_KEY = ['fx-rates']

// ── Queries ──────────────────────────────────────────────────────────────────

/** Full paginated list with optional filters */
export function useFxRates(params = {}) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'list', params],
    queryFn:  () => fxRateService.list(params).then(r => r.data?.data),
    staleTime: 5 * 60 * 1000,
  })
}

/** Distinct configured currency pairs for the business */
export function useFxPairs() {
  return useQuery({
    queryKey: [...QUERY_KEY, 'pairs'],
    queryFn:  () => fxRateService.pairs().then(r => r.data?.data ?? []),
    staleTime: 10 * 60 * 1000,
  })
}

/** Latest rate per pair — used in currency picker */
export function useLatestRates(asOf) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'latest', asOf ?? 'today'],
    queryFn:  () => fxRateService.latest(asOf).then(r => r.data?.data ?? []),
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Live conversion preview. Only fires when from/to/amount are all provided.
 * Returns { rate, converted } or null while loading.
 */
export function useConversionPreview({ from, to, amount, date }) {
  const enabled = !!(from && to && amount > 0 && from !== to)
  return useQuery({
    queryKey: [...QUERY_KEY, 'convert', from, to, amount, date ?? 'today'],
    queryFn:  () => fxRateService.convert({ from, to, amount, date }).then(r => r.data?.data),
    enabled,
    staleTime: 60 * 1000,
    placeholderData: null,
  })
}

// ── Mutations ────────────────────────────────────────────────────────────────

export function useCreateFxRate() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data) => fxRateService.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY })
      toast.success('Exchange rate saved')
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to save rate')
    },
  })
}

export function useUpdateFxRate() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => fxRateService.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY })
      toast.success('Rate updated')
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to update rate')
    },
  })
}

export function useDeleteFxRate() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id) => fxRateService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY })
      toast.success('Rate deleted')
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to delete rate')
    },
  })
}

export function useBulkUpsertFxRates() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (rates) => fxRateService.bulkUpsert(rates),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: QUERY_KEY })
      const d = res.data?.data
      toast.success(`Imported ${d?.upserted + d?.modified ?? 0} rates`)
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Bulk import failed')
    },
  })
}

export function useRunRevaluation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (date) => fxRateService.runRevaluation(date),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['transactions'] })
      toast.success(res.data?.message || 'FX revaluation complete')
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Revaluation failed')
    },
  })
}
