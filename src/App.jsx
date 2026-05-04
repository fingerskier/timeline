import { useEffect, useState } from 'react'
import { loadAllEvents } from './lib/events.js'
import Timeline from './components/Timeline.jsx'

export default function App() {
  const [events, setEvents] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {
    let alive = true
    loadAllEvents(import.meta.env.BASE_URL)
      .then((d) => { if (alive) setEvents(d) })
      .catch((e) => { if (alive) setError(e.message) })
    return () => { alive = false }
  }, [])

  if (error) {
    return (
      <div className="banner">
        Couldn't load timeline data: {error}{' '}
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    )
  }

  if (!events.length) return <div className="banner">Loading timeline…</div>
  return <Timeline events={events} />
}
