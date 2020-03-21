const utils = require("./src/utils");
const options = require("./src/options");
const validators = require("./src/validators");

module.exports = class JsonValidator {
  constructor(options = {}) {
    this._supportedTypes = ["boolean", "number", "string", "array", "object"];
    this._validations = {};
    this._options = options;
    this._errors = [];
    this.addValidationRule("equal", validators.equal);
    this.addValidationRule("regexp", validators.regexp);
    this.addValidationRule("min", validators.min);
    this.addValidationRule("max", validators.max);
  }
  async _validateSimpleType(object, schema) {
    options.required("name", schema, true);
    options.required("type", schema, true);
    validators.equal(schema.type, this._supportedTypes);
    options.default("required", schema, false);
    options.default("validations", schema, []);
    options.default("meta", schema, {});

    options.required(schema.name, object, schema.required);
    options.equalType(schema.name, object, schema.type);
    if ("default" in schema && !(schema.name in object)) {
      object[schema.name] = schema.default;
    }
    let result = object[schema.name];
    for (const keyValidation of Object.keys(schema.validations)) {
      if (keyValidation in this._validations) {
        try {
          result = this.checkValidator(
            keyValidation,
            result,
            schema.validations[keyValidation]
          );
        } catch (e) {
          this._errors.push({
            type: e.name,
            message: e.message
          });

          if (this._options["abortEarly"]) {
            return;
          }
        }
      } else {
        throw new Error(`Validation rule ${keyValidation} not found`);
      }
    }
    return result;
  }
  async _validateStrongType(object, schema) {
    options.default("children", schema, []);
    const objectValidation =
      schema.name in object ? object[schema.name] : object;
    let result = schema.type === "object" ? {} : [];
    const children = [];
    for (const child of schema.children) {
      const tmpObj =
        child.name in objectValidation ? objectValidation[child.name] : {};
      children.push(await this._validateMain(tmpObj, child));
    }
    for (const child of children) {
      if (schema.type === "object") {
        Object.assign(result, child);
      } else {
        result.push(child);
      }
    }
    return result;
  }
  async _validateMain(object, schema) {
    const typeSchema = utils.typeOf(schema);
    let result = {};
    if (typeSchema === "array") {
      result = [];
      for (const schemaKey of Object.keys(schema)) {
        const objectValidation = schemaKey in object ? object[schemaKey] : {};
        result.push(
          await this._validateMain(objectValidation, schema[schemaKey])
        );
      }
      return result;
    }
    result[schema.name] = await this._validateSimpleType(object, schema);
    if (schema.type === "array" || schema.type === "object") {
      result[schema.name] = await this._validateStrongType(object, schema);
    }
    return result;
  }
  async validate(object, schema) {
    this._errors = [];
    return {
      result: await this._validateMain(object, schema),
      isError: this._errors.length > 0,
      errors: this._errors
    };
  }
  addValidationRule(name, handler) {
    if (!(name in this._validations)) {
      this._validations[name] = handler;
    } else {
      throw new Error(`Validation rule ${name} exist`);
    }
  }
  checkValidator(validatorName, value, validatorOptions) {
    if (validatorName in this._validations) {
      return this._validations[validatorName](value, validatorOptions);
    } else {
      throw new Error(`${validatorName} not found`);
    }
  }
};
