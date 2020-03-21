const JsonValidator = require("./index");
const validator = new JsonValidator();

test("is required should be throw error", () => {
  const schema = [
    {
      name: "test",
      type: "string",
      required: true,
      validations: {}
    }
  ];
  expect(validator.validate({}, schema)).rejects.toThrow();
});

test("test", async () => {
  const schema = [
    {
      name: "test", // required, name field
      type: "string", // required, supported types: boolean, string, number, object, array
      required: true, // optional, is required variable
      default: "a", // optional, default value
      validations: {
        // rules for validation
        equal: ["a", "b", "qwe"],
        regexp: "/*",
        min: 0,
        max: 3
      }
    },
    {
      name: "maxRate",
      type: "object",
      required: true,
      default: {},
      children: [
        {
          name: "rate",
          type: "array",
          children: [
            // children is required for types: array and object
            {
              name: "value",
              type: "number"
            }
          ]
        }
      ]
    }
  ];
  validator
    .validate([{ test: "qwe" }, { maxRate: { rate: [{ value: 1 }] } }], schema)
    .then(result => {
      console.log(result);
    });
});
