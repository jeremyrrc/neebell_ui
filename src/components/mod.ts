import { Bhtml, Hotspots } from "../util/Bhtml/Bhtml.js";
import { signInPage, createUserPage } from "../pages.js";
import { accent } from "../main.js";
import { buttonB, navB } from "./base.js";
export * from "./base.js";
export * from "./form.js";

export const homeNav = (body: HTMLBodyElement) => {
  const navSignIn = (hs: Hotspots, _e: Event) => {
    hs.removeByKey("main");
    signInPage(body);
  };

  const buttonSignIn = buttonB("Sign In")
    .className(accent)
    .events({ navSignIn: ["click", navSignIn] })
    .parentReady();

  const navCreateUser = (hs: Hotspots, _e: Event) => {
    hs.removeByKey("main");
    createUserPage(body);
  };

  const buttonCreateUser = buttonB("Create User")
    .className(accent)
    .events({ navCreateUser: ["click", navCreateUser] })
    .parentReady();

  return navB()
    .className("flex flex-col max-w-sm w-full space-y-3")
    .childNodes({ buttonSignIn, buttonCreateUser });
};
