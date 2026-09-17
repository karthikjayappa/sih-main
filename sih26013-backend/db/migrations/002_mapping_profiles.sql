-- 002_mapping_profiles.sql
-- Stores configurable field-mapping rules used by the ingestion module
CREATE TABLE IF NOT EXISTS mapping_profiles (
    id              SERIAL PRIMARY KEY,
    profile_id      VARCHAR(100) UNIQUE NOT NULL,   -- e.g. REVENUE_CSV_V1
    source_system   VARCHAR(50)  NOT NULL,          -- REVENUE / SURVEY / MUNICIPAL / REGISTRATION / OTHER
    file_type       VARCHAR(20)  NOT NULL,          -- CSV / XLSX / GEOJSON
    description     TEXT,
    field_mappings  JSONB NOT NULL,                 -- { "sourceField": { "target": "...", "transform": "..." } }
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
