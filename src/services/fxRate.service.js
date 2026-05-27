import api from './api'

const fxRateService = {
  // List rates with optional filters
  list: (params = {}) => api.get('/fx-rates', { params }),

  // Distinct currency pairs
  pairs: () => api.get('/fx-rates/pairs'),

  // Most recent rate per pair (as of today or a given date)
  latest: (asOf) => api.get('/fx-rates/latest', { params: asOf ? { asOf } : {} }),

  // Single record
  getById: (id) => api.get(`/fx-rates/${id}`),

  // Create / upsert one rate
  create: (data) => api.post('/fx-rates', data),

  // Bulk upsert
  bulkUpsert: (rates) => api.post('/fx-rates/bulk', { rates }),

  // Update one record
  update: (id, data) => api.put(`/fx-rates/${id}`, data),

  // Delete one record
  delete: (id) => api.delete(`/fx-rates/${id}`),

  // Live conversion preview (no DB write)
  convert: ({ from, to, amount, date }) =>
    api.get('/fx-rates/convert', { params: { from, to, amount, ...(date ? { date } : {}) } }),

  // Fetch live rates from open.er-api.com and save to DB (no API key needed)
  syncLiveRates: (currencies) =>
    api.post('/fx-rates/sync', currencies?.length ? { currencies } : {}),

  // Trigger month-end unrealised FX revaluation
  runRevaluation: (revaluationDate) =>
    api.post('/fx-rates/revaluate', revaluationDate ? { revaluationDate } : {}),
}

export default fxRateService
