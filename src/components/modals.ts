import { Build, built } from "../util/Bhtml/builder.js";
import { mid } from "../page.js";
import { errorMessage } from "../page.js";
import { modals } from "./top.js";
import { updatePermittedUsersForm } from "./forms.js";

const buttonClasses = "cursor-pointer py-1 px-3 rounded-sm"

type WhatModal =
  | "close"
  | "error"
  | "updatePermittedUsers"
export const changeModals = (what: WhatModal) => {
  switch (what) {
    case "close":
      modals.elem.classList.add("hidden");
      modals.replace("modal", undefined)
      break;
    case "error":
      modals.elem.classList.remove("hidden");
      modals.replace("modal", errorModal)
      break;
    case "updatePermittedUsers":
      modals.elem.classList.remove("hidden");
      modals.replace("modal", editPermittedUsersModal)
      break;
  }
}

export const closeButton = built("button",
  "Close"
)
  .attribute("type", "button")
  .className(buttonClasses)
  .className("bg-neutral-300 text-neutral-900")
  .on("click", () => changeModals("close"))

export const errorModal = (b: Build) => {
  return b.cache("errorModal", make);

  function make() {
    return built("dialog",
      errorMessage,
      closeButton
    )
      .className("rounded-sm flex flex-col p-3 space-y-3")
      .className(mid)
  }
}

export const editPermittedUsersModal = () => {
  return built("dialog",
    updatePermittedUsersForm,
    closeButton
  )
    .className(mid)
    .className("rounded-sm flex flex-col p-3 space-y-3")
}
