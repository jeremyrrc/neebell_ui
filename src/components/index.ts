import { light, mid, dark } from "../main.js";
import { Builder } from "../util/Bhtml/builder.js";
import { Built } from "../util/Bhtml/built.js";
import { Page, Forum } from "../page.js";
import { Tag } from "../util/Bhtml/index.js";
import {
    signInForm,
    createAccForm,
    createForumForm,
    sendMessageForm,
} from "./forms.js";
import { buttonB } from "./base.js";

export const mainErrorBlt = (b: Builder) => {
    const closeButton = buttonB(b, "Close").on("click", (e) => {
        const button = e.target as HTMLButtonElement;
        button.parentElement?.classList.add("hidden");
    });
    return b
        .tag("dialog")
        .className("flex flex-col items-center space-y-3 rounded-sm hidden")
        .className(mid)
        .childNode("An error occured", "errorMessage")
        .childNode(closeButton.className("mt-3").className(light));
};

export const notiBubble = (b: Builder) => {
    return b
        .tag("div")
        .className("fixed bottom-3 left-3 p-3 flex rounded-sm hidden cursor-pointer")
        .className(mid)
        .childNode("", "message")
        .extend({
            show(message?: string, autoHide?: number) {
                this.elem.classList.remove("hidden");
                if (message)
                    this.replace("message", message);
                if (autoHide)
                    setTimeout(this.hide.bind(this), autoHide * 1000);
            },
            hide() {
                if (!this.elem.classList.contains("hidden"))
                    this.elem.classList.add("hidden")
            }
        }).on("click", function() {
            this.hide();
        });
};

// Sidebar side menu ==========
export const signedOutSideMenuBlt = (p: Page) => (b: Builder) => {
    const cacheKey = "signedOutSideMenu";
    const cached = b.cached(cacheKey);
    if (cached) return cached;
    const createAccButton = buttonB(b, "Create Account").on("click", () => {
        p.main("create account");
    });
    const signInButton = buttonB(b, "Sign In").on("click", () => {
        p.main("sign in");
    });
    return b
        .cache(cacheKey)
        .tag("nav")
        .className("flex flex-col space-y-3")
        .childNode(createAccButton.className(mid))
        .childNode(signInButton.className(mid));
};

export const signedInSideMenuBlt = (p: Page) => (b: Builder) => {
    const cacheKey = "signedInSideMenu";
    const cached = b.cached(cacheKey);
    if (cached) return cached;
    const signOutButton = buttonB(b, "Sign Out").on("click", () => p.sign_out());
    const createForumButton = buttonB(b, "Create New Forum").on("click", () =>
        p.main("create forum")
    );
    const listOwnedForums = buttonB(b, "Owned Forums").on(
        "click",
        p.forumListOwned
    );
    const listPermittedForums = buttonB(b, "Permitted Forums").on(
        "click",
        p.forumListPermitted
    );
    return b
        .cache(cacheKey)
        .tag("nav")
        .className("flex flex-col space-y-3")
        .childNode(signOutButton.className(mid))
        .childNode(createForumButton.className(mid))
        .childNode(listOwnedForums.className(mid))
        .childNode(listPermittedForums.className(mid));
};

const h2B = (title: string) => (b: Builder) => b.tag("h2").childNode(title);

const forumButton = (forum: Forum, p: Page) => (b: Builder) =>
    b
        .tag("button")
        .childNode(forum.name)
        .className("p-1")
        .className(dark)
        .on("click", () => p.main("forum", { forum }));

export const sideBarForumsMenuBlt = (
    p: Page,
    { title, forums }: { title: string; forums: Array<Forum> },
) => (b: Builder) => {
    const nav = b
        .tag("nav")
        .className("flex flex-col space-y-3")
        .childNode(h2B(title));
    for (const forum of forums) {
        nav.childNode(forumButton(forum, p))
    }
    return nav;
};

