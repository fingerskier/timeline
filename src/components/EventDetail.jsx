import { useEffect } from 'react'

function fmtYear(y) {
  return y < 0 ? `${-y} BCE` : String(y)
}

export default function EventDetail({ event, onClose }) {
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  if (!event) return null
  return (
    <div
      className="detail-backdrop"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div className="detail" onClick={(e) => e.stopPropagation()}>
        <div className="meta">
          {fmtYear(event.year)} · {event.era} · {event.location}
        </div>
        <h2>{event.title}</h2>
        <p>{event.description}</p>
      </div>
    </div>
  )
}
