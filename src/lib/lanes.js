export function assignLanes(spans) {
  const sorted = [...spans].sort(
    (a, b) => a.year - b.year || a.endYear - b.endYear,
  )
  const laneEnds = []
  return sorted.map((span) => {
    let lane = laneEnds.findIndex((end) => end <= span.year)
    if (lane === -1) {
      lane = laneEnds.length
      laneEnds.push(span.endYear)
    } else {
      laneEnds[lane] = span.endYear
    }
    return { ...span, lane }
  })
}
