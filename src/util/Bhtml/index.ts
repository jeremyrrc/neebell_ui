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
  appendNode,
  produceNode,
  unwrapIfKeyUndefined,
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

export interface ChildrenProps {
  className?: Array<string>;
}

export interface BuilderProps {
  cache: string | null;
  tag: keyof HTMLElementTagNameMap | null;
  id: string | null;
  className: Array<string> | null;
  attributes: Map<string, string> | null;
  events: Map<string, [string, EventListener]> | null;
  childrenProps: ChildrenProps | null;
}

export class Builder {
  props: BuilderProps;
  // registry: Array<[string | undefined, FutureChildNode]> | null;
  registry: Array<
    string | HTMLElement | [string, string | Built<HTMLElement>]
  > | null;
  _cache: Map<string, Built<HTMLElement>>;
  constructor() {
    this.props = {
      cache: null,
      tag: null,
      id: null,
      className: null,
      attributes: null,
      events: null,
      childrenProps: null,
    };
    this.registry = null;
    this._cache = new Map();
  }

  [Symbol.iterator]() {
    return (this.registry || [])[Symbol.iterator]();
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
    if (isNothing(v) || v === "") return this;
    const uniqueClasses = Array.from(new Set(v.split(" ")));
    this.props.className = removeValuesInArray(
      this.props.className,
      uniqueClasses
    );
    return this;
  }

  childElemsClassName(v: InputValues["className"]) {
    if (isNothing(v) || v === "") return this;
    if (!this.props.childrenProps) this.props.childrenProps = {};
    const uniqueClasses = Array.from(new Set(v.split(" ")));
    this.props.childrenProps.className =
      appendArrayToArray(
        this.props.childrenProps.className || null,
        uniqueClasses
      ) || undefined;
    this.registry?.forEach((kv) => {
      if (typeof kv === "string") return;
      for (const c of uniqueClasses) {
        if (kv instanceof HTMLElement) {
          kv.classList.add(c);
          continue;
        }
        const [_k, v] = kv;
        if (typeof v === "string") continue;
        v.elem.classList.add(c);
      }
    });
    return this;
  }

