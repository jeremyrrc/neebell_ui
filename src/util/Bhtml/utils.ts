import {
  Built,
  Nothing,
  BuilderProps,
  PotentialFutureChildNode,
  FutureChildNode,
} from "./index.js";

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

// This is where any conversion of the user input needs to happen.
// TODO: Maybe a function that returns a FutureChildNode could be executed here in
// the future.
export const narrowToFutureChildNode = (
  v: NonNullable<PotentialFutureChildNode>
): FutureChildNode => {
  if (typeof v === "number") return v.toString();
  return v;
};

// If the key is undefined then I'm not going to keep it as a Built<HTMLElement>
// But instead store it as a HTMLElement. I still keep the HTMLElement so that
// the Built.childElems... methods can still modify all the HTMLElement children
// of the Built.
export const unwrapIfKeyUndefined = (
  key: string | undefined,
  v: FutureChildNode
): string | HTMLElement | [string, string | Built<HTMLElement>] => {
  if (key === undefined) {
    return typeof v === "object" ? v.unwrap() : v;
  }
  return [key, v];
};

// Unwrap the Built or convert string to Text in order to a Node that can be
// appended.
export const produceNode = (
  v: string | HTMLElement | Built<HTMLElement>
): Text | HTMLElement => {
  if (v instanceof HTMLElement) return v;
  if (typeof v === "string") return document.createTextNode(v);
  return v.unwrap();
};

// Append the produced Node from produceNode. Return the Node to be used in Built.
export const appendNode = (
  elem: Element,
  v: string | HTMLElement | Built<HTMLElement>
): Text | HTMLElement => {
  const node = produceNode(v);
  elem.appendChild(node);
  return node;
};

// Add events to the HTMLElement with AbortController.signal.
// And return the Abort controllers stored in a Map with the keys
// that were given (or number that was produced for events that didn't get a name)
// (This happened in Builder.event | Builder.events)
// as keys so that events can be removed in Built.removeEvent.
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

const applyPropsMethods = {
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
};

// This is where any properties need to be added to the freshly made HTMLElement
// and the result of adding them dosen't need to be stored.
// (Unlike addEventsSignals above that needs to get the AbortControllers)
export const applyProps = (elem: Element, props: Partial<BuilderProps>) => {
  for (const k in props) {
    const value = props[k];
    if (value === null) continue;
    applyPropsMethods[k](elem, value);
  }
  return elem;
};
