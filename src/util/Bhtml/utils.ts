import { Nothing, PotentialFutureChildNode, FutureChildNode } from "./index.js";

import { Builder, BuilderProps } from "./builder.js";
import { Built } from "./built.js";
import { Tag } from "./index.js";

export const isNothing = (v: any): v is Nothing =>
  v === null || v === undefined;

export const isSomething = (v: any): v is Nothing => !isNothing(v);

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

// This is where any conversion of the user input needs to happen.
export const parseInput = (
  b: Builder,
  v: NonNullable<PotentialFutureChildNode>
): FutureChildNode => {
  if (typeof v === "function") {
    const built = v(b);
    return built;
  }
  if (typeof v === "number") return v.toString();
  return v;
};

// If the key is undefined then I'm not going to keep it as a Built<HTMLElement>
// But instead store it as a HTMLElement.
export const unwrapBuiltIfKeyUndefined = (
  key: string | undefined,
  v: FutureChildNode
): string | HTMLElement | [string, string | Built<Tag>] => {
  if (key === undefined) {
    return v instanceof Built ? v.unwrap() : v;
  }
  return [key, v];
};

// Unwrap the Built or convert string to Text in order to a Node that can be
// appended.
export const produceNode = (
  v: string | HTMLElement | Built<Tag>
): Text | HTMLElement => {
  if (v instanceof HTMLElement) return v;
  if (typeof v === "string") return document.createTextNode(v);
  return v.unwrap();
};

// Append the produced Node from produceNode. Return the Text or preserve the
// Built<HTMLElement> if a key is defined.
export const appendNode = (
  elem: Element,
  v: string | HTMLElement | Built<Tag>,
  key: string | undefined
): Text | HTMLElement | Built<Tag> => {
  const node = produceNode(v);
  elem.appendChild(node);
  if (typeof key === "string" && v instanceof Built) return v;
  return node;
};

// Only include Text | Built<HTMLElement> into registry.
// Exclude HTMLElements that were unwrapped out of the Builts (in produceNode)
// because they didn't have a defined key.
export const isRegistryItem = (item: any): item is Text | Built<Tag> =>
  item instanceof Text || item instanceof Built<Tag>;

const applyPropsMethods = {
  id: (elem: HTMLElement, p: NonNullable<BuilderProps["id"]>) => (elem.id = p),

  className: (elem: Element, p: any) => {
    for (const c of p) {
      elem.classList.add(c);
    }
  },

  events: (elem: HTMLElement, p: NonNullable<BuilderProps["events"]>) => {
    for (const [_k, v] of p) {
      const [type, listener, options] = v;
      elem.addEventListener(type, listener, options);
    }
  },

  attributes: (
    elem: HTMLElement,
    p: NonNullable<BuilderProps["attributes"]>
  ) => {
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
