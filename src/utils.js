module.exports.typeOf = function(variable) {
  let typeObject = typeof variable;
  if (typeObject === "object" && variable instanceof Array) {
    typeObject = "array";
  }
  return typeObject;
};
