export default function PresetButtons({ presets, running, onStart, onLap }) {
  function handleClick(name) {
    if (running) {
      onLap(name)
    } else {
      onStart(name)
    }
  }

  return (
    <div className="preset-buttons">
      {presets.map((name) => (
        <button key={name} className="preset-pill" onClick={() => handleClick(name)}>
          {name}
        </button>
      ))}
    </div>
  )
}
