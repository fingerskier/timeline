export const LOD_THRESHOLDS = [
  { minK: 0,    band: 'epoch' },
  { minK: 4,    band: 'millennium' },
  { minK: 30,   band: 'century' },
  { minK: 200,  band: 'decade' },
  { minK: 1500, band: 'year' },
]

export function lodBand(k) {
  let band = 'epoch'
  for (const t of LOD_THRESHOLDS) {
    if (k >= t.minK) band = t.band
  }
  return band
}
