const AppError = require('../utils/AppError');

/**
 * validate('body' | 'query') returns middleware that validates req[source]
 * against the given Joi schema, replacing req[source] with the sanitized value.
 */
function validate(schema, source = 'body') {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[source], { abortEarly: false, stripUnknown: false });
    if (error) {
      return next(new AppError('Validation failed', 422, error.details.map((d) => d.message)));
    }
    req[source] = value;
    next();
  };
}

module.exports = validate;
