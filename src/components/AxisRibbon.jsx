import { EPOCHS } from '../lib/epochs.js'

const BAND_ORDER = ['epoch', 'millennium', 'century', 'decade', 'year']

function ticksByStep(visibleYears, step) {
  const [a, b] = visibleYears
  const start = Math.ceil(a / step) * step
  const end = Math.floor(b / step) * step
  const out = []
  for (let y = start; y <= end; y += step) out.push(y)
  return out
}

function fmtYear(y) {
  if (y === 0) return '1 CE'
  return y < 0 ? `${-y} BCE` : `${y}`
}

export default function AxisRibbon({ scale, band, visibleYears, width, height = 600 }) {
  const idx = BAND_ORDER.indexOf(band)
  const baseY = height / 2

  const epochs = EPOCHS.map((e) => {
    const start = Math.max(e.start, scale.domain()[0])
    const end = Math.min(e.end, scale.domain()[1])
    return { ...e, start, end }
  })

  return (
    <g className="axis-ribbon">
      {epochs.map((e) => (
        <rect
          key={e.name}
          className="epoch-wash"
          x={scale(e.start)}
          y={baseY - 80}
          width={scale(e.end) - scale(e.start)}
          height={160}
          fill={e.color}
          opacity={0.08}
        />
      ))}

      <line x1={0} x2={width} y1={baseY} y2={baseY} stroke="rgba(127,168,224,.25)" />

      {idx === 0 && epochs.map((e) => (
        <text
          key={`elabel-${e.name}`}
          className="tick-label epoch"
          x={(scale(e.start) + scale(e.end)) / 2}
          y={baseY - 90}
          textAnchor="middle"
        >
          {e.name}
        </text>
      ))}

      {idx >= 1 && ticksByStep(visibleYears, 1000).map((y) => (
        <g key={`m-${y}`}>
          <line x1={scale(y)} x2={scale(y)} y1={baseY - 8} y2={baseY + 8} stroke="rgba(127,168,224,.4)" />
          <text className="tick-label millennium" x={scale(y)} y={baseY + 24} textAnchor="middle">
            {fmtYear(y)}
          </text>
        </g>
      ))}

      {idx >= 2 && ticksByStep(visibleYears, 100).map((y) => (
        <g key={`c-${y}`}>
          <line x1={scale(y)} x2={scale(y)} y1={baseY - 4} y2={baseY + 4} stroke="rgba(127,168,224,.3)" />
          <text className="tick-label century" x={scale(y)} y={baseY + 38} textAnchor="middle">
            {fmtYear(y)}
          </text>
        </g>
      ))}

      {idx >= 3 && ticksByStep(visibleYears, 10).map((y) => (
        <text key={`d-${y}`} className="tick-label decade" x={scale(y)} y={baseY + 52} textAnchor="middle">
          {fmtYear(y)}
        </text>
      ))}

      {idx >= 4 && ticksByStep(visibleYears, 1).map((y) => (
        <text key={`y-${y}`} className="tick-label year" x={scale(y)} y={baseY + 66} textAnchor="middle">
          {fmtYear(y)}
        </text>
      ))}
    </g>
  )
}
