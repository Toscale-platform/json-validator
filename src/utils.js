module.exports.typeOf = function(variable) {
  let typeObject = typeof variable;
  if (typeObject === "object" && variable instanceof Array) {
    typeObject = "array";
  }
  return typeObject;
};

module.exports.BaseValidationError = class BaseValidationError extends Error {
  constructor(message, property) {
    super();
    this.name = "BaseValidationError";
    this.message = message;
    this.property = property;
  }
};
