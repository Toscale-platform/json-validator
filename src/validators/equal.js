const utils = require("../utils");

class EqualValidationError extends utils.BaseValidationError {
  constructor(message, property, path) {
    super(message, property, path);
    this.name = "EqualValidationError";
  }
}

module.exports = function(key, value, equalValue, path = "") {
  if (equalValue === value) {
    return value;
  } else {
    throw new EqualValidationError(
      `${value} should be equal ${equalValue}`,
      key,
      path
    );
  }
};
