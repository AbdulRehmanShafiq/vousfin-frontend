import api from './api'

const dashboardService = {
  getKPIs: (params) => api.get('/dashboard/kpis', { params }),
  getRevenueVsExpenses: (params) => api.get('/dashboard/revenue-vs-expenses', { params }),
  getCashFlowTrend: (params) => api.get('/dashboard/cash-flow-trend', { params }),
  getAll: (params) => api.get('/dashboard/all', { params }),
}

export default dashboardService
