import { memo } from 'react'

function StatsCard({ title, value, unit = '', icon, trend }) {
  const formatValue = (v) => {
    if (v === undefined || v === null) return '--'
    if (typeof v === 'number') {
      return Number.isInteger(v) ? v : v.toFixed(1)
    }
    return v
  }

  const trendColors = {
    up: 'text-red-400',
    down: 'text-green-400',
    stable: 'text-gray-400',
  }

  return (
    <div className="bg-gray-900 rounded-xl p-5 border border-gray-800 transition hover:shadow-lg hover:shadow-blue-500/10">
      <div className="flex items-center justify-between mb-2">
        <span className="text-gray-400 text-sm">{title}</span>
        {icon && <span className="text-xl">{icon}</span>}
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-3xl font-bold tracking-tight text-white">{formatValue(value)}</span>
        {unit && <span className="text-gray-400 text-sm">{unit}</span>}
      </div>
      {trend && (
        <div className={`text-xs mt-1 ${trendColors[trend] || 'text-gray-400'}`}>
          {trend === 'up' && '↑ Higher than average'}
          {trend === 'down' && '↓ Lower than average'}
          {trend === 'stable' && '→ Normal range'}
        </div>
      )}
    </div>
  )
}

export default memo(StatsCard)
