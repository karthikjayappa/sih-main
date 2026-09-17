-- 006_indexes.sql
CREATE INDEX IF NOT EXISTS idx_source_parcels_parcel_id ON source_parcels (parcel_id);
CREATE INDEX IF NOT EXISTS idx_source_parcels_source_system ON source_parcels (source_system);
CREATE INDEX IF NOT EXISTS idx_source_parcels_geometry_gist ON source_parcels USING GIST (geometry);
CREATE INDEX IF NOT EXISTS idx_source_parcels_village ON source_parcels (village);
CREATE INDEX IF NOT EXISTS idx_source_parcels_district ON source_parcels (district);

CREATE INDEX IF NOT EXISTS idx_unified_parcels_geometry_gist ON unified_parcels USING GIST (geometry);
CREATE INDEX IF NOT EXISTS idx_unified_parcels_status ON unified_parcels (status);
CREATE INDEX IF NOT EXISTS idx_unified_parcels_conflict_flag ON unified_parcels (conflict_flag);
CREATE INDEX IF NOT EXISTS idx_unified_parcels_owner_name ON unified_parcels (owner_name);
CREATE INDEX IF NOT EXISTS idx_unified_parcels_village ON unified_parcels (village);

CREATE INDEX IF NOT EXISTS idx_audit_log_unified_parcel_id ON audit_log (unified_parcel_id);
