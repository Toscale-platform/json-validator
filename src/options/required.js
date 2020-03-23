const { BaseValidationError } = require("../utils");

module.exports = function(key, object, required = false, path) {
  if (required) {
    if (key in object) {
      return true;
    } else {
      throw new BaseValidationError(`${key} is required`, key, path);
    }
  } else {
    return true;
  }
};
