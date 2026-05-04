function fmtYear(y) {
  return y < 0 ? `${-y} BCE` : String(y)
}

const ERA_CLASS = {
  Prehistoric: 'span-prehistoric',
  Ancient: 'span-ancient',
  Medieval: 'span-medieval',
  Modern: 'span-modern',
}

export default function EventSpan({ event, x1, x2, matched = false, onClick }) {
  const w = Math.max(2, x2 - x1)
  const h = 10
  const cx = x1 + w / 2
  const showLabel = w >= 80
  const cls = [
    'event-span',
    ERA_CLASS[event.era] ?? '',
    matched ? 'matched' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <g
      className={cls}
      onClick={() => onClick(event)}
      style={{ cursor: 'pointer' }}
    >
      <rect
        x={x1}
        y={-h / 2}
        width={w}
        height={h}
        rx={h / 2}
        ry={h / 2}
      />
      {showLabel && (
        <text
          className="span-label"
          x={cx}
          y={-h / 2 - 4}
          textAnchor="middle"
        >
          {`${fmtYear(event.year)}–${fmtYear(event.endYear)} · ${event.title}`}
        </text>
      )}
    </g>
  )
}
