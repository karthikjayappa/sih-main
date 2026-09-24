CREATE TABLE IF NOT EXISTS citizen_accounts (
    id                 SERIAL PRIMARY KEY,
    bhudhaar_id        VARCHAR(100) NOT NULL UNIQUE,
    unified_parcel_id  UUID NOT NULL REFERENCES unified_parcels(unified_parcel_id) ON DELETE CASCADE,
    created_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_citizen_accounts_bhudhaar
    ON citizen_accounts(bhudhaar_id);
