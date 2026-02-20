import { formatDurationShort } from '../utils/time.js'

export default function LapItem({ lap, onDelete }) {
  return (
    <div className="lap-item">
      <span className="lap-name">{lap.name}</span>
      <span className="lap-duration">{formatDurationShort(lap.duration)}</span>
      <button className="lap-delete" onClick={() => onDelete(lap.id)} aria-label="Delete lap">
        &times;
      </button>
    </div>
  )
}
