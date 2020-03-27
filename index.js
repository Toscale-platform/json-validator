const utils = require("./src/utils");
const options = require("./src/options");
const validators = require("./src/validators");

class JsonValidator {
  constructor(options = {}) {
    this._supportedTypes = ["boolean", "number", "string", "object", "array"];
    this._validations = {};
    this._options = options;
    this._errors = [];
    this._isDev = true;

    for (const validatorName of Object.keys(validators)) {
      this.addValidationRule(validatorName, validators[validatorName]);
    }
  }
  async _validateSchema(schema) {
    options.required("name", schema, true);
    options.required("type", schema, true);
    validators.in("type", schema.type, this._supportedTypes);
    options.default("required", schema, false);
    options.default("validations", schema, {});
    options.default("meta", schema, {});
  }
  async _validateCustomValidators(value, schema, path) {
    let result = utils.deepCopy(value);
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
  async _validateGeneral(object, schema, path) {
    try {
      const existDefault = "default" in schema;
      const isRequired = existDefault ? false : schema.required;
      options.required(schema.name, object, isRequired, path);
      options.equalType(
        schema.name,
        object[schema.name],
        schema.type,
        path,
        this._options["convert"]
      );
      if (existDefault && !(schema.name in object)) {
        options.equalType(
          "default",
          schema.default,
          schema.type,
          path,
          this._options["convert"]
        );
        object[schema.name] = schema.default;
      }
      return object;
    } catch (e) {
      this._handlerError(e);
    }
  }
  async _validateObject(object, schema, path) {
    options.default("children", schema, []);
    return await this._validateMain(object, schema.children, path);
  }

  async _validateArray(object, schema, path) {
    options.default("items", schema, {});
    options.equalType(schema.name, object, "array", path, false);
    const result = [];
    for (const index of Object.keys(object)) {
      const itemSchema = utils.deepCopy(schema.items);
      itemSchema.name = index;
      itemSchema.required = true;
      const itemResult = await this._validateMain(object, itemSchema, path);
      if (itemResult === undefined) {
        continue;
      }
      result.push(itemResult[index]);
    }
    return result;
  }

  async validateValue(object, schema, path) {
    object = await this._validateCustomValidators(object, schema, path);
    if (object === undefined) {
      return;
    }
    switch (schema.type) {
      case "object":
        return await this._validateObject(object, schema, path);
      case "array":
        return await this._validateArray(object, schema, path);
      case "boolean":
      case "number":
      case "string":
      default:
        return object;
    }
  }
  async _validateMain(object, schema, path = "") {
    let result = {};

    switch (utils.typeOf(schema)) {
      case "object":
        let newPath = path + "/" + schema.name;
        await this._validateSchema(schema);
        object = await this._validateGeneral(object, schema, newPath);
        result = await this.validateValue(object, schema, newPath);
        break;
      case "array":
        for (const schemaItem of schema) {
          let newPath = path + "/" + schemaItem.name;
          await this._validateSchema(schemaItem);
          object = await this._validateGeneral(object, schemaItem, newPath);
          const validValue = await this.validateValue(
            object[schemaItem.name],
            schemaItem,
            newPath
          );
          if (validValue === undefined) {
            continue;
          }
          result[schemaItem.name] = validValue;
        }
        break;
      default:
        break;
    }
    if (
      this._options["allowUnknown"] &&
      Object.keys(object).length !== Object.keys(result).length
    ) {
      const resultKeys = Object.keys(result);
      const unknownKeys = Object.keys(object).filter(
        e => !resultKeys.includes(e)
      );
      for (const unknownKey of unknownKeys) {
        result[unknownKey] = utils.deepCopy(object[unknownKey]);
      }
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
      } else {
        this._debug(e, "error");
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
    } else {
      this._debug(e, "error");
    }
  }
  _debug(message, level = "info") {
    if (this._isDev) {
      switch (level) {
        case "info":
          console.log(new Date(), message);
          break;
        case "error":
          console.error(new Date(), message);
      }
    }
  }
}

module.exports = {
  JsonValidator,
  validators,
  options,
  utils
};
