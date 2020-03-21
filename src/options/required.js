module.exports = function(key, object, required = false) {
  if (required) {
    if (key in object) {
      return true;
    } else {
      throw new Error(`${key} is required`);
    }
  } else {
    // if (!(key in object)) {
    //   object[key] = false;
    // }
    return true;
  }
};
