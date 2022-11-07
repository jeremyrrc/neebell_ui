import {
  appendStringToString,
  appendArrayToArray,
  appendRecordToMap,
  setRecordValueToMap,
  removeValuesInArray,
  narrowToFutureChildNode,
  isNothing,
  applyProps,
  addEventsSignals,
  addChildNode,
  produceNode,
} from "./utils.js";

export type Nothing = null | undefined;
export type PotentialFutureChildNode =
  | string
  | number
  | Built<HTMLElement>
  | Nothing;
export type FutureChildNode = string | Built<HTMLElement>;

export interface InputValues {
  tag: keyof HTMLElementTagNameMap | Nothing;
  id: string | Nothing;
  className: string | Nothing;
  attribute: string | Nothing;
  attributes: Record<string, string | Nothing> | Nothing;
  event: EventListener | Nothing;
  events: Record<string, [string, EventListener] | Nothing> | Nothing;
  childNode: PotentialFutureChildNode;
}

export interface BuilderProps {
  cache: string | null;
  tag: keyof HTMLElementTagNameMap | null;
  id: string | null;
  className: Array<string> | null;
  attributes: Map<string, string> | null;
  events: Map<string, [string, EventListener]> | null;
}

export class FutureChildNodeRegistry {
  registry: Array<[string | undefined, FutureChildNode]> | null;

  constructor() {
    this.registry = null;
  }

  #getIndex(where: string | number) {
    if (!this.registry) return undefined;
    where =
      typeof where === "string"
        ? this.registry.findIndex(([k, _v]) => k === where)
        : where;
    if (where === -1) return undefined;
    return where;
  }

  childNode(v: PotentialFutureChildNode, key?: string) {
    if (isNothing(v)) return this;
    if (!this.registry) this.registry = new Array();
    v = narrowToFutureChildNode(v);
    this.registry.push([key, v]);
    return this;
  }

  remove(where: string | number) {
    if (!this.registry) return this;
    const index = this.#getIndex(where);
    if (!index) return this;
    this.registry.splice(index, 1);
    return this;
  }

  replace(where: string | number, v: PotentialFutureChildNode, key?: string) {
    if (!this.registry) return this;
    if (isNothing(v)) return this;

    const index = this.#getIndex(where);
    if (!index) return this;
    v = narrowToFutureChildNode(v);
    this.registry.splice(index, 1, [key, v]);
    return this;
  }

  modify(
    where: string | number,
    fn: (futureChildNode: FutureChildNode) => FutureChildNode
  ) {
    if (!this.registry) return this;
    if (isNothing(fn)) return this;
    const index = this.#getIndex(where);
    if (!index) return this;
    const [key, childNode] = this[index];
    const modified = fn(childNode);
    this.registry[index] = [key, modified];
    return this;
  }

  insertAfter(
    where: string | number,
    v: PotentialFutureChildNode,
    key?: string
  ) {
    if (!this.registry) return this;
    if (isNothing(v)) return this;
    const index = this.#getIndex(where);
    if (!index) return this;
    v = narrowToFutureChildNode(v);
    if (index === this.registry.length) {
      this.registry.push([key, v]);
      return this;
    }
    this.registry.splice(index + 1, 0, [key, v]);
    return this;
  }

  insertBefore(
    where: string | number,
    v: PotentialFutureChildNode,
    key?: string
  ) {
    if (isNothing(v)) return this;
    if (!this.registry) return this;
    const index = this.#getIndex(where);
    if (!index) return;
    v = narrowToFutureChildNode(v);
    if (index === 0) {
      this.registry.unshift([key, v]);
      return this;
    }
    this.registry.splice(index, 0, [key, v]);
    return this;
  }
}

export class Builder extends FutureChildNodeRegistry {
  props: BuilderProps;
  _cache: Map<string, Built<HTMLElement>>;
  constructor() {
    super();
    this.props = {
      cache: null,
      tag: null,
      id: null,
      className: null,
      attributes: null,
      events: null,
    };
    this._cache = new Map();
  }

  cache(v: string | Nothing) {
    if (isNothing(v)) return this;
    this.props.cache = v;
    return this;
  }

  cached(v: string) {
    return this._cache.get(v);
  }

  tag(v: InputValues["tag"]) {
    if (isNothing(v)) return this;
    this.props.tag = v;
    return this;
  }

  id(v: InputValues["id"]) {
    if (v === "") return this;
    this.props.id = appendStringToString(this.props.id, v);
    return this;
  }

