import { useState, useEffect } from 'react'
import { fetchDay, pushDay, hasApiConfig } from '../utils/api.js'

export function useSync(dateKey, load, setOnChange) {
  const [loading, setLoading] = useState(true)

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

  // Push to server on every change
  useEffect(() => {
    setOnChange((key, data) => {
      if (!hasApiConfig()) return
      pushDay(key, data)
    })
  }, [setOnChange])

  return { loading }
}
