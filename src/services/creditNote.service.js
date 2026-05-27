// src/services/creditNote.service.js
// Phase 2 — REST client for Credit Note / Debit Note endpoints.
import api from './api';

const creditNoteService = {
  create:          (data)       => api.post('/credit-notes', data),
  list:            (params)     => api.get('/credit-notes', { params }),
  getById:         (id)         => api.get(`/credit-notes/${id}`),
  listByInvoice:   (invoiceId)  => api.get(`/credit-notes/invoice/${invoiceId}`),

  // Lifecycle
  approve:         (id)         => api.post(`/credit-notes/${id}/approve`),
  apply:           (id)         => api.post(`/credit-notes/${id}/apply`),
  cancel:          (id, reason) => api.post(`/credit-notes/${id}/cancel`, { reason }),

  archive:         (id)         => api.delete(`/credit-notes/${id}`),
};

export default creditNoteService;
