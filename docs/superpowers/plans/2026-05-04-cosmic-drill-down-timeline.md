# Cosmic Drill-Down Timeline Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current flat list-of-cards UI with a single-canvas, continuous-zoom cosmic timeline that drills epoch → millennium → century → decade → year via `d3-zoom`.

**Architecture:** Vite/React SPA. One SVG canvas owned by `<Timeline>`, transformed by `d3-zoom`. Year-to-x via `d3-scale-linear`. Pure render-selection helpers (`lodBand`, `epochOf`) are unit-tested; imperative zoom binding is exercised by a smoke test. Events come from four era JSON files merged on mount.

**Tech Stack:** React 18, Vite 5, d3-zoom + d3-selection + d3-scale, Vitest + @testing-library/react + jsdom. Plain CSS (no preprocessor).

**Spec:** `docs/superpowers/specs/2026-05-04-timeline-revamp-design.md`

---

## File Structure

### Create

| Path | Responsibility |
|---|---|
| `src/lib/epochs.js` | `EPOCHS` table, `epochOf(year)` |
| `src/lib/zoom.js` | `lodBand(k)` → one of `'epoch' \| 'millennium' \| 'century' \| 'decade' \| 'year'` |
| `src/lib/yearScale.js` | `makeYearScale({domain, range})`, `centerYear(scale, transform)`, `visibleYearRange(scale, transform, width)` |
| `src/lib/events.js` | `loadAllEvents(baseUrl)` — fetch, merge, sort |
| `src/components/Timeline.jsx` | SVG canvas + d3-zoom binding |
| `src/components/Starfield.jsx` | Parallax background layers (CSS) |
| `src/components/AxisRibbon.jsx` | Epoch washes + tick labels per LOD |
| `src/components/EventNode.jsx` | Dot / chip / card per LOD |
| `src/components/EventDetail.jsx` | Modal with full event info |
| `src/components/Breadcrumbs.jsx` | Epoch › Mill › Cent › Dec › Year segments |
| `src/components/ZoomControls.jsx` | + / − / reset buttons |
| `src/components/SearchBar.jsx` | Text filter, zoom-to-fit on submit |
| `src/styles/cosmic.css` | Palette, type, base, starfield |
| `src/test/setup.js` | Vitest globals + jest-dom |
| `vitest.config.js` | Test config (extends Vite) |
| `src/lib/__tests__/epochs.test.js` | Unit tests |
| `src/lib/__tests__/zoom.test.js` | Unit tests |
| `src/lib/__tests__/yearScale.test.js` | Unit tests |
| `src/lib/__tests__/events.test.js` | Unit tests |
| `src/components/__tests__/AxisRibbon.test.jsx` | Component tests |
| `src/components/__tests__/EventNode.test.jsx` | Component tests |
| `src/components/__tests__/Breadcrumbs.test.jsx` | Component tests |
| `public/data/prehistoric.json` | New era file |

### Modify

| Path | Change |
|---|---|
| `src/App.jsx` | Rewrite — fetch data, mount `<Timeline>` |
| `src/main.jsx` | Import `./styles/cosmic.css` instead of `./styles.css` |
| `package.json` | Add d3 + test deps; add `test` script |
| `public/data/ancient.json` | Expand to ~18 events |
| `public/data/medieval.json` | Expand to ~17 events |
| `public/data/modern.json` | Expand to ~20 events |
| `README.md` | Update feature list + scripts |

### Delete

`index.js`, `lib/Timeline.js`, `lib/context.js`, `stylesheets/style.css`, `src/styles.css` — vestigial pre-Vite leftovers.

---

## Task 1: Add test infrastructure

**Files:**
- Modify: `package.json`
- Create: `vitest.config.js`
- Create: `src/test/setup.js`
- Create: `src/lib/__tests__/_smoke.test.js`

- [ ] **Step 1: Install test deps**

Run:
```bash
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```
Expected: 5 packages added.

- [ ] **Step 2: Add `test` script to `package.json`**

Edit `package.json` `scripts` block to:
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest",
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  }
}
```

- [ ] **Step 3: Create `vitest.config.js`**

```js
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.js'],
  },
})
```

- [ ] **Step 4: Create `src/test/setup.js`**

```js
import '@testing-library/jest-dom/vitest'
```

- [ ] **Step 5: Write a sanity smoke test**

Create `src/lib/__tests__/_smoke.test.js`:
```js
import { describe, it, expect } from 'vitest'

describe('test runner', () => {
  it('runs', () => {
    expect(1 + 1).toBe(2)
  })
})
```

- [ ] **Step 6: Run tests**

Run: `npm test`
Expected: 1 passed.

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json vitest.config.js src/test/setup.js src/lib/__tests__/_smoke.test.js
git commit -m "chore: add Vitest + Testing Library infra"
```

---

## Task 2: Install d3 dependencies

**Files:** `package.json`

- [ ] **Step 1: Install runtime d3 deps**

Run:
```bash
npm install d3-zoom d3-selection d3-scale
```
Expected: 3 packages added.

- [ ] **Step 2: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add d3-zoom, d3-selection, d3-scale"
```

---

## Task 3: `lib/epochs.js` (TDD)

**Files:**
- Create: `src/lib/__tests__/epochs.test.js`
- Create: `src/lib/epochs.js`

- [ ] **Step 1: Write failing tests**

Create `src/lib/__tests__/epochs.test.js`:
```js
import { describe, it, expect } from 'vitest'
import { EPOCHS, epochOf } from '../epochs.js'

describe('EPOCHS', () => {
  it('exposes 4 named epochs in order', () => {
    expect(EPOCHS.map((e) => e.name)).toEqual([
      'Prehistoric',
      'Ancient',
      'Medieval',
      'Modern',
    ])
  })
  it('each epoch has start, end, and color', () => {
    for (const e of EPOCHS) {
      expect(typeof e.start).toBe('number')
      expect(typeof e.end).toBe('number')
      expect(typeof e.color).toBe('string')
    }
  })
})

describe('epochOf', () => {
  it.each([
    [-5000, 'Prehistoric'],
    [-3001, 'Prehistoric'],
    [-3000, 'Ancient'],
    [499, 'Ancient'],
    [500, 'Medieval'],
    [1499, 'Medieval'],
    [1500, 'Modern'],
    [2026, 'Modern'],
  ])('year %i → %s', (year, name) => {
    expect(epochOf(year).name).toBe(name)
  })
})
```

- [ ] **Step 2: Run tests, verify FAIL**

Run: `npm test -- epochs`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `src/lib/epochs.js`**

```js
export const EPOCHS = [
  { name: 'Prehistoric', start: -Infinity, end: -3000, color: '#5b6cb6' },
  { name: 'Ancient',     start: -3000,     end: 500,   color: '#d4a253' },
  { name: 'Medieval',    start: 500,       end: 1500,  color: '#3f8a87' },
  { name: 'Modern',      start: 1500,      end: Infinity, color: '#c8688a' },
]

export function epochOf(year) {
  return EPOCHS.find((e) => year >= e.start && year < e.end)
}
```

- [ ] **Step 4: Run tests, verify PASS**

Run: `npm test -- epochs`
Expected: 9 passed.

- [ ] **Step 5: Commit**

```bash
git add src/lib/epochs.js src/lib/__tests__/epochs.test.js
git commit -m "feat(lib): epoch table + epochOf lookup"
```

---

## Task 4: `lib/zoom.js` LOD bands (TDD)

**Files:**
- Create: `src/lib/__tests__/zoom.test.js`
- Create: `src/lib/zoom.js`

- [ ] **Step 1: Write failing tests**

Create `src/lib/__tests__/zoom.test.js`:
```js
import { describe, it, expect } from 'vitest'
import { lodBand, LOD_THRESHOLDS } from '../zoom.js'

