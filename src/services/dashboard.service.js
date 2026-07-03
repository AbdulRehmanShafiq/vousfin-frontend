import api from './api'

const dashboardService = {
  getKPIs: (params) => api.get('/dashboard/kpis', { params }),
  getRevenueVsExpenses: (params) => api.get('/dashboard/revenue-vs-expenses', { params }),
  getCashFlowTrend: (params) => api.get('/dashboard/cash-flow-trend', { params }),
  getAll: (params) => api.get('/dashboard/all', { params }),
  // Personalised module shortcuts (most-used + recent)
  recordModuleUsage: (payload) => api.post('/dashboard/module-usage', payload),
  getModuleShortcuts: () => api.get('/dashboard/module-shortcuts'),
}

export default dashboardService
