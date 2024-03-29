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
}

export const urlInitPost = (
  url: string,
  token: string | null,
  sendAs: SendAs | null,
  data: Map<string, DataValue> | null
): [URL, InitPost] => {
  const headers = new Headers();
  if (token) headers.append("Authorization", "Bearer " + token)
  const newSendAs = sendAs || "json";
  let body;
  if (newSendAs === "json") {
    headers.set("Content-Type", "application/json");
    body = toJson(data);
  } else if (newSendAs === "multipart") {
    body = toFormData(data);
  } else if (newSendAs === "encoded") {
    headers.set("Content-Type", "application/x-www-form-urlencoded");
    body = encodeUrl(url, data).searchParams;
  }
  return [
    new URL(url),
    { method: "POST", body, headers },
  ];
};

interface initGet {
  method: "GET";
  headers: Headers;
}

export const urlInitGet = (
  url: string,
  token: string | null,
  data: Map<string, DataValue> | null
): [URL, initGet] => {
  const headers = new Headers();
  if (token) headers.append("Authorization", "Bearer " + token)
  const newUrl = encodeUrl(url, data);
  return [
    newUrl,
    { method: "GET", headers },
  ];
};
