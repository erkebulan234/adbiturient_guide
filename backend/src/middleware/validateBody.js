const { ZodError } = require('zod');

function validateBody(schema) {
  return function (req, res, next) {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const errors = result.error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }));

      return res.status(400).json({
        message: 'Ошибка валидации',
        errors
      });
    }

    req.body = result.data;
    next();
  };
}

module.exports = validateBody;