// Main content ==========
export const createAccContentBlt = (p: Page) => (b: Builder) => {
    const cacheKey = "createAccContent";
    const cached = b.cached(cacheKey);
    if (cached) return cached;
    const labelledbyId = "createAccSection";
    const h1 = b.tag("h1").childNode("Create Account").id(labelledbyId);
    const form = createAccForm(b, p);
    return b
        .cache(cacheKey)
        .tag("section")
        .attribute("aria-labelledby", labelledbyId)
        .className("flex flex-col space-y-3 justify-center items-center")
        .childNode(h1.className("text-2xl"))
        .childNode(form);
};

export const signInContentBlt = (p: Page) => (b: Builder) => {
    const cacheKey = "signedOutContent";
    const cached = b.cached(cacheKey);
    if (cached) return cached;
    const labelledbyId = "signInSection";
    const h1 = b.tag("h1").childNode("Sign In").id(labelledbyId);
    const form = signInForm(b, p);
    return b
        .cache(cacheKey)
        .tag("section")
        .attribute("aria-labelledby", labelledbyId)
        .className("flex flex-col space-y-3 justify-center items-center")
        .childNode(h1.className("text-2xl"))
        .childNode(form);
};

export const createForumContentBlt = (p: Page) => (b: Builder) => {
    const cacheKey = "createForumContent";
    const cached = b.cached(cacheKey);
    if (cached) return cached;
    const labelledbyId = "createForumSec";
    const h1 = b.tag("h1").childNode("Create New Forum").id(labelledbyId);
    const form = createForumForm(b, p);
    return b
        .cache(cacheKey)
        .tag("section")
        .attribute("aria-labelledby", labelledbyId)
        .className("flex flex-col space-y-3 justify-center items-center")
        .childNode(h1.className("text-2xl"))
        .childNode(form);
};

export const forumListeningBlt = (forum: Forum, p: Page) => (b: Builder) => {
    const h1 = b.tag("h1").childNode(forum.name);
    const permittedList = b
        .tag("section")
        .childNode((b) =>
            b
                .tag("h2")
                .childNode("PERMITTED USERS")
                .className("text-neutral-500 text-lg")
        )
        .childNode((b) => {
            const ul = b.tag("ul");
            for (const u of forum.permitted_users) {
                ul.childNode((b) => b.tag("li").childNode(u));
            }
            return ul;
        });
    const messages = b.tag("ul");
    const display = b.tag("section").childNode(messages);
    subscribe(p.bfetch._baseUrl + "/forum/listen?f=" + forum._id.$oid, messages);
    const form = sendMessageForm(forum._id.$oid, p, b);
    return b
        .tag("section")
        .className("flex flex-col h-full space-y-3")
        .childNode(h1.className("text-2xl"))
        .childNode(permittedList)
        .childNode(display.className("h-full space-y-3 overflow-auto"))
        .childNode(form);
};

const subscribe = (uri: string, display: Built<Tag>) => {
    var retryTime = 1;

    function connect(uri: string) {
        const events = new EventSource(uri, { withCredentials: true });

        events.addEventListener("message", (ev) => {
            const data = JSON.parse(ev.data);
            // console.log("data", data);
            const message = (b: Builder) => {
                const user = b.tag("div").childNode(data.user);
                const value = b.tag("div").childNode(data.value);
                return b
                    .tag("li")
                    .className("flex")
                    .childNode(user.className("p-3").className(dark))
                    .childNode(value.className("p-3"));
            };
            display.childNode(message);
            display.elem.lastElementChild?.scrollIntoView();
        });

        events.addEventListener("open", () => {
            // console.log(`connected to event stream at ${uri}`);
            retryTime = 1;
        });

        events.addEventListener("error", () => {
            events.close();

            let timeout = retryTime;
            retryTime = Math.min(64, retryTime * 2);
            // console.log(`connection lost. attempting to reconnect in ${timeout}s`);
            setTimeout(() => connect(uri), (() => timeout * 1000)());
        });
    }

    connect(uri);
};
