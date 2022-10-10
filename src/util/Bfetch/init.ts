import { DataValue, SendAs } from "./Bfetch.js";
type Maybe<T> = import("true-myth/maybe").Maybe<T>;

const toFormData = (data: Maybe<Map<string, DataValue>>) => {
  if (data.isNothing || data.value.size === 0) return new FormData();
  let FD = new FormData();
  for (const [key, value] of data.value) {
    FD.append(key, value);
  }
  return FD;
};

const toJson = (data: Maybe<Map<string, DataValue>>): string => {
  if (data.isNothing || data.value.size === 0) return "{}";
  const plain = Object.fromEntries(data.value.entries());
  return JSON.stringify(plain);
};

const encodeUrl = (url: string, data: Maybe<Map<string, DataValue>>) => {
  const urlQuery = new URL(url);
  if (data.isNothing || data.value.size === 0) return urlQuery;
  for (const [key, value] of data.value) {
    urlQuery.searchParams.set(key, value.toString());
  }
  return urlQuery;
};

interface InitPost {
  method: "POST";
  body: string | FormData | undefined;
  headers: Headers;
}

export const urlInitPost = (
  method: "POST",
  url: string,
  headers: Maybe<Headers>,
  sendAs: Maybe<SendAs>,
  data: Maybe<Map<string, DataValue>>
): [URL, InitPost] => {
  const newHeaders = headers.unwrapOr(new Headers());
  const newSendAs = sendAs.unwrapOr<SendAs>("json");
  let body;
  if (newSendAs === "json") {
    newHeaders.set("Content-Type", "application/json");
    body = toJson(data);
  } else if (newSendAs === "multipart") {
    body = toFormData(data);
  } else if (newSendAs === "encoded") {
    newHeaders.set("Content-Type", "application/x-www-form-urlencoded");
    body = new URL("").searchParams;
  }
  return [new URL(url), { method, body, headers: newHeaders }];
};

interface initGet {
  method: "GET";
  headers: Headers;
}

export const urlInitGet = (
  method: "GET",
  url: string,
  headers: Maybe<Headers>,
  data: Maybe<Map<string, DataValue>>
): [URL, initGet] => {
  const newHeaders = headers.unwrapOr(new Headers());
  const newUrl = encodeUrl(url, data);
  return [newUrl, { method, headers: newHeaders }];
};
