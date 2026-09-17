const db = require('../config/db');

async function record({ unifiedParcelId, action, changedBy, notes, oldValue, newValue }) {
  const { rows } = await db.query(
    `INSERT INTO audit_log (unified_parcel_id, action, changed_by, notes, old_value, new_value)
     VALUES ($1,$2,$3,$4,$5,$6)
     RETURNING id, created_at`,
    [unifiedParcelId, action, changedBy || 'system', notes || null, oldValue || null, newValue || null]
  );
  return rows[0];
}

async function findByUnifiedParcelId(unifiedParcelId) {
  const { rows } = await db.query(
    `SELECT id, unified_parcel_id, action, changed_by, notes, old_value, new_value, created_at
     FROM audit_log WHERE unified_parcel_id = $1 ORDER BY created_at ASC`,
    [unifiedParcelId]
  );
  return rows;
}

module.exports = { record, findByUnifiedParcelId };
