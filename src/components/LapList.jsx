import LapItem from './LapItem.jsx'

export default function LapList({ laps, onDelete }) {
  if (laps.length === 0) return null

  return (
    <div className="lap-list">
      {laps.map((lap) => (
        <LapItem key={lap.id} lap={lap} onDelete={onDelete} />
      ))}
    </div>
  )
}
