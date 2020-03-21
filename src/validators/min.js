const utils = require("../utils");

module.exports = function(value, minValue) {
  const type = utils.typeOf(value);
  switch (type) {
    case "boolean":
      return value;
    case "number":
      if (value > minValue) {
        return value;
      } else {
        throw new Error(`${value} should be greater than ${minValue}`);
      }
    case "string":
    case "array":
      if (value.length > minValue) {
        return value;
      } else {
        throw new Error(
          `Length of ${value} should be greater than ${minValue}`
        );
      }
    case "object":
      if (Object.keys(value).length > minValue) {
        return value;
      } else {
        throw new Error(
          `Length of ${Object.keys(value)} should be greater than ${minValue}`
        );
      }
  }
};
