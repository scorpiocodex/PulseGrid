import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getMetrics } from '../services/api'
import { groupMetricsByTimestamp, deduplicateMetrics } from '../utils/metricsTransform'

const MAX_DATA_POINTS = 50

export function useMetrics({ service_name = '', metric_type = '', limit = 50 }) {
  const [accumulatedData, setAccumulatedData] = useState([])
  const [lastUpdated, setLastUpdated] = useState(null)
  const prevDataRef = useRef(null)

  const { data, isLoading, isError, error, refetch, isFetching, dataUpdatedAt } = useQuery({
    queryKey: ['metrics', { service_name, metric_type, limit }],
    queryFn: () => getMetrics({ service_name, metric_type, limit }),
    refetchInterval: 2000,
    refetchOnWindowFocus: false,
    staleTime: 1500,
    retry: 1,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
  })

  useEffect(() => {
    if (!data?.metrics || data.metrics.length === 0) return

    setAccumulatedData((prev) => {
      const newPoints = data.metrics.map((m) => ({
        ...m,
        timestamp: m.timestamp,
        value: m.value,
        isAnomaly: m.isAnomaly || false,
      }))

      if (newPoints.length === 0) return prev

      const merged = [...prev, ...newPoints]
      const deduped = deduplicateMetrics(merged)
      const sorted = deduped.sort(
        (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
      )
      const trimmed = sorted.slice(-MAX_DATA_POINTS)

      setLastUpdated(new Date())

      return trimmed
    })
  }, [data, dataUpdatedAt])

  const resetData = useCallback(() => {
    setAccumulatedData([])
    setLastUpdated(null)
  }, [])

  useEffect(() => {
    resetData()
  }, [service_name, metric_type, resetData])

  const status = useMemo(() => {
    if (isError) return 'offline'
    if (isFetching) return 'updating'
    return 'live'
  }, [isFetching, isError])

  const groupedData = useMemo(() => {
    return groupMetricsByTimestamp(accumulatedData)
  }, [accumulatedData])

  return {
    data: accumulatedData || [],
    groupedData,
    lastUpdated,
    status,
    isLoading: isLoading ?? true,
    isError: isError ?? false,
    error,
    refetch,
    isFetching: isFetching ?? false,
  }
}
