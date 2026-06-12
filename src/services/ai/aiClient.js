/**
 * Dedicated Axios client for the FR-01 microservices (ports 8001–8004).
 *
 * Unlike the main `api` instance, this does NOT send credentials/cookies —
 * the AI services authenticate purely via the Bearer JWT, which keeps them
 * compatible with their permissive (wildcard) CORS policy.
 */
import axios from 'axios'

const aiClient = axios.create({
  withCredentials: false,
  timeout: 60_000,
})

// Inject the same JWT the rest of the app uses (from the Zustand auth store).
aiClient.interceptors.request.use((config) => {
  try {
    const authStorage = localStorage.getItem('auth-storage')
    if (authStorage) {
      const token = JSON.parse(authStorage)?.state?.token
      if (token) config.headers.Authorization = `Bearer ${token}`
    }
  } catch {
    /* ignore */
  }
  return config
})

export default aiClient
