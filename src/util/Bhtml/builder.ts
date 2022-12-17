import { isNothing } from "./utils.js";

import { Built } from "./built.js";
import { Tag } from "./index.js";

export class Builder {
    #tagName?: keyof HTMLElementTagNameMap;
    #cache?: string;
    constructor() { }

    static cleared: boolean = false;

    static builder = new Builder();

    static getBuilder() {
        return Builder.cleared ? Builder.builder : new Builder();
    }

    static cache = new Map<any, Built<Tag>>();

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
        return this.#build() as Built<T>;
    }

    clear() {
        this.#tagName = undefined;
        this.#cache = undefined;
        Builder.cleared = true;
    }

    #build() {
        const elem = document.createElement(this.#tagName || "div");
        const built = new Built(elem);
        built.kind = this.#tagName || "div";
        if (this.#cache) Builder.cache.set(this.#cache, built);
        this.clear();
        return built;
    }
}
