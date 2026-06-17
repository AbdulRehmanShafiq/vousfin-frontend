/**
 * autonomy.service.js — Autonomy roadmap Phase 0
 * Client for the control plane + the one inbox.
 */
import api from './api'

const autonomyService = {
  getInbox:      ()                 => api.get('/autonomy/inbox'),
  scan:          ()                 => api.post('/autonomy/scan'),
  getReport:     ()                 => api.get('/autonomy/report'),
  getPolicy:     ()                 => api.get('/autonomy/policy'),
  setCapability: (capability, body) => api.put(`/autonomy/policy/${capability}`, body),
  approveAction: (id)               => api.post(`/autonomy/actions/${id}/approve`),
  rejectAction:  (id)               => api.post(`/autonomy/actions/${id}/reject`),
  reverseAction: (id)               => api.post(`/autonomy/actions/${id}/reverse`),

  // Bookkeeper agent (Phase 2) — hand the books a document; list intake + outcomes
  ingestDocument: (rawText, source) => api.post('/bookkeeping/ingest', { rawText, source }),
  getDocuments:   ()                => api.get('/bookkeeping/documents'),

  // Orchestrator (Phase 6) — routines + the observable plan
  getPlans:       ()                => api.get('/autonomy/plans'),
  runPlan:        (key)             => api.post(`/autonomy/plans/${key}/run`),

  // NL control line (Phase 7) — plain-language commands → policy changes
  control:        (text)            => api.post('/autonomy/control', { text }),
}

export default autonomyService
