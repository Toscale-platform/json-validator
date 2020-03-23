const utils = require("../utils");

class LessThanValidationError extends utils.BaseValidationError {
  constructor(message, property, path) {
    super(message, property, path);
    this.name = "LessThanValidationError";
  }
}

module.exports = function(key, value, maxValue, path = "") {
  const type = utils.typeOf(value);
  switch (type) {
    case "boolean":
      return value;
    case "number":
      if (value < maxValue) {
        return value;
      } else {
        throw new LessThanValidationError(
          `${value} should be less than ${maxValue}`,
          key,
          path
        );
      }
    case "string":
      if (value.length < maxValue) {
        return value;
      } else {
        throw new LessThanValidationError(
          `Length of ${value} should be less than ${maxValue}`,
          key,
          path
        );
      }
    case "object":
      if (Object.keys(value).length < maxValue) {
        return value;
      } else {
        throw new LessThanValidationError(
          `Length of ${Object.keys(value)} should be less than ${maxValue}`,
          key,
          path
        );
      }
  }
};
