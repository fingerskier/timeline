import { useEffect, useMemo, useRef, useState } from 'react'
import { select } from 'd3-selection'
import { zoom as d3zoom, zoomIdentity } from 'd3-zoom'
import { makeYearScale, visibleYearRange, centerYear } from '../lib/yearScale.js'
import { lodBand } from '../lib/zoom.js'
import AxisRibbon from './AxisRibbon.jsx'
import EventNode from './EventNode.jsx'
import Starfield from './Starfield.jsx'
import Breadcrumbs from './Breadcrumbs.jsx'
import ZoomControls from './ZoomControls.jsx'
import SearchBar from './SearchBar.jsx'
import EventDetail from './EventDetail.jsx'

const VIEW_W = 5000
const VIEW_H = 600

export default function Timeline({ events }) {
  const svgRef = useRef(null)
  const zoomRef = useRef(null)
  const [transform, setTransform] = useState({ k: 1, x: 0, y: 0 })
  const [size, setSize] = useState({ w: 1200, h: 600 })
  const [selected, setSelected] = useState(null)
  const [query, setQuery] = useState('')

  const domain = useMemo(() => {
    if (!events.length) return [-3000, 2000]
    const lo = Math.max(events[0].year, -12000)
    return [lo, events[events.length - 1].year]
  }, [events])

  const scale = useMemo(
    () => makeYearScale({ domain, range: [0, VIEW_W] }),
    [domain],
  )

  useEffect(() => {
    function onResize() {
      const el = svgRef.current?.parentElement
      if (!el) return
      setSize({ w: el.clientWidth, h: el.clientHeight })
    }
    onResize()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    const svg = select(svgRef.current)
    const z = d3zoom()
      .scaleExtent([1, 5000])
      .translateExtent([[0, 0], [VIEW_W, VIEW_H]])
      .on('zoom', (event) => {
        const { k, x, y } = event.transform
        setTransform({ k, x, y })
      })
    zoomRef.current = z
    svg.call(z)
    return () => { svg.on('.zoom', null) }
  }, [size.w])

  const band = lodBand(transform.k)
  const [visA, visB] = visibleYearRange(scale, transform, size.w)
  const cy = centerYear(scale, transform, size.w)

  const visibleEvents = useMemo(() => {
    return events.filter((e) => e.year >= visA && e.year <= visB)
  }, [events, visA, visB])

  const matchSet = useMemo(() => {
    if (!query.trim()) return null
    const q = query.toLowerCase()
    return new Set(
      events
        .filter((e) =>
          `${e.title} ${e.description ?? ''} ${e.location ?? ''}`.toLowerCase().includes(q),
        )
        .map((e) => `${e.year}|${e.title}`),
    )
  }, [events, query])

  function nodeMode(_event) {
    if (band === 'epoch' || band === 'millennium' || band === 'century') return 'dot'
    if (band === 'decade') return 'chip'
    return 'card'
  }

  function applyTransform(t) {
    const svg = select(svgRef.current)
    svg.transition().duration(450).call(zoomRef.current.transform, t)
  }

  function zoomToYear(year, k) {
    const px = scale(year)
    const x = size.w / 2 - px * k
    applyTransform(zoomIdentity.translate(x, 0).scale(k))
  }

  function zoomIn() {
    select(svgRef.current).transition().duration(250).call(zoomRef.current.scaleBy, 1.6)
  }
  function zoomOut() {
    select(svgRef.current).transition().duration(250).call(zoomRef.current.scaleBy, 0.625)
  }
  function reset() {
    applyTransform(zoomIdentity)
  }

  function handleJumpTo(seg) {
    if (seg === 'epoch') reset()
    else if (seg === 'millennium') zoomToYear(cy, 4)
    else if (seg === 'century') zoomToYear(cy, 30)
    else if (seg === 'decade') zoomToYear(cy, 200)
    else if (seg === 'year') zoomToYear(cy, 1500)
  }

  function handleSearchSubmit(q) {
    if (!q.trim() || !matchSet || matchSet.size === 0) return
    const matched = events.filter((e) => matchSet.has(`${e.year}|${e.title}`))
    if (!matched.length) return
    const lo = matched[0].year
    const hi = matched[matched.length - 1].year
    if (lo === hi) return zoomToYear(lo, 1500)
    const span = hi - lo
    const k = Math.max(1, Math.min(5000, (domain[1] - domain[0]) / span * 0.8))
    zoomToYear((lo + hi) / 2, k)
  }

  return (
    <div className="app">
      <div className="topbar">
        <h1>Cosmic Timeline</h1>
        <Breadcrumbs band={band} centerYear={cy} onJumpTo={handleJumpTo} />
        <SearchBar onChange={setQuery} onSubmit={handleSearchSubmit} />
      </div>

      <div className="canvas">
        <Starfield k={transform.k} />
        <svg
          ref={svgRef}
          viewBox={`0 0 ${size.w} ${size.h}`}
          width={size.w}
          height={size.h}
          preserveAspectRatio="xMidYMid meet"
          style={{ display: 'block' }}
        >
          <g transform={`translate(${transform.x}, 0)`}>
            <AxisRibbon
              scale={scale}
              k={transform.k}
              band={band}
              visibleYears={[visA, visB]}
              width={VIEW_W}
              height={VIEW_H}
            />
            <g transform={`translate(0, ${VIEW_H / 2})`}>
              {visibleEvents.map((e) => (
                <EventNode
                  key={`${e.year}-${e.title}`}
                  event={e}
                  mode={nodeMode(e)}
                  x={scale(e.year) * transform.k}
                  matched={matchSet?.has(`${e.year}|${e.title}`) ?? false}
                  onClick={setSelected}
                />
              ))}
            </g>
          </g>
        </svg>
      </div>

      <div className="bottombar">
        <span>k = {transform.k.toFixed(2)} · band: {band}</span>
        <ZoomControls onZoomIn={zoomIn} onZoomOut={zoomOut} onReset={reset} />
      </div>

      <EventDetail event={selected} onClose={() => setSelected(null)} />
    </div>
  )
}
