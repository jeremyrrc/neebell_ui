import { just, nothing } from "true-myth/maybe";
import { appendOrResetString, appendOrResetMapToMap } from "./BmodifyProps.js";
import { urlInitGet, urlInitPost } from "./init.js";

type Maybe<T> = import("true-myth/maybe").Maybe<T>;
export type Nothing = null | undefined;

type InputValue = HTMLInputElement | string | number | Blob;
type Input =
  | HTMLFormElement
  | FormData
  | Map<string, InputValue>
  | Record<string, InputValue>;

export type DataValue = string | Blob;
type Methods = "GET" | "POST";
export type SendAs = "json" | "multipart" | "encoded";

export class Bfetch {
  #url: string;
  #method: Maybe<Methods>;
  #sendAs: Maybe<SendAs>;
  #params: Maybe<Map<string, DataValue>>;

  constructor(url: string) {
    this.#url = url;
    this.#method = nothing();
    this.#sendAs = nothing();
    this.#params = nothing();
  }
  #inputToParams(v: Input | Nothing): Maybe<Map<string, DataValue>> {
    if (!v) return nothing();
    let params;
    if (v instanceof HTMLFormElement) {
      params = new FormData(v);
      params = new Map(params.entries());
    }
    if (v instanceof FormData) params = new Map(v.entries());
    if (v! instanceof Map) params = new Map(Object.entries(v));
    if (!params || params.size === 0) return nothing();
    params = new Map(
      [...params].map(([key, value]) => {
        if (typeof value === "number") return [key, value.toString()];
        if (value instanceof HTMLInputElement)
          return value.hasAttribute("name")
            ? [value.name, value.value]
            : [key, value.value];
        return [key, value];
      })
    ) as Map<string, DataValue>;
    return just(params);
  }

  url(v: string | Nothing, reset = false) {
    const url = appendOrResetString(just(this.#url), reset, v);
    if (url.isJust) this.#url = url.value;
    return this;
  }

  method(v: Methods | Nothing) {
    if (!v) return this;
    this.#method = just(v);
    return this;
  }

  sendAs(v: SendAs | Nothing) {
    if (!v) return this;
    this.#sendAs = just(v);
    return this;
  }

  params(v: Input | Nothing, reset = false) {
    if (!v) return this;
    const params = this.#inputToParams(v);
    if (params.isNothing) return this;
    this.#params = appendOrResetMapToMap(this.#params, reset, params.value);
    return this;
  }

  async send() {
    const method = this.#method.unwrapOr("GET");
    const [url, init] =
      method === "GET"
        ? urlInitGet("GET", this.#url, nothing(), this.#params)
        : urlInitPost("POST", this.#url, nothing(), this.#sendAs, this.#params);
    return await fetch(url, init);
  }
}
