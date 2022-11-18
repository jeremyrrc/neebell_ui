import {
  appendStringToString,
  appendArrayToArray,
  removeValuesInArray,
  parseInput,
  isNothing,
  isRegistryItem,
  appendNode,
  produceNode,
} from "./utils.js";

import { Builder } from "./builder.js";

import {
  ChildrenProps,
  InputValues,
  Nothing,
  PotentialFutureChildNode,
} from "./index.js";

export type Cleaner = Record<
  "id" | "className" | "attributes" | "events" | "childNodes",
  () => void
>;

export class Built {
  elem: HTMLElement;
  registry: Map<string, Text | Built>;
  childrenProps: ChildrenProps | null;
  abortControllers: Map<string, AbortController> | null;

  constructor(
    elem: HTMLElement,
    registry?: Map<string, Text | Built>,
    childProps?: ChildrenProps,
    abortControllers?: Map<string, AbortController>
  ) {
    this.elem = elem;
    if (registry === undefined) {
      while (elem.firstChild) elem.removeChild(elem.firstChild);
      this.registry = new Map();
    } else {
      this.registry = registry;
    }
    this.childrenProps = childProps || null;
    this.abortControllers = abortControllers || null;
  }

  // *[Symbol.iterator]() {
  //   let i = 0;
  //   for (const key of this.registry || []) {
  //     yield [key, this.elem.childNodes[i]];
  //     i++;
  //   }
  // }

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

  data(v: Record<string, string> | Nothing) {
    if (isNothing(v)) return this;
    for (const name in v) {
      this.elem.dataset[name] = v[name];
    }
    return this;
  }

  dataset(name?: string) {
    if (!isNothing(name)) return this.elem.dataset[name] || undefined;
    const data = {};
    for (const n in this.elem.dataset) {
      data[n] = this.elem.dataset[n];
    }
    return data;
  }

  removeAttribute(key: string) {
    this.elem.removeAttribute(key);
    return this;
  }

  event<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (e: HTMLBodyElementEventMap[K]) => void,
    options?: boolean | AddEventListenerOptions,
    key?: string
  ) {
    if (isNothing(listener)) return this;
    if (!isNothing(key)) {
      const abortController = new AbortController();
      options =
        typeof options === "boolean"
          ? { signal: abortController.signal }
          : { ...options, signal: abortController.signal };
      this.abortControllers = this.abortControllers || new Map();
      this.abortControllers.set(key, abortController);
    }
    this.elem.addEventListener(type, listener as EventListener, options);
    return this;
  }

  removeEvent(key: string) {
    const controller = this.abortControllers?.get(key);
    if (controller) {
      controller.abort();
      this.abortControllers?.delete(key);
    }
    return this;
  }

  modifySelf(fn: ((v: Built, b: Builder) => void) | Nothing) {
    if (!fn) return this;
    fn(this, Builder.getBuilder());
    return this;
  }

  replaceSelf(v: ((b: Builder) => Built) | Nothing | PotentialFutureChildNode) {
    if (!v) return this;
    if (typeof v === "function") {
      v = v(Builder.getBuilder());
    }
    v = parseInput(Builder.getBuilder(), v);
    this.elem.replaceWith(produceNode(v));
    return this;
  }

  childrenClassName(ar: "add" | "remove", v: InputValues["className"]) {
    if (isNothing(v) || v === "") return this;
    if (!this.childrenProps) this.childrenProps = {};
    const uniqueClasses = Array.from(new Set(v.split(" ")));
    // save/remove classes to be applied to all future elements
    if (ar === "add") {
      this.childrenProps.className =
        appendArrayToArray(
          this.childrenProps.className || null,
          uniqueClasses
        ) || undefined;
    } else {
      this.childrenProps.className =
        removeValuesInArray(
          this.childrenProps.className || null,
          uniqueClasses
        ) || undefined;
    }
    // Add/Remove classes to/from all children elements.
    Array.from(this.elem.children).forEach((elemChild) => {
      for (const c of uniqueClasses) elemChild.classList[ar](c);
    });
    return this;
  }

  childNode(v: PotentialFutureChildNode, key?: string) {
    if (isNothing(v)) return this;
    v = parseInput(Builder.getBuilder(), v);
    const node = appendNode(this.elem, v, key);
    if (key !== undefined && isRegistryItem(node)) this.registry.set(key, node);
    // add properties from childrenProps.
    if (v instanceof Built) {
      const elem = v.elem;
      this.childrenProps?.className?.forEach((c) => elem.classList.add(c));
    }
    return this;
  }

  query(where: string) {
    const path = where.split("/");
    let item;
    let registry = this.registry;
    for (const name of path) {
      item = registry?.get(name);
      if (item === undefined) break;
      if (item instanceof Built) registry = item.registry;
    }
    return item;
  }

  getNode(where: string | number) {
    if (typeof where === "string") {
      const value = this.registry.get(where);
      if (!value) return undefined;
      return value instanceof Text ? value : value.elem;
    }
    return this.elem.childNodes.item(where) || undefined;
  }

  getItem(where: string | number) {
    if (typeof where === "string") {
      return this.registry.get(where);
    }
    return this.elem.childNodes.item(where) || undefined;
  }

  remove(where: string | number) {
    const node = this.getNode(where);
    if (node) node.remove();
  }

  replace(where: string | number, v: PotentialFutureChildNode) {
    if (isNothing(v)) return this;
    const node = this.getNode(where);
    if (!node) return this;
    v = parseInput(Builder.getBuilder(), v);
    const newNode = produceNode(v);
    node.replaceWith(newNode);
    if (typeof where === "string") {
      const item = newNode instanceof Text ? newNode : v;
      if (isRegistryItem(item)) this.registry.set(where, item);
    }
    return this;
  }

  modify(
    where: string | number,
    fn: (cn: ChildNode | Built, b: Builder) => void | PotentialFutureChildNode
  ) {
    if (isNothing(fn)) return this;
    const node = this.getItem(where);
    if (!node) return this;
    const built = fn(node, Builder.getBuilder());
    if (built) this.replace(where, built);
    return this;
  }

  insert(
    ba: "before" | "after",
    where: string | number,
    v: PotentialFutureChildNode,
    key?: string
  ) {
    if (isNothing(v)) return this;
    const refNode = this.getNode(where);
    if (!refNode) return this;
    v = parseInput(Builder.getBuilder(), v);
    const newNode = produceNode(v);
    refNode[ba](produceNode(v));
    if (typeof key === "string") {
      const item = newNode instanceof Text ? newNode : v;
      if (isRegistryItem(item)) this.registry.set(key, item);
    }
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
        this.registry.clear();
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