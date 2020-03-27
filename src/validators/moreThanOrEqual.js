const utils = require("../utils");

class MoreThanOrEqualValidationError extends utils.BaseValidationError {
  constructor(message, property, path) {
    super(message, property, path);
    this.name = "MoreThanOrEqualValidationError";
  }
}

module.exports = function(key, value, minValue, path) {
  const type = utils.typeOf(value);
  switch (type) {
    case "number":
      if (value >= minValue) {
        return value;
      } else {
        throw new MoreThanOrEqualValidationError(
          `${value} should be more than or equal ${minValue}`,
          key,
          path
        );
      }
    case "string":
      if (value.length >= minValue) {
        return value;
      } else {
        throw new MoreThanOrEqualValidationError(
          `Length of ${value} should be more than or equal ${minValue}`,
          key,
          path
        );
      }
    case "array":
      if (value.length >= minValue) {
        return value;
      } else {
        throw new MoreThanOrEqualValidationError(
          `Length of ${value} should be more than or equal ${minValue}`,
          key,
          path
        );
      }
    case "object":
      if (Object.keys(value).length >= minValue) {
        return value;
      } else {
        throw new MoreThanOrEqualValidationError(
          `Length of ${Object.keys(
            value
          )} should be more than or equal ${minValue}`,
          key,
          path
        );
      }
    default:
      return value;
  }
};
