const BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/$/, '')
const REQUEST_TIMEOUT = 8000

console.log('[API] Using base URL:', BASE_URL)

export async function getMetrics({ service_name = '', metric_type = '', limit = 50 } = {}) {
  const params = new URLSearchParams()
  if (service_name) params.append('service_name', service_name)
  if (metric_type) params.append('metric_type', metric_type)
  params.append('limit', limit.toString())

  const url = `${BASE_URL}/api/v1/metrics?${params.toString()}`
  console.log('[API] Fetching:', url)

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT)

  try {
    const response = await fetch(url, { signal: controller.signal })

    clearTimeout(timeoutId)

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error')
      console.error('[API] Error:', response.status, errorText)
      throw new Error(`Failed to fetch metrics: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    console.log('[API] Received:', data?.metrics?.length || 0, 'metrics')
    return data
  } catch (err) {
    clearTimeout(timeoutId)
    console.error('[API] Request failed:', err.message)
    if (err.name === 'AbortError') {
      throw new Error('Request timed out')
    }
    throw err
  }
}

export async function getHealth() {
  const url = `${BASE_URL}/api/v1/health`
  console.log('[API] Fetching health:', url)

  try {
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`Health check failed: ${response.status}`)
    }

    return response.json()
  } catch (err) {
    console.error('[API] Health check failed:', err.message)
    throw err
  }
}
