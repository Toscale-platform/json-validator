const utils = require("./src/utils");
const options = require("./src/options");
const validators = require("./src/validators");

class JsonValidator {
  constructor(options = {}) {
    this._supportedTypes = ["boolean", "number", "string", "object"];
    this._validations = {};
    this._options = options;
    this._errors = [];

    for (const validatorName of Object.keys(validators)) {
      this.addValidationRule(validatorName, validators[validatorName]);
    }
  }
  async _validateSimpleType(object, schema, path) {
    options.required("name", schema, true);
    options.required("type", schema, true);
    validators.in("type", schema.type, this._supportedTypes);
    options.default("required", schema, false);
    options.default("validations", schema, []);
    options.default("meta", schema, {});
    try {
      options.required(schema.name, object, schema.required, path);
      options.equalType(
        schema.name,
        object,
        schema.type,
        path,
        this._options["convert"]
      );
    } catch (e) {
      this._handlerError(e);
    }
    if ("default" in schema && !(schema.name in object)) {
      object[schema.name] = schema.default;
    }
    let result = object[schema.name];
    for (const keyValidation of Object.keys(schema.validations)) {
      if (keyValidation in this._validations) {
        try {
          result = this.checkValidator(
            schema.name,
            keyValidation,
            result,
            schema.validations[keyValidation],
            path
          );
        } catch (e) {
          this._handlerError(e);
        }
      } else {
        throw new utils.BaseValidationError(
          `Validation rule ${keyValidation} not found`,
          schema.name,
          path
        );
      }
    }
    return result;
  }
  async _validateStrongType(object, schema, path) {
    options.default("children", schema, []);
    return await this._validateMain(object, schema.children, path);
  }
  async _validateMain(object, schema, path) {
    const typeSchema = utils.typeOf(schema);
    let result = {};
    if (typeSchema === "array") {
      for (const schemaItem of schema) {
        Object.assign(
          result,
          await this._validateMain(
            object,
            schemaItem,
            path + "/" + schemaItem.name
          )
        );
      }
      return result;
    }
    result[schema.name] = await this._validateSimpleType(object, schema, path);
    if (schema.type === "object") {
      result[schema.name] = await this._validateStrongType(
        object,
        schema,
        path
      );
    }
    return result;
  }
  async validate(object, schema) {
    this._errors = [];
    let result;
    try {
      result = await this._validateMain(object, schema, ".");
    } catch (e) {
      if (e instanceof utils.BaseValidationError) {
        this._errors.push({
          type: e.name,
          message: e.message,
          property: e.property,
          path: e.path
        });
      }
    }
    return {
      result,
      isError: this._errors.length > 0,
      errors: this._errors
    };
  }
  addValidationRule(name, handler) {
    if (!(name in this._validations)) {
      this._validations[name] = handler;
    } else {
      throw new utils.BaseValidationError(
        `Validation rule ${name} exist`,
        name
      );
    }
  }
  checkValidator(nameValue, validatorName, value, validatorOptions, path) {
    if (validatorName in this._validations) {
      return this._validations[validatorName](
        nameValue,
        value,
        validatorOptions,
        path
      );
    } else {
      throw new utils.BaseValidationError(
        `${validatorName} not found`,
        validatorName
      );
    }
  }
  _handlerError(e) {
    if (e instanceof utils.BaseValidationError) {
      if (this._options["abortEarly"]) {
        throw e;
      }
      this._errors.push({
        type: e.name,
        message: e.message,
        property: e.property,
        path: e.path
      });
    }
  }
}

module.exports = {
  JsonValidator,
  validators,
  options,
  utils
};
