import { useState, useMemo } from 'react'
import Stopwatch from './components/Stopwatch.jsx'
import ActivityInput from './components/ActivityInput.jsx'
import PresetButtons from './components/PresetButtons.jsx'
import LapList from './components/LapList.jsx'
import Summary from './components/Summary.jsx'
import { useStopwatch } from './hooks/useStopwatch.js'
import { useSync } from './hooks/useSync.js'
import { loadPresets, savePresets } from './utils/storage.js'
import { DEFAULT_PRESETS } from './utils/constants.js'

export default function App() {
  const [view, setView] = useState('stopwatch')
  const [inputValue, setInputValue] = useState('')
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

    </div>
  )
}
