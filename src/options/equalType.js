const utils = require("../utils");

module.exports = function(key, object, shouldBeType) {
  const typeObject = utils.typeOf(object[key]);
  if (typeObject === shouldBeType || typeObject === "undefined") {
    return true;
  } else {
    throw new Error(`${key} should be ${shouldBeType}`);
  }
};
