const utils = require("../utils");

class InValidationError extends utils.BaseValidationError {
  constructor(message, property) {
    super(message, property);
    this.name = "InValidationError";
  }
}

module.exports = function(key, value, equalValues = []) {
  if (equalValues.includes(value)) {
    return value;
  } else {
    throw new InValidationError(`${key} should be in ${equalValues}`, key);
  }
};
