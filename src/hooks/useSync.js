import { useEffect, useCallback, useRef } from 'react'
import { fetchDay, pushDay } from '../utils/api.js'
import { loadDay, saveDay, getApiConfig } from '../utils/storage.js'

export function useSync(dateKey, setOnChange) {
  const syncingRef = useRef(false)

  // Pull from server on mount / date change
  useEffect(() => {
    const { url, token } = getApiConfig()
    if (!url || !token) return

    let cancelled = false

    async function pull() {
      const remote = await fetchDay(dateKey)
      if (cancelled || !remote) return

      const local = loadDay(dateKey)
      // Use whichever has more recent data
      const remoteLatest = getLatestTimestamp(remote)
      const localLatest = getLatestTimestamp(local)

      if (remoteLatest > localLatest) {
        saveDay(dateKey, remote)
        // Force a page reload to pick up new data — simplest approach for single user
        window.location.reload()
      }
    }

    pull()
    return () => { cancelled = true }
  }, [dateKey])

  // Push to server on every change
  useEffect(() => {
    setOnChange((key, data) => {
      const { url, token } = getApiConfig()
      if (!url || !token) return
      if (syncingRef.current) return
      syncingRef.current = true
      pushDay(key, data).finally(() => {
        syncingRef.current = false
      })
    })
  }, [setOnChange])
}

function getLatestTimestamp(dayData) {
  if (!dayData) return 0
  let latest = 0
  if (dayData.activeLap?.startTime > latest) latest = dayData.activeLap.startTime
  if (dayData.laps) {
    for (const lap of dayData.laps) {
      if (lap.endTime > latest) latest = lap.endTime
      if (lap.startTime > latest) latest = lap.startTime
    }
  }
  return latest
}
