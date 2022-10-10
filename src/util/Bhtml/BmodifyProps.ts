import { just, nothing } from "true-myth/maybe";
import { Nullable, Key } from "./Bhtml.js";
type Maybe<T> = import("true-myth/maybe").Maybe<T>;

// String
export const appendOrResetString = (
  prop: Maybe<string>,
  reset: boolean,
  v: string | Nullable
) => {
  if (!v) return prop;
  if (reset || prop.isNothing) return just(v);
  return just(prop.value + v);
};

// Array
export const removeValuesInArray = <T>(
  prop: Maybe<Array<T>>,
  v: Array<T> | Nullable
): Maybe<Array<T>> => {
  if (!v || v.length === 0 || prop.isNothing) return prop;
  const filteredV = prop.value.filter((t) => v.includes(t));
  return filteredV.length !== 0 ? just(filteredV) : nothing<Array<T>>();
};

export const appendOrResetArrayToArray = <T>(
  prop: Maybe<Array<T>>,
  reset: boolean,
  v: Array<T | Nullable> | Nullable
) => {
  if (!v) return prop;
  const filteredV = v.filter((v) => v) as Array<T>;
  if (filteredV.length === 0) return prop;
  if (reset || prop.isNothing) return just(filteredV);
  return just([...prop.value, ...filteredV]);
};

// Map
export const appendOrResetRecordToMap = <T>(
  prop: Maybe<Map<Key, T>>,
  reset: boolean,
  v: Record<string, T | Nullable> | Nullable
): Maybe<Map<Key, T>> => {
  if (!v) return prop;
  const filteredV = Object.entries(v).filter(([_, t]) => t) as Array<
    [string, T]
  >;
  if (filteredV.length === 0) return prop;
  const add = new Map(filteredV);
  if (reset || prop.isNothing) return just(add);
  return just(new Map([...prop.value, ...add]));
};

export const appendOrResetMapToMap = <T>(
  prop: Maybe<Map<Key, T>>,
  reset: boolean,
  v: Map<Key, T | Nullable> | Nullable
): Maybe<Map<Key, T>> => {
  if (!v) return prop;
  const filteredV = [...v].filter(([_, t]) => t) as Array<[string, T]>;
  if (filteredV.length === 0) return prop;
  const add = new Map(filteredV);
  if (reset || prop.isNothing) return just(add);
  return just(new Map([...prop.value, ...add]));
};

export const setRecordValueToMap = <T>(
  prop: Maybe<Map<Key, T>>,
  key: Key,
  v: T | Nullable
): Maybe<Map<Key, T>> => {
  if (!v) return prop;
  return prop.isJust ? just(prop.value.set(key, v)) : just(new Map([[key, v]]));
};
