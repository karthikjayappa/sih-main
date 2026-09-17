const db = require('../config/db');

/**
 * Inserts one mapped source parcel row.
 * geometryGeoJSON, if provided, is stored via ST_SetSRID(ST_GeomFromGeoJSON(...), 4326).
 * geometryWkt, if provided instead, is stored via ST_GeomFromText(...).
 */
async function insert({
  parcelId, sourceSystem, mappingProfileId, ownerName, ownerId, areaSqm,
  village, tehsil, district, state, geometryGeoJSON, geometryWkt,
  coordinateSystem, rawAttributes,
}) {
  let geometryExpr = 'NULL';
  const params = [
    parcelId, sourceSystem, mappingProfileId, ownerName, ownerId, areaSqm,
    village, tehsil, district, state, coordinateSystem, rawAttributes || {},
  ];

  if (geometryGeoJSON) {
    geometryExpr = `ST_SetSRID(ST_GeomFromGeoJSON($13), 4326)`;
    params.push(JSON.stringify(geometryGeoJSON));
  } else if (geometryWkt) {
    geometryExpr = `ST_SetSRID(ST_GeomFromText($13), 4326)`;
    params.push(geometryWkt);
  }

  const { rows } = await db.query(
    `INSERT INTO source_parcels
      (parcel_id, source_system, mapping_profile_id, owner_name, owner_id, area_sqm,
       village, tehsil, district, state, coordinate_system, raw_attributes, geometry)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12, ${geometryExpr})
     RETURNING id, parcel_id, source_system`,
    params
  );
  return rows[0];
}

async function findAllForConflation() {
  const { rows } = await db.query(`
    SELECT id, parcel_id, source_system, owner_name, owner_id, area_sqm,
           village, tehsil, district, state, coordinate_system, raw_attributes,
           ST_AsGeoJSON(geometry) AS geometry_geojson,
           ST_Area(geometry::geography) AS geometry_area_sqm
    FROM source_parcels
    ORDER BY id
  `);
  return rows;
}

async function findByIds(ids) {
  if (!ids || ids.length === 0) return [];
  const { rows } = await db.query(
    `SELECT id, parcel_id, source_system, owner_name, owner_id, area_sqm,
            village, tehsil, district, state, coordinate_system, raw_attributes,
            ingested_at, ST_AsGeoJSON(geometry) AS geometry_geojson
     FROM source_parcels WHERE id = ANY($1) ORDER BY id`,
    [ids]
  );
  return rows;
}

/** Finds candidate pairs whose normalized parcel_id matches exactly across rows. */
async function findIdMatchPairs() {
  const { rows } = await db.query(`
    SELECT a.id AS a_id, b.id AS b_id
    FROM source_parcels a
    JOIN source_parcels b
      ON a.id < b.id
     AND lower(regexp_replace(a.parcel_id, '\\s+', '', 'g')) =
         lower(regexp_replace(b.parcel_id, '\\s+', '', 'g'))
  `);
  return rows;
}

/** Finds candidate pairs whose geometries are within `distanceMeters` of each other (PostGIS ST_DWithin on geography). */
async function findGeometryMatchPairs(distanceMeters) {
  const { rows } = await db.query(
    `
    SELECT a.id AS a_id, b.id AS b_id
    FROM source_parcels a
    JOIN source_parcels b
      ON a.id < b.id
     AND a.geometry IS NOT NULL AND b.geometry IS NOT NULL
     AND ST_DWithin(a.geometry::geography, b.geometry::geography, $1)
    `,
    [distanceMeters]
  );
  return rows;
}

/** Whether geometries of two rows intersect at all (PostGIS ST_Intersects). */
async function geometriesIntersect(idA, idB) {
  const { rows } = await db.query(
    `SELECT ST_Intersects(a.geometry, b.geometry) AS intersects
     FROM source_parcels a, source_parcels b
     WHERE a.id = $1 AND b.id = $2`,
    [idA, idB]
  );
  return rows[0] ? rows[0].intersects : false;
}

/** Computes the union geometry (PostGIS ST_Union) for a group of source parcel ids. */
async function unionGeometry(ids) {
  const { rows } = await db.query(
    `SELECT ST_AsGeoJSON(ST_Union(geometry)) AS geometry_geojson,
            ST_Area(ST_Union(geometry)::geography) AS union_area_sqm
     FROM source_parcels WHERE id = ANY($1) AND geometry IS NOT NULL`,
    [ids]
  );
  return rows[0];
}

module.exports = {
  insert,
  findAllForConflation,
  findByIds,
  findIdMatchPairs,
  findGeometryMatchPairs,
  geometriesIntersect,
  unionGeometry,
};
