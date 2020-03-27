const utils = require("../utils");

class InValidationError extends utils.BaseValidationError {
  constructor(message, property, path) {
    super(message, property, path);
    this.name = "InValidationError";
  }
}

module.exports = function(key, value, equalValues = [], path = "") {
  if (equalValues.includes(value)) {
    return value;
  } else {
    throw new InValidationError(
      `${value} should be in ${equalValues}`,
      key,
      path
    );
  }
};
