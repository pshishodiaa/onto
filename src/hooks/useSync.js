import { useState, useEffect, useCallback } from 'react'
import { fetchDay, pushDay, hasApiConfig } from '../utils/api.js'

export function useSync(dateKey, load, setOnChange) {
  const [loading, setLoading] = useState(true)
  const [lastSynced, setLastSynced] = useState(null)
  const [syncing, setSyncing] = useState(false)

  // Pull from server on mount / date change / visibility change
  useEffect(() => {
    if (!hasApiConfig()) {
      setLoading(false)
      return
    }

    let cancelled = false
    let initialDone = false

    async function pull() {
      const remote = await fetchDay(dateKey)
      if (cancelled) return
      load(dateKey, remote || { laps: [], activeLap: null })
      setLastSynced(Date.now())
      if (!initialDone) {
        initialDone = true
        setLoading(false)
      }
    }

    pull()

    function onVisibility() {
      if (document.visibilityState === 'visible') pull()
    }
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      cancelled = true
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [dateKey, load])

  // Manual refresh
  const refresh = useCallback(async () => {
    if (!hasApiConfig()) return
    setSyncing(true)
    try {
      const remote = await fetchDay(dateKey)
      load(dateKey, remote || { laps: [], activeLap: null })
      setLastSynced(Date.now())
    } finally {
      setSyncing(false)
    }
  }, [dateKey, load])

  // Push to server on every change
  useEffect(() => {
    setOnChange((key, data) => {
      if (!hasApiConfig()) return
      pushDay(key, data)
    })
  }, [setOnChange])

  return { loading, lastSynced, syncing, refresh }
}
