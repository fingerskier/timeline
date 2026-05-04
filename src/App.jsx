import { useEffect, useState } from 'react'
import { loadAllEvents } from './lib/events.js'
import Timeline from './components/Timeline.jsx'

export default function App() {
  const [events, setEvents] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {
    loadAllEvents(import.meta.env.BASE_URL)
      .then(setEvents)
      .catch((e) => setError(e.message))
  }, [])

  if (error) {
    return (
      <div className="banner">
        Couldn't load timeline data: {error}{' '}
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    )
  }

  if (!events.length) return null
  return <Timeline events={events} />
}
