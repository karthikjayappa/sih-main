const Joi = require('joi');

const parcelSearchSchema = Joi.object({
  q: Joi.string().allow(''),
  parcelId: Joi.string().allow(''),
  ownerName: Joi.string().allow(''),
  village: Joi.string().allow(''),
  tehsil: Joi.string().allow(''),
  district: Joi.string().allow(''),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(200).default(20),
});

module.exports = { parcelSearchSchema };
