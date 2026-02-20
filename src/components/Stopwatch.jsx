import { useState, useEffect } from 'react'
import { formatDuration } from '../utils/time.js'

export default function Stopwatch({ activeLap }) {
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    if (!activeLap) {
      setElapsed(0)
      document.title = 'Onto'
      return
    }

    function tick() {
      const elapsed = Date.now() - activeLap.startTime
      setElapsed(elapsed)
      document.title = `${formatDuration(elapsed)} - ${activeLap.name}`
    }

    tick()
    const id = setInterval(tick, 1000)
    return () => {
      clearInterval(id)
      document.title = 'Onto'
    }
  }, [activeLap])

  return (
    <div className="stopwatch">
      <div className="timer">{formatDuration(elapsed)}</div>
      {activeLap && (
        <div className="current-activity">
          <span className="pulse-dot" />
          {activeLap.name}
        </div>
      )}
    </div>
  )
}
