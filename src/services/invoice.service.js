// src/services/invoice.service.js
// Phase 1 — REST client for first-class Invoice domain endpoints.
import api from './api';

const invoiceService = {
  createDraft:        (data)              => api.post('/invoices', data),
  list:               (params)            => api.get('/invoices', { params }),
  getById:            (id)                => api.get(`/invoices/${id}`),
  getTimeline:        (id)                => api.get(`/invoices/${id}/timeline`),

  // Approval workflow
  submitForApproval:  (id)                => api.post(`/invoices/${id}/submit`),
  approve:            (id, note)          => api.post(`/invoices/${id}/approve`, { note }),
  reject:             (id, note)          => api.post(`/invoices/${id}/reject`,  { note }),

  // Lifecycle
  send:               (id)                => api.post(`/invoices/${id}/send`),
  cancel:             (id, reason)        => api.post(`/invoices/${id}/cancel`,    { reason }),
  dispute:            (id, reason)        => api.post(`/invoices/${id}/dispute`,   { reason }),
  writeOff:           (id, reason)        => api.post(`/invoices/${id}/write-off`, { reason }),
  transition:         (id, toState, reason) => api.post(`/invoices/${id}/transition`, { toState, reason }),

  archive:            (id)                => api.delete(`/invoices/${id}`),
};

export default invoiceService;
