const utils = require("../utils");

module.exports = function(
  key,
  object,
  shouldBeType,
  path = "",
  isConvert = false
) {
  const typeObject = utils.typeOf(object);
  if (typeObject === "undefined") {
    return true;
  }
  if (typeObject === shouldBeType) {
    return true;
  } else {
    if (isConvert) {
      if (shouldBeType === "number" && typeObject === "string") {
        const number = Number(object);
        if (!isNaN(number)) {
          return number;
        }
      } else if (shouldBeType === "boolean" && typeObject === "string") {
        switch (object) {
          case "true":
            return true;
          case "false":
            return false;
        }
      } else if (shouldBeType === "string") {
        return object.toString();
      }
    }
    throw new utils.BaseValidationError(
      `${key} should be ${shouldBeType}`,
      key,
      path
    );
  }
};
