const { JsonValidator } = require("./index");
const validator = new JsonValidator({
  allowUnknown: true
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
            type: "string",
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
    test: "qwe",
    maxRate: { rate: { value: 1 }, auto: ["1", "11"], test: 1 }
  };
  const result = await validator.validate(data, schema);
  console.log(data, result);
  data = Object.assign({}, data, result.result);
  console.log(data);
});
