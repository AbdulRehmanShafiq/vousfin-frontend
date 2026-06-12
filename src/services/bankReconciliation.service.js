import api from './api'

/** Feature #7 — bank-statement reconciliation. */
const bankReconciliationService = {
  // Upload a statement file → preview parsed lines (no save)
  parse: (file) => {
    const form = new FormData()
    form.append('file', file)
    return api.post('/bank-reconciliation/parse', form)
  },
  import: (data) => api.post('/bank-reconciliation/import', data),
  list:   (params) => api.get('/bank-reconciliation', { params }),
  get:    (id) => api.get(`/bank-reconciliation/${id}`),
  remove: (id) => api.delete(`/bank-reconciliation/${id}`),
  finish: (id) => api.post(`/bank-reconciliation/${id}/finish`),

  // Per-line actions
  match:   (id, lineRef, journalEntryId) => api.post(`/bank-reconciliation/${id}/lines/${lineRef}/match`, { journalEntryId }),
  unmatch: (id, lineRef) => api.post(`/bank-reconciliation/${id}/lines/${lineRef}/unmatch`),
  clear:   (id, lineRef, note) => api.post(`/bank-reconciliation/${id}/lines/${lineRef}/clear`, { note }),
  create:  (id, lineRef, body) => api.post(`/bank-reconciliation/${id}/lines/${lineRef}/create`, body),
}

export default bankReconciliationService
