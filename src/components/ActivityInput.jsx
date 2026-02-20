import { useRef, useEffect } from 'react'

export default function ActivityInput({ running, onStart, onLap, onStop, value, setValue }) {
  const inputRef = useRef(null)

  useEffect(() => {
    if (inputRef.current) inputRef.current.focus()
  }, [])

  function handleSubmit(e) {
    e.preventDefault()
    const name = value.trim()
    if (!name) return

    if (running) {
      onLap(name)
    } else {
      onStart(name)
    }
    setValue('')
  }

  return (
    <div className="activity-input-area">
      <form onSubmit={handleSubmit} className="activity-form">
        <input
          ref={inputRef}
          type="text"
          className="activity-input"
          placeholder={running ? 'Next activity...' : 'What are you doing?'}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          autoComplete="off"
          enterKeyHint="go"
        />
        <button type="submit" className="submit-btn" disabled={!value.trim()}>
          {running ? 'Next' : 'Start'}
        </button>
      </form>
      {running && (
        <button className="stop-btn" onClick={onStop}>
          Stop tracking
        </button>
      )}
    </div>
  )
}
