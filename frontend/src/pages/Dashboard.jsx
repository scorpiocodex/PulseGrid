import { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import { useMetrics } from '../hooks/useMetrics'
import MetricsChart from '../components/MetricsChart'
import Filters from '../components/Filters'
import StatsCard from '../components/StatsCard'
import { METRIC_LABELS, getLatestValue, formatMetricValue } from '../utils/metricsTransform'

function getTimeAgo(date) {
  if (!date) return '--'

  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)

  if (seconds < 5) return 'just now'
  if (seconds < 60) return `${seconds}s ago`

  const minutes = Math.floor(seconds / 60)
  return `${minutes}m ago`
}

function Dashboard() {
  const [filters, setFilters] = useState({
    service_name: 'system',
    metric_type: '',
    limit: 50,
  })

  const [tick, setTick] = useState(0)
  const [frozenLastUpdated, setFrozenLastUpdated] = useState(null)

  const {
    data = [],
    groupedData = [],
    lastUpdated,
    status,
    isLoading = true,
    isError = false,
    error,
    refetch,
  } = useMetrics(filters)

  useEffect(() => {
    const interval = setInterval(() => {
      setTick((t) => t + 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (status !== 'offline' && lastUpdated) {
      setFrozenLastUpdated(lastUpdated)
    }
  }, [lastUpdated, status])

  useEffect(() => {
    const title =
      status === 'offline'
        ? '🔴 PulseGrid — Offline'
        : status === 'updating'
          ? '🟡 PulseGrid — Updating...'
          : '🟢 PulseGrid — Live'
    document.title = title
  }, [status])

  const handleFilterChange = useCallback((key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value || '',
    }))
  }, [])

  const latestCpuValue = useMemo(() => {
    return getLatestValue(groupedData, 'cpu')
  }, [groupedData])

  const latestCpuFormatted = useMemo(() => {
    if (latestCpuValue === '--') return '--'
    return formatMetricValue(latestCpuValue)
  }, [latestCpuValue])

  const stats = useMemo(() => {
    return {
      cpuValue: latestCpuValue,
      cpuFormatted: latestCpuFormatted,
      total: Math.floor(data?.length || 0),
    }
  }, [data, latestCpuValue, latestCpuFormatted])

  const getTrend = useMemo(() => {
    if (groupedData.length < 5) return 'stable'
    const recent = groupedData.slice(-10)
    const avg = recent.reduce((sum, m) => sum + (m.cpu || 0), 0) / recent.length
    if (latestCpuValue === '--') return 'stable'
    if (latestCpuValue > avg * 1.1) return 'up'
    if (latestCpuValue < avg * 0.9) return 'down'
    return 'stable'
  }, [groupedData, latestCpuValue])

  const getStatusColor = () => {
    if (status === 'offline') return 'bg-red-500'
    if (status === 'updating') return 'bg-yellow-400'
    return 'bg-green-500'
  }

  const getStatusText = () => {
    if (status === 'offline') return 'Offline'
    if (status === 'updating') return 'Updating'
    return 'Live'
  }

  const isOffline = status === 'offline' && !data.length

  if (isOffline) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="text-center p-8">
          <div className="text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-red-400 mb-2">Backend Connection Failed</h2>
          <p className="text-gray-400 mb-4">
            {error?.message || 'Unable to connect to PulseGrid API'}
          </p>
          <button
            onClick={() => refetch?.()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors"
          >
            Retry Connection
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="bg-gray-900 border-b border-gray-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="PulseGrid"
              className="w-9 h-9 rounded-xl shadow-md"
              onError={(e) => {
                e.target.style.display = 'none'
              }}
            />
            <h1 className="text-lg font-semibold tracking-tight">PulseGrid</h1>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${getStatusColor()}`}
              style={{
                boxShadow: status === 'updating' ? '0 0 8px #eab308' : 'none',
              }}
            />
            <span className="text-gray-300 transition-opacity duration-300">
              {getStatusText()}
            </span>
          </div>
        </div>
      </header>

      <main className="p-6 max-w-7xl mx-auto animate-fade-in">
        <div className="mb-6">
          <h2 className="text-2xl font-bold tracking-tight mb-1">Dashboard</h2>
          <p className="text-gray-400 text-sm">
            Real-time system monitoring
          </p>
        </div>

        <Filters
          filters={filters}
          onFilterChange={handleFilterChange}
          services={data || []}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <StatsCard
            title={METRIC_LABELS.cpu}
            value={stats.cpuValue !== '--' ? parseFloat(stats.cpuValue) : null}
            unit="%"
            icon="📊"
            trend={getTrend}
          />
          <StatsCard
            title="Data Points"
            value={stats.total}
            icon="📈"
          />
          <StatsCard
            title="Service"
            value={filters.service_name || 'all'}
            icon="🖥️"
          />
        </div>

        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">
              System Metrics
            </h3>
            {frozenLastUpdated && (
              <span className="text-xs text-gray-400">
                Last updated: {getTimeAgo(frozenLastUpdated)}
              </span>
            )}
          </div>

          {isLoading && data.length === 0 ? (
            <div className="h-80 flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl mb-4 opacity-50 animate-pulse">📡</div>
                <p className="text-gray-400 animate-pulse">Collecting data...</p>
              </div>
            </div>
          ) : (
            <MetricsChart data={groupedData} />
          )}
        </div>

        <div className="mt-6 text-center text-gray-500 text-xs">
          Auto-refreshing every 2 seconds • Data provided by PulseGrid API
        </div>
      </main>
    </div>
  )
}

export default Dashboard