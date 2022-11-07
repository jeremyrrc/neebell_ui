import {
  Nothing,
  BuilderProps,
  PotentialFutureChildNode,
  FutureChildNode,
} from "./index.js";

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
  const filteredV = prop.filter((t) => v.includes(t));
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
  const filteredV = Object.entries(v).filter(([_, t]) => t) as Array<
    [string, T]
  >;
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

export const narrowToFutureChildNode = (
  v: NonNullable<PotentialFutureChildNode>
): FutureChildNode => {
  if (typeof v === "number") {
    v = v.toString();
    return v;
  }
  return v;
};

export const isNothing = (v: any): v is Nothing =>
  v === null || v === undefined;

export const produceNode = (v: FutureChildNode): Node => {
  if (typeof v === "string") return document.createTextNode(v);
  return v.unwrap();
};

export const addChildNode = (elem: Element, v: FutureChildNode): Node => {
  const node = produceNode(v);
  elem.appendChild(node);
  return node;
};

export const addChildNodes = (
  elem: Element,
  futureNodes: Array<[string | undefined, FutureChildNode]>
) => {
  for (const [_k, v] of futureNodes) {
    addChildNode(elem, v);
  }
};

export const applyMethods = {
  id: (elem: Element, p: NonNullable<BuilderProps["id"]>) => (elem.id = p),

  className: (elem: Element, p: any) => {
    for (const c of p) {
      elem.classList.add(c);
    }
  },

  attributes: (elem: Element, p: NonNullable<BuilderProps["attributes"]>) => {
    for (const [name, value] of p) {
      elem.setAttribute(name, value);
    }
  },

  events: (elem: Element, p: NonNullable<BuilderProps["events"]>) => {
    for (const [_k, v] of p) {
      const [type, listener] = v;
      elem.addEventListener(type, listener);
    }
  },

  futureNodes: addChildNodes,
};

export const addEventsSignals = (
  elem: Element,
  p: NonNullable<BuilderProps["events"]>
) => {
  const abortControllers = new Map<string, AbortController>();
  for (const [k, v] of p) {
    const [type, listener] = v;
    const abortController = new AbortController();
    elem.addEventListener(type, listener, {
      signal: abortController.signal,
    });
    abortControllers.set(k.toString(), abortController);
  }
  return abortControllers;
};

export const applyProps = (elem: Element, props: Partial<BuilderProps>) => {
  for (const k in props) {
    const value = props[k];
    if (value === null) continue;
    applyMethods[k](elem, value);
  }
  return elem;
};
