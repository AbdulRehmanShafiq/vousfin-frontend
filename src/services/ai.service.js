import api from './api'

const aiService = {
  assistantChat: (question, chatHistory = []) =>
    api.post('/ai/rag-query', { question, chatHistory }),

  recommendations: () =>
    api.post('/ai/cashflow-recommendations'),

  forecast: (metric, horizon) =>
    api.post('/ai/forecast', { metric, horizon }),

  // Triggers a fresh Isolation Forest scan; returns scan summary + anomalies[]
  anomalyDetection: () =>
    api.post('/ai/anomaly-scan'),

  // Fetches previously stored alerts from DB (paginated)
  getAnomalyAlerts: (params = {}) =>
    api.get('/ai/anomaly-alerts', { params }),

  // Review a stored alert: action = 'legitimate' | 'fraud'
  reviewAnomalyAlert: (alertId, action) =>
    api.put(`/ai/anomaly-alerts/${alertId}/review`, { action }),

  // Alert counts by status for stats cards
  getAnomalyStats: () =>
    api.get('/ai/anomaly-stats'),

  semanticSearch: (query) =>
    api.post('/ai/semantic-search', { query }),

  parseNL: (text) =>
    api.post('/ai/parse-nl', { text }),
}

export default aiService