describe('lodBand', () => {
  it.each([
    [1, 'epoch'],
    [3.99, 'epoch'],
    [4, 'millennium'],
    [29.99, 'millennium'],
    [30, 'century'],
    [199.99, 'century'],
    [200, 'decade'],
    [1499.99, 'decade'],
    [1500, 'year'],
    [10000, 'year'],
  ])('k=%s → %s', (k, band) => {
    expect(lodBand(k)).toBe(band)
  })
  it('clamps below 1 to epoch', () => {
    expect(lodBand(0.5)).toBe('epoch')
  })
})

describe('LOD_THRESHOLDS', () => {
  it('exposes ascending thresholds', () => {
    const ts = LOD_THRESHOLDS.map((t) => t.minK)
    expect(ts).toEqual([...ts].sort((a, b) => a - b))
  })
})
```

- [ ] **Step 2: Run tests, verify FAIL**

Run: `npm test -- zoom`
Expected: FAIL.

- [ ] **Step 3: Implement `src/lib/zoom.js`**

```js
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
```

- [ ] **Step 4: Run tests, verify PASS**

Run: `npm test -- zoom`
Expected: 12 passed.

- [ ] **Step 5: Commit**

```bash
git add src/lib/zoom.js src/lib/__tests__/zoom.test.js
git commit -m "feat(lib): lodBand + LOD_THRESHOLDS"
```

---

## Task 5: `lib/yearScale.js` (TDD)

**Files:**
- Create: `src/lib/__tests__/yearScale.test.js`
- Create: `src/lib/yearScale.js`

- [ ] **Step 1: Write failing tests**

Create `src/lib/__tests__/yearScale.test.js`:
```js
import { describe, it, expect } from 'vitest'
import { makeYearScale, centerYear, visibleYearRange } from '../yearScale.js'

const scale = makeYearScale({ domain: [-3000, 2000], range: [0, 1000] })

describe('makeYearScale', () => {
  it('maps domain endpoints to range endpoints', () => {
    expect(scale(-3000)).toBe(0)
    expect(scale(2000)).toBe(1000)
  })
  it('inverts', () => {
    expect(scale.invert(500)).toBe(-500)
  })
})

describe('centerYear', () => {
  it('returns scale-inverted center given identity transform', () => {
    const transform = { k: 1, x: 0 }
    const width = 1000
    expect(centerYear(scale, transform, width)).toBe(-500)
  })
  it('shifts with translation', () => {
    const transform = { k: 1, x: -200 }
    const width = 1000
    // visible left = 200, center px = 700, year = scale.invert(700) = 500
    expect(centerYear(scale, transform, width)).toBe(500)
  })
  it('zooms tighter at higher k', () => {
    const transform = { k: 5, x: 0 }
    const width = 1000
    // visible left px = 0/5 = 0, center px in source = (0 + width/2)/k = 100
    expect(centerYear(scale, transform, width)).toBe(scale.invert(100))
  })
})

describe('visibleYearRange', () => {
  it('returns [start, end] years inside viewport', () => {
    const transform = { k: 1, x: 0 }
    const [a, b] = visibleYearRange(scale, transform, 1000)
    expect(a).toBe(-3000)
    expect(b).toBe(2000)
  })
})
```

- [ ] **Step 2: Run tests, verify FAIL**

Run: `npm test -- yearScale`
Expected: FAIL.

- [ ] **Step 3: Implement `src/lib/yearScale.js`**

```js
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
```

- [ ] **Step 4: Run tests, verify PASS**

Run: `npm test -- yearScale`
Expected: 6 passed.

- [ ] **Step 5: Commit**

```bash
git add src/lib/yearScale.js src/lib/__tests__/yearScale.test.js
git commit -m "feat(lib): year scale with center + visible-range helpers"
```

---

## Task 6: `lib/events.js` merge + sort (TDD)

**Files:**
- Create: `src/lib/__tests__/events.test.js`
- Create: `src/lib/events.js`

- [ ] **Step 1: Write failing tests**

Create `src/lib/__tests__/events.test.js`:
```js
import { describe, it, expect, vi, afterEach } from 'vitest'
import { loadAllEvents } from '../events.js'

afterEach(() => {
  vi.unstubAllGlobals()
})

function mockFetch(map) {
  vi.stubGlobal('fetch', vi.fn((url) => {
    const file = url.split('/').pop()
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve(map[file] ?? []),
    })
  }))
}

