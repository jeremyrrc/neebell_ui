import { Built } from "./util/Bhtml/built.js";
// import { Builder } from "./util/Bhtml/builder.js";
// import { inputB } from "./util/Bhtml/bhtml.js";
import { Bfetch, Error } from "./util/Bfetch/Bfetch.js";
import {
  mainErrorBlt,
  signInContentBlt,
  createAccContentBlt,
  createForumContentBlt,
  signedOutSideMenuBlt,
  signedInSideMenuBlt,
  sideBarForumsMenuBlt,
  forumListeningBlt,
} from "./components/index.js";
export const dark = "bg-neutral-700 text-neutral-200";
export const mid = "bg-neutral-400 text-neutral-900";
export const light = "bg-neutral-300 text-neutral-900";
export const accent = "bg-orange-500 text-neutral-900";

export const namePattern = "[A-Za-z0-9_-]+";

type Tag = keyof HTMLElementTagNameMap;

const showError = (errorBlt: Built<Tag>, mess: string) => {
  errorBlt.modify("errorMessage", (message) => {
    if (message instanceof Text) {
      message.data = mess;
      return;
    }
    if (message instanceof Built) message.elem.textContent = mess;
  });
  errorBlt.elem.classList.remove("hidden");
};

const handleErrorFactory = (errorBlt: Built<Tag>) => {
  return (err: Error, _bf: Bfetch) => {
    showError(errorBlt, err.message);
  };
};

type MainComponents = Record<
  "header" | "sideBar" | "main" | "mainError",
  Built<Tag>
>;

interface ObjectId {
  $oid: string;
}

export interface Forum {
  _id: ObjectId;
  name: string;
  permitted_users: Array<string>;
}

export interface MainContentData {
  forum: Forum;
}

type WhatMain =
  | "blank"
  | "create account"
  | "sign in"
  | "create forum"
  | "forum";

type WhatSideBar = "signed in" | "signed out";

export class Page {
  _header: Built<Tag>;
  _sideBar: Built<Tag>;
  _main: Built<Tag>;
  _mainError: Built<Tag>;
  bfetch: Bfetch;

  constructor({ header, sideBar, main, mainError }: MainComponents) {
    this._header = header;
    this._sideBar = sideBar;
    this._main = main;
    this._mainError = mainError;
    this.bfetch = new Bfetch("http://127.0.0.1:8000")
      .onError(handleErrorFactory(mainError))
      .keep("onError");
  }

  userData(user?: string) {
    if (user) {
      this._main.elem.dataset.user = user;
      this._sideBar.elem.dataset.user = user;
      return;
    }
    delete this._main.elem.dataset.user;
    delete this._sideBar.elem.dataset.user;
  }

  sideBar(what: WhatSideBar) {
    switch (what) {
      case "signed out":
        this._sideBar.replace("h2", "");
        this._sideBar.replace("sideMenu", signedOutSideMenuBlt(this));
        this._sideBar.replace("forums", "");
        break;
      case "signed in":
        this._sideBar.replace("h2", (b) =>
          b.tag("h2").childNode(this._sideBar.elem.dataset.user).build()
        );
        this._sideBar.replace("sideMenu", signedInSideMenuBlt(this));
        this.forumListOwned();
        break;
    }
  }

  sideBarForums(type: "Owned" | "Permitted", forums: Array<Forum>) {
    this._sideBar.replace("forums", (b) =>
      sideBarForumsMenuBlt(this, { h2: type, forums }, b)
    );
  }

  main(what: WhatMain, data?: MainContentData) {
    switch (what) {
      case "blank":
        this._main.replace("content", "");
        break;
      case "create account":
        this._main.replace("content", createAccContentBlt(this));
        break;
      case "sign in":
        this._main.replace("content", signInContentBlt(this));
        break;
      case "create forum":
        this._main.replace("content", createForumContentBlt(this));
        break;
      case "forum":
        if (data?.forum) {
          this._main.replace("content", (b) =>
            forumListeningBlt(data.forum, this, b)
          );
        }
        break;
    }
  }

  load = () => {
    this._main.modify("content", (n) => {
      if (n instanceof Text) n.data = "...Loading";
    });
    this.bfetch
      .method("GET")
      .url("/user/load")
      .catchErrorCode(401, async () => {
        this.sideBar("signed out");
        this.main("sign in");
        return false;
      })
      .onSuccess(async (r) => {
        const user = await r.text();
        this.userData(user);
        this.sideBar("signed in");
        this.main("blank");
      })
      .send();
  };

