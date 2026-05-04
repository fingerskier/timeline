import { scaleLinear } from 'd3-scale'

export function makeYearScale({ domain, range }) {
  return scaleLinear().domain(domain).range(range)
}

export function visibleYearRange(scale, transform, width) {
  const { k, x } = transform
  const leftPx = -x / k
  const rightPx = (width - x) / k
  return [scale.invert(leftPx), scale.invert(rightPx)]
}

export function centerYear(scale, transform, width) {
  const [a, b] = visibleYearRange(scale, transform, width)
  return (a + b) / 2
}
