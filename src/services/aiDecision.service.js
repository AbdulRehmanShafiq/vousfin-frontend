/**
 * aiDecision.service.js — AI Decision Ledger + advisor (Intelligence Roadmap
 * Phases 0/1/2/4). The lineage of every AI action, its plain-language "why",
 * one-click correct/reverse, measured calibration stats, and the advisor feed.
 */
import api from './api'

const aiDecisionService = {
  list:        (params = {})            => api.get('/ai-decisions', { params }),
  getById:     (id)                     => api.get(`/ai-decisions/${id}`),
  explain:     (id)                     => api.get(`/ai-decisions/${id}/explain`),
  setOutcome:  (id, outcome, correctedTo = null) =>
                                            api.post(`/ai-decisions/${id}/outcome`, { outcome, correctedTo }),
  stats:       ()                       => api.get('/ai-decisions/stats'),

  // Proactive AI CFO (Phase 4)
  recommendations: ()                   => api.get('/advisor/recommendations'),
  whatIf:      (question)               => api.post('/advisor/what-if', { question }),
}

export default aiDecisionService
