export default function PresetButtons({ presets, onSelect }) {
  return (
    <div className="preset-buttons">
      {presets.map((name) => (
        <button key={name} className="preset-pill" onClick={() => onSelect(name)}>
          {name}
        </button>
      ))}
    </div>
  )
}
