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
import { Tag } from "./index.js";

import {
    ChildrenProps,
    InputValues,
    Nothing,
    PotentialFutureChildNode,
} from "./index.js";

export const isBuilt = <T extends keyof HTMLElementTagNameMap>(
    tagName: T,
    value: any
): value is Built<T> => {
    return value && "kind" in value && value.kind === tagName ? true : false;
};

type ListenerCallback<K extends keyof HTMLElementEventMap, T> = (this: T, e: HTMLElementEventMap[K]) => void;
interface ListenerObject<K extends keyof HTMLElementEventMap> {
    [key: string | symbol]: any;
    handleEvent: (e: HTMLElementEventMap[K]) => void;
};

type Listener<K extends keyof HTMLElementEventMap, T> = ListenerCallback<K, T> | ListenerObject<K>

export class Built<T extends keyof HTMLElementTagNameMap> {
    elem: HTMLElementTagNameMap[T];
    kind!: T;
    registry: Map<string, Text | Built<Tag>>;
    childrenProps: ChildrenProps | null;
    abortControllers: Map<string, AbortController> | null;

    constructor(elem: HTMLElementTagNameMap[T]) {
        this.elem = elem;
        while (elem.firstChild) elem.removeChild(elem.firstChild);
        this.registry = new Map();
        this.childrenProps = null;
        this.abortControllers = null;
    }

    el(v: (elem: HTMLElementTagNameMap[T]) => void) {
        v(this.elem);
        return this;
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

    extend<Add extends object>(t: Add & ThisType<Add & this>) {
        Object.assign(this, t);
        return this as this & Add;
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

    modifySelf(fn: ((v: this, b: Builder) => void) | Nothing) {
        if (!fn) return this;
        fn(this, Builder.getBuilder());
        return this;
    }

    replaceSelf(v: PotentialFutureChildNode) {
        if (!v) return this;
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

    query(where: string): Built<Tag> | Text | undefined {
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

    getItem<T extends string | number>(
        where: T
    ): T extends string ? Text | Built<Tag> | undefined : ChildNode | undefined {
        if (typeof where === "string") {
            // @ts-ignore
            return this.registry.get(where);
        }
        // @ts-ignore
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

    modify<T extends string | number>(
        where: T,
        fn: (
            value: T extends string
                ? Text | Built<Tag> | undefined
                : ChildNode | undefined,
            b: Builder
        ) => void | PotentialFutureChildNode
    ) {
        if (isNothing(fn)) return this;
        const node = this.getItem(where);
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

    clearer() {
        return {
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
    }

    clear(prop?: keyof ReturnType<Built<Tag>["clearer"]>) {
        prop;
        const cleaner = this.clearer();
        if (!prop) {
            for (const k in cleaner) {
                cleaner[k]();
            }
            return this;
        }
        if (cleaner[prop]) cleaner[prop]();
        return this;
    }

    unwrap() {
        return this.elem;
    }
}
