import { memo } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Area,
} from 'recharts'
import { METRIC_COLORS, METRIC_LABELS } from '../utils/metricsTransform'

const formatTime = (time) => {
  const d = new Date(time)
  return d.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 shadow-xl">
        <p className="text-slate-400 text-xs mb-2">
          {new Date(label).toLocaleDateString()}
        </p>
        <p className="text-slate-200 text-sm font-mono mb-2">
          {formatTime(label)}
        </p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm font-medium" style={{ color: entry.color }}>
            {METRIC_LABELS[entry.dataKey] || entry.dataKey}: {entry.value?.toFixed(1) || '--'}%
          </p>
        ))}
      </div>
    )
  }
  return null
}

function MetricsChart({ data = [] }) {
  if (!data || data.length === 0) {
    return (
      <div className="h-80 flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4 opacity-30">📊</div>
          <p className="text-slate-400 animate-pulse">Waiting for system metrics...</p>
        </div>
      </div>
    )
  }

  const metricTypes = ['cpu', 'memory', 'disk'].filter(
    (type) => data.some((d) => d[type] !== undefined)
  )

  if (metricTypes.length === 0) {
    return (
      <div className="h-80 flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4 opacity-30">📊</div>
          <p className="text-slate-400 animate-pulse">Processing metrics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05} />
            </linearGradient>
            <linearGradient id="colorMemory" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.05} />
            </linearGradient>
            <linearGradient id="colorDisk" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0.05} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />

          <XAxis
            dataKey="timestamp"
            tickFormatter={formatTime}
            stroke="#94a3b8"
            fontSize={11}
            tickLine={false}
            minTickGap={40}
          />

          <YAxis
            stroke="#94a3b8"
            fontSize={11}
            tickLine={false}
            domain={[0, 100]}
            tickFormatter={(v) => `${v}%`}
          />

          <Tooltip
            content={<CustomTooltip />}
            contentStyle={{
              backgroundColor: '#0f172a',
              border: '1px solid #1e293b',
              borderRadius: '8px',
            }}
          />

          <Legend
            formatter={(value) => METRIC_LABELS[value] || value}
            wrapperStyle={{ paddingTop: '10px' }}
          />

          {metricTypes.map((type) => (
            <Area
              key={`area-${type}`}
              type="monotone"
              dataKey={type}
              stroke="none"
              fill={`url(#color${type.charAt(0).toUpperCase() + type.slice(1)})`}
              isAnimationActive={true}
              animationDuration={400}
            />
          ))}

          {metricTypes.map((type) => (
            <Line
              key={type}
              type="monotone"
              dataKey={type}
              stroke={METRIC_COLORS[type]?.stroke || '#666'}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
              isAnimationActive={true}
              animationDuration={400}
              connectNulls
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export default memo(MetricsChart)