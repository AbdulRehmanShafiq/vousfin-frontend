// src/services/internalAudit.service.js — Phase 6C (Internal Audit)
import api from './api'

const internalAuditService = {
  // Plans
  listPlans:        ()              => api.get('/internal-audit/plans'),
  createPlan:       (data)          => api.post('/internal-audit/plans', data),
  getPlan:          (id)            => api.get(`/internal-audit/plans/${id}`),
  updatePlanStatus: (id, status)    => api.patch(`/internal-audit/plans/${id}/status`, { status }),
  drawSample:       (id)            => api.get(`/internal-audit/plans/${id}/sample`),

  // Findings
  listFindings: (params = {})  => api.get('/internal-audit/findings', { params }),
  raiseFinding: (data)         => api.post('/internal-audit/findings', data),
  recordResponse:(id, data)    => api.patch(`/internal-audit/findings/${id}`, data),

  // Aging
  aging: () => api.get('/internal-audit/aging'),
}

export default internalAuditService
