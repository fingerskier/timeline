import { useEffect, useMemo, useState } from 'react'

const ERA_FILES = ['ancient.json', 'medieval.json', 'modern.json']

function App() {
  const [events, setEvents] = useState([])
  const [selectedEra, setSelectedEra] = useState('all')
  const [query, setQuery] = useState('')

  useEffect(() => {
    async function loadEvents() {
      const responses = await Promise.all(
        ERA_FILES.map((file) => fetch(`${import.meta.env.BASE_URL}data/${file}`).then((r) => r.json()))
      )

      const merged = responses.flat().sort((a, b) => a.year - b.year)
      setEvents(merged)
    }

    loadEvents()
  }, [])

  const eras = useMemo(() => ['all', ...new Set(events.map((event) => event.era))], [events])

  const filtered = useMemo(() => {
    return events.filter((event) => {
      const matchesEra = selectedEra === 'all' || event.era === selectedEra
      const text = `${event.title} ${event.description} ${event.location}`.toLowerCase()
      const matchesQuery = text.includes(query.toLowerCase())

      return matchesEra && matchesQuery
    })
  }, [events, selectedEra, query])

  return (
    <main className="container">
      <header>
        <h1>Interactive Historical Timeline</h1>
        <p>Explore key events from human history. Use filters to focus by era and search by topic.</p>
      </header>

      <section className="controls" aria-label="timeline controls">
        <label>
          Era
          <select value={selectedEra} onChange={(e) => setSelectedEra(e.target.value)}>
            {eras.map((era) => (
              <option key={era} value={era}>
                {era === 'all' ? 'All eras' : era}
              </option>
            ))}
          </select>
        </label>

        <label>
          Search
          <input
            type="search"
            value={query}
            placeholder="Type to search events"
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
      </section>

      <section className="timeline" aria-live="polite">
        {filtered.map((event) => (
          <details key={`${event.year}-${event.title}`} className="event">
            <summary>
              <span className="year">{event.year}</span>
              <span>{event.title}</span>
            </summary>
            <p>{event.description}</p>
            <p>
              <strong>Era:</strong> {event.era} | <strong>Location:</strong> {event.location}
            </p>
          </details>
        ))}

        {filtered.length === 0 && <p>No events match your current filters.</p>}
      </section>
    </main>
  )
}

export default App
