import api from './api'

const reportService = {
  incomeStatement: (params) => api.get('/reports/income-statement', { params }),
  balanceSheet: (params) => api.get('/reports/balance-sheet', { params }),
  cashFlow: (params) => api.get('/reports/cash-flow', { params }),
  kpi: (params) => api.get('/reports/kpi', { params }),
  exportReport: (params) =>
    api.get('/reports/export', { params, responseType: 'blob' }),
}

export default reportService
