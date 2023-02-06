import { Build, cache } from "../util/Bhtml/builder.js";
import { currentForum, user, subscribe, Forum, eventSources } from "../page.js";
import { dark, accent } from "../page.js";
import {
  createAccForm,
  signInForm,
  createForumForm,
  sendMessageForm,
} from "./forms.js";
import { top } from "./top.js";
import { changeModals } from "./modals.js";
import { h1Build, h2Build } from "./base.js";

type WhatMain =
  | "blank"
  | "create account"
  | "sign in"
  | "create forum"
  | "forum";
export const changeMain = (what: WhatMain) => {
  switch (what) {
    case "blank":
      top.main.replace("content", undefined);
      break;
    case "create account":
      top.main.replace("content", createAccContent);
      break;
    case "sign in":
      top.main.replace("content", signInContent);
      break;
    case "create forum":
      top.main.replace("content", createForumContent);
      break;
    case "forum":
      top.main.replace("content", chatContent);
      break;
  }
}

export interface TabInfo {
  forum: Forum,
  eventSourceUrls: Array<string>;
}

export const openTabs = new Map<string, ReturnType<ReturnType<typeof tab>>>();

export const notifyMessage = (forum_id: string) => {
  const n = openTabs.get(forum_id)?.getItem("tabBody")?.getItem("notification");
  if (n && n.elem.childNodes.length === 0) n.append(circle)
}

export const selectTab = (forum_id: string) => {
  const tab = openTabs.get(forum_id);
  if (tab) {
    tab.getItem("tabBody").getItem("notification").removeChildren()
    tab.elem.classList.remove("bg-neutral-500");
    tab.elem.classList.add("bg-neutral-400");
  }
}

export const unselectTab = (forum_id: string | undefined) => {
  if (!forum_id) return;
  const tab = openTabs.get(forum_id);
  if (tab) {
    tab.elem.classList.remove("bg-neutral-400");
    tab.elem.classList.add("bg-neutral-500");
  }
}

export const closeTab = (info: TabInfo) => {
  for (const url of info.eventSourceUrls) {
    const ev = eventSources.get(url);
    if (ev) ev.close();
    eventSources.delete(url);
  }
  cache.delete(info.forum._id.$oid)
  const tab = openTabs.get(info.forum._id.$oid);
  if (tab) top.main.getItem("tabs").elem.removeChild(tab.elem);
  if (currentForum.value === info.forum) changeMain("blank")
  openTabs.delete(info.forum._id.$oid);
}

export const closeAllTabs = () => {
  for (const ev of eventSources.values()) {
    ev.close();
  }
  eventSources.clear();
  currentForum.value = undefined;
  for (const key of openTabs.keys()) {
    if (cache.has(key)) cache.delete(key);
  }
  openTabs.clear();
  top.main.getItem("tabs").removeChildren();
}

const addTab = (tabInfo: TabInfo) => {
  top.main.getItem("tabs").append(tab(tabInfo))
}

const circle = (b: Build) => b
  .tag("div")
  .build()
  .className("rounded-full p-1 bg-neutral-300")

const notification = (b: Build) => b
  .tag("div")
  .build()
  .className("p-2 w-5 flex items-center justify-center")

const tabBody = (text: string) => (b: Build) => b
  .tag("div")
  .nodeArgs(
    b => b.tag("div").nodeArgs(text),
    <["notification", typeof notification]>["notification", notification],
  )
  .build()
  .className("flex rounded-sm pl-2 py-1 hover:bg-neutral-400")

const closeButton = (b: Build) => b
  .tag("button")
  .nodeArgs(
    "x"
  )
  .build()
  .className("rounded-sm px-2 p-1 hover:bg-neutral-400")


const tab = (info: TabInfo) => (b: Build) => b
  .tag("li")
  .nodeArgs(
    <["tabBody", ReturnType<typeof tabBody>]>["tabBody", tabBody(info.forum.name)],
    <["close", typeof closeButton]>["close", closeButton]
  )
  .build()
  .id(info.forum._id.$oid)
  .className("flex rounded-sm cursor-pointer bg-neutral-400 text-neutral-900")
  .run(function() {
    this.getItem("tabBody").on("click", () => {
      unselectTab(currentForum.value!._id.$oid);
      currentForum.value = info.forum;
      changeMain("forum");
    });

    this.getItem("close").on("click", () => closeTab(info))

    openTabs.set(info.forum._id.$oid, this)
  })

export const createAccContent = (b: Build) => {
  return b.cache("createAccContent", make)

  function make() {
    const aria = "createAccSection";
    return b
      .tag("section")
      .nodeArgs(
        h1Build("Create Account")(b)
          .id(aria),
        createAccForm
      )
      .build()
      .attribute("aria-labelledby", aria)
      .className("flex flex-col space-y-3 justify-center items-center")
  }
};

export const signInContent = (b: Build) => {
  return b.cache("signInContent", make)

  function make() {
    const aria = "signInSection";
    return b
      .tag("section")
      .nodeArgs(
        h1Build("Sign In")(b)
          .id(aria),
        signInForm,
      )
      .build()
      .attribute("aria-labelledby", aria)
      .className("flex flex-col space-y-3 justify-center items-center")
  }
};

export const createForumContent = (b: Build) => {
  return b.cache("createForumContent", make)

  function make() {
    const aria = "createForumSec";
    return b
      .tag("section")
      .nodeArgs(
        h1Build("Create Forum")(b)
          .id(aria),
        createForumForm
      )
      .build()
      .attribute("aria-labelledby", aria)
      .className("flex flex-col space-y-3 justify-center items-center")
  }
};

