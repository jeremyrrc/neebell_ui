import { modalSectionB, mainB, h1B } from "./components/base.js";

import { signInForm, createUserForm, homeNav } from "./components/mod.js";

export const homePage = (body: HTMLBodyElement) => {
  const h1Id = "h1SignIn";
  const h1 = h1B("Home", { h1Id });
  const nav = homeNav(body);

  const section = modalSectionB(h1Id).childNodes({ h1, nav });
  mainB().childNodes({ section }).parent(body).create();
};

export const signInPage = (body: HTMLBodyElement) => {
  const h1Id = "h1SignIn";
  const h1 = h1B("Sign In", { id: h1Id });
  const form = signInForm();

  const section = modalSectionB(h1Id).childNodes({ h1, form });
  mainB().childNodes({ section }).parent(body).create();
};

export const createUserPage = (body: HTMLBodyElement) => {
  const h1Id = "h1CreateUser";
  const h1 = h1B("Create User", { id: h1Id });
  const form = createUserForm();

  const section = modalSectionB(h1Id).childNodes({ h1, form });
  mainB().childNodes({ section }).parent(body).create();
};

interface Pages {
  [key: string]: (body: HTMLBodyElement) => void;
}
export const pages: Pages = {
  home: homePage,
  "sign-in": signInPage,
  "create-user": createUserPage,
};