  className(v: InputValues["className"]) {
    if (isNothing(v) || v === "") return this;
    const uniqueClasses = Array.from(new Set(v.split(" ")));
    this.props.className = appendArrayToArray(
      this.props.className,
      uniqueClasses
    );
    return this;
  }

  removeClasses(v: InputValues["className"]) {
    if (!v) return this;
    const uniqueClasses = Array.from(new Set(v.split(" ")));
    this.props.className = removeValuesInArray(
      this.props.className,
      uniqueClasses
    );
    return this;
  }

  attribute(key: string, v: InputValues["attribute"]) {
    if (isNothing(v)) return this;
    this.props.attributes = setRecordValueToMap(this.props.attributes, key, v);
    return this;
  }

  attributes(v: InputValues["attributes"]) {
    this.props.attributes = appendRecordToMap(this.props.attributes, v);
    return this;
  }

  removeAttribute(key: string) {
    this.props.attributes?.delete(key);
    return this;
  }

  event(type: string, v: InputValues["event"], key?: string) {
    if (isNothing(v)) return this;
    this.props.events = setRecordValueToMap(this.props.events, key, [type, v]);
    return this;
  }

  events(v: InputValues["events"]) {
    this.props.events = appendRecordToMap(this.props.events, v);
    return this;
  }

  removeEvent(key: string) {
    this.props.events?.delete(key);
    return this;
  }

  clear(k?: keyof BuilderProps) {
    if (!k) {
      for (const k in this.props) this.props[k] = null;
      this.registry = null;
      return this;
    }
    this.props[k] = null;
    return this;
  }

  build<T extends HTMLElement>(overrideTag?: keyof HTMLElementTagNameMap) {
    let { tag, events, cache, ...props } = this.props;
    if (overrideTag) tag = overrideTag;
    tag = tag || "div";
    const elem = <T>document.createElement(tag);
    const abortControllers = events
      ? addEventsSignals(elem, events)
      : undefined;

    let childKeys: Array<string | undefined> | undefined;
    if (this.registry) {
      childKeys = [];
      for (const [k, v] of this.registry) {
        childKeys.push(k);
        addChildNode(elem, v);
      }
    }
    applyProps(elem, props);
    const built = new Built<T>(elem, this, childKeys, abortControllers);
    if (cache) this._cache.set(cache, built);
    this.clear();
    return built;
  }
}

export class ChildNodeRegistry<T extends HTMLElement> {
  elem: T;
  registry: Array<string | undefined> | null;
  constructor(elem: T, childKeys?: Array<string | undefined>) {
    this.elem = elem;
    if (childKeys === undefined) {
      while (elem.firstChild) elem.removeChild(elem.firstChild);
      this.registry = null;
    } else {
      this.registry = childKeys;
    }
  }

  #getIndex(where: string | number) {
    if (!this.registry) return undefined;
    where = typeof where === "string" ? this.registry.indexOf(where) : where;
    if (where === -1) return undefined;
    return where;
  }

  #get(where: string | number) {
    const index = this.#getIndex(where);
    if (index === undefined) return undefined;
    return this.elem.childNodes[index];
  }

  childNode(v: PotentialFutureChildNode, key?: string) {
    if (isNothing(v)) return this;
    if (!this.registry) this.registry = new Array();
    v = narrowToFutureChildNode(v);
    addChildNode(this.elem, v);
    this.registry.push(key);
    return this;
  }

  remove(where: string | number) {
    if (!this.registry) return this;
    const index = this.#getIndex(where);
    if (index === undefined) return this;
    this.elem.childNodes[index].remove();
    this.registry.splice(index, 1);
    return this;
  }

  replace(where: string | number, v: PotentialFutureChildNode) {
    if (!this.registry) return this;
    if (isNothing(v)) return this;
    const node = this.#get(where);
    if (!node) return this;
    v = narrowToFutureChildNode(v);
    node.replaceWith(produceNode(v));
    return this;
  }

  modify(where: string | number, fn: (cn: ChildNode) => void) {
    if (!this.registry) return this;
    if (isNothing(fn)) return this;
    const node = this.#get(where);
    if (!node) return this;
    fn(node);
    return this;
  }

  insertAfter(
    where: string | number,
    v: PotentialFutureChildNode,
    key?: string
  ) {
    if (!this.registry) return this;
    if (isNothing(v)) return this;
    const index = this.#getIndex(where);
    if (index === undefined) return this;
    const node = this.elem.childNodes[index];
    v = narrowToFutureChildNode(v);
    node.after(produceNode(v));
    if (index === this.registry.length) {
      this.registry.push(key);
      return;
    }
    this.registry.splice(index + 1, 0, key);
    return this;
  }

  insertBefore(
    where: string | number,
    v: PotentialFutureChildNode,
    key?: string
  ) {
    if (!this.registry) return this;
    if (isNothing(v)) return this;
    const index = this.#getIndex(where);
    if (index === undefined) return this;
    const node = this.elem.childNodes[index];
    v = narrowToFutureChildNode(v);
    node.before(produceNode(v));
    if (index === 0) {
      this.registry.unshift(key);
      return;
    }
    this.registry.splice(index, 0, key);
    return this;
  }
}

