import { just } from "true-myth/maybe";
import { Nothing } from "./Bfetch.js";
type Maybe<T> = import("true-myth/maybe").Maybe<T>;

export const appendOrResetString = (
  prop: Maybe<string>,
  reset: boolean,
  v: string | Nothing
) => {
  if (!v) return prop;
  if (reset || prop.isNothing) return just(v);
  return just(prop.value + v);
};

export const appendOrResetRecordToMap = <T>(
  prop: Maybe<Map<string, T>>,
  reset: boolean,
  v: Record<string, T | Nothing> | Nothing
): Maybe<Map<string, T>> => {
  if (!v) return prop;
  const filteredV = Object.entries(v).filter(([_, v]) => v) as Array<
    [string, T]
  >;
  if (filteredV.length === 0) return prop;
  const add = new Map(filteredV);
  if (reset || prop.isNothing) return just(add);
  return just(new Map([...prop.value, ...add]));
};

export const appendOrResetMapToMap = <T>(
  prop: Maybe<Map<string, T>>,
  reset: boolean,
  v: Map<string, T | Nothing> | Nothing
): Maybe<Map<string, T>> => {
  if (!v) return prop;
  const filteredV = [...v].filter(([_, v]) => v) as Array<[string, T]>;
  if (filteredV.length === 0) return prop;
  const add = new Map(filteredV);
  if (reset || prop.isNothing) return just(add);
  return just(new Map([...prop.value, ...add]));
};

export const setRecordValueToMap = <T>(
  prop: Maybe<Map<string, T>>,
  key: string,
  v: T | Nothing
): Maybe<Map<string, T>> => {
  if (!v) return prop;
  return prop.isJust ? just(prop.value.set(key, v)) : just(new Map([[key, v]]));
};
