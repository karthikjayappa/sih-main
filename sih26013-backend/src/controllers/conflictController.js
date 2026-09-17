const conflictService = require('../services/conflictService');

async function list(req, res, next) {
  try {
    const result = await conflictService.list(req.query);
    res.status(200).json({
      data: result.items,
      error: null,
      meta: { total: result.total, page: result.page, limit: result.limit },
    });
  } catch (err) { next(err); }
}

async function update(req, res, next) {
  try {
    const updated = await conflictService.updateStatus(req.params.unifiedParcelId, req.body);
    res.status(200).json({ data: updated, error: null, meta: null });
  } catch (err) { next(err); }
}

module.exports = { list, update };
