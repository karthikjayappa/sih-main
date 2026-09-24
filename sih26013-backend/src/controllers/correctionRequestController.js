const correctionRequestService = require('../services/correctionRequestService');

async function create(req, res, next) {
  try {
    const request = await correctionRequestService.create(req.body);

    res.status(201).json({
      data: request,
      error: null,
      meta: null,
    });
  } catch (err) {
    next(err);
  }
}

async function findAll(req, res, next) {
  try {
    const requests = await correctionRequestService.findAll(req.query.status);

    res.status(200).json({
      data: requests,
      error: null,
      meta: { total: requests.length },
    });
  } catch (err) {
    next(err);
  }
}

async function findById(req, res, next) {
  try {
    const request = await correctionRequestService.findById(req.params.id);

    res.status(200).json({
      data: request,
      error: null,
      meta: null,
    });
  } catch (err) {
    next(err);
  }
}

async function review(req, res, next) {
  try {
    const request = await correctionRequestService.review(
      req.params.id,
      req.body
    );

    res.status(200).json({
      data: request,
      error: null,
      meta: null,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  create,
  findAll,
  findById,
  review,
};
