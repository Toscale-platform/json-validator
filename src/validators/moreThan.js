const utils = require("../utils");

class MoreThanValidationError extends utils.BaseValidationError {
  constructor(message, property) {
    super(message, property);
    this.name = "MoreThanValidationError";
  }
}

module.exports = function(key, value, minValue) {
  const type = utils.typeOf(value);
  switch (type) {
    case "number":
      if (value > minValue) {
        return value;
      } else {
        throw new MoreThanValidationError(
          `${value} should be more than ${minValue}`,
          key
        );
      }
    case "string":
      if (value.length > minValue) {
        return value;
      } else {
        throw new MoreThanValidationError(
          `Length of ${value} should be more than ${minValue}`,
          key
        );
      }
    case "object":
      if (Object.keys(value).length > minValue) {
        return value;
      } else {
        throw new MoreThanValidationError(
          `Length of ${Object.keys(value)} should be greater than ${minValue}`,
          key
        );
      }
    default:
      return value;
  }
};
