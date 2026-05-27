// src/hooks/useInvoices.js
// Phase 1 — React Query hooks for first-class Invoice + Bill domain.
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import invoiceService from '@/services/invoice.service'
import billService    from '@/services/bill.service'
import { getErrorMessage } from '@/utils/errorHandler'

// ── Invoices ──────────────────────────────────────────────────────────────────

export function useInvoices(params = {}) {
  return useQuery({
    queryKey: ['invoices', params],
    queryFn: async () => {
      const { data } = await invoiceService.list(params)
      return data.data
    },
    staleTime: 60 * 1000,
  })
}

export function useInvoice(id) {
  return useQuery({
    queryKey: ['invoice', id],
    enabled: !!id,
    queryFn: async () => {
      const { data } = await invoiceService.getById(id)
      return data.data
    },
  })
}

export function useInvoiceTimeline(id) {
  return useQuery({
    queryKey: ['invoice-timeline', id],
    enabled: !!id,
    queryFn: async () => {
      const { data } = await invoiceService.getTimeline(id)
      return data.data
    },
    staleTime: 30 * 1000,
  })
}

/** Generic mutation factory — runs the service call and invalidates caches. */
function makeInvoiceMutation(call, { successMessage, invalidateId } = {}) {
  return function useInvoiceMutation() {
    const qc = useQueryClient()
    return useMutation({
      mutationFn: call,
      onSuccess: (_resp, vars) => {
        if (successMessage) toast.success(typeof successMessage === 'function' ? successMessage(vars) : successMessage)
        qc.invalidateQueries({ queryKey: ['invoices'] })
        if (invalidateId && vars?.id) {
          qc.invalidateQueries({ queryKey: ['invoice', vars.id] })
          qc.invalidateQueries({ queryKey: ['invoice-timeline', vars.id] })
        }
        qc.invalidateQueries({ queryKey: ['outstanding-balances'] })
      },
      onError: (err) => toast.error(getErrorMessage(err)),
    })
  }
}

export const useCreateInvoiceDraft   = makeInvoiceMutation((data) => invoiceService.createDraft(data),
  { successMessage: 'Invoice draft created' })

export const useSubmitInvoice        = makeInvoiceMutation(({ id })           => invoiceService.submitForApproval(id),
  { successMessage: 'Invoice submitted',   invalidateId: true })

export const useApproveInvoice       = makeInvoiceMutation(({ id, note })     => invoiceService.approve(id, note),
  { successMessage: 'Invoice approved',    invalidateId: true })

export const useRejectInvoice        = makeInvoiceMutation(({ id, note })     => invoiceService.reject(id, note),
  { successMessage: 'Invoice rejected',    invalidateId: true })

export const useSendInvoice          = makeInvoiceMutation(({ id })           => invoiceService.send(id),
  { successMessage: 'Invoice sent',        invalidateId: true })

export const useCancelInvoice        = makeInvoiceMutation(({ id, reason })   => invoiceService.cancel(id, reason),
  { successMessage: 'Invoice cancelled',   invalidateId: true })

export const useDisputeInvoice       = makeInvoiceMutation(({ id, reason })   => invoiceService.dispute(id, reason),
  { successMessage: 'Invoice disputed',    invalidateId: true })

export const useWriteOffInvoice      = makeInvoiceMutation(({ id, reason })   => invoiceService.writeOff(id, reason),
  { successMessage: 'Invoice written off', invalidateId: true })

export const useArchiveInvoice       = makeInvoiceMutation(({ id })           => invoiceService.archive(id),
  { successMessage: 'Invoice archived',    invalidateId: true })

// ── Bills ─────────────────────────────────────────────────────────────────────

export function useBills(params = {}) {
  return useQuery({
    queryKey: ['bills', params],
    queryFn: async () => {
      const { data } = await billService.list(params)
      return data.data
    },
    staleTime: 60 * 1000,
  })
}

export function useBill(id) {
  return useQuery({
    queryKey: ['bill', id],
    enabled: !!id,
    queryFn: async () => {
      const { data } = await billService.getById(id)
      return data.data
    },
  })
}

export function useBillTimeline(id) {
  return useQuery({
    queryKey: ['bill-timeline', id],
    enabled: !!id,
    queryFn: async () => {
      const { data } = await billService.getTimeline(id)
      return data.data
    },
    staleTime: 30 * 1000,
  })
}

function makeBillMutation(call, { successMessage, invalidateId } = {}) {
  return function useBillMutation() {
    const qc = useQueryClient()
    return useMutation({
      mutationFn: call,
      onSuccess: (_resp, vars) => {
        if (successMessage) toast.success(typeof successMessage === 'function' ? successMessage(vars) : successMessage)
        qc.invalidateQueries({ queryKey: ['bills'] })
        if (invalidateId && vars?.id) {
          qc.invalidateQueries({ queryKey: ['bill', vars.id] })
          qc.invalidateQueries({ queryKey: ['bill-timeline', vars.id] })
        }
        qc.invalidateQueries({ queryKey: ['outstanding-balances'] })
      },
      onError: (err) => toast.error(getErrorMessage(err)),
    })
  }
}

export const useCreateBillDraft   = makeBillMutation((data) => billService.createDraft(data),
  { successMessage: 'Bill draft created' })

export const useSubmitBill        = makeBillMutation(({ id })             => billService.submitForApproval(id),
  { successMessage: 'Bill submitted',  invalidateId: true })

export const useApproveBill       = makeBillMutation(({ id, note })       => billService.approve(id, note),
  { successMessage: 'Bill approved',   invalidateId: true })

export const useRejectBill        = makeBillMutation(({ id, note })       => billService.reject(id, note),
  { successMessage: 'Bill rejected',   invalidateId: true })

export const useScheduleBill      = makeBillMutation(({ id, payDate })    => billService.schedule(id, payDate),
  { successMessage: 'Bill scheduled',  invalidateId: true })

export const useCancelBill        = makeBillMutation(({ id, reason })     => billService.cancel(id, reason),
  { successMessage: 'Bill cancelled',  invalidateId: true })

export const useArchiveBill       = makeBillMutation(({ id })             => billService.archive(id),
  { successMessage: 'Bill archived',   invalidateId: true })
