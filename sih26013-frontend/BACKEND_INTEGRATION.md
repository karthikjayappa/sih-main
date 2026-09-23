# Backend integration

The frontend uses `lib/api.ts` and `lib/httpClient.ts` as its typed REST boundary. The backend is Node.js + Express with PostgreSQL/PostGIS, runs on port 3000, and is mounted at `/api/v1`. The Next.js frontend runs on port 3001.

## Environment

Copy `.env.example` to `.env.local`:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api/v1
```

Run the frontend with:

```bash
npm run dev -- -p 3001
```

The backend must allow CORS from `http://localhost:3001` during local development.

## Endpoints used

```text
GET   /api/v1/health
GET   /api/v1/dashboard/stats
GET   /api/v1/parcels/search?q=&village=&tehsil=&district=
GET   /api/v1/parcels/{id}
GET   /api/v1/parcels/{id}/audit
GET   /api/v1/conflicts?status=&conflictType=&village=&tehsil=
PATCH /api/v1/conflicts/{unifiedParcelId}
GET   /api/v1/mapping-profiles
GET   /api/v1/mapping-profiles/{id}
POST  /api/v1/ingest
```

The client unwraps `{ data: ... }` responses and also accepts direct arrays. Parcel geometry is normalized at the API boundary to WGS84 GeoJSON `Polygon` or `MultiPolygon`; the map uses Leaflet's GeoJSON renderer and calculates its initial location from returned parcels.

## Ingestion request

`POST /api/v1/ingest` is sent as `multipart/form-data` with these fields:

```text
file              uploaded GeoJSON, CSV, XLSX, or ZIP
sourceSystem      REVENUE | SURVEY | MUNICIPAL | REGISTRATION
mappingProfileId  backend mapping profile identifier
```

The frontend does not set the multipart `Content-Type` header manually. The browser adds the boundary. The expected response is:

```json
{
  "data": {
    "ingested": 169,
    "mapped": 169,
    "warnings": []
  }
}
```

The upload UI reports the actual request result and does not simulate percentage progress.

## Backend contract notes

- `GET /api/v1/dashboard/stats` should return the existing `DashboardMetrics` shape.
- Mapping profiles should expose an identifier, source system, format, sample fields, and rules. The frontend converts the profile catalogue into dataset cards.
- Parcel and conflict records should include the fields in `lib/types.ts`. The map's before layer is derived from `sourceRecords` returned with unified parcels; missing source records or audit entries are normalized to empty arrays.
- Conflict updates accept `{ status, notes, resolvedBy }`. The frontend no longer sends a placeholder resolver identity; `resolvedBy` should be supplied by the authenticated user session once backend authentication is available.
- Authentication is intentionally not fabricated in this frontend until the backend exposes its login/token contract.

## Verification checklist

- [x] API base URL uses `http://localhost:3000/api/v1`.
- [x] Frontend development port is 3001.
- [x] File upload uses multipart form data.
- [x] Polygon and MultiPolygon are supported.
- [x] Map search uses `/parcels/search?q=`.
- [x] Conflict status uses `PATCH /conflicts/{id}`.
- [ ] Backend CORS allows `http://localhost:3001`.
- [ ] Backend endpoint response shapes verified against a running API.
