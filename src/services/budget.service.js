// src/services/budget.service.js — SRS FR-04.1 / FR-04.2 (Budgeting & Variance)
import api from './api'

const budgetService = {
  list:     (params)     => api.get('/budgets', { params }),
  get:      (id)         => api.get(`/budgets/${id}`),
  create:   (data)       => api.post('/budgets', data),
  update:   (id, data)   => api.put(`/budgets/${id}`, data),
  seed:     (data)       => api.post('/budgets/seed', data),
  submit:   (id)         => api.post(`/budgets/${id}/submit`),
  approve:  (id, note)   => api.post(`/budgets/${id}/approve`, { note }),
  reject:   (id, note)   => api.post(`/budgets/${id}/reject`, { note }),
  clone:    (id)         => api.post(`/budgets/${id}/clone`),
  variance: (id, asOf)   => api.get(`/budgets/${id}/variance`, { params: { asOf } }),
}

export default budgetService
