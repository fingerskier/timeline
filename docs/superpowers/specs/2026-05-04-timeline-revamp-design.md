# Cosmic Drill-Down Timeline — Design Spec

**Date:** 2026-05-04
**Project:** fingerskier/timeline
**Status:** Approved (awaiting implementation plan)

## Goal

Replace the current flat list-of-cards UI with a single-canvas, zoom-driven timeline. The user navigates time as a continuous space — wheel/pinch zooming reveals progressively finer levels of detail (epoch → millennium → century → decade → year), with a cosmic visual treatment (deep-space gradient, parallax starfield, thin sans-serif type).

## Decisions

| Topic | Choice |
|---|---|
| Visual style | Cosmic / Timescape (deep-space gradient, starfield, Inter sans) |
| Drill levels | 5: Epoch → Millennium → Century → Decade → Year |
| Navigation | Continuous scroll/pinch zoom (no fixed pages) |
| Epochs | Named: Prehistoric / Ancient / Medieval / Modern |
| Data | Seed ~60 events across the four named epochs |
| Zoom engine | `d3-zoom` + React (anticipates dataset growth) |
| Render target | SVG with `foreignObject` for HTML event cards |
| Test runner | Vitest + @testing-library/react |

## Epoch boundaries

| Epoch | Year range | Accent color (working name) |
|---|---|---|
| Prehistoric | year < -3000 | muted indigo |
| Ancient | -3000 to 500 | warm amber |
| Medieval | 500 to 1500 | deep teal |
| Modern | 1500 to present | rose |

Boundaries are inclusive of the lower bound, exclusive of the upper bound.

## LOD bands (by zoom scale `k`)

| `k` range | Visible elements |
|---|---|
| 1 ≤ k < 4 | Epoch washes + epoch labels only |
| 4 ≤ k < 30 | + Millennium tick labels |
| 30 ≤ k < 200 | + Century tick labels, event dots |
| 200 ≤ k < 1500 | + Decade tick labels, dot → chip (year + title) |
| k ≥ 1500 | Year tick labels, full inline event card |

`k` thresholds are placeholders for tuning during implementation; the spec's invariant is the ordering of bands and which elements appear in each.

## Architecture

### Stack

- **Existing:** Vite 5, React 18, vanilla CSS.
- **New deps (runtime):** `d3-zoom`, `d3-selection`, `d3-scale`.
- **New deps (dev):** `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `jsdom`.

### File layout

```
src/
  App.jsx                       app shell, fetches data, mounts <Timeline>
  main.jsx
  components/
    Timeline.jsx                d3-zoom owner; renders SVG canvas
    Starfield.jsx               parallax background (CSS, slower transform)
    AxisRibbon.jsx              epoch washes + tick labels by current LOD
    EventNode.jsx               dot / chip / card by current LOD
    EventDetail.jsx             modal with full description
    Breadcrumbs.jsx             Epoch › Mill › Cent › Dec › Year from transform
    ZoomControls.jsx            +, −, reset
    SearchBar.jsx               text filter; ENTER → zoom-to-fit matches
  lib/
    zoom.js                     d3-zoom factory, lodBand(k)
    epochs.js                   epoch table + epochOf(year)
    events.js                   fetch + merge + sort helpers
    yearScale.js                d3-scaleLinear factory + helpers
  styles/
    cosmic.css                  palette, type, starfield bg, components
public/data/
  prehistoric.json              new file
  ancient.json                  expand
  medieval.json                 new file
  modern.json                   expand
                                ~60 events total
```

Vestigial leftovers from the pre-Vite vanilla version are removed: `index.js`, `lib/Timeline.js`, `lib/context.js`, `stylesheets/style.css`. The Vite entry `index.html` is kept (it is the SPA shell). `src/styles.css` is replaced by `src/styles/cosmic.css`.

### Data flow

1. `App` fetches the four era JSON files in parallel on mount.
2. JSON arrays merged → sorted by `year` → passed to `<Timeline events={…}>`.
3. `Timeline` creates a `yearScale` covering `[minYear, maxYear]`, mounts an SVG with a single `<g>` transformed via `d3.zoom()`.
4. The zoom listener writes the current transform `{k, x}` into React state (via `setState` in a `useEffect` that wires `selection.call(zoom)`).
5. `useMemo([events, transform])` filters events to the visible x-range and selects per-event render mode by `lodBand(k)`.
6. `Breadcrumbs` reads the inverted center year + `k` and derives the active epoch/millennium/century/decade/year segments.
7. Click on an `EventNode` sets `selectedId`; `EventDetail` renders if non-null.

### Interactions

- **Wheel / pinch** — zoom anchored at cursor (d3-zoom default with `wheelDelta` tuned for smoothness).
- **Drag** — pan along x. Vertical pan locked.
- **Click event node** — open `EventDetail` modal.
- **Click breadcrumb segment** — animated `zoom.transform` to that span (e.g., click "20th c." → fit 1900–1999).
- **+ / − / reset** — programmatic `zoom.scaleBy` and `zoom.transform(identity)`.
- **Search** — filters events; matched glow; ENTER fits viewport to matched range.
- **ESC** — close modal.

### Visual treatment

- Background: radial gradient `#06070d → #1b3a6b` at 30% 30%.
- Two starfield layers, each a CSS pseudo-element with `radial-gradient` dot patterns. The far layer transforms at ~50% of the foreground k (parallax).
- Type: Inter, weights 200–700. Year ticks: `font-weight:200; letter-spacing:-0.02em`.
- Epoch washes: 4 horizontal soft-gradient bands behind the ribbon (one per epoch), each tinted with that epoch's accent color at low alpha.
- Event node states:
  - `dot` (k < 200): 3 px luminous circle, glow on hover, label tooltip.
  - `chip` (200 ≤ k < 1500): pill with year + title.
  - `card` (k ≥ 1500): full inline card with year, title, location, one-line description.
- Modal: backdrop blur, off-center placement, close on backdrop click or ESC.

### Error handling

Errors only at the fetch boundary:
- Any of the four JSON fetches fails → inline retry banner above the canvas; the canvas hides until at least one era loads.
- Empty search result → small text overlay: "No events in this view."

No other defensive validation; data files are first-party.

### Testing (red/green TDD)

Per repo `CLAUDE.md`: tests written first, must pass before commit. Coverage targets:

**`lib/zoom.js`**
- `lodBand(k)` returns expected band for each boundary value (k = 1, 3.99, 4, 29, 30, 199, 200, 1499, 1500, 5000).

**`lib/epochs.js`**
- `epochOf(year)` returns correct epoch for boundary years (-3001, -3000, 499, 500, 1499, 1500, 2026).
- Returns null/undefined for years outside known epochs (sanity).

**`lib/events.js`**
- Merge sorts ascending by year.
- Stable order for equal years.

**`lib/yearScale.js`**
- Scale maps domain endpoints to range endpoints.
- `centerYear(transform)` inverts correctly.

**`components/Timeline.jsx`**
- Given a mock transform of k=1, renders epoch labels, no event chips/cards.
- Given k=300, renders chips for events with year inside the visible window.
- Given k=2000, renders cards for events in window.

**Smoke**
- `npm run dev` boots, renders `<Timeline>`, no console errors with seed data.

## Out of scope (v1)

- Mobile pinch polish beyond d3-zoom defaults.
- Per-event images, audio, video.
- Persistence of view state (URL params, localStorage).
- Multi-language / non-Gregorian calendars.
- User-contributed events.
- Animated transitions between LOD bands (events appear/disappear; no morph).

## Open questions

None. All design decisions locked at brainstorm time. Implementation plan to follow.
