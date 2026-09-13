exports.validate = (req, res, next) => {
  const { validationResult } = require("express-validator");
  const e = validationResult(req);
  return e.isEmpty()
    ? next()
    : res
        .status(400)
        .json({
          success: false,
          message: "Validation failed",
          error: e.array(),
        });
};
