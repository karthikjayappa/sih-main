const citizenRepo = require('../repositories/citizenRepo');

async function login(bhudhaarId) {
  if (!bhudhaarId || !bhudhaarId.trim()) {
    throw new Error('BhuDhaar ID is required');
  }

  const citizen = await citizenRepo.findByBhuDhaarId(bhudhaarId.trim());

  if (!citizen) {
    throw new Error('Invalid BhuDhaar ID');
  }

  return citizen;
}

module.exports = {
  login,
};
