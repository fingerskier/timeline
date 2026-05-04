export default function Starfield({ k = 1 }) {
  const farShift = (k - 1) * 4
  const nearShift = (k - 1) * 12
  return (
    <div className="starfield" aria-hidden>
      <div
        className="layer far"
        style={{ transform: `translateX(${-farShift}px)` }}
      />
      <div
        className="layer near"
        style={{ transform: `translateX(${-nearShift}px)` }}
      />
    </div>
  )
}
