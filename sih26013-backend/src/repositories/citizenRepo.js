const db = require('../config/db');

async function findByBhuDhaarId(bhudhaarId) {
  const { rows } = await db.query(
    `SELECT
        ca.bhudhaar_id,
        up.unified_parcel_id,
        up.owner_name,
        up.area_sqm,
        up.land_use,
        ST_AsGeoJSON(up.geometry) AS geometry,
        up.village,
        up.tehsil,
        up.district,
        up.state,
        up.conflict_flag,
        up.conflict_types,
        up.status,
        up.created_at,
        up.updated_at
     FROM citizen_accounts ca
     JOIN unified_parcels up
       ON ca.unified_parcel_id = up.unified_parcel_id
     WHERE ca.bhudhaar_id = $1`,
    [bhudhaarId]
  );

  return rows[0] || null;
}

module.exports = {
  findByBhuDhaarId,
};
