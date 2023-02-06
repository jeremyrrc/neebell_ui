import type { Build } from "../util/Bhtml/builder.js";
import { light, mid } from "../page.js";
import { errorMessage } from "../page.js";
import { top } from "./top.js";
import { updatePermittedUsersForm } from "./forms.js";
import { buttonBuild } from "./base.js";

type WhatModal =
  | "close"
  | "error"
  | "updatePermittedUsers"
export const changeModals = (what: WhatModal) => {
  switch (what) {
    case "close":
      top.modals.elem.classList.add("hidden");
      top.modals.replace("modal", undefined)
      break;
    case "error":
      top.modals.elem.classList.remove("hidden");
      top.modals.replace("modal", errorModal)
      break;
    case "updatePermittedUsers":
      top.modals.elem.classList.remove("hidden");
      top.modals.replace("modal", editPermittedUsersModal)
      break;
  }
}

export const closeButton = (b: Build) => buttonBuild("Close")(b)
  .className(light)
  .on("click", () => changeModals("close"))

export const errorModal = (b: Build) => {
  return b.cache("errorModal", make);

  function make() {
    return b
      .tag("dialog")
      .nodeArgs(
        errorMessage,
        closeButton
      )
      .build()
      .className("rounded-sm flex flex-col p-3 space-y-3")
      .className(mid)
  }
}

export const editPermittedUsersModal = (b: Build) => {
  return b.cache("editPermittedUsersModal", make)

  function make() {
    return b
      .tag("dialog")
      .nodeArgs(
        updatePermittedUsersForm,
        closeButton
      )
      .build()
      .className(mid)
      .className("rounded-sm flex flex-col p-3 space-y-3")
  }
}
