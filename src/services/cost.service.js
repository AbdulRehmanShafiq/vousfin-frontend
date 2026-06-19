// src/services/cost.service.js — SRS FR-07 (Cost Accounting)
import api from './api'

const costService = {
  listJobs:   (params)   => api.get('/cost/jobs', { params }),
  getJob:     (id)       => api.get(`/cost/jobs/${id}`),
  createJob:  (data)     => api.post('/cost/jobs', data),
  addCost:    (id, data) => api.post(`/cost/jobs/${id}/costs`, data),
  complete:   (id)       => api.post(`/cost/jobs/${id}/complete`),
  cancel:     (id)       => api.post(`/cost/jobs/${id}/cancel`),
  profitability: (dim, from, to) => api.get('/cost/profitability', { params: { dim, from, to } }),
  breakEven:  (data)     => api.post('/cost/break-even', data),
  whatIf:     (data)     => api.post('/cost/what-if', data),
  estimate:   (from, to) => api.get('/cost/break-even/estimate', { params: { from, to } }),
}

export default costService
