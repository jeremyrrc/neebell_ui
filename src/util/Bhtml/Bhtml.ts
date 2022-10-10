import { curry, CurriedFunction1 } from "lodash";
import { just, nothing, of } from "true-myth/maybe";
export { Hotspots } from "./hotspots.js";
import { Hotspots } from "./hotspots.js";
import {
  appendOrResetString,
  appendOrResetArrayToArray,
  removeValuesInArray,
  appendOrResetRecordToMap,
  setRecordValueToMap,
} from "./BmodifyProps.js";
type Maybe<T> = import("true-myth/maybe").Maybe<T>;

export type Nullable = null | undefined;
export type ParentReady = CurriedFunction1<Maybe<Element>, Element>;
export type FnToBhtml = <T extends HTMLElement>(b: Bhtml<T>) => Bhtml<T>;
export type FutureNode = string | ParentReady | ChildNode;
export type PotentialNode<T extends HTMLElement> =
  | ChildNode
  | string
  | ParentReady
  | Bhtml<T>
  | Nullable;
export type Listener = (hs: Hotspots, event: Event) => void;
export type TypeListener = [string, Listener];
type Hotspot = [string, boolean];

export type Key = string | number;

const checkToParentReady = <T extends HTMLElement>(
  v: NonNullable<PotentialNode<T>>
): FutureNode => {
  return typeof v === "object" && !(v instanceof Node) ? v.parentReady() : v;
};

const broadRecordToFutureNodeRecord = <T extends HTMLElement>(
  v: Record<string, PotentialNode<T>>
) => {
  let FutureNodeRecord: Record<string, FutureNode> = {};
  for (const [key, broad] of Object.entries(v)) {
    if (!broad) continue;
    FutureNodeRecord[key] = checkToParentReady(broad);
  }
  return FutureNodeRecord;
};

const appendOrResetFutureNodeToMap = <T extends HTMLElement>(
  prop: Maybe<Map<Key, FutureNode>>,
  reset: boolean,
  v: Record<string, PotentialNode<T>> | Nullable
): Maybe<Map<Key, FutureNode>> => {
  if (!v) return prop;
  const parentReadyRecord = broadRecordToFutureNodeRecord(v);
  if (Object.keys(parentReadyRecord).length === 0) return prop;
  return appendOrResetRecordToMap(prop, reset, parentReadyRecord);
};

const hotspots = new Hotspots();

const build = curry(
  (
    wrapped: Maybe<HTMLElement>,
    hotspot: Maybe<Hotspot>,
    id: Maybe<string>,
    className: Maybe<Array<string>>,
    events: Maybe<Map<Key, TypeListener>>,
    attributes: Maybe<Map<Key, string>>,
    dataset: Maybe<Map<Key, string>>,
    children: Maybe<Map<Key, FutureNode>>,
    tag: Maybe<string>,
    parent: Maybe<HTMLElement>
  ): Element => {
    const elem = wrapped.isJust
      ? wrapped.value
      : document.createElement(tag.unwrapOr("div"));
    if (id.isJust) elem.id = id.value;
    if (className.isJust) {
      for (const c of className.value) {
        elem.classList.add(c);
      }
    }
    if (attributes.isJust) {
      for (const [key, value] of attributes.value) {
        const name = typeof key === "number" ? key.toString() : key;
        elem.setAttribute(name, value);
      }
    }
    if (dataset.isJust) {
      for (const [key, value] of dataset.value) {
        elem.dataset[key] = value;
      }
    }
    if (hotspot.isJust) {
      const [name, override] = hotspot.value;
      if (hotspots._set(name, elem, override))
        elem.setAttribute("bhtml-hs", name);
    }
    if (events.isJust) {
      for (const [_k, v] of events.value) {
        const [type, listener] = v;
        const eventReady = curry(listener)(hotspots);
        elem.addEventListener(type, eventReady);
      }
    }
    if (children.isJust) {
      const keys = [];
      for (const [k, futureNode] of children.value) {
        keys.push(k);
        // if it's already Node, it's already attached to elem. So continue.
        if (futureNode instanceof Node) continue;
        // Make the string into a Text Node.
        if (typeof futureNode === "string") {
          const textNode = document.createTextNode(futureNode);
          elem.appendChild(textNode);
          continue;
        }
        // If it's not a Text Node, then it is a pendingParent. Provide the elem.
        const newElem = futureNode(just(elem));
        elem.appendChild(newElem);
      }
      elem.setAttribute("bhtml-ns", keys.join(","));
    }
    if (parent.isJust) parent.value.appendChild(elem);
    return elem;
  }
);

export class Bhtml<T extends HTMLElement> {
  #elem: Maybe<T>;
  #hotspot: Maybe<[string, boolean]>;
  #id: Maybe<string>;
  #className: Maybe<Array<string>>;
  #childNodes: Maybe<Map<Key, FutureNode>>;
  #events: Maybe<Map<Key, TypeListener>>;
  #attributes: Maybe<Map<Key, string>>;
  #dataset: Maybe<Map<Key, string>>;
  #tag: Maybe<string>;
  #parent: Maybe<HTMLElement>;

