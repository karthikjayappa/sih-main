const AppError = require('../utils/AppError');
const unifiedParcelRepo = require('../repositories/unifiedParcelRepo');
const sourceParcelRepo = require('../repositories/sourceParcelRepo');
const auditRepo = require('../repositories/auditRepo');

async function search(params) {
  const { items, total } = await unifiedParcelRepo.search(params);
  return { items, total, page: params.page, limit: params.limit };
}

async function getById(id) {
  const unified = await unifiedParcelRepo.findById(id);
  if (!unified) throw new AppError(`Unified parcel ${id} not found`, 404);

  const sourceParcels = await sourceParcelRepo.findByIds(unified.source_parcel_ids);
  const auditLog = await auditRepo.findByUnifiedParcelId(id);

  return {
    ...unified,
    geometry: unified.geometry_geojson ? JSON.parse(unified.geometry_geojson) : null,
    geometry_geojson: undefined,
    sourceParcels: sourceParcels.map((sp) => ({
      ...sp,
      geometry: sp.geometry_geojson ? JSON.parse(sp.geometry_geojson) : null,
      geometry_geojson: undefined,
    })),
    auditLog,
  };
}

async function getAudit(id) {
  const unified = await unifiedParcelRepo.findById(id);
  if (!unified) throw new AppError(`Unified parcel ${id} not found`, 404);
  return auditRepo.findByUnifiedParcelId(id);
}

module.exports = { search, getById, getAudit };
