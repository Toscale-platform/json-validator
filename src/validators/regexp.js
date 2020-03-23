const { BaseValidationError } = require("../utils");

class RegexpValidationError extends BaseValidationError {
  constructor(message, property, path) {
    super(message, property, path);
    this.name = "RegexpValidationError";
  }
}

module.exports = function(key, value, regex, path) {
  if (new RegExp(regex).test(value)) {
    return value;
  } else {
    throw new RegexpValidationError(
      `${value} is not valid ${regex}`,
      key,
      path
    );
  }
};
