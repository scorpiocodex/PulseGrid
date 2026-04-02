import { useEffect, useCallback } from 'react'

export function usePolling(callback, interval = 5000) {
  const handleCallback = useCallback(callback, [callback])

  useEffect(() => {
    handleCallback()
    const id = setInterval(handleCallback, interval)
    return () => clearInterval(id)
  }, [handleCallback, interval])
}
