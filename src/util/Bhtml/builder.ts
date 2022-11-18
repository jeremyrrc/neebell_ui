import {
  appendStringToString,
  appendArrayToArray,
  appendRecordToMap,
  setRecordValueToMap,
  removeValuesInArray,
  parseInput,
  isNothing,
  isRegistryItem,
  applyProps,
  appendNode,
  unwrapBuiltIfKeyUndefined,
} from "./utils.js";

import { Built } from "./built.js";

import {
  FutureChildNode,
  PotentialFutureChildNode,
  InputValues,
  Nothing,
  BuilderProps,
} from "./index.js";

export class Builder {
  cleared: boolean;
  props: BuilderProps;
  childNodes: Array<string | HTMLElement | [string, string | Built]>;
  constructor() {
    this.cleared = false;
    this.props = {
      cache: null,
      tag: null,
      id: null,
      className: null,
      attributes: null,
      data: null,
      events: null,
      abortControllers: null,
      childrenProps: null,
    };
    this.childNodes = new Array();
  }

  [Symbol.iterator]() {
    return (this.childNodes || [])[Symbol.iterator]();
  }

  static builder = new Builder();

  static getBuilder() {
    return Builder.builder.cleared ? Builder.builder : new Builder();
  }

  static cache = new Map<string, Built>();

  cache(v: string | Nothing) {
    if (isNothing(v)) return this;
    this.props.cache = v;
    return this;
  }

  cached(v: string) {
    return Builder.cache.get(v);
  }

  // b(v: keyof typeof tagMap) {
  //   return new tagMap[v]();
  // }

