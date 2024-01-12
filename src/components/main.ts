import { Build } from "../util/Bhtml/builder.js";
import { built } from "../util/Bhtml/builder.js";
import { chatContent } from "./chatContent.js";
import {
  createAccForm,
  signInForm,
  createForumForm,
} from "./forms.js";
import { main } from "./top.js";

type WhatMain =
  | "blank"
  | "create account"
  | "sign in"
  | "create forum"
  | "forum";

export const changeMain = (what: WhatMain) => {
  switch (what) {
    case "blank":
      main.replace("content", undefined);
      break;
    case "create account":
      main.replace("content", createAccContent);
      break;
    case "sign in":
      main.replace("content", signInContent);
      break;
    case "create forum":
      main.replace("content", createForumContent);
      break;
    case "forum":
      main.replace("content", chatContent);
      break;
  }
}

export const createAccContent = (b: Build) => {
  return b.cache("createAccContent", make)

  function make() {
    return built("section",
      built("h1",
        "Create Account"
      ),
      createAccForm
    )
      .className("flex flex-col space-y-3 justify-center items-center")
  }
};

export const signInContent = (b: Build) => {
  return b.cache("signInContent", make)

  function make() {
    return built("section",
      built("h1",
        "Sign In"
      ),
      signInForm,
    )
      .className("flex flex-col space-y-3 justify-center items-center")
  }
};

export const createForumContent = (b: Build) => {
  return b.cache("createForumContent", make)

  function make() {
    return built("section",
      built("h1",
        "Create Forum"
      ),
      createForumForm
    )
      .className("flex flex-col space-y-3 justify-center items-center")
  }
};