  constructor(elem?: T) {
    this.#elem = of<T>(elem);
    this.#hotspot = nothing();
    this.#id = nothing();
    this.#className = elem ? this.#initClassName(elem) : nothing();
    this.#childNodes = elem ? this.#initChildNodes(elem) : nothing();
    this.#events = nothing();
    this.#attributes = nothing();
    this.#dataset = nothing();
    this.#tag = nothing();
    this.#parent = nothing();
  }

  #initClassName(elem: T) {
    return just(elem.className.split(" "));
  }

  #initChildNodes(elem: T) {
    if (!elem.hasChildNodes()) return nothing<Map<Key, ChildNode>>();
    const attr = elem.getAttribute("bhtml-ns");
    if (!attr) return nothing<Map<Key, ChildNode>>();
    const keys = attr.split(",");
    const values = Array.from(elem.childNodes);
    const merged = keys.map((key, index): [Key, ChildNode] => [
      key,
      values[index],
    ]);
    return just(new Map(merged));
  }

  hotspot(v: string | Nullable, override = true) {
    if (!v) return this;
    this.#hotspot = just([v, override]);
    return this;
  }

  id(v: string | Nullable, reset = false) {
    this.#id = appendOrResetString(this.#id, reset, v);
    return this;
  }

  className(v: string | Nullable, reset = false) {
    if (!v) return this;
    const uniqueClasses = Array.from(new Set(v.split(" ")));
    this.#className = appendOrResetArrayToArray(
      this.#className,
      reset,
      uniqueClasses
    );
    return this;
  }

  classNameRemove(v: string | Nullable) {
    if (!v) return this;
    const uniqueClasses = Array.from(new Set(v.split(" ")));
    this.#className = removeValuesInArray(this.#className, uniqueClasses);
    return this;
  }

  events(v: Record<string, TypeListener | Nullable> | Nullable, reset = false) {
    this.#events = appendOrResetRecordToMap<TypeListener>(
      this.#events,
      reset,
      v
    );
    return this;
  }

  attributes(v: Record<string, string | Nullable> | Nullable, reset = false) {
    this.#attributes = appendOrResetRecordToMap<string>(
      this.#attributes,
      reset,
      v
    );
    return this;
  }

  dataset(v: Record<string, string | Nullable> | Nullable, reset = false) {
    this.#dataset = appendOrResetRecordToMap<string>(this.#dataset, reset, v);
    return this;
  }

  adHoc(v: FnToBhtml | Nullable, key?: Key) {
    if (!v) return this;
    if (!key)
      key = this.#childNodes.isJust ? this.#childNodes.value.size + 1 : 1;
    const parentReady = v(new Bhtml()).parentReady();
    this.#childNodes = setRecordValueToMap(this.#childNodes, key, parentReady);
    return this;
  }

  childNode(v: PotentialNode<T>, key?: Key) {
    if (!v) return this;
    if (!key)
      key = this.#childNodes.isJust ? this.#childNodes.value.size + 1 : 1;
    v = checkToParentReady(v);
    this.#childNodes = setRecordValueToMap(this.#childNodes, key, v);
    return this;
  }

  childNodes(v: Record<string, PotentialNode<T>> | Nullable, reset = false) {
    this.#childNodes = appendOrResetFutureNodeToMap(this.#childNodes, reset, v);
    return this;
  }

  removeChildNode(key: string) {
    if (this.#childNodes.isNothing) return this;
    const childNode = this.#childNodes.value.get(key);
    if (!childNode) return this;
    if (childNode instanceof Node) {
      if (childNode.nodeType === Node.TEXT_NODE) childNode.remove();
      if (childNode.nodeType === Node.ELEMENT_NODE)
        hotspots.remove(childNode as Element);
    }
    this.#childNodes.value.delete(key);
    return this;
  }

  destroyChildNodes() {
    if (this.#childNodes.isNothing) return this;
    if (this.#elem.isJust) hotspots.removeChildren(this.#elem.value);
    this.#childNodes = nothing();
    return this;
  }

  tag<T extends HTMLElement>(v: string | Nullable) {
    if (!v) return this;
    this.#tag = just(v);
    return this as Bhtml<T>;
  }

  parent(v: HTMLElement | Nullable) {
    if (!v) return this;
    this.#parent = just(v);
    return this;
  }

  parentReady(): ParentReady {
    return build(
      this.#elem,
      this.#hotspot,
      this.#id,
      this.#className,
      this.#events,
      this.#attributes,
      this.#dataset,
      this.#childNodes,
      this.#tag
    );
  }

  destroy() {
    if (this.#elem.isJust) {
      hotspots.remove(this.#elem.value);
      this.#elem = nothing();
    }
    return this;
  }

  create<T extends HTMLElement>() {
    this.#elem = build(
      this.#elem,
      this.#hotspot,
      this.#id,
      this.#className,
      this.#events,
      this.#attributes,
      this.#dataset,
      this.#childNodes,
      this.#tag,
      this.#parent
    );
    return this as Bhtml<T>;
  }
  unwrap() {
    return this.#elem.unwrapOr(null);
  }
}
