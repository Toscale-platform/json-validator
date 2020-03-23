const utils = require("../utils");

module.exports = function(key, object, shouldBeType, isConvert = false) {
  const typeObject = utils.typeOf(object[key]);
  if (typeObject === "undefined") {
    return true;
  }
  if (typeObject === shouldBeType) {
    return true;
  } else {
    if (isConvert) {
      if (shouldBeType === "number" && typeObject === "string") {
        const number = Number(object[key]);
        if (!isNaN(number)) {
          object[key] = number;
          return true;
        }
      } else if (shouldBeType === "boolean" && typeObject === "string") {
        switch (object[key]) {
          case "true":
            object[key] = true;
            return true;
          case "false":
            object[key] = false;
            return true;
        }
      } else if (shouldBeType === "string") {
        object[key] = object[key].toString();
      }
    }
    throw new utils.BaseValidationError(
      `${key} should be ${shouldBeType}`,
      key
    );
  }
};
