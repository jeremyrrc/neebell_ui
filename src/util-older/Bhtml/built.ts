import {
  appendStringToString,
  appendArrayToArray,
  removeValuesInArray,
  processToChild,
  isNothing,
} from "./utils.js";
import { Build, Id, ToChild } from "./builder.js";

type CanBeUndefinedGuard<Obj, K extends keyof Obj> =
  undefined extends Obj[K] ? K :
  never;

export type Nothing = null | undefined;

type ChildGuard<V extends ToChild, Acceptable> =
  V extends Acceptable ? V :
  V extends (b: Build) => infer R ? R extends Acceptable ? V : never :
  never;

type ListenerCallback<K extends keyof HTMLElementEventMap, T> = (this: T, e: HTMLElementEventMap[K]) => void;

interface ListenerObject<K extends keyof HTMLElementEventMap> {
  [key: string | symbol | number]: any;
  handleEvent: (e: HTMLElementEventMap[K]) => void;
};

type Listener<K extends keyof HTMLElementEventMap, T> = ListenerCallback<K, T> | ListenerObject<K>

export type Tag = keyof HTMLElementTagNameMap;

export class Built<T extends Tag = Tag, Children = {}> {
  readonly elem: HTMLElementTagNameMap[T];
  private registry: Map<any, any> | undefined;
  private abortControllers: Map<string, AbortController> | null;

  constructor(
    elem: HTMLElementTagNameMap[T],
    registry?: Map<any, any>,
  ) {
    this.elem = elem;
    this.registry = registry;
    this.abortControllers = null;
  }

  id(v: string | Nothing) {
    if (isNothing(v)) return this;
    this.elem.id = appendStringToString(this.elem.id, v) || "";
    return this;
  }

  className(v: string | Nothing) {
    if (isNothing(v)) return this;
    const uniqueClasses = Array.from(new Set(v.split(" ")));
    this.elem.className =
      appendArrayToArray(this.elem.className.split(" "), uniqueClasses)?.join(
        " "
      ) || "";
    return this;
  }

  removeClasses(v: string | Nothing) {
    if (isNothing(v) || v == "") return this;
    const uniqueClasses = Array.from(new Set(v.split(" ")));
    this.elem.className =
      removeValuesInArray(this.elem.className.split(" "), uniqueClasses)?.join(
        " "
      ) || "";
    return this;
  }

  attribute(key: string, v: string | Nothing) {
    if (isNothing(v)) return this;
    this.elem.setAttribute(key, v);
    return this;
  }

  attributes(v: Record<string, string | Nothing> | Nothing) {
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

  run(fn: ((this: this) => void)) {
    fn.call(this)
    return this;
  }

  export<T>(fn: ((this: this) => T)) {
    return fn.call(this)
  }

  on<K extends keyof HTMLElementEventMap, L extends {}>(
    type: K,
    listener: L & Listener<K, this> & ThisType<this & L>,
    options?: boolean | AddEventListenerOptions,
    key?: string
  ) {
    if (isNothing(listener)) return this;
    const lis = typeof listener === "function" ?
      listener.bind(this) :
      listener.handleEvent.bind(Object.assign(listener, this));
    if (!isNothing(key)) {
      const abortController = new AbortController();
      options =
        typeof options === "boolean"
          ? { signal: abortController.signal }
          : { ...options, signal: abortController.signal };
      this.abortControllers = this.abortControllers || new Map();
      this.abortControllers.set(key, abortController);
    }
    this.elem.addEventListener(type, lis as EventListenerOrEventListenerObject, options);
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

  append(value: ToChild) {
    if (value === undefined) return this;
    const processed = processToChild(value);
    const node = processed instanceof Built ? processed.elem : processed;
    this.elem.appendChild(node);
    return this;
  }

  getItem<W extends keyof Id<Children>>(where: W) {
    return this.registry?.get(where) as Id<Children>[W];
  }

  getNode<W extends keyof Id<Children>>(where: W): HTMLElement | Text | Comment {
    const value = this.registry?.get(where) as Built | Text | Comment;
    return value instanceof Built ? value.elem : value;
  }

  remove<W extends keyof Id<Children>>(where: CanBeUndefinedGuard<Id<Children>, W>) {
    const node = this.getNode(where);
    if (node instanceof Comment) return this;
    const comment = document.createComment("");
    node.replaceWith(comment);
    this.registry?.set(where, comment);
    return this;
  }

  removeChildren() {
    while (this.elem.lastChild) this.elem.removeChild(this.elem.lastChild);
  }

  replace<W extends keyof Id<Children>, V extends ToChild>(where: W, value: ChildGuard<V, Id<Children>[W]>) {
    if (value === undefined) {
      // @ts-ignore because it can be undefined thanks to the ChildGuard.
      return this.remove(where);
    };
    const node = this.getNode(where);
    if (node === undefined) return this;
    const processed = processToChild(value);
    const newNode = processed instanceof Built ? processed.elem : processed;
    node.replaceWith(newNode);
    this.registry?.set(where, processed);
    return this;
  }

  insert(
    ba: "before" | "after",
    where: keyof Id<Children>,
    value: ToChild,
  ) {
    const refNode = this.getNode(where);
    const processed = processToChild(value);
    const newNode = processed instanceof Built ? processed.elem : processed;
    refNode[ba](newNode);
    return this;
  }
}
