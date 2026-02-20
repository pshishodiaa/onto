import { useState, useEffect, useRef } from 'react'
import Stopwatch from './components/Stopwatch.jsx'
import ActivityInput from './components/ActivityInput.jsx'
import PresetButtons from './components/PresetButtons.jsx'
import LapList from './components/LapList.jsx'
import Summary from './components/Summary.jsx'
import { useStopwatch } from './hooks/useStopwatch.js'
import { useSync } from './hooks/useSync.js'
import { hasApiConfig, fetchPresets, pushPresets } from './utils/api.js'
import { DEFAULT_PRESETS } from './utils/constants.js'

function timeAgo(ts) {
  if (!ts) return null
  const s = Math.floor((Date.now() - ts) / 1000)
  if (s < 10) return 'just now'
  if (s < 60) return `${s}s ago`
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m ago`
  return `${Math.floor(m / 60)}h ago`
}

export default function App() {
  const [view, setView] = useState('stopwatch')
  const [inputValue, setInputValue] = useState('')
  const [undoLap, setUndoLap] = useState(null)
  const { laps, activeLap, running, dateKey, start, lap, stop, deleteLap, load, setOnChange } =
    useStopwatch()

  const { loading, lastSynced, syncing, refresh } = useSync(dateKey, load, setOnChange)

  // Re-render periodically to update "synced X ago" text
  const [, setTick] = useState(0)
  useEffect(() => {
    if (!lastSynced) return
    const id = setInterval(() => setTick((t) => t + 1), 30000)
    return () => clearInterval(id)
  }, [lastSynced])

  // Pull-to-refresh
  const mainRef = useRef(null)
  const [pullY, setPullY] = useState(0)
  const pullYRef = useRef(0)
  const refreshRef = useRef(refresh)
  refreshRef.current = refresh

  useEffect(() => {
    const el = mainRef.current
    if (!el) return

    let startY = null
    let pulling = false

    function onTouchStart(e) {
      if (el.scrollTop <= 0 && !pulling) {
        startY = e.touches[0].clientY
      }
    }

    function onTouchMove(e) {
      if (startY === null) return
      const delta = e.touches[0].clientY - startY
      if (delta > 0 && el.scrollTop <= 0) {
        pulling = true
        e.preventDefault()
        const dist = Math.min(delta * 0.4, 80)
        pullYRef.current = dist
        setPullY(dist)
      } else if (!pulling) {
        startY = null
      }
    }

    function onTouchEnd() {
      if (pullYRef.current > 50) {
        refreshRef.current()
      }
      pullYRef.current = 0
      setPullY(0)
      startY = null
      pulling = false
    }

    el.addEventListener('touchstart', onTouchStart, { passive: true })
    el.addEventListener('touchmove', onTouchMove, { passive: false })
    el.addEventListener('touchend', onTouchEnd, { passive: true })

    return () => {
      el.removeEventListener('touchstart', onTouchStart)
      el.removeEventListener('touchmove', onTouchMove)
      el.removeEventListener('touchend', onTouchEnd)
    }
  }, [])

  const [presets, setPresets] = useState(DEFAULT_PRESETS)

  // Load presets from server + refresh on visibility change
  useEffect(() => {
    if (!hasApiConfig()) return

    async function pullPresets() {
      const p = await fetchPresets()
      if (p && p.length > 0) setPresets(p)
    }

    pullPresets()

    function onVisibility() {
      if (document.visibilityState === 'visible') pullPresets()
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [])

  function handleStart(name) {
    start(name)
    addToPresets(name)
  }

  function handleLap(name) {
    lap(name)
    addToPresets(name)
  }

  function addToPresets(name) {
    if (!presets.includes(name.toLowerCase())) {
      const updated = [name.toLowerCase(), ...presets].slice(0, 15)
      setPresets(updated)
      if (hasApiConfig()) pushPresets(updated)
    }
  }

  function handleDeleteLap(id) {
    const lap = laps.find((l) => l.id === id)
    if (lap) {
      setUndoLap(lap)
      deleteLap(id)
      setTimeout(() => setUndoLap(null), 5000)
    }
  }

  function handleUndo() {
    if (undoLap) {
      // Re-insert the lap at the beginning
      load(dateKey, { laps: [undoLap, ...laps], activeLap })
      setUndoLap(null)
    }
  }

  if (loading) {
    return (
      <div className="app">
        <header className="app-header">
          <h1>Onto</h1>
        </header>
        <main className="app-main">
          <p style={{ textAlign: 'center', padding: '2rem', opacity: 0.5 }}>Loading...</p>
        </main>
      </div>
    )
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Onto</h1>
        {lastSynced && (
          <button className="sync-status" onClick={refresh} disabled={syncing}>
            {syncing ? 'syncing…' : `synced ${timeAgo(lastSynced)}`}
          </button>
        )}
      </header>

      <div
        className={`pull-indicator${pullY > 0 ? ' pulling' : ''}`}
        style={{ height: syncing ? 36 : pullY > 0 ? Math.min(pullY * 0.5, 36) : 0 }}
      >
        <span className={syncing ? 'spin' : ''}>↻</span>
      </div>

      <main className="app-main" ref={mainRef}>
        {view === 'stopwatch' ? (
          <>
            <Stopwatch activeLap={activeLap} />
            <ActivityInput
              running={running}
              onStart={handleStart}
              onLap={handleLap}
              onStop={stop}
              value={inputValue}
              setValue={setInputValue}
            />
            <PresetButtons
              presets={presets}
              onSelect={setInputValue}
            />
            <LapList laps={laps} onDelete={handleDeleteLap} />
          </>
        ) : (
          <Summary laps={laps} activeLap={activeLap} />
        )}
      </main>

      <nav className="bottom-nav">
        <button
          className={`nav-tab ${view === 'stopwatch' ? 'active' : ''}`}
          onClick={() => setView('stopwatch')}
        >
          Timer
        </button>
        <button
          className={`nav-tab ${view === 'summary' ? 'active' : ''}`}
          onClick={() => setView('summary')}
        >
          Summary
        </button>
      </nav>

      {undoLap && (
        <div className="undo-toast">
          <span>Lap deleted</span>
          <button onClick={handleUndo}>Undo</button>
        </div>
      )}

    </div>
  )
}
