import { ParamErrors } from "./caller.js";

export type CallError = string | ParamErrors;

export const formatResponse = async (response: Response): Promise<unknown> => {
  const contentType = response.headers.get("Content-Type");
  switch (contentType) {
    case "application/json":
      return await response.json();
    case "text/plain; charset=utf-8":
      return await response.text();
    case "image/jpeg":
      return await response.blob();
    case "image/png":
      return await response.blob();
    case null:
      return null;
    default:
      return response;
  }
};

// const formatError = (error: CallError): Promise<unknown> => {
//   return Promise.resolve(error);
// };

// export const formatCallResult = async (
//   result: FetchResult
// ): Promise<unknown> => {
//   return result.mapOrElse(formatError, formatResponse);
// };
