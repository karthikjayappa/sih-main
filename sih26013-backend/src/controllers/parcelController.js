const parcelService = require('../services/parcelService');

async function search(req, res, next) {
  try {
    const result = await parcelService.search(req.query);
    res.status(200).json({
      data: result.items,
      error: null,
      meta: { total: result.total, page: result.page, limit: result.limit },
    });
  } catch (err) { next(err); }
}

async function getById(req, res, next) {
  try {
    const parcel = await parcelService.getById(req.params.id);
    res.status(200).json({ data: parcel, error: null, meta: null });
  } catch (err) { next(err); }
}

async function getAudit(req, res, next) {
  try {
    const auditLog = await parcelService.getAudit(req.params.id);
    res.status(200).json({ data: auditLog, error: null, meta: { total: auditLog.length } });
  } catch (err) { next(err); }
}

module.exports = { search, getById, getAudit };
