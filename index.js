const utils = require("./src/utils");
const options = require("./src/options");
const validators = require("./src/validators");

class JsonValidator {
  constructor(options = {}) {
    this._supportedTypes = ["boolean", "number", "string", "object", "array"];
    this._validations = {};
    this._options = options;
    this._isDev = true;

    for (const validatorName of Object.keys(validators)) {
      this.addValidationRule(validatorName, validators[validatorName]);
    }
  }
  async _validateSchema(schema, path) {
    if ("oneOf" in schema) {
      options.equalType(
        "oneOf",
        schema["oneOf"],
        "array",
        path + "/oneOf",
        false
      );
    } else {
      options.required("name", schema, true, path + "/" + "name");
      options.required("type", schema, true, path + "/" + "type");
      validators.in(
        "type",
        schema.type,
        this._supportedTypes,
        path + "/" + "type"
      );
      options.default("required", schema, false);
      options.default("validations", schema, {});
      options.default("meta", schema, {});
    }
  }
  async _validateCustomValidators(value, schema, path) {
    let result = value;
    const errors = [];
    for (const keyValidation of Object.keys(schema.validations)) {
      try {
        result = this.checkValidator(
          schema.name,
          keyValidation,
          result,
          schema.validations[keyValidation],
          path
        );
      } catch (e) {
        errors.push(this._handlerError(e));
      }
    }
    return { result, isError: errors.length > 0, errors };
  }
  async _validateGeneral(object, schema, path) {
    const errors = [];
    try {
      const existDefault = "default" in schema;
      options.default("required", schema, false);
      const isRequired = existDefault ? false : schema.required;
      options.required(schema.name, object, isRequired, path);
      if (existDefault && !(schema.name in object)) {
        object[schema.name] = schema.default;
      }
      object[schema.name] = options.equalType(
        schema.name,
        object[schema.name],
        schema.type,
        path,
        this._options["convert"]
      );
    } catch (e) {
      errors.push(this._handlerError(e));
    }
    return {
      result: object,
      isError: errors.length > 0,
      errors
    };
  }
  async _validateObject(object, schema, path) {
    options.default("children", schema, []);
    return await this._validateMain(object, schema.children, path);
  }

  async _validateArray(object, schema, path) {
    options.default("items", schema, {});
    options.equalType(schema.name, object, "array", path, false);
    const result = [];
    const errors = [];
    for (const index of Object.keys(object)) {
      const itemSchema = utils.deepCopy(schema.items);
      itemSchema.name = index;
      itemSchema.required = true;
      const itemResult = await this._validateMain(object, itemSchema, path);
      if (itemResult.result === undefined) {
        continue;
      }
      result.push(itemResult.result[index]);
      errors.push(...itemResult.errors);
    }
    return { result, isError: errors.length > 0, errors };
  }

  async _validateValue(object, schema, path) {
    if (object === undefined) {
      return {
        result: undefined,
        isError: true,
        errors: []
      };
    }
    let resultValidation;
    switch (schema.type) {
      case "object":
        resultValidation = await this._validateObject(object, schema, path);
        break;
      case "array":
        resultValidation = await this._validateArray(object, schema, path);
        break;
      case "boolean":
      case "number":
      case "string":
      default:
        resultValidation = { result: object, isError: false, errors: [] };
    }
    const resultCustomValidation = await this._validateCustomValidators(
      resultValidation.result,
      schema,
      path
    );
    resultCustomValidation.errors.push(...resultValidation.errors);
    return {
      result: resultCustomValidation.result,
      isError: resultCustomValidation.errors.length > 0,
      errors: resultCustomValidation.errors
    };
  }

  async _processObject(object, schema, path) {
    let newPath = path + "/" + schema.name;
    const resultValidateGeneral = await this._validateGeneral(
      object,
      schema,
      newPath
    );
    if (!resultValidateGeneral.isError) {
      const resultValidationValue = await this._validateValue(
        resultValidateGeneral.result,
        schema,
        newPath
      );
      resultValidateGeneral.result = resultValidationValue.result;
      resultValidateGeneral.errors.push(...resultValidationValue.errors);
      resultValidateGeneral.isError = resultValidationValue.errors.length > 0;
    }
    return resultValidateGeneral;
  }

  async _processArray(object, schema, path) {
    let result = {
      result: {},
      isError: false,
      errors: []
    };
    for (const schemaItem of schema) {
      await this._validateSchema(schemaItem, path);
      if ("oneOf" in schemaItem) {
        const resultOneOf = await this._processOneOf(
          object,
          schemaItem["oneOf"],
          path
        );
        result.result = resultOneOf.result;
        result.errors.push(...resultOneOf.errors);
        result.isError = result.errors > 0;
      } else {
        let newPath = path + "/" + schemaItem.name;
        const resultValidateGeneral = await this._validateGeneral(
          object,
          schemaItem,
          newPath
        );
        const resultValidationValue = await this._validateValue(
          resultValidateGeneral.result[schemaItem.name],
          schemaItem,
          newPath
        );

        result.result[schemaItem.name] = resultValidationValue.result;
        result.errors.push(
          ...resultValidateGeneral.errors,
          ...resultValidationValue.errors
        );
        result.isError = result.errors.length > 0;
      }
    }
    return result;
  }

  async _processOneOf(object, schemas, path) {
    let result = {
      result: {},
      isError: false,
      errors: []
    };
    let defaultValue = {
      result: {},
      isError: false,
      errors: []
    };

    let isMatch = false;
    for (const schemaOneOf of schemas) {
      if (isMatch && schemaOneOf.name in object) {
        delete object[schemaOneOf.name];
      }
      const validationResult = await this._validateMain(
        utils.deepCopy(object),
        [schemaOneOf],
        path
      );
      if (!validationResult.isError &&
        validationResult.result[schemaOneOf.name] !== undefined
      ) {
        if ('default' in schemaOneOf) {
          defaultValue.result[schemaOneOf.name] =
              validationResult.result[schemaOneOf.name];
          defaultValue.errors.push(...validationResult.errors);
          defaultValue.isError = result.errors.length > 0;
        } else {
          result.result[schemaOneOf.name] =
              validationResult.result[schemaOneOf.name];
          result.errors.push(...validationResult.errors);
          result.isError = result.errors.length > 0;
        }
      }
    }
    if (Object.keys(result.result).length === 0) {
      if (Object.keys(defaultValue.result).length !== 0 && !defaultValue.isError) {
        result = defaultValue;
      }else {
        result.errors.push(
            this._handlerError(
                new utils.BaseValidationError("Not match schema", "oneOf", path)
            )
        );
        result.isError = result.errors.length > 0;
      }
    }

    return result;
  }

  async _validateMain(object, schema, path = "") {
    let result = {
      result: {},
      isError: false,
      errors: []
    };

    switch (utils.typeOf(schema)) {
      case "object":
        await this._validateSchema(schema, path);
        result = await this._processObject(object, schema, path);
        break;
      case "array":
        result = await this._processArray(object, schema, path);
        break;
      default:
        break;
    }
    if (this._options["allowUnknown"]) {
      const resultKeys = Object.keys(result.result);
      const unknownKeys = Object.keys(object).filter(
        e => !resultKeys.includes(e)
      );
      for (const unknownKey of unknownKeys) {
        result.result[unknownKey] = utils.deepCopy(object[unknownKey]);
      }
    }
    return result;
  }
  async validate(object, schema) {
    const copyObject = utils.deepCopy(object);
    return await this._validateMain(copyObject, schema, ".");
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
      return {
        type: e.name,
        message: e.message,
        property: e.property,
        path: e.path
      };
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
