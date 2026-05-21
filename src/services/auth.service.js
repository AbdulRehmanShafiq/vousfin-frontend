import api, { API_BASE_URL } from './api'

const authService = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  logout: () => api.post('/auth/logout'),
  verifyEmail: (token) => api.post('/auth/verify-email', { token }),
  resendVerification: (email) => api.post('/auth/resend-verification', { email }),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  googleOAuthUrl: () => {
    if (API_BASE_URL.startsWith('http')) {
      return `${API_BASE_URL.replace(/\/api\/v1\/?$/, '')}/api/v1/auth/google`
    }
    return `${window.location.origin}/api/v1/auth/google`
  },
}

export default authService
