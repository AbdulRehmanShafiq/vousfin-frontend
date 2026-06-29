import api, { API_BASE_URL } from './api'

function authHeaders() {
  try {
    const authStorage = localStorage.getItem('auth-storage')
    if (!authStorage) return {}
    const token = JSON.parse(authStorage)?.state?.token
    return token ? { Authorization: `Bearer ${token}` } : {}
  } catch {
    return {}
  }
}

function parseSseBlock(block) {
  let event = 'message'
  const dataLines = []

  block.split(/\r?\n/).forEach((line) => {
    if (line.startsWith('event:')) event = line.slice(6).trim()
    if (line.startsWith('data:')) dataLines.push(line.slice(5).trim())
  })

  const rawData = dataLines.join('\n')
  let data
  try {
    data = rawData ? JSON.parse(rawData) : {}
  } catch {
    data = rawData
  }

  return { event, data }
}

async function assistantChatStream(question, chatHistory = [], handlers = {}) {
  const response = await fetch(`${API_BASE_URL}/ai/rag-query/stream`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
    },
    body: JSON.stringify({ question, chatHistory }),
  })

  if (response.status === 401) {
    window.dispatchEvent(new Event('auth:unauthorized'))
  }

  if (!response.ok) {
    const text = await response.text().catch(() => '')
    throw new Error(text || `AI stream failed with status ${response.status}`)
  }

  const reader = response.body?.getReader?.()
  if (!reader) throw new Error('AI stream is not readable in this browser')

  const decoder = new TextDecoder()
  let buffer = ''
  let finalPayload = null

  const processBlock = (block) => {
    if (!block.trim()) return
    const { event, data } = parseSseBlock(block)
    if (event === 'meta') handlers.onMeta?.(data)
    if (event === 'token') handlers.onToken?.(data?.delta || '')
    if (event === 'done') {
      finalPayload = data
      handlers.onDone?.(data)
    }
    if (event === 'error') {
      throw new Error(data?.message || 'AI stream failed')
    }
  }

  while (true) {
    const { value, done } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const blocks = buffer.split(/\r?\n\r?\n/)
    buffer = blocks.pop() || ''
    blocks.forEach(processBlock)
  }

  if (buffer.trim()) processBlock(buffer)
  return finalPayload || {}
}

const aiService = {
  assistantChat: (question, chatHistory = []) =>
    api.post('/ai/rag-query', { question, chatHistory }),

  assistantChatStream,

  recommendations: () =>
    api.post('/ai/cashflow-recommendations'),

  forecast: (metric, horizon) =>
    api.post('/ai/forecast', { metric, horizon }),

  // Triggers a fresh anomaly scan; returns scan summary + anomalies[]
  // Pass { force: true } to override decision-suppression (full re-scan)
  anomalyDetection: (opts = {}) =>
    api.post('/ai/anomaly-scan', opts),

  // Fetches previously stored alerts from DB (paginated, filterable by status)
  // Supported statuses: pending | marked_legit | confirmed_fraud | ignored | rescanned
  getAnomalyAlerts: (params = {}) =>
    api.get('/ai/anomaly-alerts', { params }),

  // Review a stored alert: action = 'legitimate' | 'fraud' | 'ignore'
  // Optional `notes` for reviewer comments
  reviewAnomalyAlert: (alertId, action, notes = '') =>
    api.put(`/ai/anomaly-alerts/${alertId}/review`, { action, notes }),

  // Alert counts by status for stats cards
  getAnomalyStats: () =>
    api.get('/ai/anomaly-stats'),

  semanticSearch: (query) =>
    api.post('/ai/semantic-search', { query }),

  parseNL: (text) =>
    api.post('/ai/parse-nl', { text }),

  // Auditable server-side Business Health Score (liquidity/profitability/
  // efficiency/leverage/tax) with data-sufficiency confidence.
  healthScore: () =>
    api.get('/ai/health-score'),

  // Health score over time + change vs last month (trend sparkline).
  healthHistory: (days = 90) =>
    api.get('/ai/health-history', { params: { days } }),

  // Forward-looking outlook: projected runway / margin / forward health
  // + proactive signals, derived from the ensemble forecast.
  healthOutlook: (horizon = 6) =>
    api.get('/ai/health-outlook', { params: { horizon } }),

  // Unified "Needs attention" feed — merged + ranked insights/forecast/anomalies.
  needsAttention: () =>
    api.get('/ai/needs-attention'),
}

export default aiService
