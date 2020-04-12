const utils = require("../utils");

module.exports = function(
  key,
  value,
  shouldBeType,
  path = "",
  isConvert = false
) {
  const typeObject = utils.typeOf(value);
  if (typeObject === "undefined") {
    return undefined;
  }
  if (typeObject === shouldBeType) {
    return value;
  } else {
    if (isConvert) {
      if (shouldBeType === "number" && typeObject === "string") {
        const number = Number(value);
        if (!isNaN(number)) {
          return number;
        }
      } else if (shouldBeType === "boolean" && typeObject === "string") {
        switch (value) {
          case "true":
            return true;
          case "false":
            return false;
        }
      } else if (shouldBeType === "string") {
        return value.toString();
      }
    }
    throw new utils.BaseValidationError(
      `${key} should be ${shouldBeType}`,
      key,
      path
    );
  }
};
