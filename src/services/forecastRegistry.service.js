/**
 * forecastRegistry.service.js — Forecast Platform F3
 * Forecast runs, model versions, realized accuracy, and on-demand backtests.
 */
import api from './api'

const forecastRegistryService = {
  listRuns:   (params = {}) => api.get('/forecast-registry/runs', { params }),
  listModels: (params = {}) => api.get('/forecast-registry/models', { params }),
  accuracy:   (params = {}) => api.get('/forecast-registry/accuracy', { params }),
  ensemble:   (params = {}) => api.get('/forecast-registry/ensemble', { params }), // F4
  backtest:   (payload = {}) => api.post('/forecast-registry/backtest', payload),
  runAccuracy:() => api.post('/forecast-registry/accuracy/run'),
}

export default forecastRegistryService
