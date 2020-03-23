# Install

<code>npm i json-validator</code>

# Usage

```javascript
const schema = [
    {
      name: "test", // required, name field
      type: "string", // required, supported types: boolean, string, number, object
      required: true, // optional, is required variable
      default: "a", // optional, default value
      validations: {
        // rules for validation
        in: ["a", "b", "qwe"],
        equal: "a",
        regexp: "/*",
        moreThan: 0,
        moreThanOrEqual: 1,
        lessThan: 3,
        lessThanOrEqual: 2
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
          type: "number",
          default: 0,
          meta: {
            title: "It is title",
            description: ""
          }
        }
      ]
    }
  ];

const JsonValidator = require("json-validator");

const options = {
  abortEarly: false,
  convert: true
};

const validator = new JsonValidator(options);

  validator
    .validate([{ test: "qwe" }, { maxRate: { rate: 1 } }], schema)
    .then(result => {
      console.log(result);
      // print 
      {
        result: ..., // result validation,
        isError: false,
        errors: [ //list of error
          {
            type: "...",
            message: "...",
            property: "..."
          }
        ]
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
