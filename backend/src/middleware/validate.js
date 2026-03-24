const { z } = require('zod');
const AppError = require('../utils/appError');

const validate = (schema) => (req, res, next) => {
  try {
    schema.parse({
      body: req.body,
      query: req.query,
      params: req.params
    });
    next();
  } catch (err) {
    if (err instanceof z.ZodError) {
      const issues = err.issues || err.errors || [];
      const errorMessage = issues.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
      return next(new AppError(`Validation Error: ${errorMessage}`, 400));
    }
    next(err);
  }
};

module.exports = validate;
