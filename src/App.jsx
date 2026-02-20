import { useState, useMemo } from 'react'
import Stopwatch from './components/Stopwatch.jsx'
import ActivityInput from './components/ActivityInput.jsx'
import PresetButtons from './components/PresetButtons.jsx'
import LapList from './components/LapList.jsx'
import Summary from './components/Summary.jsx'
import Settings from './components/Settings.jsx'
import { useStopwatch } from './hooks/useStopwatch.js'
import { useSync } from './hooks/useSync.js'
import { loadPresets, savePresets } from './utils/storage.js'
import { DEFAULT_PRESETS } from './utils/constants.js'

export default function App() {
  const [view, setView] = useState('stopwatch')
  const [showSettings, setShowSettings] = useState(false)
  const { laps, activeLap, running, dateKey, start, lap, stop, deleteLap, setOnChange } =
    useStopwatch()

  useSync(dateKey, setOnChange)

  const presets = useMemo(() => loadPresets() || DEFAULT_PRESETS, [])

  function handleStart(name) {
    start(name)
    addToPresets(name)
  }

  function handleLap(name) {
    lap(name)
    addToPresets(name)
  }

  function addToPresets(name) {
    const current = loadPresets() || DEFAULT_PRESETS
    if (!current.includes(name.toLowerCase())) {
      const updated = [name.toLowerCase(), ...current].slice(0, 15)
      savePresets(updated)
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Onto</h1>
        <button className="settings-btn" onClick={() => setShowSettings(true)} aria-label="Settings">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="10" cy="10" r="3" />
            <path d="M10 1v2M10 17v2M1 10h2M17 10h2M3.5 3.5l1.4 1.4M15.1 15.1l1.4 1.4M3.5 16.5l1.4-1.4M15.1 4.9l1.4-1.4" />
          </svg>
        </button>
      </header>

      <main className="app-main">
        {view === 'stopwatch' ? (
          <>
            <Stopwatch activeLap={activeLap} />
            <ActivityInput
              running={running}
              onStart={handleStart}
              onLap={handleLap}
              onStop={stop}
            />
            <PresetButtons
              presets={presets}
              running={running}
              onStart={handleStart}
              onLap={handleLap}
            />
            <LapList laps={laps} onDelete={deleteLap} />
          </>
        ) : (
          <Summary />
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

      {showSettings && <Settings onClose={() => setShowSettings(false)} />}
    </div>
  )
}
