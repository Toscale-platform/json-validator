const { JsonValidator } = require("./index");
const validator = new JsonValidator({
  allowUnknown: true,
  convert: true
});

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
      // default: "a", // optional, default value
      validations: {
        // rules for validation
        in: ["a", "b", "qwe"],
        regexp: "/*"
      }
    },
    {
      oneOf: [
        {
          name: "testA",
          type: "string"
        },
        {
          name: "testB",
          type: "number"
        }
      ]
    },
    {
      name: "maxRate",
      type: "object",
      default: {},
      children: [
        {
          name: "test",
          type: "number",
          required: true
        },
        {
          name: "rate",
          type: "object",
          children: []
        },
        {
          name: "auto",
          type: "array",
          required: true,
          items: {
            type: "number",
            validations: {
              moreThan: 0
            }
          },
          validations: {
            moreThan: 1
          }
        }
      ]
    }
  ];
  let data = {
    a: 1,
    test: "a",
    testA: "1",
    testB: 1,
    maxRate: { rate: { value: 1 }, auto: ["1", "11"], test: 1 }
  };
  const result = await validator.validate(data, schema);
  console.log(data, result);
});
