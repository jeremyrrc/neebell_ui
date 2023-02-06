import { createEffect, Build } from "../util/Bhtml/builder.js";
import { h2Build, buttonBuild } from "../components/base.js";
import { mid, dark } from "../page.js";
import {
  user,
  sign_out,
  forumListOwned,
  forumListPermitted,
  ForumListItem,
  currentForum,
  forumListSelection,
  forumsMenuHeader,
  bfetch,
} from "../page.js";
import { top } from "./top.js";
import { changeMain, unselectTab } from "./main.js";

type WhatSideBar =
  | "signed in"
  | "signed out";
export const changeSideBar = (what: WhatSideBar) => {
  switch (what) {
    case "signed out":
      top.sideBar
        .replace("h2", undefined)
        .replace("sidemenu", signedOutSideBarMenu)
        .replace("forums", undefined)
      break;
    case "signed in":
      top.sideBar
        .replace("h2", h2Build(user))
        .replace("sidemenu", signedInSideBarMenu)
        .replace("forums", sideBarForumsMenu);
      break;
  }
}

export const signedOutSideBarMenu = (b: Build) => {
  return b.cache("signedOutSideBarMenuBlt", make);

  function make() {
    const createAccButton = buttonBuild("Create Account")(b)
      .className(mid)
      .on("click", () => {
        changeMain("create account");
      })
    const signInButton = buttonBuild("Sign In")(b)
      .className(mid)
      .on("click", () => {
        changeMain("sign in");
      })

    return b
      .tag("nav")
      .nodeArgs(
        createAccButton,
        signInButton
      )
      .build()
      .className("flex flex-col space-y-3")
  }
};

export const signedInSideBarMenu = (b: Build) => {
  return b.cache("signedInSideBarMenu", make)

  function make() {
    const signOutButton = buttonBuild("Sign Out")(b)
      .on("click", () => sign_out())
      .className(mid)

    const createForumButton = buttonBuild("Create New Forum")(b)
      .on("click", () => changeMain("create forum"))
      .className(mid)

    const listOwnedForums = buttonBuild("Owned Forums")(b)
      .on("click", forumListOwned)
      .className(mid)

    const listPermittedForums = buttonBuild("Permitted Forums")(b)
      .on("click", forumListPermitted)
      .className(mid)

    return b
      .tag("nav")
      .nodeArgs(
        signOutButton,
        createForumButton,
        listOwnedForums,
        listPermittedForums
      )
      .build()
      .className("flex flex-col space-y-3")
  }
};

const forumButton = (forumItem: ForumListItem) => (b: Build) => buttonBuild(forumItem.name)(b)
  .on("click", () => {
    unselectTab(currentForum.value?._id.$oid);
    bfetch
      .method("GET")
      .url("/forum/forum?f=" + forumItem._id.$oid)
      .onSuccess(async (r) => {
        const data = await r.json() as { permitted_users: Array<string> };
        currentForum.value = { ...forumItem, ...data }
        changeMain("forum")
      })
      .send();
  })
  .className(dark)

export const sideBarForumsMenu = (b: Build) => {
  return b.cache("sideBarForumsMenu", make)

  function make() {
    const head = h2Build(forumsMenuHeader)(b)
    const nav = b
      .tag("nav")
      .build()
      .className("flex flex-col space-y-3")

    createEffect(() => {
      nav.removeChildren();
      for (const forumItem of forumListSelection.value) {
        nav.append(forumButton(forumItem))
      }
    })

    return b
      .tag("section")
      .nodeArgs(
        head,
        nav
      )
      .build()
      .className("space-y-3")
  }
};
