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
      return data.data?.data || data.data?.docs || data.data
    },
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
