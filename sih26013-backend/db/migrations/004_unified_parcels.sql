-- 004_unified_parcels.sql
-- Harmonized / conflated parcel layer exposed via the API
CREATE TABLE IF NOT EXISTS unified_parcels (
    unified_parcel_id  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_parcel_ids  INTEGER[] NOT NULL DEFAULT '{}',
    owner_name         VARCHAR(255),
    area_sqm           NUMERIC(14,2),
    geometry           geometry(Geometry, 4326),
    village            VARCHAR(150),
    tehsil             VARCHAR(150),
    district            VARCHAR(150),
    state              VARCHAR(150),
    conflict_flag      BOOLEAN NOT NULL DEFAULT false,
    conflict_types     TEXT[] NOT NULL DEFAULT '{}',
    status             VARCHAR(20) NOT NULL DEFAULT 'PENDING_REVIEW'
                        CHECK (status IN ('PENDING_REVIEW','REVIEWED','RESOLVED')),
    created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);
