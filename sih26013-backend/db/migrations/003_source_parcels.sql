-- 003_source_parcels.sql
-- Raw, per-source parcel records after mapping into the common land data model
CREATE TABLE IF NOT EXISTS source_parcels (
    id                  SERIAL PRIMARY KEY,
    parcel_id           VARCHAR(150) NOT NULL,
    source_system       VARCHAR(50)  NOT NULL CHECK (source_system IN ('REVENUE','SURVEY','MUNICIPAL','REGISTRATION','OTHER')),
    mapping_profile_id  VARCHAR(100),
    owner_name          VARCHAR(255),
    owner_id            VARCHAR(100),
    area_sqm            NUMERIC(14,2),
    village             VARCHAR(150),
    tehsil              VARCHAR(150),
    district            VARCHAR(150),
    state               VARCHAR(150),
    geometry            geometry(Geometry, 4326),
    coordinate_system   VARCHAR(50),
    raw_attributes      JSONB DEFAULT '{}'::jsonb,
    ingested_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);
