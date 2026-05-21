import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import api from '@/services/api'

export function useForecast() {
  return useMutation({
    mutationFn: async ({ metric, horizon }) => {
      const { data } = await api.post('/ai/forecast', { metric, horizon })
      return data.data
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to generate forecast')
    },
  })
}
