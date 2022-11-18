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

type Modify<T> = (v: T) => T;

interface ServerError {
  type: "server";
  code: number;
  response: Response;
  message: string;
}

interface ValidationError {
  type: "validation";
  errors: Record<string, Array<string>>;
  message: string;
}

interface NetworkError {
  type: "network";
  error: unknown;
  message: string;
}

export type Error = ServerError | ValidationError | NetworkError;

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

const forwarder = async <T>(
  v: Array<ForwardHandler<T>> | null,
  t: T,
  bfetch: Bfetch
): Promise<boolean> => {
  if (!v) return true;
  let forward = true;
  for (const fn of v) {
    forward = await fn(t, bfetch);
    if (!forward) return false;
  }
  return true;
};

type CodeErrorHandlers = Map<number, Array<ForwardHandler<Response>>>;
type NetworkErrorHandlers = Map<string, ForwardHandler<unknown>>;
type ServerErrorHanlders = Map<string, ForwardHandler<Response>>;

interface Props {
  url: string | null;
  method: Methods | null;
  sendAs: SendAs | null;
  params: Map<string, DataValue> | null;
  catchCodeError: CodeErrorHandlers | null;
  catchNetworkError: NetworkErrorHandlers | null;
  catchServerError: ServerErrorHanlders | null;
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
      params: null,
      catchCodeError: null,
      catchNetworkError: null,
      catchServerError: null,
      onSuccess: null,
      onError: null,
    };
  }

  #inputToParams(v: Input | Nothing): Map<string, DataValue> | null {
    if (v === null || v === undefined) return null;
    let params;
    if (v instanceof Event) {
      const input = v.target;
      console.log(input instanceof HTMLTextAreaElement);
      if (
        !(input instanceof HTMLInputElement) &&
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

  params(v: Input | Nothing | Modify<Map<string, DataValue>>) {
    if (!v) return this;
    if (typeof v === "function") {
      let params = this.props.params || new Map<string, DataValue>();
      params = v(params);
      this.props.params = params.size !== 0 ? params : null;
      return this;
    }
    const params = this.#inputToParams(v);
    if (!params) return this;
    this.props.params = appendMapToMap(this.props.params, params);
    return this;
  }

  catchErrorCode(key: number, v: ForwardHandler<Response> | Nothing) {
    if (!v) return this;
    if (!this.props.catchCodeError) {
      this.props.catchCodeError = new Map([[key, [v]]]);
      return this;
    }
    const array = this.props.catchCodeError.get(key);
    if (!array) {
      this.props.catchCodeError.set(key, [v]);
      return this;
    }
    this.props.catchCodeError.set(key, [...array, v]);
    return this;
  }

  catchNetworkError(key: string, v: ForwardHandler<unknown> | Nothing) {
    if (!v) return this;
    if (!this.props.catchNetworkError) {
      this.props.catchNetworkError = new Map([[key, v]]);
    } else {
      this.props.catchNetworkError.set(key, v);
    }
    return this;
  }

  catchServerError(key: string, v: ForwardHandler<Response> | Nothing) {
    if (!v) return this;
    if (!this.props.catchServerError) {
      this.props.catchServerError = new Map([[key, v]]);
    } else {
      this.props.catchServerError.set(key, v);
    }
    return this;
  }

  removeErrorCode(key: number) {
    if (!this.props.catchCodeError) return this;
    this.props.catchCodeError.delete(key);
    return this;
  }

  removeNetworkServerError(key: string) {
    if (!this.props.catchNetworkError) return this;
    this.props.catchNetworkError.delete(key);
    return this;
  }

  removeCatchServerError(key: string) {
    if (!this.props.catchServerError) return this;
    this.props.catchServerError.delete(key);
    return this;
  }

  onSuccess(v: FinalHandler<Response>) {
    this.props.onSuccess = v;
    return this;
  }

  onError(v: FinalHandler<Error>) {
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
      sendAs,
      onSuccess,
      catchCodeError,
      catchServerError,
      onError,
      catchNetworkError,
    } = this.props;
    const fullUrl = this._baseUrl + (url || "");
    const [finalUrl, init] =
      method === "GET"
        ? urlInitGet(fullUrl, null, params)
        : urlInitPost(fullUrl, null, sendAs, params);

    try {
      const response = await fetch(finalUrl, init);
      if (response.status >= 200 && response.status <= 299) {
        if (onSuccess) onSuccess(response, this);
        this.clear();
        return response;
      }

      const serverError: ServerError = {
        type: "server",
        code: response.status,
        response,
        message: response.statusText,
      };

      const codeErrorCatchers = catchCodeError
        ? catchCodeError.get(response.status)
        : undefined;
      if (codeErrorCatchers) {
        let forward = await forwarder(codeErrorCatchers, response, this);
        if (forward) {
          const serverErrorCatchers = catchServerError
            ? Array.from(catchServerError.values())
            : null;
          forward = await forwarder(serverErrorCatchers, response, this);
          if (forward && onError) await onError(serverError, this);
        }
        this.clear();
        return Promise.reject(serverError);
      }

      if (onError) onError(serverError, this);
      this.clear();
      return Promise.reject(serverError);
    } catch (error) {
      console.error(error);
      const message =
        "message" in error ? error.message : "Could not connect to server.";
      const networkError: NetworkError = {
        type: "network",
        error,
        message: message,
      };

      let forward = true;
      const networkErrorCatchers = catchNetworkError
        ? Array.from(catchNetworkError.values())
        : null;
      forward = await forwarder(networkErrorCatchers, error, this);
      if (forward && onError) await onError(networkError, this);
      this.clear();
      return Promise.reject(networkError);
    }
  }
}