  childElemsRemoveClassName(v: InputValues["className"]) {
    if (isNothing(v) || v === "") return this;
    if (!this.props.childrenProps) return this;
    const uniqueClasses = Array.from(new Set(v.split(" ")));
    this.props.childrenProps.className =
      removeValuesInArray(
        this.props.childrenProps.className || null,
        uniqueClasses
      ) || undefined;
    this.registry?.forEach((kv) => {
      if (typeof kv === "string") return;
      for (const c of uniqueClasses) {
        if (kv instanceof HTMLElement) {
          kv.classList.remove(c);
          continue;
        }
        const [_k, v] = kv;
        if (typeof v === "string") continue;
        v.elem.classList.remove(c);
      }
    });
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

  childNode(v: PotentialFutureChildNode, key?: string) {
    if (isNothing(v)) return this;
    if (!this.registry) this.registry = new Array();
    v = narrowToFutureChildNode(v);
    if (typeof v === "object") {
      const elem = v.elem;
      this.props?.childrenProps?.className?.forEach((c) =>
        elem.classList.add(c)
      );
    }
    const kv = unwrapIfKeyUndefined(key, v);
    this.registry.push(kv);

    return this;
  }

  getIndex(where: string | number) {
    if (!this.registry) return undefined;
    where =
      typeof where === "string"
        ? this.registry
            .filter((v): v is [string, string | Built<HTMLElement>] =>
              Array.isArray(v)
            )
            .findIndex(([k, _v]) => k === where)
        : where;
    if (where === -1) return undefined;
    return where;
  }

  remove(where: string | number) {
    if (!this.registry) return this;
    const index = this.getIndex(where);
    if (!index) return this;
    this.registry.splice(index, 1);
    return this;
  }

  replace(where: string | number, v: PotentialFutureChildNode, key?: string) {
    if (!this.registry) return this;
    if (isNothing(v)) return this;

    const index = this.getIndex(where);
    if (!index) return this;
    v = narrowToFutureChildNode(v);
    const kv = unwrapIfKeyUndefined(key, v);
    this.registry.splice(index, 1, kv);
    return this;
  }

  modify(
    where: string | number,
    fn: (futureChildNode: FutureChildNode) => FutureChildNode
  ) {
    if (!this.registry) return this;
    if (isNothing(fn)) return this;
    const index = this.getIndex(where);
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
    const index = this.getIndex(where);
    if (!index) return this;
    v = narrowToFutureChildNode(v);
    const kv = unwrapIfKeyUndefined(key, v);
    if (index === this.registry.length) {
      this.registry.push(kv);
      return this;
    }
    this.registry.splice(index + 1, 0, kv);
    return this;
  }

  insertBefore(
    where: string | number,
    v: PotentialFutureChildNode,
    key?: string
  ) {
    if (isNothing(v)) return this;
    if (!this.registry) return this;
    const index = this.getIndex(where);
    if (!index) return;
    v = narrowToFutureChildNode(v);
    const kv = unwrapIfKeyUndefined(key, v);
    if (index === 0) {
      this.registry.unshift(kv);
      return this;
    }
    this.registry.splice(index, 0, kv);
    return this;
  }

  removeChildNodes() {
    this.registry = null;
  }

  clear(k?: keyof BuilderProps | "childNodes") {
    if (k === "childNodes") {
      this.registry = null;
      return this;
    }
    if (!k) {
      for (const k in this.props) this.props[k] = null;
      this.registry = null;
      return this;
    }
    this.props[k] = null;
    return this;
  }

  build<T extends HTMLElement>(overrideTag?: keyof HTMLElementTagNameMap) {
    // We are going to separate out some special properties to to special things with
    // them. The rest will be added to the HTMLElement created below in 'applyProps'.
    let { tag, events, cache, childrenProps, ...rest } = this.props;
    // You might want to override the tag here at the end if the tag was added in
    // Builder.tag, but at the point of Building it you want to create a different
    // type of Element. (You could repurpose a generic 'div' as a 'section' for
    // example)
    if (overrideTag) tag = overrideTag;
    tag = tag || "div";
    // The freshly made HTMLElement
    const elem = <T>document.createElement(tag);
    // AbortControllers who's signal was added in elem.addEventlistener inside 'addEventsSignals'.
    // These will be used in the returned Built object to remove events that are added here.
    const abortControllers = events
      ? addEventsSignals(elem, events)
      : undefined;

    // Gather all the information about childNodes that will be needed in the returned
    // Built object.
    let builtRegistry:
      | Array<HTMLElement | [string, Text | Built<HTMLElement>]>
      | undefined;
    if (this.registry) {
      builtRegistry = [];
      for (const kv of this.registry) {
        // Identify registry items that were added without a key. By
        // creating a key/value tuple with key undefined for items that are
        // not already key/value tuples. A destructure assignment of the tuple
        // to better identify the items that didn't get a key, and
        // handle the value.
        const [k, v]:
          | [string, string | Built<HTMLElement>]
          | [undefined, string | HTMLElement] = Array.isArray(kv)
          ? kv
          : [undefined, kv];
        // appendNode produces a Node from v (string -> Text / Built -> HTMLElement)
        // I think it is important to store the actual Node (Text | HTMLElement) that was produced
        // into the Built registry. I believe this will be a live Node that the Built methods can
        // interact with.
        const node = appendNode(elem, v);
        if (k === undefined) {
          // Discard Text Nodes that haven't been assigned a key. Because there are
          // no Built methods that deal with unkeyed Text Nodes.
          // TODO: If Built methods are added that deal with unkeyed Text Nodes, then they might
          // need to be added. Maybe Built.childTextNodes... methods might be a thing.
          if (node instanceof Text) continue;
          // Keep HTMLElement Nodes to access them in the Built.childElems... methods
          builtRegistry.push(node);
          continue;
        }
        if (node instanceof Text) {
          // Keep Text Nodes that are keyed.
          builtRegistry.push([k, node]);
          continue;
        }
        // Since this item was keyed, I'll preserve it in its Built form. Built methods will be
        // able to do more things with it (remove events, access it's keyed childNodes etc).
        // Typescript dosen't know that v can't be a string. Strings were converted to Text above (appendNode)
        // and the loop was broken in 'node instanceof Text' above. So I'll tell Typescript v is a Built.
        // Let's hope I'm right.
        builtRegistry.push([k, v as Built<HTMLElement>]);
      }
    }
    // Add id, classes attributes to the freshly made HTMLElement.
    applyProps(elem, rest);
    const built = new Built<T>(elem, this, builtRegistry, abortControllers);
    // Cache this build so that we might not have to do all the above again.
    if (cache) this._cache.set(cache, built);
    // Clear out all the BuilderProperties and childNodeRegistry so that this Builder can continue to be used.
    // The Builder._cache is not cleared so that we can remember this build and maybe not do all the above
    // again.
    this.clear();
    return built;
  }
}

export class ChildNodeRegistry<T extends HTMLElement> {
  elem: T;
  registry: Array<
    Text | HTMLElement | [string, Text | Built<HTMLElement>]
  > | null;
  constructor(elem: T, childKeys?: Array<string | undefined>) {
    this.elem = elem;
    if (childKeys === undefined) {
      while (elem.firstChild) elem.removeChild(elem.firstChild);
      this.registry = null;
    } else {
      this.registry = childKeys;
    }
  }

  *[Symbol.iterator]() {
    let i = 0;
    for (const key of this.registry || []) {
      yield [key, this.elem.childNodes[i]];
      i++;
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
    appendNode(this.elem, v);
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

  removeChildNodes() {
    if (this.registry === null) return this;
    while (this.elem.firstChild) this.elem.removeChild(this.elem.firstChild);
    this.registry = null;
    return this;
  }
}

export type Cleaner = Record<
  "id" | "className" | "attributes" | "events" | "childNodes",
  () => void
>;

export class Built<T extends HTMLElement> extends ChildNodeRegistry<T> {
  abortControllers: Map<string, AbortController> | null;
  builder: Builder;

  constructor(
    elem: T,
    builder: Builder,
    childKeys?: Array<string | undefined>,
    abortControllers?: Map<string, AbortController>
  ) {
    super(elem, childKeys);
    this.abortControllers = abortControllers || null;
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
    this.abortControllers = setRecordValueToMap(
      this.abortControllers,
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
    if (!this.abortControllers) return this;
    const controller = this.abortControllers.get(key);
    if (controller) {
      controller.abort();
      this.abortControllers.delete(key);
    }
    return this;
  }

  modifySelf(fn: ((v: Built<T>, b: Builder) => void) | Nothing) {
    if (!fn) return this;
    fn(this, this.builder);
    return this;
  }

  replaceSelf(
    v: ((b: Builder) => Built<T>) | Nothing | PotentialFutureChildNode
  ) {
    if (!v) return this;
    if (typeof v === "function") {
      v = v(this.builder);
    }
    v = narrowToFutureChildNode(v);
    this.elem.replaceWith(produceNode(v));
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
        if (!this.abortControllers) return;
        for (const [_k, c] of this.abortControllers) c.abort();
        this.abortControllers.clear();
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
