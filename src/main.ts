// import { nav, isPage } from "./pages.js";
import { Built, Builder } from "./util/Bhtml/index.js";
import { Bfetch, Error } from "./util/Bfetch/Bfetch.js";
import { mainErrorBlt, signInContentBlt, buttonB } from "./components/index.js";
export const dark = "bg-neutral-700 text-neutral-200";
export const mid = "bg-neutral-400 text-neutral-900";
export const light = "bg-neutral-300 text-neutral-900";
export const accent = "bg-orange-500 text-neutral-900";

export const namePattern = "[A-Za-z0-9_-]+";

type MainComponents = Record<
  "header" | "sideMenu" | "main" | "mainError",
  Built<HTMLElement>
>;

const showError = (errorBlt: Built<HTMLElement>, mess: string) => {
  errorBlt.modify("errorMessage", (message) => {
    if (message instanceof Text) {
      message.data = mess;
    }
    message.textContent = mess;
  });
  if (errorBlt.elem instanceof HTMLDialogElement) errorBlt.elem.showModal();
};

const handleErrorFactory = (errorBlt: Built<HTMLElement>) => {
  return (err: Error, _bf: Bfetch) => {
    showError(errorBlt, err.message);
  };
};

export class Page {
  header: Built<HTMLElement>;
  sideMenu: Built<HTMLElement>;
  main: Built<HTMLElement>;
  mainError: Built<HTMLElement>;
  bfetch: Bfetch;

  constructor(
    { header, sideMenu, main, mainError }: MainComponents,
    bfetch: Bfetch
  ) {
    this.header = header;
    this.sideMenu = sideMenu;
    this.main = main;
    this.mainError = mainError;
    bfetch.onError(handleErrorFactory(mainError));
    this.bfetch = bfetch;
  }

  signIn(b: Builder) {
    const createAccButton = buttonB(b, "Create Account").className(mid).build();
    const signInButton = buttonB(b, "Sign In").className(mid).build();
    this.sideMenu.childNode(createAccButton).childNode(signInButton);
    this.main.replace("content", signInContentBlt(b, this));
  }

  load(b: Builder) {
    this.main.replace("content", "...Loading");
    this.bfetch
      .method("GET")
      .url("/user/load")
      .catchErrorCode(401, async () => {
        this.signIn(b);
        return false;
      })
      .onSuccess(async (response) => {
        const user = await response.text();
        console.log(user);
      })
      .send();
  }
}

new Built(document.body, new Builder()).modifySelf((self, b) => {
  const header = b.tag("header").childNode("NEEBELL").build();
  const sideMenu = b.tag("nav").build();
  const main = b.tag("main").childNode("", "content").build();
  const mainError = mainErrorBlt(b);

  const bfetch = new Bfetch("http://127.0.0.1:8000").onError(
    handleErrorFactory(mainError)
  );

  const page = new Page({ header, sideMenu, main, mainError }, bfetch);

  const container = b
    .className("flex h-full")
    .childNode(
      sideMenu.className(
        "flex-none flex flex-col space-y-3 p-3 h-full bg-neutral-800"
      )
    )
    .childNode(main.className("flex-1 p-3  h-full"))
    .build();

  self
    .className("h-full")
    .childNode(header.className("p-3").className(dark))
    .childNode(container)
    .childNode(mainError);
  page.load(b);
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
