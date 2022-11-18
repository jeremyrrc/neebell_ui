import { light, mid, dark } from "../main.js";
import { Builder } from "../util/Bhtml/builder.js";
import { Built } from "../util/Bhtml/built.js";
import { Page, Forum } from "../main.js";
import {
  signInForm,
  createAccForm,
  createForumForm,
  sendMessageForm,
} from "./forms.js";
import { buttonB } from "./base.js";
import { curry } from "lodash";

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
    .build();
};

// Sidebar side menu ==========
export const signedOutSideMenuBlt = curry((p: Page, b: Builder) => {
  const cacheKey = "signedOutSideMenu";
  const cached = b.cached(cacheKey);
  if (cached) return cached;
  const createAccButton = buttonB(b, "Create Account")
    .event("click", () => {
      p.main("create account");
    })
    .build();
  const signInButton = buttonB(b, "Sign In")
    .event("click", () => {
      p.main("sign in");
    })
    .build();
  return b
    .cache(cacheKey)
    .tag("nav")
    .className("flex flex-col space-y-3")
    .childNode(createAccButton.className(mid))
    .childNode(signInButton.className(mid))
    .build();
});

export const signedInSideMenuBlt = curry((p: Page, b: Builder) => {
  const cacheKey = "signedInSideMenu";
  const cached = b.cached(cacheKey);
  if (cached) return cached;
  const signOutButton = buttonB(b, "Sign Out")
    .event("click", () => {
      p.sign_out();
    })
    .build();
  const createForumButton = buttonB(b, "Create New Forum")
    .event("click", () => {
      p.main("create forum");
    })
    .build();
  const listOwnedForums = buttonB(b, "Owned Forums")
    .event("click", p.forumListOwned)
    .build();
  const listPermittedForums = buttonB(b, "Permitted Forums")
    .event("click", p.forumListPermitted)
    .build();
  return b
    .cache(cacheKey)
    .tag("nav")
    .className("flex flex-col space-y-3")
    .childNode(signOutButton.className(mid))
    .childNode(createForumButton.className(mid))
    .childNode(listOwnedForums.className(mid))
    .childNode(listPermittedForums.className(mid))
    .build();
});

export const sideBarForumsMenuBlt = (
  p: Page,
  { h2, forums }: { h2: string; forums: Array<Forum> },
  nav: Builder
) => {
  nav
    .tag("nav")
    .className("flex flex-col space-y-3")
    .childNode((b) => b.tag("h2").childNode(h2).build());
  for (const forum of forums) {
    nav.childNode((button) =>
      button
        .tag("button")
        .childNode(forum.name)
        .className("p-1")
        .className(dark)
        .event("click", () => {
          p.main("forum", { forum });
        })
        .build()
    );
  }
  return nav.build();
};

// Main content ==========
export const createAccContentBlt = curry((p: Page, b: Builder) => {
  const cacheKey = "createAccContent";
  const cached = b.cached(cacheKey);
  if (cached) return cached;
  const labelledbyId = "createAccSection";
  const h1 = b.tag("h1").childNode("Create Account").id(labelledbyId).build();
  const form = createAccForm(b, p).build();
  return b
    .cache(cacheKey)
    .attribute("aria-labelledby", labelledbyId)
    .tag("section")
    .className("flex flex-col space-y-3 justify-center items-center")
    .childNode(h1.className("text-2xl"))
    .childNode(form)
    .build();
});

export const signInContentBlt = curry((p: Page, b: Builder) => {
  const cacheKey = "signedOutContent";
  const cached = b.cached(cacheKey);
  if (cached) return cached;
  const labelledbyId = "signInSection";
  const h1 = b.tag("h1").childNode("Sign In").id(labelledbyId).build();
  const form = signInForm(b, p).build();
  return b
    .cache(cacheKey)
    .attribute("aria-labelledby", labelledbyId)
    .tag("section")
    .className("flex flex-col space-y-3 justify-center items-center")
    .childNode(h1.className("text-2xl"))
    .childNode(form)
    .build();
});

export const createForumContentBlt = curry((p: Page, b: Builder) => {
  const cacheKey = "createForumContent";
  const cached = b.cached(cacheKey);
  if (cached) return cached;
  const labelledbyId = "createForumSec";
  const h1 = b.tag("h1").childNode("Create New Forum").id(labelledbyId).build();
  const form = createForumForm(b, p).build();
  return b
    .cache(cacheKey)
    .attribute("aria-labelledby", labelledbyId)
    .tag("section")
    .className("flex flex-col space-y-3 justify-center items-center")
    .childNode(h1.className("text-2xl"))
    .childNode(form)
    .build();
});

export const forumListeningBlt = (forum: Forum, p: Page, b: Builder) => {
  const h1 = b.tag("h1").childNode(forum.name).build();
  const permittedList = b
    .tag("section")
    .childNode((h2) =>
      h2
        .tag("h2")
        .childNode("PERMITTED USERS")
        .className("text-neutral-500 text-lg")
        .build()
    )
    .childNode((ul) => {
      ul.tag("ul");
      for (const u of forum.permitted_users) {
        ul.childNode((li) => li.tag("li").childNode(u).build());
      }
      return ul.build();
    })
    .build();
  const messages = b.tag("ul").build();
  const display = b.tag("section").childNode(messages).build();
  subscribe(p.bfetch._baseUrl + "/forum/listen?f=" + forum._id.$oid, messages);
  const form = sendMessageForm(forum._id.$oid, p, b);
  return b
    .tag("section")
    .className("flex flex-col h-full space-y-3")
    .childNode(h1.className("text-2xl"))
    .childNode(permittedList)
    .childNode(display.className("h-full"))
    .childNode(form)
    .build();
};

const subscribe = (uri: string, display: Built) => {
  var retryTime = 1;

  function connect(uri: string) {
    const events = new EventSource(uri, { withCredentials: true });

    events.addEventListener("message", (ev) => {
      console.log("raw data", JSON.stringify(ev.data));
      display.childNode((li) => li.tag("li").childNode(ev.data).build());
    });

    events.addEventListener("open", () => {
      console.log(`connected to event stream at ${uri}`);
      retryTime = 1;
    });

    events.addEventListener("error", () => {
      events.close();

      let timeout = retryTime;
      retryTime = Math.min(64, retryTime * 2);
      console.log(`connection lost. attempting to reconnect in ${timeout}s`);
      setTimeout(() => connect(uri), (() => timeout * 1000)());
    });
  }

  connect(uri);
};
