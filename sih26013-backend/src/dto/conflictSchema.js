const Joi = require('joi');

const conflictQuerySchema = Joi.object({
  status: Joi.string().valid('PENDING_REVIEW', 'REVIEWED', 'RESOLVED'),
  conflictType: Joi.string().valid('OWNER_MISMATCH', 'AREA_MISMATCH', 'GEOMETRY_CONFLICT'),
  village: Joi.string(),
  tehsil: Joi.string(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(200).default(20),
});

const conflictUpdateSchema = Joi.object({
  status: Joi.string().valid('PENDING_REVIEW', 'REVIEWED', 'RESOLVED').required(),
  notes: Joi.string().allow('', null),
  resolvedBy: Joi.string().max(150).required(),
});

module.exports = { conflictQuerySchema, conflictUpdateSchema };
