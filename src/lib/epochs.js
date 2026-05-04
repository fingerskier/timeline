export const EPOCHS = [
  { name: 'Prehistoric', start: -Infinity, end: -3000, color: '#5b6cb6' },
  { name: 'Ancient',     start: -3000,     end: 500,   color: '#d4a253' },
  { name: 'Medieval',    start: 500,       end: 1500,  color: '#3f8a87' },
  { name: 'Modern',      start: 1500,      end: Infinity, color: '#c8688a' },
]

export function epochOf(year) {
  return EPOCHS.find((e) => year >= e.start && year < e.end)
}
