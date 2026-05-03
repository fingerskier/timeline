# Historical Timeline (Vite + React)

An interactive historical timeline app built with Vite and React, ready for GitHub Pages deployment.

## Features

- Loads timeline events from JSON files segmented by era.
- Era filter and full-text search.
- Expandable event cards for interactive exploration.
- GitHub Pages deployment via `gh-pages`.

## Data layout

Event data lives in `public/data`:

- `public/data/ancient.json`
- `public/data/medieval.json`
- `public/data/modern.json`

Each file should export an array of objects with this shape:

```json
{
  "year": 1969,
  "title": "Apollo 11 Moon Landing",
  "description": "Humans land on the Moon.",
  "era": "Modern",
  "location": "Moon"
}
```

## Scripts

- `npm run dev` – local dev server
- `npm run build` – production build
- `npm run preview` – preview production build locally
- `npm run deploy` – deploy `dist` to GitHub Pages

## GitHub Pages notes

`vite.config.js` uses `base: '/timeline/'`, which matches a repository named `timeline`.
If your repo name differs, update the `base` value accordingly.
