import { Built, Nothing } from "./built.js";
import { isSignal, ToChild, getBuild } from "./builder.js";

export const isNothing = (v: any): v is Nothing =>
  v === null || v === undefined;

// String
export const appendStringToString = (
  prop: string | null,
  v: string | Nothing
) => {
  if (isNothing(v)) return prop;
  if (prop === null) return v;
  return prop + v;
};

// Array
export const removeValuesInArray = <T>(
  prop: Array<T> | null,
  v: Array<T> | Nothing
): Array<T> | null => {
  if (isNothing(v) || v.length === 0 || prop === null) return prop;
  const filteredV = prop.filter((t) => !v.includes(t));
  return filteredV.length !== 0 ? filteredV : null;
};

export const appendArrayToArray = <T>(
  prop: Array<T> | null,
  v: Array<T | Nothing> | Nothing
): Array<T> | null => {
  if (isNothing(v)) return prop;
  const filteredV = v.filter((v) => v) as Array<T>;
  if (filteredV.length === 0) return prop;
  if (prop === null) return filteredV;
  return [...prop, ...filteredV];
};

// Map
export const appendRecordToMap = <T>(
  prop: Map<string, T> | null,
  v: Record<string, T | Nothing> | Nothing
): Map<string, T> | null => {
  if (isNothing(v)) return prop;
  const filteredV = Object.entries(v).filter(
    ([_, t]) => !isNothing(t)
  ) as Array<[string, T]>;
  if (filteredV.length === 0) return prop;
  const add = new Map(filteredV);
  if (prop === null) return add;
  return new Map([...prop, ...add]);
};

export const setRecordValueToMap = <V>(
  prop: Map<string, V> | null,
  key: string | undefined,
  v: V | Nothing
): Map<string, V> | null => {
  if (isNothing(v)) return prop;
  if (key === undefined) key = (prop ? prop.size + 1 : 1).toString();
  return prop ? prop.set(key, v) : new Map([[key, v]]);
};

// This is where any conversion of the user input happens.
export const processToChild = (v: ToChild): Text | Comment | Built => {
  if (v instanceof Built) return v;
  v = (isSignal(v)) ? v.value : v;
  switch (typeof v) {
    case "string":
      return document.createTextNode(v);
    case "number":
      return document.createTextNode(v.toString())
    case "undefined":
      return document.createComment("")
    case "function":
      const r = v(getBuild())
      if ("build" in r) return r.build()
      return r;
  }
  if ("build" in v) return v.build()
  return v;
};

// used in Builder.modify
export const deprocess = (v: Text | Comment | Built): string | undefined | Built => {
  if (v instanceof Text) return v.data;
  if (v instanceof Comment) return undefined
  return v;
};
