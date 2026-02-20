import { useState, useEffect, useMemo } from 'react'
import { formatDurationShort, formatDate, todayKey } from '../utils/time.js'
import { hasApiConfig, fetchDay } from '../utils/api.js'

export default function Summary({ laps, activeLap }) {
  const dateKey = todayKey()

  const { groups, totalMs } = useMemo(() => {
    if ((!laps || laps.length === 0) && !activeLap) {
      return { groups: [], totalMs: 0 }
    }

    const byName = {}
    let total = 0

    for (const lap of laps || []) {
      const d = lap.duration || 0
      total += d
      if (!byName[lap.name]) {
        byName[lap.name] = { name: lap.name, totalMs: 0, count: 0 }
      }
      byName[lap.name].totalMs += d
      byName[lap.name].count += 1
    }

    if (activeLap) {
      const elapsed = Date.now() - activeLap.startTime
      total += elapsed
      const name = activeLap.name
      if (!byName[name]) {
        byName[name] = { name, totalMs: 0, count: 0 }
      }
      byName[name].totalMs += elapsed
      byName[name].count += 1
    }

    const sorted = Object.values(byName).sort((a, b) => b.totalMs - a.totalMs)
    return { groups: sorted, totalMs: total }
  }, [laps, activeLap])

  // Fetch past 7 days from server
  const [pastDays, setPastDays] = useState([])

  useEffect(() => {
    if (!hasApiConfig()) return

    async function loadPastDays() {
      const today = new Date()
      const keys = []
      for (let i = 1; i <= 7; i++) {
        const d = new Date(today)
        d.setDate(d.getDate() - i)
        const dk = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
        keys.push(dk)
      }

      const results = await Promise.all(keys.map((dk) => fetchDay(dk)))
      const loaded = keys
        .map((dk, i) => ({ dateKey: dk, data: results[i] }))
        .filter((d) => d.data && d.data.laps && d.data.laps.length > 0)
      setPastDays(loaded)
    }

    loadPastDays()
  }, [])

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
          {pastDays.map(({ dateKey: dk, data }) => (
            <PastDaySummary key={dk} dateKey={dk} data={data} />
          ))}
        </div>
      )}
    </div>
  )
}

function PastDaySummary({ dateKey, data }) {
  const { groups, totalMs } = useMemo(() => {
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
  }, [data])

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
