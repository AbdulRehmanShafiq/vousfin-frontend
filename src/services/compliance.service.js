// src/services/compliance.service.js — FR-10 Compliance
import api from './api'

const complianceService = {
  // FR-10.1 Calendar
  generateObligations: (year)          => api.post('/compliance/generate', { year }),
  listObligations:     (params)        => api.get('/compliance/obligations', { params }),
  completeObligation:  (id, data)      => api.patch(`/compliance/obligations/${id}/complete`, data),
  waiveObligation:     (id, data)      => api.patch(`/compliance/obligations/${id}/waive`, data),
  checkOverdue:        ()              => api.post('/compliance/check-overdue'),
  upcoming:            (days = 30)     => api.get('/compliance/upcoming', { params: { days } }),

  // FR-10.2 Leases
  createLease:         (data)          => api.post('/leases', data),
  listLeases:          ()              => api.get('/leases'),
  getLease:            (id)            => api.get(`/leases/${id}`),
  getSchedule:         (id)            => api.get(`/leases/${id}/schedule`),
  postAmortization:    (id)            => api.post(`/leases/${id}/amortize`),
  terminateLease:      (id)            => api.patch(`/leases/${id}/terminate`),

  // FR-10.2 Impairment
  createAssessment:    (data)          => api.post('/impairment', data),
  listAssessments:     ()              => api.get('/impairment'),
  postImpairmentLoss:  (id)            => api.post(`/impairment/${id}/post`),

  // FR-10.3 AML
  listScreenings:      (params)        => api.get('/aml', { params }),
  draftSTR:            (id)            => api.get(`/aml/${id}/str-draft`),
  addJustification:    (id, data)      => api.patch(`/aml/${id}/justify`, data),

  // FR-10.4 Retention
  listPolicies:        ()              => api.get('/retention/policies'),
  setPolicies:         (policies)      => api.post('/retention/policies', policies),
}

export default complianceService
