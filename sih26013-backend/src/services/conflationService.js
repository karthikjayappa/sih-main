const env = require('../config/env');
const logger = require('../utils/logger');
const sourceParcelRepo = require('../repositories/sourceParcelRepo');
const unifiedParcelRepo = require('../repositories/unifiedParcelRepo');
const auditRepo = require('../repositories/auditRepo');

/** Tiny union-find (disjoint set) for grouping matched source-parcel ids into clusters. */
class UnionFind {
  constructor() { this.parent = new Map(); }
  find(x) {
    if (!this.parent.has(x)) this.parent.set(x, x);
    if (this.parent.get(x) !== x) this.parent.set(x, this.find(this.parent.get(x)));
    return this.parent.get(x);
  }
  union(a, b) {
    const ra = this.find(a);
    const rb = this.find(b);
    if (ra !== rb) this.parent.set(ra, rb);
  }
}

function normalizedId(parcelId) {
  return String(parcelId).replace(/\s+/g, '').toLowerCase();
}

function mostFrequent(values) {
  const counts = new Map();
  for (const v of values) {
    if (v === null || v === undefined) continue;
    counts.set(v, (counts.get(v) || 0) + 1);
  }
  let best = null;
  let bestCount = -1;
  for (const [v, c] of counts.entries()) {
    if (c > bestCount) { best = v; bestCount = c; }
  }
  return best;
}

function pct(a, b) {
  if (a === 0 && b === 0) return 0;
  const base = Math.max(Math.abs(a), Math.abs(b), 1e-9);
  return (Math.abs(a - b) / base) * 100;
}

/**
 * Resolves owner_name/area_sqm/conflict flags for one cluster of source_parcel rows
 * (rows already include geometry_geojson + geometry_area_sqm from the repository).
 */
function resolveCluster(members) {
  const conflictTypes = new Set();

  // --- Owner resolution ---
  const owners = [...new Set(members.map((m) => (m.owner_name || '').trim()).filter(Boolean))];
  const resolvedOwner = mostFrequent(members.map((m) => m.owner_name).filter(Boolean)) || null;
  if (owners.length > 1) conflictTypes.add('OWNER_MISMATCH');

  // --- Area resolution ---
  const areas = members.map((m) => (m.area_sqm !== null && m.area_sqm !== undefined ? Number(m.area_sqm) : null)).filter((a) => a !== null);
  let resolvedArea = null;
  if (areas.length > 0) {
    resolvedArea = Math.round((areas.reduce((s, a) => s + a, 0) / areas.length) * 100) / 100;
    const maxDiffPct = Math.max(...areas.flatMap((a, i) => areas.slice(i + 1).map((b) => pct(a, b))), 0);
    if (maxDiffPct > env.conflation.areaMismatchThresholdPct) conflictTypes.add('AREA_MISMATCH');
  }

  // --- Geometry consistency: compare each member's own footprint area to the
  //     unioned cluster geometry area. A big mismatch means shapes don't line up
  //     (e.g. one source's polygon is far larger/offset from the others). ---
  const geomAreas = members.map((m) => (m.geometry_area_sqm !== null && m.geometry_area_sqm !== undefined ? Number(m.geometry_area_sqm) : null)).filter((a) => a !== null && a > 0);
  if (geomAreas.length > 1) {
    const maxGeomDiffPct = Math.max(...geomAreas.flatMap((a, i) => geomAreas.slice(i + 1).map((b) => pct(a, b))), 0);
    // A footprint-area mismatch beyond ~2x the area-mismatch threshold, combined
    // with more than one independent geometry, indicates the boundaries
    // themselves disagree (not just the reported attribute) -> GEOMETRY_CONFLICT.
    if (maxGeomDiffPct > env.conflation.areaMismatchThresholdPct * 2) {
      conflictTypes.add('GEOMETRY_CONFLICT');
    }
  }

  return {
    resolvedOwner,
    resolvedArea,
    conflictFlag: conflictTypes.size > 0,
    conflictTypes: [...conflictTypes],
  };
}

