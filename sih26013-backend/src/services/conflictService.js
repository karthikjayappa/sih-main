const AppError = require('../utils/AppError');
const unifiedParcelRepo = require('../repositories/unifiedParcelRepo');
const auditRepo = require('../repositories/auditRepo');

async function list(params) {
  const { items, total } = await unifiedParcelRepo.findConflicts(params);
  return { items, total, page: params.page, limit: params.limit };
}

async function updateStatus(id, { status, notes, resolvedBy }) {
  const existing = await unifiedParcelRepo.findById(id);
  if (!existing) throw new AppError(`Unified parcel ${id} not found`, 404);
  if (!existing.conflict_flag) {
    throw new AppError(`Unified parcel ${id} has no conflict flagged; nothing to review`, 422);
  }

  const updated = await unifiedParcelRepo.updateStatus(id, status);

  await auditRepo.record({
    unifiedParcelId: id,
    action: 'STATUS_CHANGED',
    changedBy: resolvedBy,
    notes: notes || null,
    oldValue: { status: existing.status },
    newValue: { status },
  });

  return updated;
}

module.exports = { list, updateStatus };
