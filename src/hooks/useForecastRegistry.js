/**
 * useForecastRegistry.js — Forecast Platform F3
 * Realized accuracy + model-version/gate hooks + on-demand backtest.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import forecastRegistryService from '@/services/forecastRegistry.service'
import { getErrorMessage } from '@/utils/errorHandler'

export function useForecastAccuracy(target) {
  return useQuery({
    queryKey: ['forecast-accuracy', target],
    queryFn: () => forecastRegistryService.accuracy(target ? { target } : {}).then((r) => r.data?.data),
    staleTime: 5 * 60 * 1000,
  })
}

export function useForecastModels(key) {
  return useQuery({
    queryKey: ['forecast-models', key],
    queryFn: () => forecastRegistryService.listModels(key ? { key } : {}).then((r) => r.data?.data),
    staleTime: 5 * 60 * 1000,
  })
}

export function useRunBacktest() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload) => forecastRegistryService.backtest(payload),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['forecast-models'] })
      const v = res?.data?.data
      toast.success(v ? `Backtest: MASE ${v.modelMase ?? '—'} vs baseline ${v.baselineMase ?? '—'} · ${v.gatePassed ? 'PASS' : 'fallback'}` : 'Backtest complete')
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  })
}
