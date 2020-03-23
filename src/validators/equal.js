const utils = require("../utils");

class EqualValidationError extends utils.BaseValidationError {
  constructor(message, property) {
    super(message, property);
    this.name = "EqualValidationError";
  }
}

module.exports = function(key, value, equalValue) {
  if (equalValue === value) {
    return value;
  } else {
    throw new EqualValidationError(
      `${value} should be equal ${equalValue}`,
      key
    );
  }
};
