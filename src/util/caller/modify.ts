type Result<T, E> = import("true-myth").Result<T, E>;
type Maybe<T> = import("true-myth").Maybe<T>;
import { err, ok } from "true-myth/result";
import { of, just, nothing } from "true-myth/maybe";
import { curry, identity } from "lodash";
import { List, Map } from "immutable";
import { modifyString } from "./modifications";
import { CallParam } from "./schema";
import { Input, Value, ParamErrors } from "./caller";

const runModify = curry(
  (input: Value, modificaionKey: string): Result<Value, string> => {
    if (!Reflect.has(modifyString, modificaionKey)) {
      return err("Could not find modification: " + modificaionKey);
    }
    return typeof input === "string"
      ? modifyString[modificaionKey](input)
      : err("Can only modify strings");
  }
);

export const modifyValue = (
  input: Value,
  modifiers: List<string>
): Result<Value, string> => {
  return modifiers.reduce(
    (prevResult: Result<Value, string>, modificationKey: string) => {
      return prevResult.isOk
        ? runModify(prevResult.value, modificationKey)
        : prevResult;
    },
    ok(input)
  );
};

const modifyInputValue = curry(
  (
    data: Input,
    prePost: "pre" | "post",
    callParam: CallParam,
    callNameParam: string
  ): Maybe<Result<Value, string>> => {
    let value = of(data.get(callNameParam));
    if (value.isNothing && callParam.require) {
      return just(err("Missing required value MOD. " + callNameParam));
    } else if (value.isNothing) {
      return nothing();
    }
    if (callParam.modifiers.isNothing) {
      return just(ok(value.value));
    }
    if (callParam.modifiers.value[prePost].isNothing) {
      return just(ok(value.value));
    }
    return just(
      modifyValue(value.value, callParam.modifiers.value[prePost].value)
    );
  }
);

export const modifyCall = (
  call_params: Maybe<Map<string, CallParam>>,
  data: Maybe<Input>,
  prePost: "pre" | "post"
): Result<Maybe<Input>, string | ParamErrors> => {
  if (call_params.isJust) {
    if (data.isJust) {
      let extraParams = Array.from(data.value)
        .map((a) => (call_params.value.has(a[0]) ? false : a[0]))
        .filter(identity);
      if (extraParams.length)
        return err("Extra paramaters: " + extraParams.join(" "));
      let errors = Map<string, List<string>>({});
      let inputs = Map<string, Value>({});
      call_params.value
        .map(modifyInputValue(data.value, prePost))
        .forEach((v, k) => {
          if (v.isJust) {
            if (v.value.isErr) {
              errors = errors.set(k, List([v.value.error]));
            } else {
              inputs = inputs.set(k, v.value.value);
            }
          }
        });
      return errors.isEmpty() ? ok(just(inputs)) : err(errors);
    } else {
      return err("This call requires data");
    }
  } else {
    return ok(data);
  }
};
