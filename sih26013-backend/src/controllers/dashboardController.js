const dashboardService = require('../services/dashboardService');

async function stats(req, res, next) {
  try {
    const result = await dashboardService.getStats();

    res.status(200).json({
      data: result,
      error: null,
      meta: null,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { stats };
