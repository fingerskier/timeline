# Cosmic Timeline

An interactive historical timeline. Pan and zoom from epochs all the way down to individual years — drill from the cosmic scale into the moment, on a single canvas.

Built with Vite + React, navigated with `d3-zoom`.

## Features

- **Continuous zoom drill-down:** Epoch → Millennium → Century → Decade → Year. Wheel/pinch zooms; drag pans.
- **Cosmic visual:** deep-space gradient, parallax starfield, thin sans-serif type, soft epoch washes.
- **Five level-of-detail bands:** events appear as luminous dots, then chips, then full cards as you zoom in.
- **Breadcrumbs that navigate:** click any segment to animate-zoom to that span.
- **Search with zoom-to-fit:** type to glow-highlight matches; ENTER fits the viewport to the matched range.
- **Modal event detail:** click any event for the full description; ESC or backdrop-click closes.

## Data layout

Event data lives in `public/data`, one file per epoch:

- `public/data/prehistoric.json`
- `public/data/ancient.json`
- `public/data/medieval.json`
- `public/data/modern.json`

Each file is an array of:
```json
{
  "year": 1969,
  "title": "Apollo 11 Moon Landing",
  "description": "Humans land on the Moon.",
  "era": "Modern",
  "location": "Moon"
}
```

Negative years are BCE.

## Scripts

- `npm run dev` — local dev server
- `npm run build` — production build
- `npm run preview` — preview production build locally
- `npm test` — run unit + component tests once
- `npm run test:watch` — watch mode
- `npm run deploy` — deploy `dist` to GitHub Pages

## GitHub Pages

`vite.config.js` sets `base: '/timeline/'` to match the repository name. A GitHub Actions workflow at `.github/workflows/deploy.yml` builds and publishes to `gh-pages` on every push to `main`.
