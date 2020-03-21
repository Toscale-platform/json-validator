module.exports = function(value, equalValues = []) {
  if (equalValues.includes(value)) {
    return value;
  } else {
    throw new Error(`${value} should be equal one of ${equalValues}`);
  }
};
