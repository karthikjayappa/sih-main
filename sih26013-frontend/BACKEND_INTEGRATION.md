# Connecting a real backend

The frontend was built so that **`lib/mockApi.ts` is the only file that knows data is fake.**
Every page and component calls functions from that file (`searchParcels`, `getParcelById`,
`getConflicts`, `updateConflictStatus`, `getParcelAudit`, `getDatasets`, `getMappingProfile`,
`getDashboardMetrics`, `getAllParcels`, `getSourceParcels`, `runIngestion`) and never imports
`mock/*.json` directly. That means switching to a real backend is a matter of rewriting the
bodies of those functions — no component, page, or type needs to change if the response
shapes match `lib/types.ts`.

This assumes a backend matching the API contract documented on the **APIs** page and in the
companion backend prompt (Java/Spring Boot + PostgreSQL/PostGIS, or an equivalent Node
service) exposing:

```
GET   /parcels/search?q=
GET   /parcels/{id}
GET   /conflicts?status=&conflictType=&village=&tehsil=
PATCH /conflicts/{unifiedParcelId}
GET   /parcels/{id}/audit
POST  /ingest
```

## Step 1 — Point the app at the API

Add an environment variable rather than hardcoding a URL:

```bash
# .env.local
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api
```

Create a tiny fetch wrapper alongside `mockApi.ts`, e.g. `lib/httpClient.ts`:

```ts
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...init?.headers },
    ...init,
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`API ${res.status} on ${path}: ${body}`);
  }
  // Adjust if your backend doesn't wrap responses in { data, meta }
  const json = await res.json();
  return (json.data ?? json) as T;
}
```

## Step 2 — Replace each mock function, one at a time

You do not have to migrate everything at once. Because every page calls a named function from
`lib/mockApi.ts`, you can convert one endpoint, ship it, and leave the rest on mock data.
Example for search:

```ts
// lib/mockApi.ts — before
export async function searchParcels(params: ParcelSearchParams): Promise<UnifiedParcel[]> {
  // ... filters unifiedParcels in memory
}

// after
export async function searchParcels(params: ParcelSearchParams): Promise<UnifiedParcel[]> {
  const query = new URLSearchParams();
  if (params.q) query.set("q", params.q);
  if (params.village) query.set("village", params.village);
  if (params.tehsil) query.set("tehsil", params.tehsil);
  if (params.district) query.set("district", params.district);
  return apiFetch<UnifiedParcel[]>(`/parcels/search?${query.toString()}`);
}
```

Repeat this for each function. Suggested order, easiest first:

1. `getDashboardMetrics` — read-only, low risk, good smoke test for the connection.
2. `getAllParcels` / `getSourceParcels` — powers the map; confirm the backend returns
   geometry as `[lng, lat][]` rings in WGS84 (EPSG:4326) to match `UnifiedParcel.geometry`.
   If PostGIS returns GeoJSON or WKT instead, convert it in this function so every component
   downstream keeps working unchanged.
3. `searchParcels`, `getParcelById`, `getParcelAudit` — straightforward GETs.
4. `getConflicts` — same pattern, with query-string filters.
5. `updateConflictStatus` — first real write; wire this to `PATCH /conflicts/{id}` and pass
   through the `{ status, notes, resolvedBy }` body already assembled by
   `ConflictDetail.tsx`.
6. `getDatasets` / `getMappingProfile` / `runIngestion` — last, since the Ingestion page is
   the most simulated part of the MVP (real ingestion likely involves an actual file upload,
   see Step 4).

## Step 3 — Server vs. client data fetching

Pages under `app/(shell)/dashboard`, `map`, `conflicts`, `ingestion`, `apis` currently call
`mockApi.ts` functions directly inside **async Server Components**
(`app/(shell)/dashboard/page.tsx`, `app/(shell)/map/page.tsx`, etc.). Once `apiFetch` talks to
a real backend:

- If the backend is reachable from the Next.js server (same network / Docker Compose /
  same VPC), leave these as server-side calls — this is simpler and keeps API tokens off the
  client. Just make sure `NEXT_PUBLIC_API_BASE_URL` resolves correctly from inside the server
  runtime (e.g. `http://backend:8080` in Docker Compose, not `localhost`).
- If the backend is only reachable from the browser (e.g. it enforces per-user auth via a
  browser cookie/session), move the initial fetch into the existing client components
  (`ConflictsExperience.tsx`, `IngestionExperience.tsx`, `MapExperience.tsx` already fetch or
  receive data client-side) and drop the `async` server component wrapper.

The mutating call (`updateConflictStatus`) already happens from a client component
(`ConflictsExperience.tsx`), so no change is needed there beyond making `apiFetch` send
credentials if your backend uses cookie-based auth (`fetch(url, { credentials: "include" })`).

## Step 4 — Real file upload for ingestion

`IngestionRunner.tsx` currently calls `runIngestion(datasetId)` with a dataset chosen from a
dropdown of pre-seeded datasets. To support real files:

1. Add a `<input type="file" accept=".csv,.xlsx,.geojson,.zip" />` to the ingestion page.
2. In `mockApi.ts`, add:
   ```ts
   export async function ingestFile(file: File, sourceSystem: SourceSystem, mappingProfileId: string) {
     const form = new FormData();
     form.append("file", file);
     form.append("sourceSystem", sourceSystem);
     form.append("mappingProfileId", mappingProfileId);
     const res = await fetch(`${BASE_URL}/ingest`, { method: "POST", body: form });
     if (!res.ok) throw new Error(await res.text());
     return res.json();
   }
   ```
   (Don't set `Content-Type` manually for `FormData` — the browser sets the multipart
   boundary for you.)
3. Swap the button handler in `IngestionRunner.tsx` to call `ingestFile` instead of
   `runIngestion`, and use the real `{ ingested, mapped, warnings }` response for the
   progress/result UI, which is already shaped to match.

## Step 5 — CORS and environments

- In development, enable CORS on the backend for `http://localhost:3000`
  (Spring Boot: `@CrossOrigin` or a global `CorsConfigurationSource` bean; Express:
  the `cors` middleware).
- In production, prefer same-origin deployment (serve the Next.js app and API under the same
  domain via a reverse proxy) to avoid CORS entirely, or lock CORS to your deployed frontend
  origin.
- Keep separate `.env.local` / `.env.production` values for `NEXT_PUBLIC_API_BASE_URL`.

## Step 6 — Remove the mock layer (optional, once fully migrated)

Once every function in `lib/mockApi.ts` calls `apiFetch`, you can:

- Delete the `mock/*.json` files and their imports.
- Delete the in-memory mutation logic (`let unifiedParcels = ...`, `resetUnifiedParcels`) —
  the backend is now the source of truth.
- Keep the function names and signatures as-is; they've effectively become your typed API
  client (`lib/apiClient.ts` might be a better name at that point).

## Quick checklist

- [ ] `NEXT_PUBLIC_API_BASE_URL` set for each environment
- [ ] Geometry format agreed (WGS84 `[lng, lat]` rings) and converted at the API boundary if needed
- [ ] CORS enabled for local dev
- [ ] `updateConflictStatus` write path tested against a real `PATCH`
- [ ] File upload wired for `/ingest` if real ingestion is in scope for your submission
- [ ] Loading and error states (already present via `Skeleton` / try-catch) verified against
      real network latency and real error responses, not just the simulated 260ms delay
