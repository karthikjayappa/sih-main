const db = require('../config/db');

/**
 * Inserts a unified parcel. If geometryGeoJSON is provided it's stored directly;
 * this is normally the ST_Union result already computed by the conflation service.
 */
async function insert({
  sourceParcelIds, ownerName, areaSqm, geometryGeoJSON,
  village, tehsil, district, state, conflictFlag, conflictTypes, status,
}) {
  const { rows } = await db.query(
    `INSERT INTO unified_parcels
      (source_parcel_ids, owner_name, area_sqm, geometry, village, tehsil, district, state,
       conflict_flag, conflict_types, status)
     VALUES ($1,$2,$3, ${geometryGeoJSON ? 'ST_SetSRID(ST_GeomFromGeoJSON($4), 4326)' : 'NULL'},
             $5,$6,$7,$8,$9,$10,$11)
     RETURNING unified_parcel_id, created_at`,
    geometryGeoJSON
      ? [sourceParcelIds, ownerName, areaSqm, JSON.stringify(geometryGeoJSON), village, tehsil, district, state, conflictFlag, conflictTypes, status]
      : [sourceParcelIds, ownerName, areaSqm, village, tehsil, district, state, conflictFlag, conflictTypes, status]
  );
  return rows[0];
}

/** Deletes all unified parcels (conflation is re-run from scratch for MVP simplicity). Audit log cascades. */
async function deleteAll() {
  await db.query('DELETE FROM unified_parcels');
}

async function findById(id) {
  const { rows } = await db.query(
    `SELECT unified_parcel_id, source_parcel_ids, owner_name, area_sqm,
            ST_AsGeoJSON(geometry) AS geometry_geojson,
            village, tehsil, district, state, conflict_flag, conflict_types,
            status, created_at, updated_at
     FROM unified_parcels WHERE unified_parcel_id = $1`,
    [id]
  );
  return rows[0] || null;
}

function buildSearchWhere({ q, parcelId, ownerName, village, tehsil, district }) {
  const clauses = [];
  const params = [];

  if (q) {
    params.push(`%${q}%`);
    clauses.push(`(owner_name ILIKE $${params.length} OR village ILIKE $${params.length} OR tehsil ILIKE $${params.length} OR district ILIKE $${params.length})`);
  }
  if (parcelId) {
    params.push(parcelId);
    // A unified parcel matches parcelId if ANY of its source parcels carried that id.
    clauses.push(`EXISTS (SELECT 1 FROM source_parcels sp WHERE sp.id = ANY(unified_parcels.source_parcel_ids) AND sp.parcel_id ILIKE $${params.length})`);
  }
  if (ownerName) {
    params.push(`%${ownerName}%`);
    clauses.push(`owner_name ILIKE $${params.length}`);
  }
  if (village) {
    params.push(`%${village}%`);
    clauses.push(`village ILIKE $${params.length}`);
  }
  if (tehsil) {
    params.push(`%${tehsil}%`);
    clauses.push(`tehsil ILIKE $${params.length}`);
  }
  if (district) {
    params.push(`%${district}%`);
    clauses.push(`district ILIKE $${params.length}`);
  }

  return { whereSql: clauses.length ? `WHERE ${clauses.join(' AND ')}` : '', params };
}

async function search({ q, parcelId, ownerName, village, tehsil, district, page, limit }) {
  const { whereSql, params } = buildSearchWhere({ q, parcelId, ownerName, village, tehsil, district });
  const offset = (page - 1) * limit;
  params.push(limit, offset);

  const { rows } = await db.query(
    `SELECT unified_parcel_id, owner_name, area_sqm, village, tehsil, district, state,
            conflict_flag, conflict_types, status, created_at
     FROM unified_parcels
     ${whereSql}
     ORDER BY created_at DESC
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  );

  const countParams = params.slice(0, params.length - 2);
  const { rows: countRows } = await db.query(
    `SELECT COUNT(*)::int AS total FROM unified_parcels ${whereSql}`,
    countParams
  );

  return { items: rows, total: countRows[0].total };
}

async function findConflicts({ status, conflictType, village, tehsil, page, limit }) {
  const clauses = ['conflict_flag = true'];
  const params = [];

  if (status) {
    params.push(status);
    clauses.push(`status = $${params.length}`);
  }
  if (conflictType) {
    params.push(conflictType);
    clauses.push(`$${params.length} = ANY(conflict_types)`);
  }
  if (village) {
    params.push(`%${village}%`);
    clauses.push(`village ILIKE $${params.length}`);
  }
  if (tehsil) {
    params.push(`%${tehsil}%`);
    clauses.push(`tehsil ILIKE $${params.length}`);
  }

  const whereSql = `WHERE ${clauses.join(' AND ')}`;
  const offset = (page - 1) * limit;
  params.push(limit, offset);

  const { rows } = await db.query(
    `SELECT unified_parcel_id, owner_name, area_sqm, village, tehsil, district, state,
            conflict_flag, conflict_types, status, created_at
     FROM unified_parcels
     ${whereSql}
     ORDER BY created_at DESC
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  );

  const countParams = params.slice(0, params.length - 2);
  const { rows: countRows } = await db.query(
    `SELECT COUNT(*)::int AS total FROM unified_parcels ${whereSql}`,
    countParams
  );

  return { items: rows, total: countRows[0].total };
}

async function updateStatus(id, status) {
  const { rows } = await db.query(
    `UPDATE unified_parcels SET status = $2, updated_at = now()
     WHERE unified_parcel_id = $1
     RETURNING unified_parcel_id, status, updated_at`,
    [id, status]
  );
  return rows[0] || null;
}

module.exports = {
  insert, deleteAll, findById, search, findConflicts, updateStatus,
};
