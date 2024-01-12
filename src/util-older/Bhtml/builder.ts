import { Built, Tag } from "./built.js";
import { processToChild } from "./utils.js";

export type Id<O> = O extends infer U ? { [K in keyof U]: U[K] } : never;

type RemoveIndex<T> = {
  [K in keyof T as string extends K ? never : number extends K ? never : K]: T[K]
};

export type B<T extends Tag = Tag, Children = {}> = Built<T, Children>

type Values = undefined | string | number | B

export type ToChild =
  | B
  | string
  | number
  | undefined
  | Signal<Values>
  | { build: () => B }
  | ((b: Build) => B | { build: () => B })

type ToChildren = readonly ([string, ToChild] | ToChild)[]

type BuilderInput = ToChildren | ((b: Build) => ToChildren);

type GetToChildren<I extends BuilderInput> =
  I extends ToChildren ? I :
  I extends (b: Build) => infer R ? R :
  never;

export type Child<C extends ToChild> =
  C extends B ? C :
  C extends string ? string :
  C extends number ? number :
  C extends undefined ? undefined :
  C extends Signal<infer V> ? V :
  C extends { build: () => infer R } ? R :
  C extends (b: Build) => infer R ? R :
  never;

type Key<Tup> =
  Tup extends [infer U, any] ? U :
  never;

type Value<Tup> =
  Tup extends [any, infer U] ? U :
  never;

type Get<K, A extends ToChildren> = {
  [I in keyof A]:
  K extends Key<A[I]> ? Value<A[I]> :
  never;
}[number]

type KeyNames<A extends ToChildren> = {
  [P in keyof A]: Key<A[P]>;
}[number];


type Children<A extends ToChildren> = Id<RemoveIndex<{
  [K in KeyNames<A>]: Child<Get<K, A>>
}>>

export type Signal<T> = {
  id: symbol,
  value: T
}


const context: (() => void)[] = [];

export function createEffect(fn: () => void) {
  const effect = () => {
    context.push(effect);
    fn();
    context.pop();
  }
  effect();
}

const id = Symbol();

export function isSignal(instance: any): instance is Signal<any> {
  return instance && typeof instance === "object" && "id" in instance && instance.id === id;
}

export function signal<T>(value: T) {
  const subscribers = new Set<() => void>();
  return {
    id,
    get value() {
      const current = context[context.length - 1];
      if (current) subscribers.add(current);
      return value;
    },

    set value(newValue: T) {
      value = newValue;
      this.trigger();
    },

    trigger() {
      for (const sub of subscribers) {
        sub();
      }
    }
  }
}

export interface Build<TagName extends Tag = Tag, Nodes = {}> {
  cache: <T>(key: string, make: () => T) => T

  tagName?: Tag
  tag: <T extends Tag>(t: T) => Build<T, Nodes>

  // elem?: HTMLElement
  nodes?: ToChildren
  nodeArgs: <C extends ToChildren>(...c: [...C]) => Build<TagName, Children<C>>
  nodeArray: <C extends ToChildren>(c: C) => Build<TagName, Children<C>>
  returnNodeArray: <C extends ToChildren>(fn: (b: Build) => C) => Build<TagName, Children<C>>

  clear: () => Build<Tag, {}>

  build: () => Built<TagName, Nodes>
}

export const cache = new Map();

const build = Builder();

export function getBuild() {
  return build.clear();
};

export function Builder(): Build {
  return {
    cache<T>(key: string, make: () => T) {
      const cached = cache.get(key);
      if (cached) return cached as ReturnType<typeof make>;
      const built = make();
      cache.set(key, built);
      return built;
    },

    tag<T extends Tag>(t: T) {
      this.tagName = t;
      return this as Build<T>;
    },

    nodeArgs(...c: [...ToChildren]) {
      this.nodes = c;
      return this
    },

    nodeArray(c: ToChildren) {
      this.nodes = c;
      return this;
    },

    returnNodeArray(fn: (b: Build) => ToChildren) {
      const c = fn(getBuild());
      this.nodes = c;
      return this;
    },

    clear() {
      this.tagName, this.nodes = undefined;
      return this;
    },

    build() {
      const built = makeBuilt(this.tagName, this.nodes);
      this.clear();
      return built;
    }
  }
}

function makeBuilt(tagName: string | undefined, nodes: ToChildren | undefined) {
  const elem = document.createElement(tagName || "div");
  const tup = nodes ? tupRegistrySignals(elem, nodes) : nodes;
  return builtReactive(elem, tup);
}

function builtReactive(elem: HTMLElement, tup: readonly [Map<any, any>, Map<any, any>] | undefined) {
  if (tup) {
    const [registry, signals] = tup;
    const built = new Built(elem, registry)

    for (const [key, value] of signals) {
      createEffect(() => {
        // @ts-ignore
        built.replace(key, value.value)
      })
    }
    return built;
  }
  return new Built(elem, tup)
}

function tupRegistrySignals(elem: HTMLElement, c: ToChildren) {
  let registry = new Map();
  let signals = new Map();
  for (const k of c) {
    let key, value;
    if (Array.isArray(k)) {
      key = k[0];
      value = k[1];
    } else {
      value = k;
    }
    const processedChild = processToChild(value)
    const node = processedChild instanceof Built ? processedChild.elem : processedChild;
    elem.appendChild(node);
    if (isSignal(value)) {
      if (!key) key = signals.size + 1;
      signals.set(key, value)
    }
    if (!key) continue;
    registry.set(key, processedChild);
  }
  return [registry, signals] as const;
}

export const startAt = <C extends BuilderInput>(
  elem: HTMLElement,
  children: C,
) => {
  const c = ((typeof children === "function") ? children(Builder()) : children) as ToChildren;
  const tup = tupRegistrySignals(elem, c);
  return builtReactive(elem, tup) as Built<Tag, Children<GetToChildren<C>>>
}
