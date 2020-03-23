const { BaseValidationError } = require("../utils");

class RegexpValidationError extends BaseValidationError {
  constructor(message, property) {
    super(message, property);
    this.name = "RegexpValidationError";
  }
}

module.exports = function(key, value, regex) {
  if (new RegExp(regex).test(value)) {
    return value;
  } else {
    throw new RegexpValidationError(`${value} is not valid ${regex}`, key);
  }
};
