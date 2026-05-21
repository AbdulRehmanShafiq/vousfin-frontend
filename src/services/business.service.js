import api from './api'

const businessService = {
  // ✅ CREATE business (POST)
  setupBusiness: (data) => api.post('/business', data),
  
  // ✅ UPDATE business (PUT)
  updateBusiness: (data) => api.put('/business', data),
  
  // ✅ GET current business
  getBusiness: (params) => api.get('/business', { params }),
  
  // ✅ Chart of accounts
  getAccounts: (params) => api.get('/business/accounts', { params }),
  addAccount: (data) => api.post('/business/accounts', data),
  updateAccount: (accountId, data) => api.put(`/business/accounts/${accountId}`, data),
}

export default businessService