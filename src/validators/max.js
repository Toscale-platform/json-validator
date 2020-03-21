const utils = require("../utils");

module.exports = function(value, maxValue) {
  const type = utils.typeOf(value);
  switch (type) {
    case "boolean":
      return value;
    case "number":
      if (value < maxValue) {
        return value;
      } else {
        throw new Error(`${value} should be less than ${maxValue}`);
      }
    case "string":
    case "array":
      if (value.length < maxValue) {
        return value;
      } else {
        throw new Error(`Length of ${value} should be less than ${maxValue}`);
      }
    case "object":
      if (Object.keys(value).length < maxValue) {
        return value;
      } else {
        throw new Error(
          `Length of ${Object.keys(value)} should be less than ${maxValue}`
        );
      }
  }
};
