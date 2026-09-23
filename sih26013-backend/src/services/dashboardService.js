const db = require('../config/db');

async function getStats() {
  const [
    totalParcelsResult,
    unifiedParcelsResult,
    conflictsResult,
    resolvedResult,
    parcelsBySourceResult,
    conflictsByTypeResult,
    ingestionTrendResult,
  ] = await Promise.all([
    db.query(`
      SELECT COUNT(*)::int AS count
      FROM source_parcels
    `),

    db.query(`
      SELECT COUNT(*)::int AS count
      FROM unified_parcels
    `),

    db.query(`
      SELECT COUNT(*)::int AS count
      FROM unified_parcels
      WHERE conflict_flag = true
    `),

    db.query(`
      SELECT COUNT(*)::int AS count
      FROM unified_parcels
      WHERE status = 'RESOLVED'
    `),

    db.query(`
      SELECT
        source_system AS source,
        COUNT(*)::int AS count
      FROM source_parcels
      GROUP BY source_system
      ORDER BY source_system
    `),

    db.query(`
      SELECT
        conflict_type AS type,
        COUNT(*)::int AS count
      FROM unified_parcels,
           unnest(conflict_types) AS conflict_type
      GROUP BY conflict_type
      ORDER BY count DESC
    `),

    db.query(`
      SELECT
        TO_CHAR(day, 'YYYY-MM-DD') AS date,
        COUNT(up.unified_parcel_id)::int AS count
      FROM generate_series(
        CURRENT_DATE - INTERVAL '6 days',
        CURRENT_DATE,
        INTERVAL '1 day'
      ) AS day
      LEFT JOIN unified_parcels up
        ON DATE(up.created_at) = day::date
      GROUP BY day
      ORDER BY day
    `),
  ]);

  return {
    totalParcelsIngested: totalParcelsResult.rows[0].count,
    unifiedParcelsCreated: unifiedParcelsResult.rows[0].count,
    conflictsDetected: conflictsResult.rows[0].count,
    conflictsResolved: resolvedResult.rows[0].count,

    parcelsBySource: parcelsBySourceResult.rows.map((row) => ({
      source: row.source,
      count: row.count,
    })),

    conflictsByType: conflictsByTypeResult.rows.map((row) => ({
      type: row.type,
      count: row.count,
    })),

    ingestionTrend: ingestionTrendResult.rows.map((row) => ({
      date: row.date,
      count: row.count,
    })),
  };
}

module.exports = { getStats };
