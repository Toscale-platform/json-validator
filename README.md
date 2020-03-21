# Install

<code>npm i json-validator</code>

# Usage

```javascript
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

const JsonValidator = require("json-validator");

const options = {
  abortEarly: false
};

const validator = new JsonValidator(options);

  validator
    .validate([{ test: "qwe" }, { maxRate: { rate: [{ value: 1 }] } }], schema)
    .then(result => {
      console.log(result);
      // print 
      {
        result: ..., // result validation,
        isError: false,
        errors: [] //list of error
      }
    });
```

## Custom validation rule

```javascript
validator.addValidationRule("nameValidator", function(value, option) {
  // if value is valid return value
  // else throw Error
  if (value) {
    return value;
  } else {
    throw new Error("Validation message");
  }
});
```