describe('loadAllEvents', () => {
  it('merges all era files and sorts ascending by year', async () => {
    mockFetch({
      'prehistoric.json': [{ year: -10000, title: 'Cave painting' }],
      'ancient.json':     [{ year: 776, title: 'should not be here' }, { year: -776, title: 'Olympics' }],
      'medieval.json':    [{ year: 1066, title: 'Hastings' }],
      'modern.json':      [{ year: 1969, title: 'Apollo 11' }],
    })
    const events = await loadAllEvents('/timeline/')
    expect(events.map((e) => e.year)).toEqual([-10000, -776, 776, 1066, 1969])
  })

  it('keeps stable order for equal years', async () => {
    mockFetch({
      'prehistoric.json': [],
      'ancient.json': [
        { year: 0, title: 'A' },
        { year: 0, title: 'B' },
      ],
      'medieval.json': [],
      'modern.json': [{ year: 0, title: 'C' }],
    })
    const events = await loadAllEvents('/timeline/')
    expect(events.map((e) => e.title)).toEqual(['A', 'B', 'C'])
  })
})
```

- [ ] **Step 2: Run tests, verify FAIL**

Run: `npm test -- events`
Expected: FAIL.

- [ ] **Step 3: Implement `src/lib/events.js`**

```js
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
  // stable sort: assign source-order index, sort, drop index
  const indexed = responses.flatMap((arr, era) =>
    arr.map((ev, i) => ({ ...ev, _order: era * 1e6 + i })),
  )
  indexed.sort((a, b) => a.year - b.year || a._order - b._order)
  return indexed.map(({ _order, ...e }) => e)
}
```

- [ ] **Step 4: Run tests, verify PASS**

Run: `npm test -- events`
Expected: 2 passed.

- [ ] **Step 5: Commit**

```bash
git add src/lib/events.js src/lib/__tests__/events.test.js
git commit -m "feat(lib): merge + stable-sort era event files"
```

---

## Task 7: Seed data — `prehistoric.json`

**Files:**
- Create: `public/data/prehistoric.json`

- [ ] **Step 1: Write file**

Create `public/data/prehistoric.json`:
```json
[
  {
    "year": -65000000,
    "title": "End-Cretaceous extinction",
    "description": "Asteroid impact wipes out non-avian dinosaurs.",
    "era": "Prehistoric",
    "location": "Yucatán Peninsula"
  },
  {
    "year": -300000,
    "title": "Early Homo sapiens",
    "description": "Earliest fossil evidence of anatomically modern humans.",
    "era": "Prehistoric",
    "location": "Jebel Irhoud, Morocco"
  },
  {
    "year": -40000,
    "title": "Cave art at Chauvet",
    "description": "Some of the earliest known figurative cave paintings.",
    "era": "Prehistoric",
    "location": "Ardèche, France"
  },
  {
    "year": -10000,
    "title": "Neolithic Revolution begins",
    "description": "Transition from hunter-gatherer to settled agriculture.",
    "era": "Prehistoric",
    "location": "Fertile Crescent"
  },
  {
    "year": -9500,
    "title": "Göbekli Tepe constructed",
    "description": "Earliest known monumental religious complex.",
    "era": "Prehistoric",
    "location": "Anatolia"
  },
  {
    "year": -3500,
    "title": "Invention of the wheel",
    "description": "Wheeled vehicles attested in Mesopotamia and Eastern Europe.",
    "era": "Prehistoric",
    "location": "Mesopotamia"
  }
]
```

- [ ] **Step 2: Commit**

```bash
git add public/data/prehistoric.json
git commit -m "data: seed prehistoric era"
```

---

## Task 8: Seed data — expand `ancient.json`

**Files:**
- Modify: `public/data/ancient.json`

- [ ] **Step 1: Replace contents**

Overwrite `public/data/ancient.json`:
```json
[
  { "year": -3100, "title": "Early Dynastic Period in Egypt", "description": "Unification of Upper and Lower Egypt.", "era": "Ancient", "location": "Nile Valley" },
  { "year": -2560, "title": "Great Pyramid of Giza completed", "description": "Tomb of Pharaoh Khufu, tallest structure for ~3,800 years.", "era": "Ancient", "location": "Giza" },
  { "year": -1754, "title": "Code of Hammurabi", "description": "One of the earliest preserved law codes.", "era": "Ancient", "location": "Babylon" },
  { "year": -1200, "title": "Late Bronze Age collapse", "description": "Wave of civilizational collapses across the eastern Mediterranean.", "era": "Ancient", "location": "Eastern Mediterranean" },
  { "year": -776, "title": "First Recorded Olympic Games", "description": "First documented ancient Olympic Games.", "era": "Ancient", "location": "Olympia" },
  { "year": -753, "title": "Founding of Rome", "description": "Traditional date of the founding of Rome.", "era": "Ancient", "location": "Rome" },
  { "year": -509, "title": "Roman Republic established", "description": "Rome transitions from monarchy to republic.", "era": "Ancient", "location": "Rome" },
  { "year": -490, "title": "Battle of Marathon", "description": "Athenians defeat Persian invasion force.", "era": "Ancient", "location": "Marathon" },
  { "year": -399, "title": "Trial of Socrates", "description": "Socrates condemned to death; foundational moment for Western philosophy.", "era": "Ancient", "location": "Athens" },
  { "year": -331, "title": "Alexander defeats Darius III", "description": "Battle of Gaugamela ends the Achaemenid Empire.", "era": "Ancient", "location": "Mesopotamia" },
  { "year": -221, "title": "Qin unifies China", "description": "Qin Shi Huang founds the first imperial Chinese dynasty.", "era": "Ancient", "location": "China" },
  { "year": -44, "title": "Assassination of Julius Caesar", "description": "Caesar killed on the Ides of March.", "era": "Ancient", "location": "Rome" },
  { "year": -27, "title": "Roman Empire begins", "description": "Augustus becomes first Roman emperor.", "era": "Ancient", "location": "Rome" },
  { "year": 79, "title": "Eruption of Vesuvius", "description": "Pompeii and Herculaneum destroyed.", "era": "Ancient", "location": "Bay of Naples" },
  { "year": 105, "title": "Paper standardized in Han China", "description": "Cai Lun documents standardized papermaking process.", "era": "Ancient", "location": "China" },
  { "year": 313, "title": "Edict of Milan", "description": "Christianity tolerated across the Roman Empire.", "era": "Ancient", "location": "Milan" },
  { "year": 410, "title": "Sack of Rome", "description": "Visigoths under Alaric sack the city of Rome.", "era": "Ancient", "location": "Rome" },
  { "year": 476, "title": "Fall of the Western Roman Empire", "description": "Romulus Augustulus deposed by Odoacer.", "era": "Ancient", "location": "Ravenna" }
]
```

- [ ] **Step 2: Commit**

```bash
git add public/data/ancient.json
git commit -m "data: expand ancient era to 18 events"
```

---

## Task 9: Seed data — replace `medieval.json`

**Files:**
- Modify: `public/data/medieval.json`

- [ ] **Step 1: Replace contents**

Overwrite `public/data/medieval.json`:
```json
[
  { "year": 622, "title": "Hijra", "description": "Muhammad migrates from Mecca to Medina; Islamic calendar begins.", "era": "Medieval", "location": "Arabian Peninsula" },
  { "year": 632, "title": "Death of Muhammad", "description": "Founding figure of Islam dies; Rashidun Caliphate begins.", "era": "Medieval", "location": "Medina" },
  { "year": 800, "title": "Charlemagne crowned emperor", "description": "First Holy Roman Emperor crowned by Pope Leo III.", "era": "Medieval", "location": "Rome" },
  { "year": 868, "title": "Diamond Sutra printed", "description": "Earliest dated printed book.", "era": "Medieval", "location": "Tang China" },
  { "year": 1054, "title": "East-West Schism", "description": "Mutual excommunications split Eastern and Western Christianity.", "era": "Medieval", "location": "Constantinople / Rome" },
  { "year": 1066, "title": "Battle of Hastings", "description": "William of Normandy conquers England.", "era": "Medieval", "location": "Hastings" },
  { "year": 1095, "title": "First Crusade declared", "description": "Pope Urban II calls for the recovery of the Holy Land.", "era": "Medieval", "location": "Clermont" },
  { "year": 1206, "title": "Genghis Khan unifies the Mongols", "description": "Foundation of the Mongol Empire.", "era": "Medieval", "location": "Mongolia" },
  { "year": 1215, "title": "Magna Carta sealed", "description": "King John seals charter limiting royal power.", "era": "Medieval", "location": "Runnymede" },
  { "year": 1271, "title": "Marco Polo departs for the East", "description": "Polo begins his journey to the court of Kublai Khan.", "era": "Medieval", "location": "Venice" },
  { "year": 1298, "title": "Aztec capital founded", "description": "Tenochtitlan founded on Lake Texcoco (traditional date 1325 also cited).", "era": "Medieval", "location": "Valley of Mexico" },
  { "year": 1347, "title": "Black Death reaches Europe", "description": "Plague pandemic kills a third of Europe over the next 4 years.", "era": "Medieval", "location": "Mediterranean" },
  { "year": 1381, "title": "Peasants' Revolt", "description": "Major uprising against serfdom in England.", "era": "Medieval", "location": "England" },
  { "year": 1431, "title": "Joan of Arc executed", "description": "Joan burned at the stake at age 19.", "era": "Medieval", "location": "Rouen" },
  { "year": 1440, "title": "Gutenberg's printing press", "description": "Movable-type printing demonstrated in Europe.", "era": "Medieval", "location": "Mainz" },
  { "year": 1453, "title": "Fall of Constantinople", "description": "Ottoman conquest ends the Byzantine Empire.", "era": "Medieval", "location": "Constantinople" },
  { "year": 1492, "title": "Columbus reaches the Americas", "description": "European contact with the Americas begins.", "era": "Medieval", "location": "Caribbean" }
]
```

- [ ] **Step 2: Commit**

```bash
git add public/data/medieval.json
git commit -m "data: seed medieval era"
```

---

## Task 10: Seed data — expand `modern.json`

**Files:**
- Modify: `public/data/modern.json`

- [ ] **Step 1: Replace contents**

Overwrite `public/data/modern.json`:
```json
[
  { "year": 1517, "title": "Ninety-five Theses", "description": "Martin Luther sparks the Protestant Reformation.", "era": "Modern", "location": "Wittenberg" },
  { "year": 1543, "title": "Copernicus publishes heliocentric model", "description": "De revolutionibus orbium coelestium is printed.", "era": "Modern", "location": "Nuremberg" },
  { "year": 1607, "title": "Jamestown founded", "description": "First permanent English settlement in North America.", "era": "Modern", "location": "Virginia" },
  { "year": 1687, "title": "Newton's Principia", "description": "Mathematical Principles of Natural Philosophy is published.", "era": "Modern", "location": "London" },
  { "year": 1776, "title": "U.S. Declaration of Independence", "description": "The Thirteen Colonies declare independence from Great Britain.", "era": "Modern", "location": "Philadelphia" },
  { "year": 1789, "title": "French Revolution begins", "description": "Storming of the Bastille on July 14.", "era": "Modern", "location": "Paris" },
  { "year": 1804, "title": "Haiti gains independence", "description": "First independent Black-led republic in the Americas.", "era": "Modern", "location": "Haiti" },
  { "year": 1859, "title": "On the Origin of Species", "description": "Darwin publishes his theory of evolution by natural selection.", "era": "Modern", "location": "London" },
  { "year": 1865, "title": "End of the U.S. Civil War", "description": "Confederate surrender at Appomattox; slavery abolished by 13th Amendment.", "era": "Modern", "location": "Virginia" },
  { "year": 1879, "title": "Edison's incandescent bulb", "description": "First practical long-lasting electric light bulb.", "era": "Modern", "location": "Menlo Park" },
  { "year": 1903, "title": "Wright brothers' first flight", "description": "First successful powered, controlled airplane flight.", "era": "Modern", "location": "Kitty Hawk" },
  { "year": 1914, "title": "World War I begins", "description": "Assassination in Sarajevo triggers global war.", "era": "Modern", "location": "Sarajevo" },
  { "year": 1939, "title": "World War II begins", "description": "Germany invades Poland.", "era": "Modern", "location": "Poland" },
  { "year": 1945, "title": "Atomic bombings of Hiroshima and Nagasaki", "description": "First use of nuclear weapons in war; Japan surrenders days later.", "era": "Modern", "location": "Japan" },
  { "year": 1957, "title": "Sputnik launched", "description": "First artificial Earth satellite.", "era": "Modern", "location": "Baikonur" },
  { "year": 1969, "title": "Apollo 11 Moon Landing", "description": "Humans land on the Moon for the first time.", "era": "Modern", "location": "Moon" },
  { "year": 1989, "title": "Fall of the Berlin Wall", "description": "Symbolic end of the Cold War divide in Europe.", "era": "Modern", "location": "Berlin" },
  { "year": 1991, "title": "World Wide Web goes public", "description": "Tim Berners-Lee publishes the first website.", "era": "Modern", "location": "CERN" },
  { "year": 2007, "title": "iPhone introduced", "description": "Apple launches the smartphone era at scale.", "era": "Modern", "location": "San Francisco" },
  { "year": 2020, "title": "COVID-19 pandemic", "description": "WHO declares a global pandemic.", "era": "Modern", "location": "Worldwide" }
]
```

- [ ] **Step 2: Commit**

```bash
git add public/data/modern.json
git commit -m "data: expand modern era to 20 events"
```

---

## Task 11: `styles/cosmic.css`

**Files:**
- Create: `src/styles/cosmic.css`

- [ ] **Step 1: Write file**

Create `src/styles/cosmic.css`:
```css
:root {
  --bg-near: #06070d;
  --bg-far: #1b3a6b;
  --ink: #e8eaf2;
  --ink-soft: #a8b3c8;
  --ink-faint: #7fa8e0;
  --accent: #f4b860;
  --epoch-prehistoric: #5b6cb6;
  --epoch-ancient: #d4a253;
  --epoch-medieval: #3f8a87;
  --epoch-modern: #c8688a;
  font-family: Inter, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
  color: var(--ink);
}

