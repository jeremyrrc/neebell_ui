import { err, ok } from "true-myth/result";
type Result<T, E> = import("true-myth").Result<T, E>;
type Maybe<T> = import("true-myth").Maybe<T>;
import { checkCall } from "./validify.js";
// import { modifyCall } from "./modify.js";
import { Call } from "./schema.js";
import { formatResponse } from "./format.js";
import { urlInit, Init } from "./init.js";

export type Nothing = null | undefined;

export type Errors = Array<string>;

export type ParamErrors = Map<string, Errors>;

export type Value = string | Blob;

export type Input = FormData | Record<string, Value>;

export interface FetchRequest {
  call: Call;
  input: Maybe<Input>;
}

export type FetchResult = Result<Response, string | ParamErrors>;

export const caller = async (
  call: Call,
  input: Input | Nothing
): Promise<CallResult> => {
  const mayError = checkCall(call.stips, input);
  if (mayError) return Promise.resolve(mayError);
  // const resModifiedInput = modifyCall(call.stips, input, "post");
  // if (resModifiedInput.isErr)
  //   return Promise.resolve(err(resModifiedInput.error));
  // input = resModifiedInput.value;
  const [url, init] = urlInit(call, input);
  const callResult = await exeFetch(url, init);
  return await formatResponse(callResult);
};

const exeFetch = async (url: string, init: Init): Promise<FetchResult> => {
  try {
    const response = await fetch(url, init);
    if (response.status >= 400 && response.status < 600) {
      return err(await response.text());
    } else if (!response.ok) {
      return err(await response.text());
    }
    return ok(response);
  } catch (error) {
    console.error(error);
    return err("There was a problem with the fetch operation");
  }
};
