import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import api from '@/services/api'

export function useAccounts(filters = {}) {
  return useQuery({
    queryKey: ['accounts', filters],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (filters.accountType) params.append('accountType', filters.accountType)

      const { data } = await api.get(`/business/accounts?${params.toString()}`)
      // Backend now returns a plain array (no pagination wrapper).
      // ApiResponse.success wraps it as { success, data: [...], message }.
      // Fallback handles legacy paginated shape { data: { data: [...] } } if needed.
      const payload = data.data
      if (Array.isArray(payload))       return payload          // new: plain array
      if (Array.isArray(payload?.data)) return payload.data     // legacy: paginated
      if (Array.isArray(payload?.docs)) return payload.docs     // legacy: docs
      return []
    },
    // Accounts rarely change — cache for 5 minutes to avoid redundant refetches
    // while still refreshing after account creation (invalidateQueries covers that)
    staleTime: 5 * 60 * 1000,
  })
}

export function useCreateAccount() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (accountData) => {
      const { data } = await api.post('/business/accounts', accountData)
      return data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
      queryClient.invalidateQueries({ queryKey: ['reports'] })
      toast.success('Account created successfully')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create account')
    },
  })
}

export function useUpdateAccount() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }) => {
      const res = await api.put(`/business/accounts/${id}`, data)
      return res.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
      queryClient.invalidateQueries({ queryKey: ['reports'] })
      toast.success('Account updated successfully')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update account')
    },
  })
}
