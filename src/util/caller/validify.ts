import { just, nothing, of, isJust } from "true-myth/maybe";
type Maybe<T> = import("true-myth/maybe").Maybe<T>;
import { curry } from "lodash";
import { stringValidate, blobValidate } from "./validations.js";
import { Stipulations, Validation } from "./schema.js";
import { Value, Input, Errors, ParamErrors } from "./caller.js";

type Nothing = null | undefined;

const hasValidation = curry((value: string | Blob, valKey: string) => {
  const has =
    typeof value === "string"
      ? Reflect.has(stringValidate, valKey)
      : Reflect.has(blobValidate, valKey);
  if (!has) console.error("Could not find validation test: " + valKey);
  return has;
});

const checkEmpty = (value: string | Blob) =>
  typeof value === "string" ? value.trim().length : value.size;

const validate = curry((value: string | Blob, validationKey: string) =>
  typeof value === "string"
    ? stringValidate[validationKey](value.trim())
    : blobValidate[validationKey](value)
);

export const checkValue = (
  value: Value,
  required: boolean,
  validations: Array<Validation>
): Maybe<Errors> => {
  const hasValidationKeyReady = hasValidation(value);
  const validationKeys = validations.filter(hasValidationKeyReady);
  const empty = checkEmpty(value);
  if (empty && required) return just(["This is required"]);
  if (empty && !required) return nothing<Errors>();
  const validateKeyReady = validate(value);
  const errors = validationKeys
    .map(validateKeyReady)
    .filter(isJust)
    .map((j) => j.value) as Array<string>;
  return errors.length ? just(errors) : nothing<Errors>();
};

const checkInputValue = curry(
  (data: Input, stips: Stipulations, callNameParam: string): Maybe<Errors> => {
    let value = of(data.get(callNameParam));
    if (value.isNothing && stips.require) {
      return just(["Missing required value."]);
    } else if (value.isNothing) {
      return nothing<Errors>();
    }
    if (!stips.validations) {
      return nothing<Errors>();
    }
    return checkValue(value.value, stips.require, stips.validations);
  }
);

export const checkCall = (
  stips: Record<string, Stipulations>,
  data: Input | Nothing
): ParamErrors | Nothing => {
  if (!data) return null;
  // let extraParams = Array.from(data.value)
  //   .map((a) => (stips.hasOwnProperty(a[0]) ? false : a[0]))
  //   .filter((v) => v);
  // if (extraParams.length)
  //   return just(["Extra parameters: " + extraParams.join(" ")]);

  const checkInputValueStipReady = checkInputValue(data);
  const paramErrors = new Map<string, Array<string>>();
  for (const key in stips) {
    const mayErrors = checkInputValueStipReady(stips[key], key);
    if (mayErrors.isJust) paramErrors.set(key, mayErrors.value);
  }

  return paramErrors.size ? null : paramErrors;
};