function pickMode(values) {
  return mostFrequent(values.filter(Boolean));
}

/**
 * Re-runs the full conflation pipeline from scratch over every source_parcel row:
 *   1. Build candidate-match edges via exact (normalized) parcel_id equality.
 *   2. Build candidate-match edges via PostGIS ST_DWithin geometry proximity.
 *   3. Union-find the edges into clusters (connected components).
 *   4. For each cluster, resolve owner/area, detect conflicts, union geometry (ST_Union),
 *      and write one unified_parcels row + a CREATED audit_log entry.
 *
 * MVP simplification: unified_parcels is truncated and rebuilt each run, since
 * this is designed to be re-run after each ingestion batch, not incrementally patched.
 */
async function runConflation() {
  const rows = await sourceParcelRepo.findAllForConflation();
  if (rows.length === 0) {
    return { clustersCreated: 0, conflictsFlagged: 0, sourceRowsProcessed: 0 };
  }

  const byId = new Map(rows.map((r) => [r.id, r]));
  const uf = new UnionFind();
  rows.forEach((r) => uf.find(r.id));

  // Rule 1: ID-based matching (normalized string equality) - delegated to SQL for efficiency.
  const idPairs = await sourceParcelRepo.findIdMatchPairs();
  idPairs.forEach(({ a_id, b_id }) => uf.union(a_id, b_id));

  // Rule 2: geometry distance threshold (PostGIS ST_DWithin on geography, meters).
  const geomPairs = await sourceParcelRepo.findGeometryMatchPairs(env.conflation.distanceMeters);
  geomPairs.forEach(({ a_id, b_id }) => uf.union(a_id, b_id));

  // Group rows by cluster root.
  const clusters = new Map();
  for (const r of rows) {
    const root = uf.find(r.id);
    if (!clusters.has(root)) clusters.set(root, []);
    clusters.get(root).push(r);
  }

  await unifiedParcelRepo.deleteAll();

  let conflictsFlagged = 0;
  for (const members of clusters.values()) {
    const ids = members.map((m) => m.id);
    const { resolvedOwner, resolvedArea, conflictFlag, conflictTypes } = resolveCluster(members);

    let geometryGeoJSON = null;
    if (ids.length === 1) {
      geometryGeoJSON = members[0].geometry_geojson ? JSON.parse(members[0].geometry_geojson) : null;
    } else {
      const unioned = await sourceParcelRepo.unionGeometry(ids);
      geometryGeoJSON = unioned && unioned.geometry_geojson ? JSON.parse(unioned.geometry_geojson) : null;
    }

    const village = pickMode(members.map((m) => m.village));
    const tehsil = pickMode(members.map((m) => m.tehsil));
    const district = pickMode(members.map((m) => m.district));
    const state = pickMode(members.map((m) => m.state));

    const status = conflictFlag ? 'PENDING_REVIEW' : 'RESOLVED';

    const inserted = await unifiedParcelRepo.insert({
      sourceParcelIds: ids,
      ownerName: resolvedOwner,
      areaSqm: resolvedArea,
      geometryGeoJSON,
      village, tehsil, district, state,
      conflictFlag,
      conflictTypes,
      status,
    });

    if (conflictFlag) conflictsFlagged += 1;

    await auditRepo.record({
      unifiedParcelId: inserted.unified_parcel_id,
      action: 'CREATED',
      changedBy: 'system:conflation-engine',
      notes: `Created from ${ids.length} source parcel(s) via automated conflation`,
      oldValue: null,
      newValue: {
        source_parcel_ids: ids,
        source_systems: [...new Set(members.map((m) => m.source_system))],
        conflict_flag: conflictFlag,
        conflict_types: conflictTypes,
      },
    });
  }

  logger.info(`Conflation complete: ${clusters.size} unified parcels created, ${conflictsFlagged} flagged with conflicts (out of ${rows.length} source rows).`);
  return { clustersCreated: clusters.size, conflictsFlagged, sourceRowsProcessed: rows.length };
}

module.exports = { runConflation, normalizedId };
