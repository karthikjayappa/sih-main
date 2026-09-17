const fs = require('fs');
const { parse: parseCsv } = require('csv-parse/sync');
const XLSX = require('xlsx');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');
const { applyMapping } = require('../utils/mapping');
const { pointToSquarePolygon } = require('../utils/geo');
const mappingProfileRepo = require('../repositories/mappingProfileRepo');
const sourceParcelRepo = require('../repositories/sourceParcelRepo');

function readCsvRows(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  return parseCsv(content, { columns: true, skip_empty_lines: true, trim: true });
}

function readXlsxRows(filePath) {
  const wb = XLSX.readFile(filePath);
  const sheetName = wb.SheetNames[0];
  return XLSX.utils.sheet_to_json(wb.Sheets[sheetName], { defval: null });
}

function readGeoJsonFeatures(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const parsed = JSON.parse(content);
  if (parsed.type !== 'FeatureCollection' || !Array.isArray(parsed.features)) {
    throw new AppError('GeoJSON file must be a FeatureCollection with a features array', 422);
  }
  return parsed.features;
}

/**
 * Builds the geometry payload (either GeoJSON or WKT) for one mapped row, in
 * priority order: explicit geometry_wkt field > explicit GeoJSON feature
 * geometry > synthesized square polygon from centroid_lat/centroid_lon.
 */
function resolveGeometry(mapped, featureGeometry) {
  if (mapped.geometry_wkt) {
    return { geometryWkt: mapped.geometry_wkt, geometryGeoJSON: null };
  }
  if (featureGeometry) {
    return { geometryWkt: null, geometryGeoJSON: featureGeometry };
  }
  if (mapped.centroid_lat !== undefined && mapped.centroid_lon !== undefined
      && mapped.centroid_lat !== null && mapped.centroid_lon !== null) {
    const lat = Number(mapped.centroid_lat);
    const lon = Number(mapped.centroid_lon);
    if (!Number.isNaN(lat) && !Number.isNaN(lon)) {
      return { geometryWkt: null, geometryGeoJSON: pointToSquarePolygon(lat, lon, 15) };
    }
  }
  return { geometryWkt: null, geometryGeoJSON: null };
}

async function ingestFile({ filePath, fileType, sourceSystem, mappingProfileId }) {
  const profile = await mappingProfileRepo.findByProfileId(mappingProfileId);
  if (!profile) {
    throw new AppError(`Unknown mappingProfileId "${mappingProfileId}"`, 404);
  }
  if (profile.source_system !== sourceSystem) {
    throw new AppError(
      `mappingProfileId "${mappingProfileId}" is registered for source_system "${profile.source_system}", not "${sourceSystem}"`,
      422
    );
  }

  let rawRows = [];
  let featureGeometries = [];

  if (fileType === 'CSV') {
    rawRows = readCsvRows(filePath);
  } else if (fileType === 'XLSX') {
    rawRows = readXlsxRows(filePath);
  } else if (fileType === 'GEOJSON') {
    const features = readGeoJsonFeatures(filePath);
    rawRows = features.map((f) => f.properties || {});
    featureGeometries = features.map((f) => f.geometry || null);
  } else {
    throw new AppError(`Unsupported fileType "${fileType}". Use CSV, XLSX, or GEOJSON.`, 422);
  }

  const results = { totalRows: rawRows.length, ingested: 0, errors: [] };

  for (let i = 0; i < rawRows.length; i += 1) {
    try {
      const { mapped, unmapped } = applyMapping(rawRows[i], profile.field_mappings);

      if (!mapped.parcel_id) {
        throw new AppError(`Row ${i + 1}: mapped result has no parcel_id (check mapping profile)`, 422);
      }

      const { geometryWkt, geometryGeoJSON } = resolveGeometry(mapped, featureGeometries[i]);

      await sourceParcelRepo.insert({
        parcelId: String(mapped.parcel_id),
        sourceSystem,
        mappingProfileId,
        ownerName: mapped.owner_name || null,
        ownerId: mapped.owner_id || null,
        areaSqm: mapped.area_sqm !== undefined && mapped.area_sqm !== null ? Number(mapped.area_sqm) : null,
        village: mapped.village || null,
        tehsil: mapped.tehsil || null,
        district: mapped.district || null,
        state: mapped.state || null,
        coordinateSystem: mapped.coordinate_system || null,
        geometryGeoJSON,
        geometryWkt,
        rawAttributes: unmapped,
      });
      results.ingested += 1;
    } catch (err) {
      logger.warn(`Ingestion row ${i + 1} failed`, err.message);
      results.errors.push({ row: i + 1, message: err.message });
    }
  }

  logger.info(`Ingested ${results.ingested}/${results.totalRows} rows from ${fileType} (${sourceSystem}/${mappingProfileId})`);
  return results;
}

module.exports = { ingestFile };
