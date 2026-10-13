const API = '/api/trades'

async function readApiResponse(response) {
  const contentType = response.headers.get('content-type') || ''
  if (!contentType.includes('application/json')) {
    throw new Error('The backend returned a web page instead of JSON. Restart the Backend server from the Backend folder.');
  }
  return response.json()
}

export async function fetchTrades({ page = 1, limit = 10, search = '', symbol = '' } = {}) {
  const query = new URLSearchParams({ page, limit, search, symbol })
  const response = await fetch(`${API}?${query}`)
  const result = await readApiResponse(response)
  if (!response.ok) throw new Error(result.message || 'Could not load trades')
  const data = Array.isArray(result) ? { trades: result } : result
  return {
    ...data,
    trades: Array.isArray(data?.trades) ? data.trades : [],
    total: Number(data?.total ?? data?.trades?.length ?? 0),
    totalPages: Number(data?.totalPages ?? 1),
    summary: data?.summary || {},
  }
}

export async function createPull({ batchSize, delayMs }) {
  const response = await fetch(`${API}/pulls`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ batchSize: Number(batchSize), delayMs: Number(delayMs) }),
  })
  const result = await readApiResponse(response)
  if (!response.ok) throw new Error(result.message || 'Could not create pull')
  return result
}

export function subscribeToTrades({ onConnection, onTrades, onPull }) {
  const events = new EventSource(`${API}/events`)
  events.addEventListener('connected', () => onConnection(true))
  events.addEventListener('trades', (event) => onTrades(JSON.parse(event.data)))
  events.addEventListener('pull', (event) => onPull(JSON.parse(event.data)))
  events.onerror = () => onConnection(false)
  return () => events.close()
}
