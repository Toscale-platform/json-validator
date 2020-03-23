const utils = require("../utils");

class MoreThanOrEqualValidationError extends utils.BaseValidationError {
  constructor(message, property) {
    super(message, property);
    this.name = "MoreThanOrEqualValidationError";
  }
}

module.exports = function(key, value, minValue) {
  const type = utils.typeOf(value);
  switch (type) {
    case "number":
      if (value >= minValue) {
        return value;
      } else {
        throw new MoreThanOrEqualValidationError(
          `${value} should be more than or equal ${minValue}`,
          key
        );
      }
    case "string":
      if (value.length >= minValue) {
        return value;
      } else {
        throw new MoreThanOrEqualValidationError(
          `Length of ${value} should be more than or equal ${minValue}`,
          key
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
          key
        );
      }
    default:
      return value;
  }
};
