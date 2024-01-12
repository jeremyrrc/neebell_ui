import { urlInitGet, urlInitPost } from "./init.js";

export type Nothing = null | undefined;

type InputValue = HTMLInputElement | string | number | Blob;
type Input =
  | Event
  | HTMLFormElement
  | FormData
  | Map<string, InputValue>
  | Record<string, InputValue>;

export type DataValue = string | Blob;

export interface Error {
  type: "server" | "network";
  code?: number;
  message: string;
}

type Handler<T, R> = (v: T, bfetch: Bfetch) => Promise<R> | R;
export type ForwardHandler<T> = Handler<T, boolean>;
type FinalHandler<T> = Handler<T, void>;

type Methods = "GET" | "POST";
export type SendAs = "json" | "multipart" | "encoded";

const appendMapToMap = <K, V>(
  prop: Map<K, V> | null,
  v: Map<K, V> | Nothing
): Map<K, V> | null => {
  if (!v) return prop;
  const filteredV = [...v].filter(([_, v]) => v) as Array<[K, V]>;
  if (filteredV.length === 0) return prop;
  const map = new Map(filteredV);
  if (!prop) return map;
  return new Map([...prop, ...map]);
};

interface Props {
  url: string | null;
  method: Methods | null;
  sendAs: SendAs | null;
  headers: Headers | null;
  params: Map<string, DataValue> | null;
  onSuccess: FinalHandler<Response> | null;
  onError: FinalHandler<Error> | null;
}

export class Bfetch {
  _baseUrl: string;
  _keep: Array<keyof Props> | null;
  props: Props;

  constructor(baseUrl: string) {
    this._baseUrl = baseUrl;
    this._keep = null;
    this.props = {
      url: null,
      method: null,
      sendAs: null,
      headers: null,
      params: null,
      onSuccess: null,
      onError: null,
    };
  }

  inputToParams(v: Input | Nothing): Map<string, DataValue> | null {
    if (v === null || v === undefined) return null;
    let params;
    if (v instanceof Event) {
      const input = v.target;
      if (
        !(input instanceof HTMLInputElement) &&
        !(input instanceof HTMLButtonElement) &&
        !(input instanceof HTMLTextAreaElement)
      )
        return null;
      const form = input.form;
      if (!form) return null;
      params = new FormData(form);
      params = new Map(params.entries());
    } else if (v instanceof HTMLFormElement) {
      params = new FormData(v);
      params = new Map(params.entries());
    } else if (v instanceof FormData) {
      params = new Map(v.entries());
    } else if (!(v instanceof Map)) {
      params = new Map(Object.entries(v));
    }
    if (!params || params.size === 0) return null;
    params = new Map(
      [...params].map(([key, value]) => {
        if (typeof value === "number") return [key, value.toString()];
        if (value instanceof HTMLInputElement)
          return value.hasAttribute("name")
            ? [value.name, value.value]
            : [key, value.value];
        return [key, value];
      })
    );
    return params;
  }

  baseUrl(v: string | Nothing) {
    if (!v) return this;
    this._baseUrl = v;
    return this;
  }

  url(v: string | Nothing) {
    if (!v) return this;
    this.props.url = this.props.url ? this.props.url + v : v;
    return this;
  }

  method(v: Methods | Nothing) {
    if (!v) return this;
    this.props.method = v;
    return this;
  }

  sendAs(v: SendAs | Nothing) {
    if (!v) return this;
    this.props.sendAs = v;
    return this;
  }

  header(k: string, v: string) {
    if (!this.props.headers) this.props.headers = new Headers();
    this.props.headers.append(k, v);
    return this;
  }

  params(v: Input | Nothing) {
    if (!v) return this;
    const params = this.inputToParams(v);
    if (!params) return this;
    this.props.params = appendMapToMap(this.props.params, params);
    return this;
  }

  onSuccess(v: FinalHandler<Response>) {
    this.props.onSuccess = v;
    return this;
  }

  onError(v: (e: Error) => void) {
    this.props.onError = v;
    return this;
  }

  keep(...keepKeys: Array<keyof Props>) {
    this._keep = this._keep ? [...this._keep, ...keepKeys] : keepKeys;
    return this;
  }

  remove(...removeKeys: Array<keyof Props>) {
    if (removeKeys.length !== 0) return this;
    this._keep =
      this._keep?.filter((propKey) => !removeKeys.includes(propKey)) || null;
    return this;
  }

  clear(...propKeys: Array<keyof Props>) {
    if (propKeys.length === 0) {
      for (const k in this.props) {
        if (this._keep?.includes(k as keyof Props)) continue;
        this.props[k] = null;
      }
      return this;
    }
    for (const propKey of propKeys) {
      if (this._keep?.includes(propKey as keyof Props)) continue;
      this.props[propKey] = null;
    }
    return this;
  }

  async send(): Promise<Response> {
    this.props.method = this.props.method || "GET";
    const {
      url,
      method,
      params,
      headers,
      sendAs,
      onSuccess,
      onError,
    } = this.props;
    const fullUrl = this._baseUrl + (url || "");
    const [finalUrl, init] =
      method === "GET"
        ? urlInitGet(fullUrl, headers, params)
        : urlInitPost(fullUrl, headers, sendAs, params);

    try {
      const response = await fetch(finalUrl, init);
      if (response.ok) {
        if (onSuccess) onSuccess(response, this);
        this.clear();
        return response;
      }

      const message = await response.text();

      const serverError: Error = {
        type: "server",
        code: response.status,
        message,
      };

      if (onError) onError(serverError, this);
      this.clear();
      return Promise.reject(serverError);
    } catch (e) {

      console.error(e);
      const networkError: Error = {
        type: "network",
        message: "Network error",
      };

      if (onError) onError(networkError, this);
      this.clear();
      return Promise.reject(networkError);
    }
  }
}
