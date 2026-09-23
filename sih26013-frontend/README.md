# Unified Urban Land Records — SIH26013 (Frontend)

A demo-ready web app for **"Automated Integration & Harmonization of Multi-source Geospatial
Data for Urban Land Records"** (Smart India Hackathon 2026, problem code SIH26013, Disaster
Management theme, Ministry of Rural Development).

This is the **frontend** for the Node.js/Express API. It expects the backend at
`http://localhost:3000` and runs on port 3001 during local development. See
[`BACKEND_INTEGRATION.md`](./BACKEND_INTEGRATION.md) for the API contract.

## Tech stack

- **Next.js 14** (App Router) + **TypeScript**
- **Tailwind CSS** for styling (custom "civic ledger" theme — see `tailwind.config.ts`)
- **Leaflet** / `react-leaflet` for the interactive land map
- **Recharts** for dashboard charts
- **Zustand** for lightweight client state (toast notifications)
- Typed REST client in `lib/api.ts` targeting `/api/v1`

## Getting started

Requires Node.js 18.18+ (or 20+) and npm.

```bash
npm install
cp .env.example .env.local
npm run dev -- -p 3001
```

Then open [http://localhost:3001](http://localhost:3001) — it redirects to `/overview`.

Other scripts:

```bash
npm run build   # production build
npm run start   # run the production build
npm run lint    # eslint
```

## Where things live

```
app/
  overview/            Landing page (hero, how-it-works, architecture diagram) — own layout, no sidebar
  (shell)/             Everything behind the app shell (sidebar + top bar)
    dashboard/         Programme metrics, charts, activity feed
    map/                Unified Land Map — before/after toggle, search, conflict panel
    conflicts/          Conflicts Dashboard — filters, table, review drawer
    ingestion/          Data sources, schema mapping, and multipart upload
    apis/               Static API reference (mirrors the conceptual backend contract)
    about/              Problem context, capabilities, team section
components/
  layout/               Sidebar, TopBar
  dashboard/, map/, conflicts/, ingestion/, apis/    Page-specific components
  ui/                   Shared primitives: Card, Badge, Button, Toaster, Skeleton, EmptyState
lib/
  types.ts              Shared TypeScript domain types (SourceParcel, UnifiedParcel, ...)
  api.ts                 Typed REST client for the Express `/api/v1` backend
  httpClient.ts          Shared fetch wrapper and response unwrapping
  utils.ts               Formatting helpers, label/color maps
  toastStore.ts           Zustand store for toast notifications
mock/
  sourceParcels.json      ~170 raw, pre-conflation records from Revenue/Survey/Municipal
  parcels.json             62 unified parcels, ~33 with an intentionally flagged conflict
  datasets.json             Dataset catalogue for the ingestion page
  mappingProfiles.json      Field-mapping rules per dataset
  dashboard.json            Precomputed dashboard metrics
```

All mock data was generated once by a small Python script (not shipped) and committed as
static JSON, so the demo is fully deterministic and reproducible.

## How the demo data tells the story

Every unified parcel in `mock/parcels.json` carries the source records it was built from
(`sourceRecords`), so the **Land Map**'s "Before" mode can show three overlapping,
independently-styled layers, and the **Conflicts Dashboard** can show a real side-by-side
comparison — without a second data model.

Conflicts were injected deliberately across four categories, matching the conflation rules
described in the problem statement:

| Conflict type       | How it's simulated                                                             |
|----------------------|----------------------------------------------------------------------------|
| `OWNER_MISMATCH`      | Survey record uses a different owner name than Revenue for the same parcel |
| `AREA_MISMATCH`       | One source reports area 12–35% larger than the others                     |
| `GEOMETRY_OVERLAP`    | Survey polygon is shifted a few metres from the Revenue/Municipal polygon  |
| `DUPLICATE_ID`        | Municipal ward/plot ID collides with a different parcel                    |

The (simplified) conflation logic that produced `conflictFlag` / `conflictTypes` for each
parcel is: group source records by parcel ID and geometry proximity (< 5 m), then flag
`OWNER_MISMATCH` if resolved owners differ, `AREA_MISMATCH` if area varies by more than 10%,
`GEOMETRY_OVERLAP` if a shift was introduced, and `DUPLICATE_ID` where an ID collision was
introduced. A real backend would run this as a service over PostGIS (`ST_DWithin`,
`ST_Intersects`) rather than a data-generation script — see `BACKEND_INTEGRATION.md`.

## Design notes

The visual language is a "civic ledger" theme rather than a generic SaaS dashboard:
Source Serif 4 for headings, IBM Plex Sans for UI text, IBM Plex Mono for IDs/coordinates/
status codes, a paper-and-ink palette (warm off-white, slate ink, survey-blue, moss-green for
resolved states, rust for conflicts, gold for pending review), sharp 2–3px corners instead of
rounded SaaS cards, and a faint survey-grid backdrop behind the main content area.

## Known simplifications (MVP scope)

- File upload on the Ingestion page is simulated (dataset selection, not a real file picker).
- The map's "geometry preview" inside a conflict's detail drawer is a normalized SVG, not a
  second Leaflet instance, to keep the drawer lightweight.
- All writes (`PATCH /conflicts/{id}`) only mutate an in-memory copy of the mock data for the
  current browser session; refreshing the page resets state. A real backend persists these to
  PostgreSQL.
