import { useState, useEffect } from 'react'
import Stopwatch from './components/Stopwatch.jsx'
import ActivityInput from './components/ActivityInput.jsx'
import PresetButtons from './components/PresetButtons.jsx'
import LapList from './components/LapList.jsx'
import Summary from './components/Summary.jsx'
import { useStopwatch } from './hooks/useStopwatch.js'
import { useSync } from './hooks/useSync.js'
import { hasApiConfig, fetchPresets, pushPresets } from './utils/api.js'
import { DEFAULT_PRESETS } from './utils/constants.js'

export default function App() {
  const [view, setView] = useState('stopwatch')
  const [inputValue, setInputValue] = useState('')
  const { laps, activeLap, running, dateKey, start, lap, stop, deleteLap, load, setOnChange } =
    useStopwatch()

  const { loading } = useSync(dateKey, load, setOnChange)

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
              value={inputValue}
              setValue={setInputValue}
            />
            <PresetButtons
              presets={presets}
              onSelect={setInputValue}
            />
            <LapList laps={laps} onDelete={deleteLap} />
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

    </div>
  )
}
