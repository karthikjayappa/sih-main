# SIH26013 — Land Record Harmonization & Conflation Backend

MVP backend for **SIH26013: Automated Integration & Harmonization of Multi-source
Geospatial Data for Urban Land Records** (Theme: Disaster Management, Ministry: Rural
Development).

Ingests land parcel data from heterogeneous sources (Revenue CSV, Survey Excel,
Municipal GeoJSON), maps each into a common land data model, runs rule-based
spatial conflation using PostGIS, flags conflicting records for manual review, and
exposes the harmonized result over a REST API.

**Stack:** Node.js + Express + `pg` (raw SQL) + PostgreSQL 15+/PostGIS 3.
Raw SQL (via `pg`) is used deliberately instead of an ORM — PostGIS operations
(`ST_DWithin`, `ST_Union`, `ST_Intersects`, `ST_Area`, `ST_GeomFromGeoJSON`) are
easiest to use directly, and MVP scope doesn't need ORM migration tooling.

---

## 1. Folder structure

```
sih26013-backend/
├── package.json
├── .env.example              # copy to .env and edit for your local Postgres
├── server.js                 # entry point
├── db/
│   ├── migrations/            # plain SQL, applied in filename order
│   │   ├── 001_extensions.sql         (CREATE EXTENSION postgis, uuid-ossp, pgcrypto)
│   │   ├── 002_mapping_profiles.sql
│   │   ├── 003_source_parcels.sql
│   │   ├── 004_unified_parcels.sql
│   │   ├── 005_audit_log.sql
│   │   └── 006_indexes.sql            (incl. GIST spatial indexes)
│   └── seed/
│       ├── run-migrations.js          # applies all migrations
│       ├── mapping-profiles.json      # field-mapping rules for 3 sample sources
│       ├── seed-mapping-profiles.js   # loads mapping-profiles.json into DB
│       ├── generate-sample-data.js    # generates the sample dataset files below
│       └── sample-data/
│           ├── revenue_dataset.csv
│           ├── survey_dataset.xlsx
│           ├── municipal_dataset.geojson
│           └── EXPECTED_CONFLICTS.md  # which rows should conflict, and why
├── src/
│   ├── app.js                 # express app (middleware + routes)
│   ├── config/
│   │   ├── env.js             # reads .env
│   │   ├── db.js              # pg Pool
│   │   └── upload.js          # multer disk storage config
│   ├── routes/                # controller <-> URL wiring
│   │   ├── index.js
│   │   ├── ingestRoutes.js
│   │   ├── parcelRoutes.js
│   │   └── conflictRoutes.js
│   ├── controllers/           # thin HTTP layer, calls services
│   │   ├── ingestController.js
│   │   ├── parcelController.js
│   │   └── conflictController.js
│   ├── services/               # business logic
│   │   ├── ingestionService.js     # CSV/XLSX/GeoJSON parsing + field mapping
│   │   ├── conflationService.js    # ID/geometry matching, union-find, conflict rules
│   │   ├── parcelService.js
│   │   └── conflictService.js
│   ├── repositories/           # all SQL lives here
│   │   ├── mappingProfileRepo.js
│   │   ├── sourceParcelRepo.js
│   │   ├── unifiedParcelRepo.js
│   │   └── auditRepo.js
│   ├── dto/                    # Joi request/response validation schemas
│   │   ├── ingestSchema.js
│   │   ├── parcelSchema.js
│   │   └── conflictSchema.js
│   ├── middleware/
│   │   ├── validate.js
│   │   └── errorHandler.js
│   └── utils/
│       ├── AppError.js
│       ├── logger.js
│       ├── mapping.js          # generic field-mapping + unit-conversion engine
│       └── geo.js              # builds a small polygon from a lat/lon centroid
└── uploads/                    # scratch dir for incoming files (auto-created, gitignored)
```

This has been fully built and smoke-tested end-to-end (ingest → map → store →
conflate → search → flag → review → audit) against a real PostgreSQL 16 + PostGIS 3
instance while generating this deliverable.

---

## 2. Prerequisites

- Node.js 18+
- PostgreSQL 15+ with the PostGIS extension available (PostgreSQL 16 + PostGIS 3 was
  used for testing; anything 15+ works)

### Installing PostgreSQL + PostGIS (Ubuntu/Debian)

```bash
sudo apt-get update
sudo apt-get install -y postgresql postgresql-contrib postgis postgresql-postgis
sudo service postgresql start
```

(Package names vary slightly by PostgreSQL major version, e.g.
`postgresql-15-postgis-3` vs `postgresql-16-postgis-3` — install whichever matches
your installed `postgresql-<version>` package.)

---

