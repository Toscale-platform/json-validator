const { BaseValidationError } = require("../utils");

module.exports = function(key, object, required = false) {
  if (required) {
    if (key in object) {
      return true;
    } else {
      throw new BaseValidationError(`${key} is required`, key);
    }
  } else {
    return true;
  }
};
