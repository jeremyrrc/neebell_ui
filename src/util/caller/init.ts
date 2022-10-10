import { Call, Input } from "./exports.js";

type Nothing = null | undefined;

interface InitPost {
  method: string;
  body: string | FormData;
  headers?: Headers;
}

interface InitGet {
  method: string;
  headers?: Headers;
}

export type Init = InitPost | InitGet;

const toFormData = (data: Input) => {
  if (data instanceof FormData) {
    return data;
  }
  let FD = new FormData();
  for (const key in data) {
    FD.append(key, data[key]);
  }
  return FD;
};

const toJson = (data: Input): string => {
  if (!data) return "{}";
  const plain =
    data instanceof FormData ? Object.fromEntries(data.entries()) : data;
  return JSON.stringify(plain);
};

export const initGET = (
  { url, method, headers }: Call,
  data: Input | Nothing
): [string, InitGet] => {
  if (!data) return [url, { method, headers }];
  const urlQuery = new URL(url);
  for (const key in data) {
    urlQuery.searchParams.set(key, data[key].toString());
  }
  return [urlQuery.href, { method, headers }];
};

export const initPOST = (
  { url, method, headers, contentType: contentType }: Call,
  data: Input | Nothing
): [string, InitPost] => {
  if (contentType === "json") {
    const newHeaders = headers || new Headers();
    newHeaders.set("Content-Type", "application/json");
    if (!data) return [url, { method, body: "{}", headers }];
    const body = toJson(data);
    return [url, { method, body, headers }];
  } else {
    if (!data) return [url, { method, body: new FormData(), headers }];
    const body = toFormData(data);
    return [url, { method, body, headers }];
  }
};

export const urlInit = (call: Call, input: Input | Nothing): [string, Init] =>
  call.method === "GET" ? initGET(call, input) : initPOST(call, input);
