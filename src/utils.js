module.exports.typeOf = function(variable) {
  let typeObject = typeof variable;
  if (typeObject === "object" && Array.isArray(variable)) {
    typeObject = "array";
  }
  return typeObject;
};

module.exports.deepCopy = function(inObject) {
  let outObject, value;

  if (typeof inObject !== "object" || inObject === null) {
    return inObject;
  }

  outObject = Array.isArray(inObject) ? [] : {};

  for (const key of Object.keys(inObject)) {
    value = inObject[key];
    outObject[key] =
      typeof value === "object" && value !== null ? deepCopy(value) : value;
  }

  return outObject;
};

module.exports.BaseValidationError = class BaseValidationError extends Error {
  constructor(message, property, path = "") {
    super();
    this.name = "BaseValidationError";
    this.message = message;
    this.property = property;
    this.path = path;
  }
};
