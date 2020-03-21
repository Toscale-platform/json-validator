module.exports = function(key, object, defaultValue) {
  if (!(key in object)) {
    object[key] = defaultValue;
    return true;
  }
};
