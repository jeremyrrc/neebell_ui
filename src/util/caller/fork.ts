type Result<T, E> = import("true-myth/result").Result<T, E>;
import { handlers, Handler, predicate } from "../forker/forker";
import { ParamErrors } from "../caller/caller";
import { CallOk, CallError } from "../caller/format";
import { is, compose } from "ramda";
import { curry, CurriedFunction1 } from "lodash";
import { DataSchemas } from "../data/schema";

export type OkData = DataSchemas | Blob;

// handle a call result (call ok / call error)
// call_ok
const okHandlers = <O2, O1>() =>
  curry((h_data: Handler<OkData, O2>, h_notify: Handler<string, O1>) =>
    handlers<OkData, string, O2, O1>()(h_notify, h_data)
  );

const notString = (v: unknown): boolean => !is(String, v);

const predicateCallOkString = predicate<OkData, string>()(notString);

const handleOk = <O2, O1>() =>
  curry((handle: CurriedFunction1<Result<OkData, string>, Result<O2, O1>>) =>
    compose(handle, predicateCallOkString)
  );

// call_error
const errorHandlers = <E2, E1>() =>
  curry(
    (h_param_errors: Handler<ParamErrors, E2>, h_notify: Handler<string, E1>) =>
      handlers<ParamErrors, string, E2, E1>()(h_notify, h_param_errors)
  );

const predicateCallErrorString = predicate<ParamErrors, string>()(notString);

const handle_error = <E2, E1>() =>
  curry(
    (handle: CurriedFunction1<Result<ParamErrors, string>, Result<E2, E1>>) =>
      compose(handle, predicateCallErrorString)
  );
// call_result
const isOk = (v: unknown): boolean => {
  const value = v as Result<unknown, unknown>;
  return value.isOk;
};

const predicateOk = predicate<CallError, CallOk>()(isOk);

const callResult = <E1, E2, O1, O2>() =>
  curry(
    (
      h: CurriedFunction1<
        Result<CallError, CallOk>,
        Result<Result<E1, E2>, Result<O1, O2>>
      >
    ) => compose(h, predicateOk)
  );

export const buildCallForks = <EE, ET, TE, TT>() =>
  curry(
    (
      error_s: Handler<string, EE>,
      err_pe: Handler<ParamErrors, ET>,
      ok_s: Handler<string, TE>,
      ok_do: Handler<OkData, TT>
    ) => {
      const ok_fork = okHandlers<TT, TE>()(ok_do, ok_s);
      const error_fork = errorHandlers<ET, EE>()(err_pe, error_s);

      const apply_ok_fork = handleOk<TT, TE>()(ok_fork);
      const apply_error_fork = handle_error<ET, EE>()(error_fork);

      const apply_call_result_forks = handlers<
        CallError,
        CallOk,
        Result<TT, TE>,
        Result<ET, EE>
      >()(apply_error_fork, apply_ok_fork);

      return callResult<OkData, string, ParamErrors, string>()(
        apply_call_result_forks
      );
    }
  );
