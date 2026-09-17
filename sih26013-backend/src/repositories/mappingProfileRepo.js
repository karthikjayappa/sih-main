const db = require('../config/db');

async function findByProfileId(profileId) {
  const { rows } = await db.query(
    'SELECT * FROM mapping_profiles WHERE profile_id = $1',
    [profileId]
  );
  return rows[0] || null;
}

async function listAll() {
  const { rows } = await db.query('SELECT * FROM mapping_profiles ORDER BY profile_id');
  return rows;
}

module.exports = { findByProfileId, listAll };
