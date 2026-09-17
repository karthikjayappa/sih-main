-- 005_audit_log.sql
CREATE TABLE IF NOT EXISTS audit_log (
    id                 SERIAL PRIMARY KEY,
    unified_parcel_id  UUID NOT NULL REFERENCES unified_parcels(unified_parcel_id) ON DELETE CASCADE,
    action             VARCHAR(50) NOT NULL,     -- CREATED / STATUS_CHANGED / FIELD_UPDATED
    changed_by         VARCHAR(150),
    notes              TEXT,
    old_value          JSONB,
    new_value          JSONB,
    created_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);
