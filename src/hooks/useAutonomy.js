/**
 * useAutonomy.js — Autonomy roadmap Phase 0
 * TanStack Query hooks for the Command Center inbox + the autonomy dials.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import autonomyService from '@/services/autonomy.service'

const KEY = ['autonomy']

export function useAutonomyInbox() {
  return useQuery({
    queryKey: [...KEY, 'inbox'],
    queryFn:  () => autonomyService.getInbox().then(r => r.data?.data),
    staleTime: 10 * 1000,
    refetchOnWindowFocus: true,   // returning to the tab clears any stale cards
  })
}

/** Ask the agents to look for work (reconciliation + collections) → fills the inbox. */
export function useAutonomyScan() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => autonomyService.scan().then(r => r.data?.data),
    onSuccess:  (data) => {
      qc.invalidateQueries({ queryKey: [...KEY, 'inbox'] })
      const n = data?.total || 0
      if (n > 0) toast.success(`Found ${n} thing${n === 1 ? '' : 's'} for you`)
    },
    onError: () => {}, // silent — scanning is a background nicety
  })
}

export function useAutonomyPolicy() {
  return useQuery({
    queryKey: [...KEY, 'policy'],
    queryFn:  () => autonomyService.getPolicy().then(r => r.data?.data),
    staleTime: 5 * 60 * 1000,
  })
}

/** The Autonomy Report — per-capability level + accuracy + dial recommendation. */
export function useAutonomyReport() {
  return useQuery({
    queryKey: [...KEY, 'report'],
    queryFn:  () => autonomyService.getReport().then(r => r.data?.data),
    staleTime: 60 * 1000,
  })
}

export function useSetCapability() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ capability, ...body }) => autonomyService.setCapability(capability, body).then(r => r.data?.data),
    onSuccess:  () => { qc.invalidateQueries({ queryKey: KEY }); toast.success('Autonomy updated') },
    onError:    (err) => toast.error(err.response?.data?.message || 'Could not update autonomy'),
  })
}

// A stale card (already handled elsewhere) → refresh the inbox so it disappears,
// and tell the owner plainly instead of showing a raw "must be queued" error.
function handleActionError(qc, err, fallback) {
  const msg = err.response?.data?.message || ''
  if (/must be (queued|executed)|not found/i.test(msg)) {
    qc.invalidateQueries({ queryKey: [...KEY, 'inbox'] })
    toast('Already handled — refreshed', { icon: '↻' })
  } else {
    toast.error(msg || fallback)
  }
}

export function useApproveAction() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id) => autonomyService.approveAction(id).then(r => r.data),
    onSuccess:  () => { qc.invalidateQueries({ queryKey: [...KEY, 'inbox'] }); toast.success('Approved') },
    onError:    (err) => handleActionError(qc, err, 'Could not approve'),
  })
}

export function useRejectAction() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id) => autonomyService.rejectAction(id).then(r => r.data),
    onSuccess:  () => { qc.invalidateQueries({ queryKey: [...KEY, 'inbox'] }); toast('Dismissed', { icon: '✕' }) },
    onError:    (err) => handleActionError(qc, err, 'Could not dismiss'),
  })
}

/* ── Bookkeeper agent (Phase 2) ───────────────────────────────────────────── */

/** Recent intake the Bookkeeper has read, and what each became. */
export function useBookkeepingDocuments() {
  return useQuery({
    queryKey: [...KEY, 'documents'],
    queryFn:  () => autonomyService.getDocuments().then(r => r.data?.data),
    staleTime: 30 * 1000,
  })
}

/* ── Orchestrator routines (Phase 6) + NL control (Phase 7) ───────────────── */

/** The routines on offer + the latest plan run. */
export function usePlans() {
  return useQuery({
    queryKey: [...KEY, 'plans'],
    queryFn:  () => autonomyService.getPlans().then(r => r.data?.data),
    staleTime: 60 * 1000,
  })
}

/** Run a routine (e.g. weekly_cash) → records an observable plan, fills the inbox. */
export function useRunPlan() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (key) => autonomyService.runPlan(key).then(r => r.data?.data),
    onSuccess:  (run) => {
      qc.invalidateQueries({ queryKey: [...KEY, 'inbox'] })
      qc.invalidateQueries({ queryKey: [...KEY, 'plans'] })
      const n = run?.totalProposed || 0
      toast.success(n > 0 ? `${run.name}: found ${n} thing${n === 1 ? '' : 's'} for you` : `${run?.name || 'Routine'}: all clear`)
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Could not run that routine'),
  })
}

/** The plain-language control line — "set tax to autopilot", "don't pay ACME". */
export function useAutonomyControl() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (text) => autonomyService.control(text).then(r => r.data?.data),
    onSuccess:  (data) => {
      if (data?.understood) {
        qc.invalidateQueries({ queryKey: KEY })
        toast.success(data.message)
      } else {
        toast(data?.message || "I didn't catch that", { icon: '💬' })
      }
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Could not apply that'),
  })
}

/** Hand the books a document — typed text or a photo → a proposed journal entry. */
export function useIngestDocument() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload) => autonomyService.ingestDocument(payload).then(r => r.data?.data),
    onSuccess:  (data) => {
      qc.invalidateQueries({ queryKey: [...KEY, 'inbox'] })
      qc.invalidateQueries({ queryKey: [...KEY, 'documents'] })
      const posted = data?.action?.status === 'executed'
      if (data?.action) toast.success(posted ? 'Recorded for you' : 'Read — waiting for your OK')
      else if (data?.busy) toast('Our reader is busy — try again in a moment', { icon: '⏳' })
      else toast.error(data?.error || "Couldn't read that — try adding the amount and what it was for")
    },
    onError:    (err) => toast.error(err.response?.data?.message || 'Could not read that'),
  })
}