## 3. Setup

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# edit .env with your DB host/user/password if different from defaults

# 3. Create the database (run as a Postgres superuser)
psql -U postgres -c "CREATE DATABASE land_conflation;"

# 4. Run migrations (enables PostGIS, creates tables + indexes)
npm run migrate

# 5. Seed the 3 sample mapping profiles (REVENUE_CSV_V1, SURVEY_XLSX_V1, MUNICIPAL_GEOJSON_V1)
npm run seed:mapping-profiles

# 6. (Re)generate the sample datasets (already included in db/seed/sample-data,
#    but you can regenerate them, e.g. with different random seeds/counts)
npm run seed:sample-data

# Steps 4-6 can also be run together:
npm run setup
```

## 4. Run

```bash
npm start
# or, for auto-restart on file changes:
npm run dev
```

Server listens on `http://localhost:3000` (configurable via `PORT` in `.env`).
All routes are under `/api/v1`.

```bash
curl http://localhost:3000/api/v1/health
# {"data":{"status":"ok"},"error":null,"meta":null}
```

---

## 5. Sample data & intentional conflicts

`db/seed/sample-data/` contains 3 datasets with **different schemas**, totalling
77 rows, deliberately engineered to exercise every conflict rule:

| Dataset | Format | Schema highlights |
|---|---|---|
| `revenue_dataset.csv` | CSV | `khasra_no`, `owner`, `area_acre`, `geometry_wkt` (full boundary as WKT polygon) |
| `survey_dataset.xlsx` | Excel | `PlotID`, `LandOwner`, `Area_Ha`, `Lat`/`Lon` (centroid only — the app builds a ~15m square footprint from this) |
| `municipal_dataset.geojson` | GeoJSON | `municipal_id`, `resident_name`, `plot_size_sqm`, full `Polygon` geometry |

Intentional conflict groups (see `EXPECTED_CONFLICTS.md` for the exact generated
parcel IDs each run):

- **Same parcel ID, different owner** → Revenue + Municipal share a khasra/municipal
  ID and footprint, but disagree on the registered owner → `OWNER_MISMATCH`.
- **Same geometry, different area** → Revenue + Municipal share ID and footprint,
  but one reports an area >10% off from the other → `AREA_MISMATCH`.
- **Slightly shifted geometry, same logical parcel** → Revenue + Survey use
  different ID formats entirely, but their boundaries sit within ~3m of each other
  → matched purely via `ST_DWithin`, not by ID (clean merge when everything else
  agrees; `OWNER_MISMATCH` in a few cases to test both paths at once).
- **3-way merge** → Revenue + Municipal (ID match) + Survey (geometry match) chain
  together into a single cluster via union-find, usually carrying more than one
  conflict type at once.
- **Wildly inconsistent footprint** → Revenue + Municipal share an ID, but the
  Municipal polygon is 2x+ larger and offset by ~12m → `GEOMETRY_CONFLICT`.
- Several single-source parcels (Revenue-only, Survey-only, Municipal-only) are
  included as a control group — these should conflate cleanly with
  `conflict_flag = false` and `status = RESOLVED`.

## 6. How conflation works (`src/services/conflationService.js`)

1. Load every row from `source_parcels`.
2. **Rule 1 — ID match:** SQL query finds all pairs whose normalized
   (whitespace-stripped, lowercased) `parcel_id` is identical.
3. **Rule 2 — geometry proximity:** `ST_DWithin(a.geometry::geography, b.geometry::geography, <CONFLATION_DISTANCE_METERS>)`
   finds all pairs within the configured distance (default 5m), using the
   `geography` cast so the threshold is genuinely in meters regardless of latitude
   (more accurate than a fixed degree offset).
4. Both rule outputs are fed into a union-find structure, so matches chain
   transitively (A↔B, B↔C ⇒ one cluster {A,B,C}) — this is what lets a 3-way
   Revenue+Municipal+Survey merge happen even though Survey never matched
   Municipal directly.
5. For each resulting cluster:
   - **Owner** resolved as the most frequent (mode) value; `OWNER_MISMATCH` if more
     than one distinct owner appears.
   - **Area** resolved as the average of reported areas; `AREA_MISMATCH` if any pair
     differs by more than `AREA_MISMATCH_THRESHOLD_PCT` (default 10%).
   - **Geometry** resolved via `ST_Union` across the cluster's footprints (or the
     single footprint if only one source contributed); `GEOMETRY_CONFLICT` if
     individual footprint areas disagree by more than 2x the area threshold,
     indicating the boundaries themselves — not just a reported number — don't
     line up.
   - `status` starts as `RESOLVED` for clean clusters or `PENDING_REVIEW` for
     conflicted ones.
