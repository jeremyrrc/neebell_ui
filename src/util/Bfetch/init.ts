import { DataValue, SendAs } from "./Bfetch.js";

const toFormData = (data: Map<string, DataValue> | null) => {
  if (!data || data.size === 0) return new FormData();
  let FD = new FormData();
  for (const [key, value] of data) {
    FD.append(key, value);
  }
  return FD;
};

const toJson = (data: Map<string, DataValue> | null): string => {
  if (!data || data.size === 0) return "{}";
  const plain = Object.fromEntries(data.entries());
  return JSON.stringify(plain);
};

const encodeUrl = (url: string, data: Map<string, DataValue> | null) => {
  console.log(url);
  const urlQuery = new URL(url);
  if (!data || data.size === 0) return urlQuery;
  for (const [key, value] of data) {
    urlQuery.searchParams.set(key, value.toString());
  }
  return urlQuery;
};

interface InitPost {
  method: "POST";
  body: string | FormData | undefined;
  headers: Headers;
  credentials: RequestCredentials;
}

export const urlInitPost = (
  url: string,
  headers: Headers | null,
  sendAs: SendAs | null,
  data: Map<string, DataValue> | null
): [URL, InitPost] => {
  const newHeaders = headers || new Headers();
  const newSendAs = sendAs || "json";
  let body;
  if (newSendAs === "json") {
    newHeaders.set("Content-Type", "application/json");
    body = toJson(data);
  } else if (newSendAs === "multipart") {
    body = toFormData(data);
  } else if (newSendAs === "encoded") {
    newHeaders.set("Content-Type", "application/x-www-form-urlencoded");
    body = encodeUrl(url, data).searchParams;
  }
  return [
    new URL(url),
    { method: "POST", body, headers: newHeaders, credentials: "include" },
  ];
};

interface initGet {
  method: "GET";
  headers: Headers;
  credentials: RequestCredentials;
}

export const urlInitGet = (
  url: string,
  headers: Headers | null,
  data: Map<string, DataValue> | null
): [URL, initGet] => {
  const newHeaders = headers || new Headers();
  const newUrl = encodeUrl(url, data);
  return [
    newUrl,
    { method: "GET", headers: newHeaders, credentials: "include" },
  ];
};
