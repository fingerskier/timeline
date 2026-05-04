export default function ZoomControls({ onZoomIn, onZoomOut, onReset }) {
  return (
    <div className="zoom-controls" aria-label="zoom controls">
      <button type="button" onClick={onZoomOut} title="Zoom out">−</button>
      <button type="button" onClick={onReset} title="Reset">⟲</button>
      <button type="button" onClick={onZoomIn} title="Zoom in">+</button>
    </div>
  )
}
