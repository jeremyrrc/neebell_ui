import {
  Builder,
  Built,
  Nothing,
  PotentialFutureChildNode,
  InputValues,
} from "./index.js";
import {
  appendStringToString,
  appendArrayToArray,
  setRecordValueToMap,
  removeValuesInArray,
  parseInput,
  isNothing,
  appendNode,
  produceNode,
} from "./utils.js";

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
    v = parseInput(v);
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
    v = parseInput(v);
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
    v = parseInput(v);
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
    v = parseInput(v);
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

export class Wrap<T extends HTMLElement> extends ChildNodeRegistry<T> {
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

  modifySelf(fn: ((v: Wrap<T>, b: Builder) => void) | Nothing) {
    if (!fn) return this;
    fn(this, this.builder);
    return this;
  }

  replaceSelf(
    v: ((b: Builder) => Built<HTMLElement>) | Nothing | PotentialFutureChildNode
  ) {
    if (!v) return this;
    if (typeof v === "function") {
      v = v(this.builder);
    }
    v = parseInput(v);
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