  create_user = (e: Event) => {
    e.preventDefault();
    this.bfetch
      .url("/user/create")
      .method("POST")
      .sendAs("encoded")
      .params(e)
      .onSuccess(() => {
        this.main("sign in");
      })
      .send();
  };

  sign_in = (e: Event) => {
    e.preventDefault();
    this.bfetch
      .url("/user/sign-in")
      .method("POST")
      .sendAs("encoded")
      .params(e)
      .onSuccess(async (r) => {
        const user = await r.text();
        this.userData(user);
        this.sideBar("signed in");
        this.main("blank");
      })
      .send();
  };

  sign_out = () => {
    this.bfetch
      .method("GET")
      .url("/user/sign_out")
      .onSuccess(() => {
        this.userData();
        this.sideBar("signed out");
        this.main("sign in");
      })
      .send();
  };

  create_forum = (e: Event) => {
    e.preventDefault();
    this.bfetch
      .url("/forum/create")
      .method("POST")
      .sendAs("encoded")
      .params(e)
      .onSuccess(() => {
        this.forumListOwned();
      })
      .send();
  };

  forumListOwned = () => {
    this.bfetch
      .method("GET")
      .url("/forum/list-owned")
      .onSuccess(async (r) => {
        const forums = (await r.json()) as Array<Forum>;
        this.sideBarForums("Owned", forums);
      })
      .send();
  };

  forumListPermitted = () => {
    this.bfetch
      .method("GET")
      .url("/forum/list-permitted")
      .onSuccess(async (r) => {
        const forums = (await r.json()) as Array<Forum>;
        this.sideBarForums("Permitted", forums);
      })
      .send();
  };

  sendMessage = (e: Event) => {
    e.preventDefault();
    this.bfetch
      .method("POST")
      .url("/forum/message")
      .sendAs("encoded")
      .params(e)
      .send();
  };
}

new Built(document.body).modifySelf((self, b) => {
  const header = b.tag("header").childNode("Chat").build();
  const sideBar = b
    .tag("aside")
    .childNode("", "h2")
    .childNode("", "sideMenu")
    .childNode("", "forums")
    .build();
  const main = b.tag("main").childNode("", "content").build();
  const input = b.tag("input").build();
  input.elem;
  const mainError = mainErrorBlt(b);

  const page = new Page({ header, sideBar, main, mainError });
  const container = b
    .tag("div")
    .childNode(
      sideBar.className(
        "flex flex-col space-y-3 p-3 h-full bg-neutral-800 overflow-auto"
      )
    )
    .childNode(main.className("flex-1 p-3  h-full"))
    .build();

  self
    .className("flex flex-col h-full")
    .childNode(header.className("p-3").className(dark))
    .childNode(container.className("flex flex-row h-full"))
    .childNode(mainError.className("fixed top-5 left-0 right-0"));

  page.load();
});

// const display = (b: Builder) =>
//   b
//     .tag("div")
//     .childNode("Clicked: ")
//     .childNode(0, "count")
//     .childNode(" times.");

// const display = (b: Builder) =>
//   b
//     .tag("div")
//     .childNode("Clicked: ")
//     .childNode((b) => inputB(b).build().startValue("0"), "count")
//     .childNode(" times.");

// const incCountListenerFactory = (hasTextNode: Built<HTMLElement>, countTextKey: string) => {
//   return (_e: Event) => {
//     hasTextNode.modify(countTextKey, (item) => {
//       if ("kind" in item && item.kind === "input") {
//         const curr = parseInt(item.elem.value);
//         item.elem.value = (curr + 1).toString();
//       }
//     });
//   };
// };

// const clicker = (displayBlt: Built<HTMLElement>) => {
//   return (b: Builder) =>
//     b
//       .tag("button")
//       .childNode("Clicker")
//       .on("click", incCountListenerFactory(displayBlt, "count"))
//       .build();
// };

// new Built(document.body).childNode((b) => {
//   const displayBlt = display(b).build();
//   return b
//     .tag("div")
//     .childNode(displayBlt)
//     .childNode(clicker(displayBlt))
//     .build();
// });
