const isRequired = require("./required");
test("should be true if key in object and required true", () => {
  expect(isRequired("name", { name: "test" }, true)).toBeTruthy();
});

test("should be true if key in object and required false", () => {
  expect(isRequired("name", { name: "test" }, false)).toBeTruthy();
});

test("should be true if key not in object and required false", () => {
  expect(isRequired("name", {}, false)).toBeTruthy();
});

test("should be throw Error if key not in object and required true", () => {
  try {
    isRequired("name", {}, true);
  } catch (e) {
    expect(e).toBeInstanceOf(Error);
  }
});
