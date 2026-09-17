const Joi = require('joi');

const ingestRequestSchema = Joi.object({
  sourceSystem: Joi.string()
    .valid('REVENUE', 'SURVEY', 'MUNICIPAL', 'REGISTRATION', 'OTHER')
    .required(),
  mappingProfileId: Joi.string().max(100).required(),
}).unknown(true); // multer places the file separately on req.file

module.exports = { ingestRequestSchema };
