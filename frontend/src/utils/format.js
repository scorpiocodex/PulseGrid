export function formatTimestamp(timestamp) {
  return new Date(timestamp).toLocaleString()
}

export function formatPercentage(value) {
  return `${value.toFixed(1)}%`
}

export function formatZScore(value) {
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}σ`
}
