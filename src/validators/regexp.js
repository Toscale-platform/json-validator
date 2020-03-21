module.exports = function(value, regex) {
  if (new RegExp(regex).test(value)) {
    return value;
  } else {
    throw new Error(`${value} is not valid ${regex}`);
  }
};
