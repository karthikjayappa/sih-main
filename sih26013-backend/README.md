# SIH26013 Land Record Harmonization Backend

Node.js + Express backend for ingesting heterogeneous parcel datasets, mapping them into a common model, conflating matching records with PostGIS, and exposing conflicts for review.

## Structure

```text
src/                         Application code
 db/migrations/              PostGIS schema migrations
 db/seed/mapping-profiles.json
 db/seed/source-data/        Licensed Alur demonstration GeoJSON files
 uploads/                    Runtime upload scratch space
server.js
```

## Prerequisites

- Node.js 18+
- PostgreSQL 15+ with PostGIS 3

## Setup

```bash
npm install
cp .env.example .env
psql -U postgres -c "CREATE DATABASE land_conflation;"
npm run setup
npm start
```

`npm run setup` applies migrations and seeds the three Alur mapping profiles. It does not generate or modify source data.

The server listens on `http://localhost:3000`; configure `PORT`, `CORS_ORIGIN`, and PostgreSQL settings in `.env`. The default React development origin is `http://localhost:5173`.

## Alur source data

Place the licensed files below in `db/seed/source-data/` when available:

- `alur_revenue_169.geojson`
- `alur_survey_169.geojson`
- `alur_municipal_169.geojson`

Each file should be a GeoJSON `FeatureCollection` containing polygon or multipolygon features. The profiles expect properties such as `source`, `record_id`, `survey_number`, `owner_name`, `area_sqm`, and `land_use`. Feature geometry is sent directly to PostGIS, including `MultiPolygon` geometry; the service only uses its centroid-square fallback for genuinely point-only uploads.

These supplied 169-record source files are included in this checkout. Keep them in the repository only where their licensing and competition rules allow distribution.

## API examples

Health check:

```bash
curl http://localhost:3000/api/v1/health
```

Ingest one source file:

```bash
curl -X POST http://localhost:3000/api/v1/ingest \
  -F "file=@db/seed/source-data/alur_revenue_169.geojson" \
  -F "sourceSystem=REVENUE" \
  -F "mappingProfileId=ALUR_REVENUE_GEOJSON_V1"
```

Run the same request with `ALUR_SURVEY_GEOJSON_V1` or `ALUR_MUNICIPAL_GEOJSON_V1` for the other source systems. Search parcels with `/api/v1/parcels/search` and review conflicts with `/api/v1/conflicts`.

## Geometry and conflation

GeoJSON feature geometry is stored as SRID 4326 geometry in `source_parcels`. Conflation combines exact normalized parcel IDs and nearby geometries using configurable PostGIS thresholds. Conflicted clusters are stored as `PENDING_REVIEW`; clean clusters are `RESOLVED`.
