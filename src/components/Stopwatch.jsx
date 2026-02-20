import { useState, useEffect } from 'react'
import { formatDuration } from '../utils/time.js'

export default function Stopwatch({ activeLap }) {
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    if (!activeLap) {
      setElapsed(0)
      return
    }

    function tick() {
      setElapsed(Date.now() - activeLap.startTime)
    }

    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
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