export type Cleaner = Record<
  "id" | "className" | "attributes" | "events" | "childNodes",
  () => void
>;

export class Built<T extends HTMLElement> extends ChildNodeRegistry<T> {
  #abortControllers: Map<string, AbortController> | null;
  builder: Builder;

  constructor(
    elem: T,
    builder: Builder,
    childKeys?: Array<string | undefined>,
    abortControllers?: Map<string, AbortController>
  ) {
    super(elem, childKeys);
    this.#abortControllers = abortControllers || null;
    this.builder = builder;
  }

  id(v: InputValues["id"]) {
    if (isNothing(v)) return this;
    this.elem.id = appendStringToString(this.elem.id, v) || "";
    return this;
  }

  className(v: InputValues["className"]) {
    if (isNothing(v)) return this;
    const uniqueClasses = Array.from(new Set(v.split(" ")));
    this.elem.className =
      appendArrayToArray(this.elem.className.split(" "), uniqueClasses)?.join(
        " "
      ) || "";
    return this;
  }

  removeClasses(v: InputValues["className"]) {
    if (isNothing(v) || v == "") return this;
    const uniqueClasses = Array.from(new Set(v.split(" ")));
    this.elem.className =
      removeValuesInArray(this.elem.className.split(" "), uniqueClasses)?.join(
        " "
      ) || "";
    return this;
  }

  attribute(key: string, v: InputValues["attribute"]) {
    if (isNothing(v)) return this;
    this.elem.setAttribute(key, v);
    return this;
  }

  attributes(v: InputValues["attributes"]) {
    if (isNothing(v)) return this;
    for (const name in v) {
      this.attribute(name, v[name]);
    }
    return this;
  }

  removeAttribute(key: string) {
    this.elem.removeAttribute(key);
    return this;
  }

  event(type: string, v: InputValues["event"], key?: string) {
    if (isNothing(v)) return this;
    const controller = new AbortController();
    this.elem.addEventListener(type, v, {
      signal: controller.signal,
    });
    this.#abortControllers = setRecordValueToMap(
      this.#abortControllers,
      key,
      controller
    );
    return this;
  }

  events(v: InputValues["events"]) {
    if (isNothing(v)) return this;
    for (const k in v) {
      const value = v[k];
      if (isNothing(value)) continue;
      const [type, listener] = value;
      this.event(type, listener, k);
    }
    return this;
  }

  removeEvent(key: string) {
    if (!this.#abortControllers) return this;
    const controller = this.#abortControllers.get(key);
    if (controller) {
      controller.abort();
      this.#abortControllers.delete(key);
    }
    return this;
  }

  modifySelf(fn: ((v: Built<T>, b: Builder) => void) | Nothing) {
    if (!fn) return this;
    fn(this, this.builder);
    return this;
  }

  replaceSelf(fn: ((b: Builder) => Built<T>) | Nothing) {
    if (!fn) return this;
    const built = fn(this.builder);
    this.elem.replaceWith(built.elem);
    return this;
  }

  clear(prop?: keyof Cleaner) {
    const c: Cleaner = {
      id: () => (this.elem.id = ""),
      className: () => (this.elem.className = ""),
      attributes: () =>
        this.elem
          .getAttributeNames()
          .forEach((name) => this.elem.removeAttribute(name)),
      events: () => {
        if (!this.#abortControllers) return;
        for (const [_k, c] of this.#abortControllers) c.abort();
        this.#abortControllers.clear();
      },
      childNodes: () => {
        while (this.elem.firstChild) {
          this.elem.removeChild(this.elem.firstChild);
        }
        this.registry = null;
      },
    };
    if (!prop) {
      for (const k in c) {
        c[k]();
      }
      return this;
    }
    if (c[prop]) c[prop]();
    return this;
  }

  unwrap() {
    return this.elem;
  }
}