html, body, #root { height: 100%; margin: 0; }

body {
  background: radial-gradient(circle at 30% 30%, var(--bg-far), var(--bg-near) 75%);
  overflow: hidden;
}

.app {
  position: relative;
  width: 100vw;
  height: 100vh;
  display: grid;
  grid-template-rows: auto 1fr auto;
}

.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 22px;
  background: linear-gradient(180deg, rgba(6,7,13,.85), rgba(6,7,13,0));
  z-index: 5;
}
.topbar h1 {
  font-weight: 200;
  font-size: 20px;
  letter-spacing: .08em;
  text-transform: uppercase;
  margin: 0;
}

.bottombar {
  padding: 10px 22px 16px;
  font-size: 11px;
  color: var(--ink-soft);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(0deg, rgba(6,7,13,.85), rgba(6,7,13,0));
  z-index: 5;
}

.starfield {
  position: absolute; inset: 0; pointer-events: none; z-index: 0;
  overflow: hidden;
}
.starfield .layer {
  position: absolute; inset: -10%;
  background-repeat: repeat;
  background-size: 320px 320px;
}
.starfield .far {
  opacity: .35;
  background-image:
    radial-gradient(1px 1px at 14% 22%, #fff, transparent 60%),
    radial-gradient(1px 1px at 70% 38%, rgba(255,255,255,.7), transparent 60%),
    radial-gradient(1px 1px at 30% 70%, rgba(255,255,255,.5), transparent 60%),
    radial-gradient(1px 1px at 88% 80%, #fff, transparent 60%);
}
.starfield .near {
  opacity: .65;
  background-image:
    radial-gradient(1.5px 1.5px at 12% 50%, #fff, transparent 60%),
    radial-gradient(2px 2px at 60% 12%, #fff, transparent 60%),
    radial-gradient(1.5px 1.5px at 82% 65%, #fff, transparent 60%);
}

.canvas {
  position: relative; z-index: 1;
  width: 100%; height: 100%;
  cursor: grab;
}
.canvas:active { cursor: grabbing; }

.zoom-controls {
  display: flex; gap: 6px;
}
.zoom-controls button {
  width: 30px; height: 30px;
  border-radius: 50%;
  background: rgba(255,255,255,.06);
  border: 1px solid rgba(255,255,255,.25);
  color: var(--ink); cursor: pointer;
  font-size: 14px; line-height: 1;
}
.zoom-controls button:hover { background: rgba(255,255,255,.15); }

.crumbs {
  display: flex; gap: 6px; align-items: center;
  font-size: 10px; letter-spacing: .25em; text-transform: uppercase;
  color: var(--ink-faint);
}
.crumbs .seg { cursor: pointer; padding: 2px 6px; border-radius: 4px; }
.crumbs .seg:hover { color: var(--ink); background: rgba(127,168,224,.15); }
.crumbs .sep { color: rgba(127,168,224,.4); }

.search input {
  background: rgba(255,255,255,.05);
  border: 1px solid rgba(127,168,224,.3);
  color: var(--ink);
  padding: 8px 12px;
  border-radius: 999px;
  font: inherit; font-size: 13px;
  min-width: 240px;
}
.search input:focus { outline: 1px solid var(--ink-faint); }

.event-dot { fill: #fff; filter: drop-shadow(0 0 4px rgba(127,168,224,.8)); }
.event-dot.matched { fill: var(--accent); filter: drop-shadow(0 0 8px var(--accent)); }

.event-chip {
  background: rgba(127,168,224,.12);
  border: 1px solid rgba(127,168,224,.4);
  color: var(--ink);
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 11px;
  white-space: nowrap;
}
.event-card {
  background: rgba(20,28,46,.92);
  border: 1px solid rgba(127,168,224,.4);
  color: var(--ink);
  padding: 10px 14px;
  border-radius: 10px;
  width: 240px;
  box-shadow: 0 6px 24px rgba(0,0,0,.45);
}
.event-card .y { font-size: 10px; letter-spacing: .25em; color: var(--ink-faint); text-transform: uppercase; }
.event-card .t { font-size: 14px; font-weight: 500; margin: 4px 0; }
.event-card .d { font-size: 12px; color: var(--ink-soft); line-height: 1.4; }

.tick-label {
  fill: var(--ink-faint);
  font-size: 10px;
  letter-spacing: .12em;
  text-transform: uppercase;
}

.detail-backdrop {
  position: fixed; inset: 0;
  background: rgba(6,7,13,.6);
  backdrop-filter: blur(6px);
  display: flex; align-items: center; justify-content: center;
  z-index: 50;
}
.detail {
  background: linear-gradient(180deg, rgba(27,58,107,.92), rgba(6,7,13,.95));
  border: 1px solid rgba(127,168,224,.3);
  border-radius: 14px;
  padding: 28px;
  max-width: 480px; width: 90%;
  box-shadow: 0 20px 60px rgba(0,0,0,.6);
}
.detail h2 { font-weight: 300; font-size: 26px; margin: 8px 0 14px; }
.detail .meta { font-size: 11px; letter-spacing: .25em; color: var(--ink-faint); text-transform: uppercase; }
.detail p { color: var(--ink-soft); line-height: 1.55; }

.banner {
  background: rgba(220, 80, 80, .15);
  border: 1px solid rgba(220, 80, 80, .4);
  color: var(--ink);
  padding: 10px 16px; margin: 16px;
  border-radius: 8px;
  font-size: 13px;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/styles/cosmic.css
git commit -m "style: cosmic palette + base layout"
```

---

## Task 12: `Starfield.jsx`

**Files:**
- Create: `src/components/Starfield.jsx`

- [ ] **Step 1: Write file**

Create `src/components/Starfield.jsx`:
```jsx
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
```

No tests for this component — it's pure CSS-driven visual decoration. Smoke covered by Timeline test.

- [ ] **Step 2: Commit**

```bash
git add src/components/Starfield.jsx
git commit -m "feat(ui): parallax starfield background"
```

---

## Task 13: `Breadcrumbs.jsx` (TDD)

**Files:**
- Create: `src/components/__tests__/Breadcrumbs.test.jsx`
- Create: `src/components/Breadcrumbs.jsx`

- [ ] **Step 1: Write failing tests**

Create `src/components/__tests__/Breadcrumbs.test.jsx`:
```jsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Breadcrumbs from '../Breadcrumbs.jsx'

describe('Breadcrumbs', () => {
  it('shows only Epoch at the epoch band', () => {
    render(<Breadcrumbs band="epoch" centerYear={1969} onJumpTo={() => {}} />)
    expect(screen.getByText('Modern')).toBeInTheDocument()
    expect(screen.queryByText(/2nd Mill/i)).not.toBeInTheDocument()
  })

  it('shows Epoch › Millennium at millennium band', () => {
    render(<Breadcrumbs band="millennium" centerYear={1969} onJumpTo={() => {}} />)
    expect(screen.getByText('Modern')).toBeInTheDocument()
    expect(screen.getByText(/2nd Mill/)).toBeInTheDocument()
  })

  it('shows full chain at year band', () => {
    render(<Breadcrumbs band="year" centerYear={1969} onJumpTo={() => {}} />)
    expect(screen.getByText('Modern')).toBeInTheDocument()
    expect(screen.getByText(/2nd Mill/)).toBeInTheDocument()
    expect(screen.getByText(/20th c\./)).toBeInTheDocument()
    expect(screen.getByText('1960s')).toBeInTheDocument()
    expect(screen.getByText('1969')).toBeInTheDocument()
  })

  it('shows BCE for negative years', () => {
    render(<Breadcrumbs band="century" centerYear={-44} onJumpTo={() => {}} />)
    expect(screen.getByText('Ancient')).toBeInTheDocument()
    expect(screen.getByText(/1st c\. BCE/)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run tests, verify FAIL**

Run: `npm test -- Breadcrumbs`
Expected: FAIL.

- [ ] **Step 3: Implement `src/components/Breadcrumbs.jsx`**

```jsx
import { epochOf } from '../lib/epochs.js'

function ord(n) {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return n + (s[(v - 20) % 10] || s[v] || s[0])
}

function millLabel(year) {
  if (year >= 0) {
    const m = Math.floor(year / 1000) + 1
    return `${ord(m)} Mill. CE`
  }
  const m = Math.ceil(-year / 1000)
  return `${ord(m)} Mill. BCE`
}

function centLabel(year) {
  if (year >= 0) {
    const c = Math.floor(year / 100) + 1
    return `${ord(c)} c. CE`
  }
  const c = Math.ceil(-year / 100)
  return `${ord(c)} c. BCE`
}

function decLabel(year) {
  const start = Math.floor(year / 10) * 10
  return `${start}s`
}

const ORDER = ['epoch', 'millennium', 'century', 'decade', 'year']

export default function Breadcrumbs({ band, centerYear, onJumpTo }) {
  const idx = ORDER.indexOf(band)
  const segs = []
  const epoch = epochOf(centerYear)
  if (epoch && idx >= 0) segs.push({ key: 'epoch', label: epoch.name })
  if (idx >= 1) segs.push({ key: 'millennium', label: millLabel(centerYear) })
  if (idx >= 2) segs.push({ key: 'century', label: centLabel(centerYear) })
  if (idx >= 3) segs.push({ key: 'decade', label: decLabel(centerYear) })
  if (idx >= 4) segs.push({ key: 'year', label: String(Math.floor(centerYear)) })

  return (
    <nav className="crumbs" aria-label="zoom level">
      {segs.map((s, i) => (
        <span key={s.key}>
          <span className="seg" onClick={() => onJumpTo(s.key)}>{s.label}</span>
          {i < segs.length - 1 && <span className="sep"> › </span>}
        </span>
      ))}
    </nav>
  )
}
```

- [ ] **Step 4: Run tests, verify PASS**

Run: `npm test -- Breadcrumbs`
Expected: 4 passed.

- [ ] **Step 5: Commit**

```bash
git add src/components/Breadcrumbs.jsx src/components/__tests__/Breadcrumbs.test.jsx
git commit -m "feat(ui): Breadcrumbs derived from band + centerYear"
```

---

## Task 14: `EventNode.jsx` (TDD)

**Files:**
- Create: `src/components/__tests__/EventNode.test.jsx`
- Create: `src/components/EventNode.jsx`

- [ ] **Step 1: Write failing tests**

Create `src/components/__tests__/EventNode.test.jsx`:
```jsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import EventNode from '../EventNode.jsx'

const ev = { year: 1969, title: 'Apollo 11', description: 'Humans land on the Moon.', location: 'Moon', era: 'Modern' }

describe('EventNode', () => {
  it('renders SVG dot at dot mode', () => {
    const { container } = render(
      <svg><EventNode event={ev} mode="dot" x={100} onClick={() => {}} /></svg>
    )
    expect(container.querySelector('circle.event-dot')).toBeInTheDocument()
  })
  it('renders chip text at chip mode', () => {
    render(
      <svg><EventNode event={ev} mode="chip" x={100} onClick={() => {}} /></svg>
    )
    expect(screen.getByText(/1969/)).toBeInTheDocument()
    expect(screen.getByText(/Apollo 11/)).toBeInTheDocument()
  })
  it('renders full description at card mode', () => {
    render(
      <svg><EventNode event={ev} mode="card" x={100} onClick={() => {}} /></svg>
    )
    expect(screen.getByText(/Humans land on the Moon/)).toBeInTheDocument()
  })
  it('fires onClick when activated', () => {
    const onClick = vi.fn()
    render(
      <svg><EventNode event={ev} mode="dot" x={100} onClick={onClick} /></svg>
    )
    fireEvent.click(document.querySelector('.event-dot'))
    expect(onClick).toHaveBeenCalledWith(ev)
  })
  it('applies matched class when matched=true', () => {
    render(
      <svg><EventNode event={ev} mode="dot" x={100} matched onClick={() => {}} /></svg>
    )
    expect(document.querySelector('.event-dot')).toHaveClass('matched')
  })
})
```

- [ ] **Step 2: Run tests, verify FAIL**

Run: `npm test -- EventNode`
Expected: FAIL.

- [ ] **Step 3: Implement `src/components/EventNode.jsx`**

```jsx
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

  // card / year
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
```

- [ ] **Step 4: Run tests, verify PASS**

Run: `npm test -- EventNode`
Expected: 5 passed.

- [ ] **Step 5: Commit**

```bash
git add src/components/EventNode.jsx src/components/__tests__/EventNode.test.jsx
git commit -m "feat(ui): EventNode dot/chip/card by mode"
```

---

## Task 15: `EventDetail.jsx`

**Files:**
- Create: `src/components/EventDetail.jsx`

- [ ] **Step 1: Write file**

Create `src/components/EventDetail.jsx`:
```jsx
import { useEffect } from 'react'

function fmtYear(y) {
  return y < 0 ? `${-y} BCE` : String(y)
}

export default function EventDetail({ event, onClose }) {
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  if (!event) return null
  return (
    <div
      className="detail-backdrop"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div className="detail" onClick={(e) => e.stopPropagation()}>
        <div className="meta">
          {fmtYear(event.year)} · {event.era} · {event.location}
        </div>
        <h2>{event.title}</h2>
        <p>{event.description}</p>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/EventDetail.jsx
git commit -m "feat(ui): EventDetail modal with ESC + backdrop close"
```

---

## Task 16: `AxisRibbon.jsx` (TDD)

**Files:**
- Create: `src/components/__tests__/AxisRibbon.test.jsx`
- Create: `src/components/AxisRibbon.jsx`

- [ ] **Step 1: Write failing tests**

Create `src/components/__tests__/AxisRibbon.test.jsx`:
```jsx
import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import AxisRibbon from '../AxisRibbon.jsx'
import { makeYearScale } from '../../lib/yearScale.js'

const scale = makeYearScale({ domain: [-3000, 2000], range: [0, 5000] })

describe('AxisRibbon', () => {
  it('renders 4 epoch washes regardless of band', () => {
    const { container } = render(
      <svg><AxisRibbon scale={scale} band="epoch" visibleYears={[-3000, 2000]} width={5000} /></svg>
    )
    expect(container.querySelectorAll('rect.epoch-wash')).toHaveLength(4)
  })
  it('renders no millennium ticks at epoch band', () => {
    const { container } = render(
      <svg><AxisRibbon scale={scale} band="epoch" visibleYears={[-3000, 2000]} width={5000} /></svg>
    )
    expect(container.querySelectorAll('text.tick-label.millennium')).toHaveLength(0)
  })
  it('renders millennium ticks at millennium band', () => {
    const { container } = render(
      <svg><AxisRibbon scale={scale} band="millennium" visibleYears={[-3000, 2000]} width={5000} /></svg>
    )
    expect(container.querySelectorAll('text.tick-label.millennium').length).toBeGreaterThan(0)
  })
  it('renders century ticks at century band', () => {
    const { container } = render(
      <svg><AxisRibbon scale={scale} band="century" visibleYears={[1500, 2000]} width={5000} /></svg>
    )
    expect(container.querySelectorAll('text.tick-label.century').length).toBeGreaterThan(3)
  })
})
```

- [ ] **Step 2: Run tests, verify FAIL**

Run: `npm test -- AxisRibbon`
Expected: FAIL.

- [ ] **Step 3: Implement `src/components/AxisRibbon.jsx`**

```jsx
import { EPOCHS } from '../lib/epochs.js'

const BAND_ORDER = ['epoch', 'millennium', 'century', 'decade', 'year']

function ticksByStep(visibleYears, step) {
  const [a, b] = visibleYears
  const start = Math.ceil(a / step) * step
  const end = Math.floor(b / step) * step
  const out = []
  for (let y = start; y <= end; y += step) out.push(y)
  return out
}

function fmtYear(y) {
  if (y === 0) return '1 CE'
  return y < 0 ? `${-y} BCE` : `${y}`
}

export default function AxisRibbon({ scale, band, visibleYears, width, height = 600 }) {
  const idx = BAND_ORDER.indexOf(band)
  const baseY = height / 2

  const epochs = EPOCHS.map((e) => {
    const start = Math.max(e.start, scale.domain()[0])
    const end = Math.min(e.end, scale.domain()[1])
    return { ...e, start, end }
  })

  return (
    <g className="axis-ribbon">
      {epochs.map((e) => (
        <rect
          key={e.name}
          className="epoch-wash"
          x={scale(e.start)}
          y={baseY - 80}
          width={scale(e.end) - scale(e.start)}
          height={160}
          fill={e.color}
          opacity={0.08}
        />
      ))}

      <line x1={0} x2={width} y1={baseY} y2={baseY} stroke="rgba(127,168,224,.25)" />

      {idx === 0 && epochs.map((e) => (
        <text
          key={`elabel-${e.name}`}
          className="tick-label epoch"
          x={(scale(e.start) + scale(e.end)) / 2}
          y={baseY - 90}
          textAnchor="middle"
        >
          {e.name}
        </text>
      ))}

      {idx >= 1 && ticksByStep(visibleYears, 1000).map((y) => (
        <g key={`m-${y}`}>
          <line x1={scale(y)} x2={scale(y)} y1={baseY - 8} y2={baseY + 8} stroke="rgba(127,168,224,.4)" />
          <text className="tick-label millennium" x={scale(y)} y={baseY + 24} textAnchor="middle">
            {fmtYear(y)}
          </text>
        </g>
      ))}

      {idx >= 2 && ticksByStep(visibleYears, 100).map((y) => (
        <g key={`c-${y}`}>
          <line x1={scale(y)} x2={scale(y)} y1={baseY - 4} y2={baseY + 4} stroke="rgba(127,168,224,.3)" />
          <text className="tick-label century" x={scale(y)} y={baseY + 38} textAnchor="middle">
            {fmtYear(y)}
          </text>
        </g>
      ))}

      {idx >= 3 && ticksByStep(visibleYears, 10).map((y) => (
        <text key={`d-${y}`} className="tick-label decade" x={scale(y)} y={baseY + 52} textAnchor="middle">
          {fmtYear(y)}
        </text>
      ))}

      {idx >= 4 && ticksByStep(visibleYears, 1).map((y) => (
        <text key={`y-${y}`} className="tick-label year" x={scale(y)} y={baseY + 66} textAnchor="middle">
          {fmtYear(y)}
        </text>
      ))}
    </g>
  )
}
```

- [ ] **Step 4: Run tests, verify PASS**

Run: `npm test -- AxisRibbon`
Expected: 4 passed.

- [ ] **Step 5: Commit**

```bash
git add src/components/AxisRibbon.jsx src/components/__tests__/AxisRibbon.test.jsx
git commit -m "feat(ui): AxisRibbon — epoch washes + LOD ticks"
```

---

## Task 17: `ZoomControls.jsx`

**Files:**
- Create: `src/components/ZoomControls.jsx`

- [ ] **Step 1: Write file**

Create `src/components/ZoomControls.jsx`:
```jsx
export default function ZoomControls({ onZoomIn, onZoomOut, onReset }) {
  return (
    <div className="zoom-controls" aria-label="zoom controls">
      <button type="button" onClick={onZoomOut} title="Zoom out">−</button>
      <button type="button" onClick={onReset} title="Reset">⟲</button>
      <button type="button" onClick={onZoomIn} title="Zoom in">+</button>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ZoomControls.jsx
git commit -m "feat(ui): ZoomControls"
```

---

## Task 18: `SearchBar.jsx`

**Files:**
- Create: `src/components/SearchBar.jsx`

- [ ] **Step 1: Write file**

Create `src/components/SearchBar.jsx`:
```jsx
import { useState } from 'react'

export default function SearchBar({ onChange, onSubmit }) {
  const [value, setValue] = useState('')

  function handleChange(e) {
    setValue(e.target.value)
    onChange(e.target.value)
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') {
      e.preventDefault()
      onSubmit(value)
    }
  }

  return (
    <form className="search" onSubmit={(e) => { e.preventDefault(); onSubmit(value) }}>
      <input
        type="search"
        value={value}
        placeholder="Search events…"
        onChange={handleChange}
        onKeyDown={handleKeyDown}
      />
    </form>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/SearchBar.jsx
git commit -m "feat(ui): SearchBar with onChange + ENTER submit"
```

---

## Task 19: `Timeline.jsx` — main canvas

**Files:**
- Create: `src/components/Timeline.jsx`

This component owns the imperative `d3-zoom` binding. Pure render-selection logic is in helpers (already tested). Smoke test in Task 21 covers the full render.

- [ ] **Step 1: Write file**

Create `src/components/Timeline.jsx`:
```jsx
import { useEffect, useMemo, useRef, useState } from 'react'
import { select } from 'd3-selection'
import { zoom as d3zoom, zoomIdentity } from 'd3-zoom'
import { makeYearScale, visibleYearRange, centerYear } from '../lib/yearScale.js'
import { lodBand } from '../lib/zoom.js'
import AxisRibbon from './AxisRibbon.jsx'
import EventNode from './EventNode.jsx'
import Starfield from './Starfield.jsx'
import Breadcrumbs from './Breadcrumbs.jsx'
import ZoomControls from './ZoomControls.jsx'
import SearchBar from './SearchBar.jsx'
import EventDetail from './EventDetail.jsx'

const VIEW_W = 5000
const VIEW_H = 600

export default function Timeline({ events }) {
  const svgRef = useRef(null)
  const zoomRef = useRef(null)
  const [transform, setTransform] = useState({ k: 1, x: 0, y: 0 })
  const [size, setSize] = useState({ w: 1200, h: 600 })
  const [selected, setSelected] = useState(null)
  const [query, setQuery] = useState('')

  const domain = useMemo(() => {
    if (!events.length) return [-3000, 2000]
    return [events[0].year, events[events.length - 1].year]
  }, [events])

  const scale = useMemo(
    () => makeYearScale({ domain, range: [0, VIEW_W] }),
    [domain],
  )

  useEffect(() => {
    function onResize() {
      const el = svgRef.current?.parentElement
      if (!el) return
      setSize({ w: el.clientWidth, h: el.clientHeight })
    }
    onResize()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    const svg = select(svgRef.current)
    const z = d3zoom()
      .scaleExtent([1, 5000])
      .translateExtent([[0, 0], [VIEW_W, VIEW_H]])
      .on('zoom', (event) => {
        const { k, x, y } = event.transform
        setTransform({ k, x, y })
      })
    zoomRef.current = z
    svg.call(z)
    return () => { svg.on('.zoom', null) }
  }, [])

  const band = lodBand(transform.k)
  const [visA, visB] = visibleYearRange(scale, transform, size.w)
  const cy = centerYear(scale, transform, size.w)

  const visibleEvents = useMemo(() => {
    return events.filter((e) => e.year >= visA && e.year <= visB)
  }, [events, visA, visB])

  const matchSet = useMemo(() => {
    if (!query.trim()) return null
    const q = query.toLowerCase()
    return new Set(
      events
        .filter((e) =>
          `${e.title} ${e.description ?? ''} ${e.location ?? ''}`.toLowerCase().includes(q),
        )
        .map((e) => `${e.year}|${e.title}`),
    )
  }, [events, query])

  function nodeMode(_event) {
    if (band === 'epoch' || band === 'millennium' || band === 'century') return 'dot'
    if (band === 'decade') return 'chip'
    return 'card'
  }

  function applyTransform(t) {
    const svg = select(svgRef.current)
    svg.transition().duration(450).call(zoomRef.current.transform, t)
  }

  function zoomToYear(year, k) {
    const px = scale(year)
    const x = size.w / 2 - px * k
    applyTransform(zoomIdentity.translate(x, 0).scale(k))
  }

  function zoomIn() {
    select(svgRef.current).transition().duration(250).call(zoomRef.current.scaleBy, 1.6)
  }
  function zoomOut() {
    select(svgRef.current).transition().duration(250).call(zoomRef.current.scaleBy, 0.625)
  }
  function reset() {
    applyTransform(zoomIdentity)
  }

  function handleJumpTo(seg) {
    if (seg === 'epoch') reset()
    else if (seg === 'millennium') zoomToYear(cy, 4)
    else if (seg === 'century') zoomToYear(cy, 30)
    else if (seg === 'decade') zoomToYear(cy, 200)
    else if (seg === 'year') zoomToYear(cy, 1500)
  }

  function handleSearchSubmit(q) {
    if (!q.trim() || !matchSet || matchSet.size === 0) return
    const matched = events.filter((e) => matchSet.has(`${e.year}|${e.title}`))
    if (!matched.length) return
    const lo = matched[0].year
    const hi = matched[matched.length - 1].year
    if (lo === hi) return zoomToYear(lo, 1500)
    const span = hi - lo
    const k = Math.max(1, Math.min(5000, (domain[1] - domain[0]) / span * 0.8))
    zoomToYear((lo + hi) / 2, k)
  }

  return (
    <div className="app">
      <div className="topbar">
        <h1>Cosmic Timeline</h1>
        <Breadcrumbs band={band} centerYear={cy} onJumpTo={handleJumpTo} />
        <SearchBar onChange={setQuery} onSubmit={handleSearchSubmit} />
      </div>

      <div className="canvas">
        <Starfield k={transform.k} />
        <svg
          ref={svgRef}
          viewBox={`0 0 ${size.w} ${size.h}`}
          width={size.w}
          height={size.h}
          preserveAspectRatio="xMidYMid meet"
          style={{ display: 'block' }}
        >
          <g transform={`translate(${transform.x}, 0) scale(${transform.k}, 1)`}>
            <AxisRibbon
              scale={scale}
              band={band}
              visibleYears={[visA, visB]}
              width={VIEW_W}
              height={VIEW_H}
            />
            <g transform={`translate(0, ${VIEW_H / 2})`}>
              {visibleEvents.map((e) => (
                <g
                  key={`${e.year}-${e.title}`}
                  transform={`translate(0,0) scale(${1 / transform.k}, 1)`}
                  style={{ transformOrigin: `${scale(e.year) * transform.k}px 0` }}
                >
                  <EventNode
                    event={e}
                    mode={nodeMode(e)}
                    x={scale(e.year) * transform.k}
                    matched={matchSet?.has(`${e.year}|${e.title}`) ?? false}
                    onClick={setSelected}
                  />
                </g>
              ))}
            </g>
          </g>
        </svg>
      </div>

      <div className="bottombar">
        <span>k = {transform.k.toFixed(2)} · band: {band}</span>
        <ZoomControls onZoomIn={zoomIn} onZoomOut={zoomOut} onReset={reset} />
      </div>

      <EventDetail event={selected} onClose={() => setSelected(null)} />
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/Timeline.jsx
git commit -m "feat(ui): Timeline canvas with d3-zoom binding"
```

---

## Task 20: Wire `App.jsx` + `main.jsx`

**Files:**
- Modify: `src/App.jsx`
- Modify: `src/main.jsx`

- [ ] **Step 1: Replace `src/App.jsx`**

Overwrite `src/App.jsx`:
```jsx
import { useEffect, useState } from 'react'
import { loadAllEvents } from './lib/events.js'
import Timeline from './components/Timeline.jsx'

export default function App() {
  const [events, setEvents] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {
    loadAllEvents(import.meta.env.BASE_URL)
      .then(setEvents)
      .catch((e) => setError(e.message))
  }, [])

  if (error) {
    return (
      <div className="banner">
        Couldn't load timeline data: {error}{' '}
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    )
  }

  if (!events.length) return null
  return <Timeline events={events} />
}
```

- [ ] **Step 2: Replace `src/main.jsx`**

Read current `src/main.jsx` first, then update its style import. The expected new content:

```jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './styles/cosmic.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

- [ ] **Step 3: Commit**

```bash
git add src/App.jsx src/main.jsx
git commit -m "feat(ui): mount Timeline + load era JSON in App"
```

---

## Task 21: Smoke test for full app boot

**Files:**
- Create: `src/__tests__/App.smoke.test.jsx`

- [ ] **Step 1: Write smoke test**

Create `src/__tests__/App.smoke.test.jsx`:
```jsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import App from '../App.jsx'

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn((url) => {
    const file = url.split('/').pop()
    const data = {
      'prehistoric.json': [{ year: -10000, title: 'Test Pre', description: 'd', era: 'Prehistoric', location: 'l' }],
      'ancient.json':     [{ year: -776, title: 'Test Anc', description: 'd', era: 'Ancient',     location: 'l' }],
      'medieval.json':    [{ year: 1066, title: 'Test Med', description: 'd', era: 'Medieval',    location: 'l' }],
      'modern.json':      [{ year: 1969, title: 'Test Mod', description: 'd', era: 'Modern',      location: 'l' }],
    }[file] ?? []
    return Promise.resolve({ ok: true, json: () => Promise.resolve(data) })
  }))
})

describe('App smoke', () => {
  it('renders the timeline shell after data loads', async () => {
    render(<App />)
    await waitFor(() => expect(screen.getByText('Cosmic Timeline')).toBeInTheDocument())
    expect(screen.getByText(/k =/)).toBeInTheDocument()
  })

  it('renders error banner when fetch fails', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({ ok: false, status: 500 })))
    render(<App />)
    await waitFor(() => expect(screen.getByText(/Couldn't load timeline data/)).toBeInTheDocument())
  })
})
```

- [ ] **Step 2: Run tests, verify PASS**

Run: `npm test -- App.smoke`
Expected: 2 passed.

- [ ] **Step 3: Run the full test suite**

Run: `npm test`
Expected: all suites pass.

- [ ] **Step 4: Commit**

```bash
git add src/__tests__/App.smoke.test.jsx
git commit -m "test: App boot + fetch-failure smoke"
```

---

## Task 22: Remove vestigial pre-Vite files

**Files:**
- Delete: `index.js`
- Delete: `lib/Timeline.js`
- Delete: `lib/context.js`
- Delete: `stylesheets/style.css`
- Delete: `src/styles.css`

- [ ] **Step 1: Delete files**

Run:
```bash
git rm index.js lib/Timeline.js lib/context.js stylesheets/style.css src/styles.css
rmdir lib stylesheets
```
(If `rmdir` fails because the dir isn't empty, run `git rm` on remaining files first.)

- [ ] **Step 2: Verify build still works**

Run: `npm run build`
Expected: Vite build succeeds, `dist/` produced.

- [ ] **Step 3: Run tests**

Run: `npm test`
Expected: all pass.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: remove pre-Vite vestigial files"
```

---

## Task 23: Manual smoke + dev-server verify

**Files:** none

- [ ] **Step 1: Boot dev server**

Run: `npm run dev`
Expected: Vite dev server starts; URL printed.

- [ ] **Step 2: Open browser, verify**

Open the printed URL. Verify:
- Cosmic background renders, no console errors.
- Timeline shows epoch labels at default zoom.
- Mouse-wheel scroll over canvas zooms in; pan via drag works.
- Past k=200, event chips appear; past k=1500, full cards.
- Click an event → modal opens; ESC or backdrop click closes.
- Type in search → matched events glow; ENTER zooms to fit.
- Click breadcrumb segments → animated zoom-to.
- ± / reset buttons work.

If any check fails, file the regression as a follow-up task before merging. **Do not** mark this task complete until the golden path passes in-browser.

- [ ] **Step 3: Stop dev server**

Ctrl-C in the dev-server terminal.

---

## Task 24: README update

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Replace contents**

Overwrite `README.md`:
```markdown
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
```

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "docs: rewrite README for cosmic timeline"
```

---

## Final verification

- [ ] **Step 1: Full test run**

Run: `npm test`
Expected: all suites pass, no warnings about missing files.

- [ ] **Step 2: Production build**

Run: `npm run build`
Expected: build succeeds, `dist/` populated.

- [ ] **Step 3: Preview production build**

Run: `npm run preview`
Open the printed URL, repeat the manual smoke from Task 23 against the production bundle. Expected: same behavior.

- [ ] **Step 4: Final commit (only if any cleanup)**

Run: `git status`
If clean: nothing to commit.
If anything pending: stage and commit with a descriptive message.

---

## Self-review notes

**Spec coverage check:** every section of the spec maps to at least one task —
- Stack/deps → Tasks 1, 2
- LOD bands → Task 4 (`zoom.js`) + Task 16 (`AxisRibbon`) + Task 14 (`EventNode`)
- File layout → Tasks 3–22
- Data flow → Tasks 6, 19, 20
- Interactions → Task 19 (`Timeline.jsx`) — wheel/pinch/drag via d3-zoom, click → modal, breadcrumb jump, ± / reset, search-zoom-fit, ESC
- Visual treatment → Task 11 (`cosmic.css`) + Task 12 (`Starfield`)
- Error handling → Task 20 (`App.jsx` retry banner) + Task 21 (smoke for fetch failure)
- Testing → Tasks 3–6, 13, 14, 16, 21
- Out-of-scope items remain out of scope.

**Type/name consistency:** `lodBand`, `epochOf`, `makeYearScale`, `centerYear`, `visibleYearRange`, `loadAllEvents`, `nodeMode` — all referenced consistently across tasks. `EventNode` props (`event`, `mode`, `x`, `matched`, `onClick`) match between Timeline call site and component definition.

**No placeholders:** every code-bearing step has full code. No "implement later," no "similar to above."