  tag(v: string | Nothing) {
    if (isNothing(v) || v === "") return this;
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

  childrenClassName(ar: "add" | "remove", v: InputValues["className"]) {
    if (isNothing(v) || v === "") return this;
    if (!this.props.childrenProps) this.props.childrenProps = {};
    const uniqueClasses = Array.from(new Set(v.split(" ")));
    // save/remove classes to be applied to all future elements
    if (ar === "add") {
      this.props.childrenProps.className =
        appendArrayToArray(
          this.props.childrenProps.className || null,
          uniqueClasses
        ) || undefined;
    } else {
      this.props.childrenProps.className =
        removeValuesInArray(
          this.props.childrenProps.className || null,
          uniqueClasses
        ) || undefined;
    }
    // Add/Remove the className to/from all current childNodes.
    this.childNodes?.forEach((kv) => {
      if (typeof kv === "string") return;
      for (const c of uniqueClasses) {
        if (kv instanceof HTMLElement) {
          kv.classList[ar](c);
          continue;
        }
        const [_k, v] = kv;
        if (typeof v === "string") continue;
        v.elem.classList[ar](c);
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

  event<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (e: HTMLElementEventMap[K]) => void,
    options?: boolean | AddEventListenerOptions,
    key?: string
  ) {
    this.props.events = this.props.events || new Map();
    if (!isNothing(key)) {
      const abortController = new AbortController();
      options =
        typeof options === "boolean"
          ? { signal: abortController.signal }
          : { ...options, signal: abortController.signal };
      this.props.abortControllers = this.props.abortControllers || new Map();
      this.props.abortControllers.set(key, abortController);
      this.props.events.set(key, [type, listener as EventListener, options]);
      return this;
    }
    this.props.events.set(Symbol(), [
      type,
      listener as EventListener,
      options || false,
    ]);
    return this;
  }

  removeEvent(key: string) {
    this.props.events?.delete(key);
    this.props.abortControllers?.delete(key);
    return this;
  }

  childNode(v: PotentialFutureChildNode, key?: string) {
    if (isNothing(v)) return this;
    v = parseInput(Builder.getBuilder(), v);
    if (v instanceof Built) {
      const elem = v.elem;
      this.props?.childrenProps?.className?.forEach((c) =>
        elem.classList.add(c)
      );
    }
    const kv = unwrapBuiltIfKeyUndefined(key, v);
    this.childNodes.push(kv);

    return this;
  }

  getIndex(where: string | number) {
    if (!this.childNodes) return undefined;
    where =
      typeof where === "string"
        ? this.childNodes
            .filter((v): v is [string, string | Built] => Array.isArray(v))
            .findIndex(([k, _v]) => k === where)
        : where;
    if (where === -1) return undefined;
    return where;
  }

  remove(where: string | number) {
    if (!this.childNodes) return this;
    const index = this.getIndex(where);
    if (!index) return this;
    this.childNodes.splice(index, 1);
    return this;
  }

  replace(where: string | number, v: PotentialFutureChildNode, key?: string) {
    if (!this.childNodes) return this;
    if (isNothing(v)) return this;
    const index = this.getIndex(where);
    if (!index) return this;
    v = parseInput(Builder.getBuilder(), v);
    const kv = unwrapBuiltIfKeyUndefined(key, v);
    this.childNodes.splice(index, 1, kv);
    return this;
  }

  modify(
    where: string | number,
    fn: (futureChildNode: FutureChildNode) => FutureChildNode
  ) {
    if (!this.childNodes) return this;
    if (isNothing(fn)) return this;
    const index = this.getIndex(where);
    if (!index) return this;
    const [key, childNode] = this[index];
    const modified = fn(childNode);
    this.childNodes[index] = [key, modified];
    return this;
  }

  insert(
    ba: "before" | "after",
    where: string | number,
    v: PotentialFutureChildNode,
    key?: string
  ) {
    if (!this.childNodes) return this;
    if (isNothing(v)) return this;
    const index = this.getIndex(where);
    if (!index) return this;
    v = parseInput(Builder.getBuilder(), v);
    const kv = unwrapBuiltIfKeyUndefined(key, v);
    if (ba === "after" && index === this.childNodes.length) {
      this.childNodes.push(kv);
      return this;
    }
    if (ba === "before" && index === 0) {
      this.childNodes.unshift(kv);
      return this;
    }
    ba === "after"
      ? this.childNodes.splice(index + 1, 0, kv)
      : this.childNodes.splice(index, 0, kv);
    return this;
  }

  clear(k?: keyof BuilderProps | "childNodes") {
    if (k === "childNodes") {
      this.childNodes.length = 0;
      return this;
    }
    if (!k) {
      for (const k in this.props) this.props[k] = null;
      this.childNodes.length = 0;
      this.cleared = true;
      return this;
    }
    this.props[k] = null;
    return this;
  }

  build() {
    // We are going to separate out some special properties to to special things with
    // them. The rest will be added to the HTMLElement created below in 'applyProps'.

    // AbortControllers who's signal was added in elem.addEventlistener inside 'applyProps'.
    // These will be used in the returned Built object to remove events that are added here.
    let { tag, cache, abortControllers, childrenProps, ...rest } = this.props;
    // The freshly made HTMLElement
    const elem = document.createElement(tag || "div");
    // Gather all the information about childNodes that will be needed in the returned
    // Built object.
    let builtRegistry: Map<string, Text | Built> | undefined;
    if (this.childNodes) {
      builtRegistry = new Map();
      for (const item of this.childNodes) {
        // Identify registry items that were added without a key. By
        // creating a key/value tuple with key undefined for items that are
        // not already key/value tuples. A destructure assignment of the tuple
        // to better identify the items that didn't get a key, and
        // handle the value.
        const [k, v]:
          | [string, string | Built]
          | [undefined, string | HTMLElement] = Array.isArray(item)
          ? item
          : [undefined, item];
        const node = appendNode(elem, v, k);
        // Don't include items that where not given keys.
        // Don't include HTMLElements that were unwrapped out of Builts.
        // into the registry.
        if (k !== undefined && isRegistryItem(node)) builtRegistry.set(k, node);
      }
    }
    // Add id, classes attributes to the freshly made HTMLElement.
    applyProps(elem, rest);
    // This might need a special Built
    const built = new Built(
      elem,
      builtRegistry,
      childrenProps || undefined,
      abortControllers || undefined
    );
    // Cache this build so that we might not have to do all the above again.
    if (cache) Builder.cache.set(cache, built);
    // Clear out all the BuilderProperties and childNodes so that this Builder can continue to be used.
    this.clear();
    return built;
  }
}
