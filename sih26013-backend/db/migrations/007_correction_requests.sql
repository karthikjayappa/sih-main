-- 007_correction_requests.sql
CREATE TABLE IF NOT EXISTS correction_requests (
    id                 SERIAL PRIMARY KEY,
    unified_parcel_id  UUID NOT NULL REFERENCES unified_parcels(unified_parcel_id) ON DELETE CASCADE,
    citizen_id         VARCHAR(150) NOT NULL,
    issue_type         VARCHAR(50) NOT NULL,
    description        TEXT NOT NULL,
    status             VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    submitted_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    reviewed_at        TIMESTAMPTZ,
    reviewed_by        VARCHAR(150),
    review_notes       TEXT
);
