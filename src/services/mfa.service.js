import api from './api'

const mfaService = {
  setup: () => api.get('/auth/mfa/setup'),
  confirm: (token) => api.post('/auth/mfa/confirm', { token }),
  disable: (token) => api.delete('/auth/mfa', { data: { token } }),
  verifyChallenge: (mfaToken, token) => api.post('/auth/mfa/verify', { mfaToken, token }),
}

export default mfaService
