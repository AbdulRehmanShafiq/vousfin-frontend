import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import api from '@/services/api'

export function useTransactions(filters = {}) {
  return useQuery({
    queryKey: ['transactions', filters],
    queryFn: async () => {
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, val]) => {
        if (val) params.append(key, val)
      })
      
      const { data } = await api.get(`/transactions?${params.toString()}`)
      // Backend returns { data: { data: [...], total, page, limit } }
      // Normalize to { docs: [...], total, page, limit }
      const inner = data.data || {}
      return {
        docs: Array.isArray(inner.data) ? inner.data : Array.isArray(inner) ? inner : [],
        total: inner.total ?? 0,
        page: inner.page ?? 1,
        limit: inner.limit ?? 25,
      }
    },
  })
}

export function useCreateTransaction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (transactionData) => {
      const { data } = await api.post('/transactions/form', transactionData)
      return data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
      queryClient.invalidateQueries({ queryKey: ['reports'] })
      queryClient.invalidateQueries({ queryKey: ['customers'] })
      queryClient.invalidateQueries({ queryKey: ['vendors'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success('Transaction recorded successfully')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to record transaction')
    },
  })
}

export function useCreateInstallmentTransaction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (transactionData) => {
      const { data } = await api.post('/transactions/installment', transactionData)
      return data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
      queryClient.invalidateQueries({ queryKey: ['reports'] })
      queryClient.invalidateQueries({ queryKey: ['customers'] })
      queryClient.invalidateQueries({ queryKey: ['vendors'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success('Installment plan created successfully')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create installment plan')
    },
  })
}

export function useNLPreview() {
  return useMutation({
    mutationFn: async (text) => {
      const { data } = await api.post('/transactions/nl', { text })
      return data.data
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Could not parse transaction')
    },
  })
}

export function useNLConfirm() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (transactionData) => {
      const { data } = await api.post('/transactions/nl/confirm', transactionData)
      return data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
      queryClient.invalidateQueries({ queryKey: ['reports'] })
      queryClient.invalidateQueries({ queryKey: ['customers'] })
      queryClient.invalidateQueries({ queryKey: ['vendors'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success('Transaction recorded from natural language')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to confirm transaction')
    },
  })
}

export function useExcelPreview() {
  return useMutation({
    mutationFn: async (file) => {
      const form = new FormData()
      form.append('file', file)
      const { data } = await api.post('/transactions/excel', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return data.data
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to parse Excel file')
    },
  })
}

export function useExcelConfirm() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (rows) => {
      const { data } = await api.post('/transactions/excel/confirm', { rows })
      return data.data
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
      queryClient.invalidateQueries({ queryKey: ['reports'] })
      queryClient.invalidateQueries({ queryKey: ['customers'] })
      queryClient.invalidateQueries({ queryKey: ['vendors'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success(`${result?.successful ?? 'All'} transactions imported`)
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Import failed')
    },
  })
}
