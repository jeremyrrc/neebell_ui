import { identity } from "ramda";
import {
  PossibleElem,
  notifyError as notify,
  showErrors as formErrors,
  active,
  inactive,
} from "../dom/exports";
import { buildCallForks, OkData } from "./fork";
import { CallResult, ParamErrors } from "./exports";
import { curry, CurriedFunction1 } from "lodash";

type CallbackStringParam = (s: string) => void | CurriedFunction1<string, void>;

type CallbackOkDataParam = (
  ok: OkData
) => void | CurriedFunction1<OkData, void>;

const unexpectedData = curry((info: string, data: CallResult) => {
  notify("Server error: Unexpected data (" + info + ").");
  console.error(data);
});

export const forkCall = buildCallForks<string, ParamErrors, string, OkData>()(
  identity,
  identity,
  identity,
  identity
);

export const consoleCall = buildCallForks<void, void, void, void>()(
  console.error,
  (pe) => console.error(pe.join(", ")),
  console.log,
  console.log
);

export const redirect = curry(
  (url: string, form: HTMLFormElement, result: CallResult) =>
    buildCallForks<void, void, void, void>()(
      notify,
      formErrors(form),
      (_s) => location.assign(url),
      unexpectedData("redirect-okData")
    )(result)
);

export const openFormModal = curry(
  (form: HTMLFormElement, modal: PossibleElem, result: CallResult) =>
    buildCallForks<void, void, void, void>()(
      notify,
      formErrors(form),
      (_s) => active(modal),
      unexpectedData("openFormModal-okData")
    )(result)
);

export const closeFormModal = curry(
  (modalId: PossibleElem, form: HTMLFormElement, result: CallResult) =>
    buildCallForks<void, void, void, void>()(
      notify,
      formErrors(form),
      (_s) => inactive(modalId),
      unexpectedData("closeFormModal-okData")
    )(result)
);
export const notifyFormCall = curry(
  (form: HTMLFormElement, result: CallResult) =>
    buildCallForks<void, void, void, void>()(
      notify,
      formErrors(form),
      notify,
      unexpectedData("notifyFormCall-okData")
    )(result)
);

export const notifyCall = (result: CallResult) =>
  buildCallForks<void, void, void, void>()(
    notify,
    (_pe) => notify("Invalid parameters."),
    notify,
    unexpectedData("notifyCall-okData")
  )(result);

export const handleFormOkString = curry(
  (callback: CallbackStringParam, form: HTMLFormElement, result: CallResult) =>
    buildCallForks<void, void, void, void>()(
      notify,
      formErrors(form),
      callback,
      unexpectedData("handleFormOkString-okData")
    )(result)
);
export const okString = curry(
  (callback: (s: string) => void, result: CallResult) =>
    buildCallForks<void, void, void, void>()(
      notify,
      unexpectedData("okString-paramErrors"),
      callback,
      unexpectedData("okString-okData")
    )(result)
);

export const customOkData = curry(
  (callback: CallbackOkDataParam, result: CallResult) =>
    buildCallForks<void, void, void, void>()(
      notify,
      unexpectedData("customOkData-paramErrors"),
      unexpectedData("customOkData-string"),
      callback
    )(result)
);

export const handleFormOkData = curry(
  (callback: CallbackOkDataParam, form: HTMLFormElement, result: CallResult) =>
    buildCallForks<void, void, void, void>()(
      notify,
      formErrors(form),
      (_s) =>
        notify("Server error: Unexpected data (handleFormOkData-string)."),
      callback
    )(result)
);

//export const returnResultStringString = (result: CallResult): Result<string, string> => {
//buildCallForks<void, void, void, void>()(
//notify,
//(_pe) => notify("Server error: Unexpected data."),
//(_pe) => notify("Server error: Unexpected data."),
//callback
//)(result);
//};