const h2PermittedUsers = (aria: string) => (b: Build) => h2Build("PERMITTED USERS")(b)
  .id(aria)
  .className("text-neutral-500")

const buttonEditPermittedUsers = (b: Build) => b
  .tag("button")
  .nodeArgs(
    "edit"
  )
  .build()
  .className("px-2")
  .on("click", () => changeModals("updatePermittedUsers"))

const headerPermittedUsers = (aria: string) => (b: Build) => {
  const header = b
    .tag("header")
    .nodeArgs(
      h2PermittedUsers(aria)
    )
    .build()
    .className("flex")
  if (currentForum.value?.owner === user.value) {
    header
      .append(buttonEditPermittedUsers)
  }
  return header;
}

const liPermittedUser = (u: string, id: string) => (b: Build) => {
  const li = b
    .tag("li")
    .nodeArgs(
      u
    )
    .build()
    .id("PU" + u + id)
    .className("px-2 py-1 rounded-sm text-neutral-900");
  if (u === user.value) {
    li.className("bg-neutral-400")
    return li;
  }
  return li.className("bg-neutral-500");
}

const message = (data: { user: string, value: string }) => (b: Build) => {
  const divUser = b
    .tag("div")
    .nodeArgs(
      data.user
    )
    .build()
    .className("flex justify-center items-center rounded-sm p-3 w-20 m-w-full")
  data.user === user.value ? divUser.className(accent) : divUser.className(dark);

  const divValue = b
    .tag("div")
    .nodeArgs(
      data.value
    )
    .build()
    .className("p-3")

  return b
    .tag("li")
    .nodeArgs(
      divUser,
      divValue
    )
    .build()
    .className("flex")
}

const scheduleRemoveListening = new Map<string, number>();

const removeListening = (e: Element) => {
  e.classList.add("bg-neutral-500");
  e.classList.remove("bg-neutral-400");
}

const addListening = (e: Element) => {
  e.classList.remove("bg-neutral-500");
  e.classList.add("bg-neutral-400");
};

export const chatContent = (b: Build) => {
  selectTab(currentForum.value!._id.$oid)
  return b.cache(currentForum.value!._id.$oid, make);

  function make() {
    const thisForum = currentForum.value!;

    const aria = "chatContent";

    const tabInfo = {
      forum: thisForum,
      eventSourceUrls: [
        "/forum/listen-updated-permitted-users?f=" + thisForum._id.$oid,
        "/forum/listen-listening-users?f=" + thisForum._id.$oid,
        "/forum/listen-messages?f=" + thisForum._id.$oid,
      ]
    };

    const h1 = h1Build(thisForum.name)(b)
      .id(aria)

    const permittedUsersList = b
      .tag("ul")
      .build()
      .className("flex gap-2")
    for (const u of thisForum.permitted_users) {
      permittedUsersList.append(liPermittedUser(u, thisForum._id.$oid))
    }

    const ariaPermittedUsers = "sectionPermittedUsers";
    const permittedUsersSection = b
      .tag("section")
      .nodeArgs(
        headerPermittedUsers(ariaPermittedUsers),
        permittedUsersList,
      )
      .build()
      .attribute("aria-labelledby", ariaPermittedUsers)

    subscribe(
      tabInfo.eventSourceUrls[0],
      undefined,
      {
        added(m) {
          for (const u of JSON.parse(m.data)) {
            permittedUsersList.append(liPermittedUser(u, thisForum._id.$oid))
          }
        },
        removed(m) {
          for (const u of JSON.parse(m.data)) {
            const list = permittedUsersList.elem;
            const removeMeLi = list.querySelector("#PU" + u);
            if (removeMeLi) list.removeChild(removeMeLi);
          }
        }
      }
    );

    subscribe(
      tabInfo.eventSourceUrls[1],
      (m) => {
        const id = "#PU" + m.data;
        const child = permittedUsersList.elem.querySelector(id);
        if (!child) return;
        addListening(child);
        const oldTOid = scheduleRemoveListening.get(id);
        if (oldTOid) clearTimeout(oldTOid)
        const newTOid = setTimeout(function() {
          removeListening(child)
          scheduleRemoveListening.delete(id);
        }, 3010);

        scheduleRemoveListening.set(id, newTOid);
      },
    );

    const messagesList = b
      .tag("ul")
      .build()
      .className("space-y-3")

    const messagesSection = b
      .tag("section")
      .nodeArgs(
        messagesList
      )
      .build()
      .attribute("aria-labelledby", aria)
      .className("grow space-y-3 overflow-auto")

    subscribe(
      tabInfo.eventSourceUrls[2],
      (m) => {
        messagesList
          .append(message(JSON.parse(m.data)))
          .elem.lastElementChild?.scrollIntoView()

        if (currentForum.value?._id.$oid !== thisForum._id.$oid) {
          notifyMessage(thisForum._id.$oid);
        }
      },
      {
        closed(_) {
          closeTab(tabInfo)
        }
      }
    );

    addTab(tabInfo);

    return b
      .tag("section")
      .nodeArgs(
        h1,
        permittedUsersSection,
        messagesSection,
        sendMessageForm
      )
      .build()
      .attribute("aria-labelledby", aria)
      .className("flex h-full flex-col space-y-3")
  }
};


