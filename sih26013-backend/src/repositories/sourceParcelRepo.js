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

/** Finds candidate pairs with matching survey numbers, locations, and geometry overlap. */
async function findIdMatchPairs() {
  const { rows } = await db.query(`
    SELECT
      a.id AS a_id,
      b.id AS b_id
    FROM source_parcels a
    JOIN source_parcels b
      ON a.id < b.id
     AND a.source_system <> b.source_system

     -- Same administrative location
     AND lower(trim(coalesce(a.district, ''))) =
         lower(trim(coalesce(b.district, '')))

     AND lower(trim(coalesce(a.tehsil, ''))) =
         lower(trim(coalesce(b.tehsil, '')))

     AND lower(trim(coalesce(a.village, ''))) =
         lower(trim(coalesce(b.village, '')))

     -- Same cadastral survey number
     AND lower(trim(coalesce(a.raw_attributes->>'survey_number', ''))) =
         lower(trim(coalesce(b.raw_attributes->>'survey_number', '')))

     -- Survey number must exist
     AND trim(coalesce(a.raw_attributes->>'survey_number', '')) <> ''

     -- The physical parcel must substantially overlap.
     AND a.geometry IS NOT NULL
     AND b.geometry IS NOT NULL
     AND ST_Intersects(a.geometry, b.geometry)

     -- At least 90% of the smaller parcel overlaps the larger one.
     AND ST_Area(
           ST_Intersection(a.geometry, b.geometry)::geography
         )
         /
         NULLIF(
           LEAST(
             ST_Area(a.geometry::geography),
             ST_Area(b.geometry::geography)
           ),
           0
         ) >= 0.90
  `);

  return rows;
}

/** Finds candidate pairs whose geometries are within `distanceMeters` of each other (PostGIS ST_DWithin on geography). */
async function findGeometryMatchPairs(distanceMeters) {
  // Geometry proximity is NOT used for automatic parcel merging.
  // Cadastral parcels can be adjacent to each other, so ST_DWithin
  // can incorrectly merge neighboring parcels into large clusters.
  return [];
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
