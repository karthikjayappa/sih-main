const AppError = require('../utils/AppError');
const correctionRequestRepo = require('../repositories/correctionRequestRepo');
const unifiedParcelRepo = require('../repositories/unifiedParcelRepo');
const auditRepo = require('../repositories/auditRepo');

async function create(data) {
  const {
    unifiedParcelId,
    citizenId,
    issueType,
    description,
    proposedValue,
  } = data;

  if (!unifiedParcelId || !citizenId || !issueType || !description) {
    throw new AppError(
      'unifiedParcelId, citizenId, issueType and description are required',
      400
    );
  }

  const parcel = await unifiedParcelRepo.findById(unifiedParcelId);

  if (!parcel) {
    throw new AppError(
      `Unified parcel ${unifiedParcelId} not found`,
      404
    );
  }

  return correctionRequestRepo.create({
    unifiedParcelId,
    citizenId,
    issueType,
    description,
    proposedValue,
  });
}

async function findAll(status) {
  return correctionRequestRepo.findAll({ status });
}

async function findById(id) {
  const request = await correctionRequestRepo.findById(id);

  if (!request) {
    throw new AppError(`Correction request ${id} not found`, 404);
  }

  return request;
}

async function review(id, { status, reviewedBy, reviewNotes }) {
  const request = await correctionRequestRepo.findById(id);

  if (!request) {
    throw new AppError(`Correction request ${id} not found`, 404);
  }

  if (!['APPROVED', 'REJECTED'].includes(status)) {
    throw new AppError(
      'Review status must be APPROVED or REJECTED',
      400
    );
  }

  if (request.status !== 'PENDING') {
    throw new AppError(
      `Correction request ${id} has already been reviewed`,
      400
    );
  }

  const reviewedRequest = await correctionRequestRepo.updateReview(id, {
    status,
    reviewedBy,
    reviewNotes,
  });

  if (status === 'APPROVED' && request.issue_type === 'OWNER_NAME') {
    if (!request.proposed_value) {
      throw new AppError(
        'Approved owner-name correction requires a proposed value',
        400
      );
    }

    const parcel = await unifiedParcelRepo.findById(
      request.unified_parcel_id
    );

    if (!parcel) {
      throw new AppError(
        `Unified parcel ${request.unified_parcel_id} not found`,
        404
      );
    }

    const oldOwnerName = parcel.owner_name;

    await unifiedParcelRepo.updateOwnerName(
      request.unified_parcel_id,
      request.proposed_value
    );

    await unifiedParcelRepo.removeConflictType(
      request.unified_parcel_id,
      'OWNER_MISMATCH'
    );

    await auditRepo.record({
      unifiedParcelId: request.unified_parcel_id,
      action: 'CORRECTION_APPROVED',
      changedBy: reviewedBy,
      notes: `Owner name corrected through citizen request #${request.id}`,
      oldValue: {
        owner_name: oldOwnerName,
      },
      newValue: {
        owner_name: request.proposed_value,
      },
    });
  }

  if (status === 'APPROVED' && request.issue_type === 'AREA') {
    if (!request.proposed_value) {
      throw new AppError(
        'Approved area correction requires a proposed value',
        400
      );
    }

    const parcel = await unifiedParcelRepo.findById(
      request.unified_parcel_id
    );

    if (!parcel) {
      throw new AppError(
        `Unified parcel ${request.unified_parcel_id} not found`,
        404
      );
    }

    const oldArea = parcel.area_sqm;
    const newArea = Number(request.proposed_value);

    if (!Number.isFinite(newArea) || newArea <= 0) {
      throw new AppError(
        'Proposed area must be a positive number',
        400
      );
    }

    await unifiedParcelRepo.updateArea(
      request.unified_parcel_id,
      newArea
    );

    await unifiedParcelRepo.removeConflictType(
      request.unified_parcel_id,
      'AREA_MISMATCH'
    );

    await auditRepo.record({
      unifiedParcelId: request.unified_parcel_id,
      action: 'CORRECTION_APPROVED',
      changedBy: reviewedBy,
      notes: `Area corrected through citizen request #${request.id}`,
      oldValue: {
        area_sqm: oldArea,
      },
      newValue: {
        area_sqm: newArea,
      },
    });
  }

  if (status === 'APPROVED' && request.issue_type === 'LAND_USE') {
    if (!request.proposed_value) {
      throw new AppError(
        'Approved land-use correction requires a proposed value',
        400
      );
    }

    const parcel = await unifiedParcelRepo.findById(
      request.unified_parcel_id
    );

    if (!parcel) {
      throw new AppError(
        `Unified parcel ${request.unified_parcel_id} not found`,
        404
      );
    }

    const oldLandUse = parcel.land_use;
    const newLandUse = request.proposed_value.trim();

    if (!newLandUse) {
      throw new AppError(
        'Proposed land use cannot be empty',
        400
      );
    }

    await unifiedParcelRepo.updateLandUse(
      request.unified_parcel_id,
      newLandUse
    );

    await unifiedParcelRepo.removeConflictType(
      request.unified_parcel_id,
      'LAND_USE_MISMATCH'
    );

    await auditRepo.record({
      unifiedParcelId: request.unified_parcel_id,
      action: 'CORRECTION_APPROVED',
      changedBy: reviewedBy,
      notes: `Land use corrected through citizen request #${request.id}`,
      oldValue: {
        land_use: oldLandUse,
      },
      newValue: {
        land_use: newLandUse,
      },
    });
  }

  return reviewedRequest;
}

module.exports = {
  create,
  findAll,
  findById,
  review,
};
