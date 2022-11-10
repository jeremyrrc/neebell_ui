import { Built, Builder } from "./util/Bhtml/index.js";
import { Bfetch, Error } from "./util/Bfetch/Bfetch.js";
import {
  mainErrorBlt,
  signInContentBlt,
  createAccContentBlt,
  createForumContentBlt,
  signedOutSideMenuBlt,
  signedInSideMenuBlt,
} from "./components/index.js";
export const dark = "bg-neutral-700 text-neutral-200";
export const mid = "bg-neutral-400 text-neutral-900";
export const light = "bg-neutral-300 text-neutral-900";
export const accent = "bg-orange-500 text-neutral-900";

export const namePattern = "[A-Za-z0-9_-]+";

const showError = (errorBlt: Built<HTMLElement>, mess: string) => {
  errorBlt.modify("errorMessage", (message) => {
    if (message instanceof Text) {
      message.data = mess;
    }
    message.textContent = mess;
  });
  errorBlt.elem.classList.remove("hidden");
};

const handleErrorFactory = (errorBlt: Built<HTMLElement>) => {
  return (err: Error, _bf: Bfetch) => {
    showError(errorBlt, err.message);
  };
};

type MainComponents = Record<
  "header" | "sideBar" | "main" | "mainError",
  Built<HTMLElement>
>;

type WhatContent = "blank" | "create account" | "sign in" | "create forum";
type WhatSideMenu = "signed in" | "signed out";

export class Page {
  header: Built<HTMLElement>;
  sideBar: Built<HTMLElement>;
  main: Built<HTMLElement>;
  mainError: Built<HTMLElement>;
  b: Builder;
  bfetch: Bfetch;

  constructor(
    b: Builder,
    { header, sideBar, main, mainError }: MainComponents
  ) {
    this.b = b;
    this.header = header;
    this.sideBar = sideBar;
    this.main = main;
    this.mainError = mainError;
    this.bfetch = new Bfetch("http://127.0.0.1:8000")
      .onError(handleErrorFactory(mainError))
      .keep("onError");
  }

  sideMenu(what: WhatSideMenu, h2?: string) {
    switch (what) {
      case "signed out":
        this.sideBar.replace("h2", "");
        this.sideBar.replace("sideMenu", signedOutSideMenuBlt(this.b, this));
        break;
      case "signed in":
        this.sideBar.replace("h2", this.b.tag("h2").childNode(h2).build());
        this.sideBar.replace("sideMenu", signedInSideMenuBlt(this.b, this));
        break;
    }
  }

  content(what: WhatContent) {
    switch (what) {
      case "blank":
        this.main.replace("content", "");
        break;
      case "create account":
        this.main.replace("content", createAccContentBlt(this.b, this));
        break;
      case "sign in":
        this.main.replace("content", signInContentBlt(this.b, this));
        break;
      case "create forum":
        this.main.replace("content", createForumContentBlt(this.b, this));
        break;
    }
  }

  load() {
    this.main.replace("content", "...Loading");
    this.bfetch
      .method("GET")
      .url("/user/load")
      .catchErrorCode(401, async () => {
        this.sideMenu("signed out");
        this.content("sign in");
        return false;
      })
      .onSuccess(async (r) => {
        const user = await r.text();
        this.sideMenu("signed in", user);
        this.content("blank");
      })
      .send();
  }
}

new Built(document.body, new Builder()).modifySelf((self, b) => {
  const header = b.tag("header").childNode("NEEBELL").build();
  const sideBar = b
    .tag("aside")
    .childNode("", "h2")
    .childNode("", "sideMenu")
    .build();
  const main = b.tag("main").childNode("", "content").build();
  const mainError = mainErrorBlt(b);

  const page = new Page(b, { header, sideBar, main, mainError });

  const container = b
    .className("flex h-screen")
    .childNode(
      sideBar.className(
        "flex-none flex flex-col space-y-3 p-3 h-screen bg-neutral-800"
      )
    )
    .childNode(main.className("flex-1 p-3  h-screen"))
    .build();

  self
    .className("h-full")
    .childNode(header.className("p-3").className(dark))
    .childNode(container)
    .childNode(mainError.className("fixed top-5 left-0 right-0"));
  page.load();
});

// const baseDisplay = (b: Builder) =>
//   b.childNode("Clicked: ").childNode(0, "count");

// const display = (b: Builder) => baseDisplay(b).childNode(" times.");

// const incCountListenerFactory = (
//   hasTextNode: Built<HTMLElement>,
//   countTextNodeKey: string
// ) => {
//   return (_e: Event) => {
//     hasTextNode.modify(countTextNodeKey, (text) => {
//       if (text instanceof Text) {
//         const count = parseInt(text.data) + 1;
//         text.data = count.toString();
//       }
//     });
//   };
// };

// const button = (b: Builder, displayWrap: Built<HTMLElement>) => {
//   return b
//     .childNode("Clicker")
//     .event("click", incCountListenerFactory(displayWrap, "count"))
//     .build<HTMLButtonElement>("button");
// };

// new Built(document.body, new Builder()).childNode((b) => {
//   const displayWrap = display(b).build();
//   return b
//     .childNode(displayWrap)
//     .childNode((b) => button(b, displayWrap))
//     .build();
// });
