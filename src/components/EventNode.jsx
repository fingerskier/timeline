function fmtYear(y) {
  return y < 0 ? `${-y} BCE` : String(y)
}

export default function EventNode({ event, mode, x, matched = false, onClick }) {
  const cls = matched ? 'event-dot matched' : 'event-dot'

  if (mode === 'dot' || mode === 'epoch' || mode === 'millennium' || mode === 'century') {
    return (
      <circle
        className={cls}
        cx={x}
        cy={0}
        r={3}
        onClick={() => onClick(event)}
        style={{ cursor: 'pointer' }}
      />
    )
  }

  if (mode === 'chip' || mode === 'decade') {
    return (
      <foreignObject x={x - 90} y={-16} width={180} height={32} style={{ overflow: 'visible' }}>
        <div
          className="event-chip"
          onClick={() => onClick(event)}
          style={{ cursor: 'pointer' }}
        >
          {fmtYear(event.year)} · {event.title}
        </div>
      </foreignObject>
    )
  }

  return (
    <foreignObject x={x - 120} y={-60} width={240} height={140} style={{ overflow: 'visible' }}>
      <div
        className="event-card"
        onClick={() => onClick(event)}
        style={{ cursor: 'pointer' }}
      >
        <div className="y">{fmtYear(event.year)} · {event.location}</div>
        <div className="t">{event.title}</div>
        <div className="d">{event.description}</div>
      </div>
    </foreignObject>
  )
}
