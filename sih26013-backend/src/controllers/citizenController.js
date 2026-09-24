const citizenService = require('../services/citizenService');

async function login(req, res) {
  try {
    const { bhudhaarId } = req.body;

    const citizen = await citizenService.login(bhudhaarId);

    return res.status(200).json({
      data: citizen,
      error: null,
      meta: null,
    });
  } catch (error) {
    const statusCode =
      error.message === 'Invalid BhuDhaar ID' ? 401 : 400;

    return res.status(statusCode).json({
      data: null,
      error: error.message,
      meta: null,
    });
  }
}

module.exports = {
  login,
};