6. `unified_parcels` is truncated and rebuilt on every run (simplest correct
   behaviour for an MVP — conflation is meant to be re-run after each ingestion
   batch). Each new unified parcel gets a `CREATED` row in `audit_log`.

All thresholds are configurable via `.env` (`CONFLATION_DISTANCE_METERS`,
`AREA_MISMATCH_THRESHOLD_PCT`, `GEOMETRY_OVERLAP_MIN_RATIO`).

## 7. Field mapping engine (`src/utils/mapping.js`, `db/seed/mapping-profiles.json`)

Mapping rules are stored in the `mapping_profiles` table as JSON, keyed by a
`profile_id` referenced from the ingest request:

```json
{
  "khasra_no":  { "target": "parcel_id" },
  "owner":      { "target": "owner_name" },
  "area_acre":  { "target": "area_sqm", "transform": "acres_to_sqm" }
}
```

Supported transforms: `identity`, `trim`, `uppercase`, `acres_to_sqm`,
`hectares_to_sqm`, `to_number`. Add more in `TRANSFORMS` in `src/utils/mapping.js`.
Any source columns not referenced by the mapping are preserved in
`source_parcels.raw_attributes` (JSONB), so nothing is silently dropped.

---

## 8. API reference & example calls

Base URL: `http://localhost:3000/api/v1`. All responses use the shape
`{ data, error, meta }`.

### Ingest a file

```bash
curl -X POST http://localhost:3000/api/v1/ingest \
  -F "file=@db/seed/sample-data/revenue_dataset.csv" \
  -F "sourceSystem=REVENUE" \
  -F "mappingProfileId=REVENUE_CSV_V1"

curl -X POST http://localhost:3000/api/v1/ingest \
  -F "file=@db/seed/sample-data/survey_dataset.xlsx" \
  -F "sourceSystem=SURVEY" \
  -F "mappingProfileId=SURVEY_XLSX_V1"

curl -X POST http://localhost:3000/api/v1/ingest \
  -F "file=@db/seed/sample-data/municipal_dataset.geojson" \
  -F "sourceSystem=MUNICIPAL" \
  -F "mappingProfileId=MUNICIPAL_GEOJSON_V1"
```

Each call re-runs conflation synchronously and returns both ingestion and
conflation stats, e.g.:

```json
{
  "data": {
    "ingestion": { "totalRows": 34, "ingested": 34, "errors": [] },
    "conflation": { "clustersCreated": 34, "conflictsFlagged": 0, "sourceRowsProcessed": 34 }
  },
  "error": null,
  "meta": { "sourceSystem": "REVENUE", "mappingProfileId": "REVENUE_CSV_V1", "fileType": "CSV" }
}
```

### Search unified parcels

```bash
curl "http://localhost:3000/api/v1/parcels/search?village=Ozar&limit=5"
curl "http://localhost:3000/api/v1/parcels/search?ownerName=Patil"
curl "http://localhost:3000/api/v1/parcels/search?parcelId=134/3"
```

### Get one unified parcel (with source parcels + audit trail)

```bash
curl "http://localhost:3000/api/v1/parcels/<unified_parcel_id>"
curl "http://localhost:3000/api/v1/parcels/<unified_parcel_id>/audit"
```

### List conflicts

```bash
curl "http://localhost:3000/api/v1/conflicts?status=PENDING_REVIEW"
curl "http://localhost:3000/api/v1/conflicts?conflictType=GEOMETRY_CONFLICT"
```

### Resolve/review a conflict

```bash
curl -X PATCH "http://localhost:3000/api/v1/conflicts/<unified_parcel_id>" \
  -H "Content-Type: application/json" \
  -d '{"status":"REVIEWED","notes":"Confirmed with tehsildar, resurvey requested","resolvedBy":"officer_priya"}'
```

---

## 9. Known MVP simplifications (documented, not hidden)

- Conflation rebuilds the entire `unified_parcels` table on every ingest rather
  than incrementally patching it — correct and simple for a 36-hour MVP and small
  datasets; would move to incremental/queued conflation for production scale.
- Shapefile/WFS ingestion is out of scope per the problem statement's own note
  ("you can assume pre-converted GeoJSON for MVP") — the GeoJSON path handles this.
- File uploads are processed synchronously; large files would need a background
  job queue (e.g. BullMQ) in a production build.
- `multer@1.x` is used for simplicity; it has known advisories fixed in `2.x` —
  fine for an MVP/hackathon demo, but swap to `multer@2` before any real deployment.
- Owner/area resolution uses simple mode/average heuristics — a production system
  would let a human reviewer pick the authoritative source per field.
