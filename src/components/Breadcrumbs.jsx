import { epochOf } from '../lib/epochs.js'

function ord(n) {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return n + (s[(v - 20) % 10] || s[v] || s[0])
}

function millLabel(year) {
  if (year >= 0) {
    const m = Math.floor(year / 1000) + 1
    return `${ord(m)} Mill. CE`
  }
  const m = Math.ceil(-year / 1000)
  return `${ord(m)} Mill. BCE`
}

function centLabel(year) {
  if (year >= 0) {
    const c = Math.floor(year / 100) + 1
    return `${ord(c)} c. CE`
  }
  const c = Math.ceil(-year / 100)
  return `${ord(c)} c. BCE`
}

function decLabel(year) {
  const start = Math.floor(year / 10) * 10
  return `${start}s`
}

const ORDER = ['epoch', 'millennium', 'century', 'decade', 'year']

export default function Breadcrumbs({ band, centerYear, onJumpTo }) {
  const idx = ORDER.indexOf(band)
  const segs = []
  const epoch = epochOf(centerYear)
  if (epoch && idx >= 0) segs.push({ key: 'epoch', label: epoch.name })
  if (idx >= 1) segs.push({ key: 'millennium', label: millLabel(centerYear) })
  if (idx >= 2) segs.push({ key: 'century', label: centLabel(centerYear) })
  if (idx >= 3) segs.push({ key: 'decade', label: decLabel(centerYear) })
  if (idx >= 4) segs.push({ key: 'year', label: String(Math.floor(centerYear)) })

  return (
    <nav className="crumbs" aria-label="zoom level">
      {segs.map((s, i) => (
        <span key={s.key}>
          <span className="seg" onClick={() => onJumpTo(s.key)}>{s.label}</span>
          {i < segs.length - 1 && <span className="sep"> › </span>}
        </span>
      ))}
    </nav>
  )
}
