import { createEffect, Build, built } from "../util/Bhtml/builder.js";
import { mid, dark } from "../page.js";
import {
  mainUser,
  sign_out,
  forumListOwned,
  forumListPermitted,
  ForumListItem,
  currentForum,
  forumListSelection,
  forumsMenuHeader,
  bfetch,
} from "../page.js";
import { sideBar } from "./top.js";
import { changeMain } from "./main.js";
// import { openTabs } from "./openTabs.js";

const buttonClasses = "cursor-pointer py-1 px-3 rounded-sm"

type WhatSideBar =
  | "signed in"
  | "signed out";
export const changeSideBar = (what: WhatSideBar) => {
  switch (what) {
    case "signed out":
      sideBar
        .replace("h2", undefined)
        .replace("sidemenu", signedOutSideBarMenu)
        .replace("forums", undefined)
      break;
    case "signed in":
      sideBar
        .replace("h2", built("h2", mainUser))
        .replace("sidemenu", signedInSideBarMenu)
        .replace("forums", sideBarForumsMenu);
      break;
  }
}

export const signedOutSideBarMenu = (b: Build) => {
  return b.cache("signedOutSideBarMenuBlt", make);

  function make() {
    const createAccButton = built("button",
      "Create Account"
    )
      .attribute("type", "button")
      .className(buttonClasses)
      .className(mid)
      .on("click", () => {
        changeMain("create account");
      })

    const signInButton = built("button",
      "Sign In"
    )
      .className(buttonClasses)
      .className(mid)
      .on("click", () => {
        changeMain("sign in");
      })

    return built("nav",
      createAccButton,
      signInButton
    )
      .className("flex flex-col space-y-3")
  }
};

export const signedInSideBarMenu = (b: Build) => {
  return b.cache("signedInSideBarMenu", make)

  function make() {
    const signOutButton = built("button",
      "Sign Out"
    )
      .className(buttonClasses)
      .className(mid)
      .attribute("type", "button")
      .on("click", () => sign_out())

    const createForumButton = built("button",
      "Create New Forum"
    )
      .className(buttonClasses)
      .className(mid)
      .on("click", () => changeMain("create forum"))

    const listOwnedForums = built("button",
      "Owned Forums"
    )
      .className(buttonClasses)
      .className(mid)
      .attribute("type", "button")
      .on("click", forumListOwned)

    const listPermittedForums = built("button",
      "Permitted Forums"
    )
      .className(buttonClasses)
      .className(mid)
      .attribute("type", "button")
      .on("click", forumListPermitted)

    return built("nav",
      signOutButton,
      createForumButton,
      listOwnedForums,
      listPermittedForums
    )
      .className("flex flex-col space-y-3")
  }
};


export const sideBarForumsMenu = (b: Build) => {
  return b.cache("sideBarForumsMenu", make)

  function make() {
    const head = built("h2",
      forumsMenuHeader
    )

    const nav = built("nav")
      .className("flex flex-col space-y-3")

    const forumButton = (forumItem: ForumListItem) => built("button",
      forumItem.name
    )
      .attribute("type", "button")
      .on("click", () => {
        // openTabs.unselectTab(currentForum.value?._id.$oid);
        bfetch
          .method("GET")
          .url("/forum/forum?f=" + forumItem._id.$oid)
          .onSuccess(async (r) => {
            const data = await r.json() as { permitted_users: Array<string> };
            console.log(data);
            currentForum.value = { ...forumItem, ...data }
            changeMain("forum")
          })
          .send();
      })
      .className(buttonClasses)
      .className(dark)

    createEffect(() => {
      nav.removeNodes();
      for (const forumItem of forumListSelection.value) {
        nav.addNodes(forumButton(forumItem))
      }
    })

    return built("section",
      head,
      nav
    )
      .className("space-y-3")
  }
};
