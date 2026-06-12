import aiClient from './aiClient'

const BASE = import.meta.env.VITE_RECONCILIATION_URL ?? 'http://localhost:8004'

const reconciliationApi = {
  getScore:      (accountId) => aiClient.get(`${BASE}/v1/score/${accountId}`),
  getExceptions: (accountId, params = {}) => aiClient.get(`${BASE}/v1/exceptions/${accountId}`, { params }),
  confirmMatch:  (body) => aiClient.post(`${BASE}/v1/match`, body),
  clearLine:     (lineId, body) => aiClient.post(`${BASE}/v1/clear/${lineId}`, body),
}

export default reconciliationApi
