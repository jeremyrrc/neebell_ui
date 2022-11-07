import { dark, mid } from "../main.js";
import { Builder } from "../util/Bhtml/index.js";
import { Page } from "../main.js";
import { signInForm } from "./forms.js";
import { buttonB } from "./base.js";
export * from "./base.js";
export * from "./forms.js";

export const mainErrorBlt = (b: Builder) => {
  const closeButton = buttonB(b, "Close").build();
  const closeForm = b
    .tag("form")
    .attribute("method", "dialog")
    .childNode(closeButton.className(mid))
    .build();
  return b
    .tag("dialog")
    .className("flex flex-col items-center rounded-sm")
    .className(dark)
    .childNode("An error occured", "errorMessage")
    .childNode(closeForm.className("mt-3"))
    .build<HTMLDialogElement>();
};

export const signInContentBlt = (b: Builder, p: Page) => {
  const cached = b.cached("signInContent");
  if (cached) return cached;
  const sectionId = "signInSection";
  const h1 = b.tag("h1").childNode("Sign In").id(sectionId).build();
  const form = signInForm(b, p).build<HTMLFormElement>();
  return b
    .cache("signInContent")
    .tag("section")
    .attribute("aria-labelledby", sectionId)
    .className("flex flex-col space-y-3 justify-center items-center")
    .childNode(h1.className("text-2xl"))
    .childNode(form)
    .build();
};
