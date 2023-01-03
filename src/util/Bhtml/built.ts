import {
  appendStringToString,
  appendArrayToArray,
  removeValuesInArray,
  processToChild,
  isNothing,
  deprocess,
} from "./utils.js";

import { Builder } from "./builder.js";

// ChildNode key
type StringLiteral<T> =
  T extends string
  ? string extends T
  ? never
  : T
  : never;

type CanBeUndefinedGuard<Obj, K extends keyof Obj> = undefined extends Obj[K] ? K : never;

type NewKey<L, Children, K> =
  L extends "L" ? never :
  K extends keyof Children ? never :
  K;

// ChildNode value
export type Nothing = null | undefined;

export type ToChild =
  | B
  | string
  | number
  | undefined
  | ((b: Builder) => B)

type LockChild<C> =
  C extends B<"L"> ? C :
  C extends B<"O", infer T, infer Children> ? B<"L", T, Children> :
  never;

export type Child<C> =
  C extends B ? LockChild<C> :
  C extends string ? string :
  C extends number ? number :
  C extends undefined ? undefined :
  C extends (b: Builder) => infer R ? LockChild<R> :
  never;

type ChildGuard<V extends ToChild, Acceptable> = V extends Acceptable ? V : never;

// Children 
type Merge<First, Second> = {
  [K in keyof First | keyof Second]:
  K extends keyof Second ? Second[K] :
  K extends keyof First ? First[K] :
  never
}

type Id<T> = T extends infer U ? { [K in keyof U]: U[K] } : never;

type SetChild<Original, Key, Value> = Id<Merge<Original, { [P in StringLiteral<Key>]: Value }>>;

// Built.on
type ListenerCallback<K extends keyof HTMLElementEventMap, T> = (this: T, e: HTMLElementEventMap[K]) => void;

interface ListenerObject<K extends keyof HTMLElementEventMap> {
  [key: string | symbol]: any;
  handleEvent: (e: HTMLElementEventMap[K]) => void;
};

type Listener<K extends keyof HTMLElementEventMap, T> = ListenerCallback<K, T> | ListenerObject<K>

// Built
export type Tag = keyof HTMLElementTagNameMap;

// type L<B> = Omit<B, "_append" | "_insert">;
type LO = "L" | "O";

type B<
  L extends LO = "O",
  T extends keyof HTMLElementTagNameMap = Tag,
  Children = {}
> = Built<L, T, Children>;

// type IsLocked<Lock, B> = Lock extends "L" ? L<B> : B;

export class Built<L extends LO = "O", T extends keyof HTMLElementTagNameMap = Tag, Children = {}> {
  tag!: T;
  elem: HTMLElementTagNameMap[T];
  registry: Map<keyof Id<Children>, any>;
  abortControllers: Map<string, AbortController> | null;

  constructor(elem: HTMLElementTagNameMap[T]) {
    this.elem = elem;
    while (elem.firstChild) elem.removeChild(elem.firstChild);
    this.registry = new Map();
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
    return this;
  }

  removeAttribute(key: string) {
    this.elem.removeAttribute(key);
    return this as B<L, T, Children>;
  }

  run(fn: ((this: this) => void)) {
    // @ts-ignore
    fn.call(this)
    return this;
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

  append<V extends ToChild>(value: V) {
    if (value === undefined) return this as B<L, T, Children>
    const processed = processToChild(value);
    const node = processed instanceof Built ? processed.elem : processed;
    this.elem.appendChild(node);
    return this;
  }

  _append<K, V extends ToChild>(key: NewKey<L, Children, K>, value: V):
    B<L, T, SetChild<Children, K, Child<V>>> {
    const processed = processToChild(value);
    const node = processed instanceof Built ? processed.elem : processed;
    this.elem.appendChild(node);
    // @ts-ignore
    this.registry.set(key, processed);
    return this as B<L, T, SetChild<Children, K, Child<V>>>
  }

  getNode<W extends keyof Id<Children>>(where: W): HTMLElement | Text | Comment {
    const value = this.registry.get(where) as Built | Text | Comment;
    return value instanceof Built ? value.elem : value;
  }

  remove<W extends keyof Id<Children>>(where: CanBeUndefinedGuard<Id<Children>, W>) {
    const node = this.getNode(where);
    if (node instanceof Comment) return this;
    const comment = document.createComment("");
    node.replaceWith(comment);
    this.registry.set(where, comment);
    return this;
  }

  replace<W extends keyof Id<Children>, V extends ToChild>(where: W, value: ChildGuard<V, Id<Children>[W]>) {
    if (value === undefined) {
      // @ts-ignore because it can be undefined thanks to the ChildGuard.
      return this.remove(where);
    };
    const node = this.getNode(where);
    const processed = processToChild(value);
    const newNode = processed instanceof Built ? processed.elem : processed;
    node.replaceWith(newNode);
    this.registry.set(where, processed);
    return this;
  }

  modify<W extends keyof Id<Children>>(
    where: W,
    fn: (this: { value: Id<Children>[W] }) => void
  ) {
    const value = this.registry.get(where);
    const deprocessed = deprocess(value) as Id<Children>[W];
    const obj = { value: deprocessed };
    fn.call(obj);
    if (deprocessed !== obj.value) {
      // @ts-ignore because obj.value can't be reassigned to a different type.
      return this.replace(where, obj.value);
    }
    return this;
  }

  insert<W extends keyof Id<Children>, V extends ToChild>(
    ba: "before" | "after",
    where: W,
    value: V,
  ) {
    const refNode = this.getNode(where);
    const processed = processToChild(value);
    const newNode = processed instanceof Built ? processed.elem : processed;
    refNode[ba](newNode);
    return this;
  }

  // _insert<W extends keyof Id<Children>, K, V extends ToChild>(
  //   ba: "before" | "after",
  //   where: W,
  //   key: NewKey<L, Children, K>,
  //   value: V,
  // ): B<L, T, SetChild<Children, K, Child<V>>> {
  //   const refNode = this.getNode(where);
  //   const processed = processToChild(value);
  //   const newNode = processed instanceof Built ? processed.elem : processed;
  //   refNode[ba](newNode);
  //   // @ts-ignore
  //   this.registry.set(key, processed)
  //   return this as B<L, T, SetChild<Children, W, Child<V>>>
  // }

  lock(): B<"L", T, Children> {
    return this as B<"L", T, Children>
  }
}

const t = {
  hello: <undefined | string>"hello",
  hello2: <null | string>"hello"
}
