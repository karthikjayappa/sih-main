const db = require('../config/db');

async function create({
  unifiedParcelId,
  citizenId,
  issueType,
  description,
  proposedValue,
}) {
  const { rows } = await db.query(
    `INSERT INTO correction_requests
      (unified_parcel_id, citizen_id, issue_type, description, proposed_value)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [
      unifiedParcelId,
      citizenId,
      issueType,
      description,
      proposedValue || null,
    ]
  );

  return rows[0];
}

async function findAll({ status } = {}) {
  const params = [];
  let whereSql = '';

  if (status) {
    params.push(status);
    whereSql = `WHERE status = $${params.length}`;
  }

  const { rows } = await db.query(
    `SELECT id, unified_parcel_id, citizen_id, issue_type,
            description, proposed_value, status, submitted_at, reviewed_at,
            reviewed_by, review_notes
     FROM correction_requests
     ${whereSql}
     ORDER BY submitted_at DESC`,
    params
  );

  return rows;
}

async function findById(id) {
  const { rows } = await db.query(
    `SELECT id, unified_parcel_id, citizen_id, issue_type,
            description, proposed_value, status, submitted_at, reviewed_at,
            reviewed_by, review_notes
     FROM correction_requests
     WHERE id = $1`,
    [id]
  );

  return rows[0] || null;
}

async function updateReview(
  id,
  { status, reviewedBy, reviewNotes }
) {
  const { rows } = await db.query(
    `UPDATE correction_requests
     SET status = $2,
         reviewed_at = now(),
         reviewed_by = $3,
         review_notes = $4
     WHERE id = $1
     RETURNING *`,
    [id, status, reviewedBy, reviewNotes || null]
  );

  return rows[0] || null;
}

module.exports = {
  create,
  findAll,
  findById,
  updateReview,
};
