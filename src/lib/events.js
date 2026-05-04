const ERA_FILES = ['prehistoric.json', 'ancient.json', 'medieval.json', 'modern.json']

export async function loadAllEvents(baseUrl) {
  const responses = await Promise.all(
    ERA_FILES.map((file) =>
      fetch(`${baseUrl}data/${file}`).then((r) => {
        if (!r.ok) throw new Error(`Failed to fetch ${file}: ${r.status}`)
        return r.json()
      }),
    ),
  )
  const indexed = responses.flatMap((arr, era) =>
    arr.map((ev, i) => ({ ...ev, _order: era * 1e6 + i })),
  )
  indexed.sort((a, b) => a.year - b.year || a._order - b._order)
  return indexed.map(({ _order, ...e }) => e)
}
