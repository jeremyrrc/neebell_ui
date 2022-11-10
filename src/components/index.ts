import { light, mid, accent } from "../main.js";
import { Builder } from "../util/Bhtml/index.js";
import { Page } from "../main.js";
import { signInForm, createAccForm, createForumForm } from "./forms.js";
import { buttonB } from "./base.js";
export * from "./base.js";
export * from "./forms.js";

export const mainErrorBlt = (b: Builder) => {
  const closeButton = buttonB(b, "Close")
    .event("click", (e) => {
      const button = e.target as HTMLButtonElement;
      button.parentElement?.classList.add("hidden");
    })
    .build();
  return b
    .tag("dialog")
    .className("flex flex-col items-center space-y-3 rounded-sm hidden")
    .className(mid)
    .childNode("An error occured", "errorMessage")
    .childNode(closeButton.className("mt-3").className(light))
    .build<HTMLDialogElement>();
};

// Sidebar side menu ==========
export const signedOutSideMenuBlt = (b: Builder, p: Page) => {
  const cached = b.cached("signedOutContent");
  if (cached) return cached;
  const createAccButton = buttonB(b, "Create Account")
    .event("click", () => {
      p.content("create account");
    })
    .build();
  const signInButton = buttonB(b, "Sign In")
    .event("click", () => {
      p.content("sign in");
    })
    .build();
  const m = b
    .cache("signedOutSideMenu")
    .tag("nav")
    .childNode(createAccButton, "ccc")
    .childElemsClassName("bg-white")
    .className("flex flex-col space-y-3")
    .childNode(createAccButton.className(mid), "ddd")
    .childNode(signInButton.className(mid))
    .build();
  console.log(m.registry);
  return m;
};

export const signedInSideMenuBlt = (b: Builder, p: Page) => {
  const cacheKey = "signedInSideMenu";
  const cached = b.cached(cacheKey);
  if (cached) return cached;
  const signOutButton = buttonB(b, "Sign Out").build();
  const createForumButton = buttonB(b, "Create New Forum")
    .event("click", () => {
      p.content("create forum");
    })
    .build();
  const listOwnedForums = buttonB(b, "Owned Forums").build();
  const listPermittedForums = buttonB(b, "All Forums").build();
  return b
    .cache(cacheKey)
    .tag("nav")
    .className("flex flex-col space-y-3")
    .childNode(signOutButton.className(mid))
    .childNode(createForumButton.className(mid))
    .childNode(listOwnedForums.className(mid))
    .childNode(listPermittedForums.className(accent))
    .build();
};

// Main content ==========
export const createAccContentBlt = (b: Builder, p: Page) => {
  const cacheKey = "createAccContent";
  const cached = b.cached(cacheKey);
  if (cached) return cached;
  const labelledbyId = "createAccSection";
  const h1 = b.tag("h1").childNode("Create Account").id(labelledbyId).build();
  const form = createAccForm(b, p).build<HTMLFormElement>();
  return b
    .cache(cacheKey)
    .attribute("aria-labelledby", labelledbyId)
    .tag("section")
    .className("flex flex-col space-y-3 justify-center items-center")
    .childNode(h1.className("text-2xl"))
    .childNode(form)
    .build();
};

export const signInContentBlt = (b: Builder, p: Page) => {
  const cacheKey = "signedOutContent";
  const cached = b.cached(cacheKey);
  if (cached) return cached;
  const labelledbyId = "signInSection";
  const h1 = b.tag("h1").childNode("Sign In").id(labelledbyId).build();
  const form = signInForm(b, p).build<HTMLFormElement>();
  return b
    .cache(cacheKey)
    .attribute("aria-labelledby", labelledbyId)
    .tag("section")
    .className("flex flex-col space-y-3 justify-center items-center")
    .childNode(h1.className("text-2xl"))
    .childNode(form)
    .build();
};

export const createForumContentBlt = (b: Builder, p: Page) => {
  const cacheKey = "createForumContent";
  const cached = b.cached(cacheKey);
  if (cached) return cached;
  const labelledbyId = "createForumSec";
  const h1 = b.tag("h1").childNode("Create New Forum").id(labelledbyId).build();
  const form = createForumForm(b, p).build<HTMLFormElement>();
  return b
    .cache(cacheKey)
    .attribute("aria-labelledby", labelledbyId)
    .tag("section")
    .className("flex flex-col space-y-3 justify-center items-center")
    .childNode(h1.className("text-2xl"))
    .childNode(form)
    .build();
};
