export function groupMetricsByTimestamp(metrics = []) {
  const map = new Map()

  metrics.forEach((m) => {
    if (!m.timestamp || m.value === undefined) return
    
    const d = new Date(m.timestamp)
    d.setMilliseconds(0)
    const ts = d.toISOString()
    
    if (!map.has(ts)) {
      map.set(ts, { timestamp: ts })
    }
    
    map.get(ts)[m.metric_type] = m.value
  })

  return Array.from(map.values()).sort(
    (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
  )
}

export function deduplicateMetrics(metrics = []) {
  const seen = new Set()
  return metrics.filter((m) => {
    const key = `${m.id || `${m.service_name}-${m.metric_type}-${m.timestamp}`}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

export const METRIC_COLORS = {
  cpu: { stroke: '#3b82f6', fill: '#3b82f6' },
  memory: { stroke: '#22c55e', fill: '#22c55e' },
  disk: { stroke: '#a855f7', fill: '#a855f7' },
}

export const METRIC_LABELS = {
  cpu: 'CPU Usage (%)',
  memory: 'Memory Usage (%)',
  disk: 'Disk Usage (%)',
}

export function getLatestValue(data = [], metricType = 'cpu') {
  if (!data || data.length === 0) return '--'
  const latest = data[data.length - 1]
  if (!latest) return '--'
  const value = latest[metricType]
  return value !== undefined && value !== null ? value : '--'
}

export function formatMetricValue(value) {
  if (value === '--' || value === null || value === undefined) return '--'
  return `${Number(value).toFixed(1)}%`
}
