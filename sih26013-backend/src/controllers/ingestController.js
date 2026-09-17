const fs = require('fs');
const path = require('path');
const AppError = require('../utils/AppError');
const ingestionService = require('../services/ingestionService');
const conflationService = require('../services/conflationService');

const EXT_TO_FILETYPE = { '.csv': 'CSV', '.xlsx': 'XLSX', '.xls': 'XLSX', '.geojson': 'GEOJSON', '.json': 'GEOJSON' };

async function ingest(req, res, next) {
  try {
    if (!req.file) throw new AppError('No file uploaded. Attach it under the "file" field.', 400);

    const { sourceSystem, mappingProfileId } = req.body;
    const ext = path.extname(req.file.originalname).toLowerCase();
    const fileType = EXT_TO_FILETYPE[ext];
    if (!fileType) throw new AppError(`Unsupported file extension "${ext}". Use .csv, .xlsx, or .geojson`, 422);

    const result = await ingestionService.ingestFile({
      filePath: req.file.path,
      fileType,
      sourceSystem,
      mappingProfileId,
    });

    // Re-run conflation synchronously so the unified layer reflects the new data immediately.
    // (For larger datasets this would be queued as an async job instead.)
    const conflationResult = await conflationService.runConflation();

    fs.unlink(req.file.path, () => {}); // best-effort cleanup of the uploaded temp file

    res.status(201).json({
      data: { ingestion: result, conflation: conflationResult },
      error: null,
      meta: { sourceSystem, mappingProfileId, fileType },
    });
  } catch (err) {
    if (req.file) fs.unlink(req.file.path, () => {});
    next(err);
  }
}

module.exports = { ingest };
