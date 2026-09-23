const conflationService = require('../services/conflationService');

async function run(req, res, next) {
  try {
    const result = await conflationService.runConflation();

    res.status(200).json({
      data: result,
      error: null,
      meta: {
        action: 'CONFLATION_RUN',
        triggeredBy: 'manual',
      },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { run };
