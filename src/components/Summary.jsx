import { useMemo } from 'react'
import { formatDurationShort, formatDate, todayKey } from '../utils/time.js'
import { loadDay } from '../utils/storage.js'
import { STORAGE_KEYS } from '../utils/constants.js'

export default function Summary() {
  const dateKey = todayKey()

  const { groups, totalMs } = useMemo(() => {
    const data = loadDay(dateKey)
    if (!data || !data.laps || data.laps.length === 0) {
      return { groups: [], totalMs: 0 }
    }

    const byName = {}
    let total = 0

    for (const lap of data.laps) {
      const d = lap.duration || 0
      total += d
      if (!byName[lap.name]) {
        byName[lap.name] = { name: lap.name, totalMs: 0, count: 0 }
      }
      byName[lap.name].totalMs += d
      byName[lap.name].count += 1
    }

    // Include active lap's elapsed time
    if (data.activeLap) {
      const elapsed = Date.now() - data.activeLap.startTime
      total += elapsed
      const name = data.activeLap.name
      if (!byName[name]) {
        byName[name] = { name, totalMs: 0, count: 0 }
      }
      byName[name].totalMs += elapsed
      byName[name].count += 1
    }

    const sorted = Object.values(byName).sort((a, b) => b.totalMs - a.totalMs)
    return { groups: sorted, totalMs: total }
  }, [dateKey])

  // Also list recent past days
  const pastDays = useMemo(() => {
    const days = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key.startsWith(STORAGE_KEYS.DAY_PREFIX)) {
        const dk = key.slice(STORAGE_KEYS.DAY_PREFIX.length)
        if (dk !== dateKey) days.push(dk)
      }
    }
    return days.sort().reverse().slice(0, 7)
  }, [dateKey])

  return (
    <div className="summary">
      <h2>{formatDate(dateKey)}</h2>
      <div className="summary-total">
        Total tracked: <strong>{formatDurationShort(totalMs)}</strong>
      </div>

      {groups.length === 0 ? (
        <p className="summary-empty">No laps recorded yet today.</p>
      ) : (
        <div className="summary-groups">
          {groups.map((g) => {
            const pct = totalMs > 0 ? (g.totalMs / totalMs) * 100 : 0
            return (
              <div key={g.name} className="summary-row">
                <span className="summary-name">
                  {g.name}
                  {g.count > 1 && <span className="summary-count"> x{g.count}</span>}
                </span>
                <div className="summary-bar-track">
                  <div className="summary-bar-fill" style={{ width: `${pct}%` }} />
                </div>
                <span className="summary-duration">{formatDurationShort(g.totalMs)}</span>
              </div>
            )
          })}
        </div>
      )}

      {pastDays.length > 0 && (
        <div className="past-days">
          <h3>Past days</h3>
          {pastDays.map((dk) => (
            <PastDaySummary key={dk} dateKey={dk} />
          ))}
        </div>
      )}
    </div>
  )
}

function PastDaySummary({ dateKey }) {
  const { groups, totalMs } = useMemo(() => {
    const data = loadDay(dateKey)
    if (!data || !data.laps || data.laps.length === 0) {
      return { groups: [], totalMs: 0 }
    }

    const byName = {}
    let total = 0
    for (const lap of data.laps) {
      const d = lap.duration || 0
      total += d
      if (!byName[lap.name]) {
        byName[lap.name] = { name: lap.name, totalMs: 0 }
      }
      byName[lap.name].totalMs += d
    }

    return { groups: Object.values(byName).sort((a, b) => b.totalMs - a.totalMs), totalMs: total }
  }, [dateKey])

  if (totalMs === 0) return null

  return (
    <div className="past-day">
      <div className="past-day-header">
        <span>{formatDate(dateKey)}</span>
        <span>{formatDurationShort(totalMs)}</span>
      </div>
      <div className="past-day-items">
        {groups.slice(0, 5).map((g) => (
          <span key={g.name} className="past-day-tag">
            {g.name} {formatDurationShort(g.totalMs)}
          </span>
        ))}
      </div>
    </div>
  )
}
