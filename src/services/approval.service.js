import api from './api'

/** Feature #6 — approval workflow. */
const approvalService = {
  getSettings:    ()             => api.get('/approvals/settings'),
  updateSettings: (data)         => api.put('/approvals/settings', data),
  list:           (params)       => api.get('/approvals', { params }),
  count:          ()             => api.get('/approvals/count'),
  getById:        (id)           => api.get(`/approvals/${id}`),
  approve:        (id, note)     => api.post(`/approvals/${id}/approve`, { note }),
  reject:         (id, reason)   => api.post(`/approvals/${id}/reject`, { reason }),
  cancel:         (id)           => api.post(`/approvals/${id}/cancel`),
}

export default approvalService
