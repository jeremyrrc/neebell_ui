import { Built, Tag } from "./built.js";

export type Id<O> = O extends infer U ? { [K in keyof U]: U[K] } : never;

type RemoveIndex<T> = {
  [K in keyof T as string extends K ? never : number extends K ? never : K]: T[K]
};

export type ToNode =
  | Built
  | string
  | number
  | undefined
  | Signal<undefined | string | number | Built>
  | { build: () => Built }
  | ((b: Build) => Built | { build: () => Built })

type ToNodeKeyed = [string, ToNode] | ToNode;

export type ToNodesKeyed = readonly ToNodeKeyed[]

export type ProccessedNode<C extends ToNode> =
  C extends Built ? C :
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

export type Value<Tup> =
  Tup extends [any, infer U] ? U :
  never;

type GetValue<K, A extends ToNodesKeyed> = {
  [I in keyof A]:
  K extends Key<A[I]> ? Value<A[I]> :
  never;
}[number]

type KeyNames<A extends ToNodesKeyed> = {
  [P in keyof A]: Key<A[P]>;
}[number];


type ProccessedNodesKeyed<A extends ToNodesKeyed> = Id<RemoveIndex<{
  [K in KeyNames<A>]: ProccessedNode<GetValue<K, A>>
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

  tag: <T extends Tag>(t: T) => Build<T, Nodes>

  // element: (tn: Tag, c: ToNodes) => Build<TagName, Nodes>
  nodes: <C extends ToNodesKeyed>(...c: [...C]) => Built<TagName, ProccessedNodesKeyed<C>>

  clear: () => Build<Tag, {}>

  build: () => Built<TagName, Nodes>
}

export const cache = new Map();

const build = Builder();

export function getBuild() {
  return build.clear();
};

const builtBuild = Builder();

export const built = <T extends Tag, N extends ToNodesKeyed>(tag: T, ...nodes: N) => builtBuild
  .tag(tag)
  .nodes(...nodes)

// const test = built("div", <["hello", string]>["hello", "world"])

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
      return this;
    },

    nodes(...c: ToNodesKeyed) {
      this.toNodes = c;
      return this.build()
    },

    clear() {
      this.tagName, this.toNodes = undefined;
      return this;
    },

    build() {
      const built = makeBuilt(this.tagName, this.toNodes);
      this.clear();
      return built;
    }
  }
}

type Registry = Map<string, Text | Comment | Built>

function makeBuilt(tagName: string | undefined, nodes: ToNodesKeyed | undefined) {
  const elem = document.createElement(tagName || "div");
  const registry = nodes ? addNodesMakeRegistry(elem, nodes) : nodes;
  return new Built(elem, registry);
}

// This is where any conversion of the user input happens.
export const makeRegistryItem = (v: ToNode): Text | Comment | Built => {
  if (v instanceof Built) return v;
  v = (isSignal(v)) ? v.value : v;
  switch (typeof v) {
    case "string":
      return document.createTextNode(v);
    case "number":
      return document.createTextNode(v.toString())
    case "undefined":
      return document.createComment("")
    case "function":
      const r = v(getBuild())
      if ("build" in r) return r.build()
      return r;
  }
  if ("build" in v) return v.build()
  return v;
};

export function proccessToNode(toNode: ToNode) {
  const registryItem = makeRegistryItem(toNode)
  let node = registryItem instanceof Built ? registryItem.elem : registryItem;
  if (isSignal(toNode)) {
    createEffect(() => {
      const reproccessedSignal = makeRegistryItem(toNode.value)
      const newNode = reproccessedSignal instanceof Built ? reproccessedSignal.elem : reproccessedSignal;
      node.replaceWith(newNode);
      node = newNode;
    })
  }
  return [node, registryItem] as const
}

export function addToNode(elem: HTMLElement, toNode: ToNode) {
  let [node, registryItem] = proccessToNode(toNode);
  elem.appendChild(node);
  return registryItem;
}

function addNodesMakeRegistry(elem: HTMLElement, toNodesKeyed: ToNodesKeyed): Registry {
  let registry: Registry = new Map();
  for (const toNodeKeyed of toNodesKeyed) {
    let key: undefined | string, toNode: ToNode;
    if (Array.isArray(toNodeKeyed)) {
      key = toNodeKeyed[0];
      toNode = toNodeKeyed[1];
    } else {
      toNode = toNodeKeyed;
    }
    const registryItem = addToNode(elem, toNode);
    if (!key) continue;
    registry.set(key, registryItem);
  }
  return registry;
}

export const startAt = <N extends ToNodesKeyed>(
  elem: HTMLElement,
  ...nodes: N
) => {
  const registry = addNodesMakeRegistry(elem, nodes);
  return new Built(elem, registry) as Built<Tag, ProccessedNodesKeyed<N>>
}
