import { isNothing } from "./utils.js";

import { Built } from "./built.js";

export class Builder {
  #tagName?: keyof HTMLElementTagNameMap;
  #cache?: string;
  constructor() { }

  static cleared: boolean = false;

  static builder = new Builder();

  static getBuilder() {
    return Builder.cleared ? Builder.builder : new Builder();
  }

  static cache = new Map<any, Built>();

  cache(v: any) {
    if (isNothing(v)) return this;
    this.#cache = v;
    return this;
  }

  cached(v: string) {
    return Builder.cache.get(v);
  }

  tag<T extends keyof HTMLElementTagNameMap>(tagName: T) {
    this.#tagName = tagName;
    return this.#build() as Built<"O", T>;
  }

  clear() {
    this.#tagName = undefined;
    this.#cache = undefined;
    Builder.cleared = true;
  }

  #build() {
    const elem = document.createElement(this.#tagName || "div");
    const built = new Built(elem);
    built.tag = this.#tagName || "div"
    if (this.#cache) Builder.cache.set(this.#cache, built);
    this.clear();
    return built;
  }
}

type NumKeysNames<O> = {
  [K in keyof O]:
  K extends number ? K :
  never 
}[keyof O];

type NoNumKeys<O> = Pick<O, Exclude<keyof O, NumKeysNames<O>>>

const t = {
  hello: <undefined | string>"hello",
  1: "world"
}

type Id<O> = O extends infer U ? { [K in keyof U]: U[K] } : never;

const t2: Id<NoNumKeys<typeof t>>= {
  hello: "world" 
}








