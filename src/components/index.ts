import { mid, dark } from "../main.js";
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

export const notiBubble = (b: Builder) => {
    return b
        .tag("div")
        .className("fixed bottom-3 left-3 p-3 flex rounded-sm hidden cursor-pointer")
        .className(mid)
        .append("", "message")
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
        .append(createAccButton.className(mid))
        .append(signInButton.className(mid));
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
        .append(signOutButton.className(mid))
        .append(createForumButton.className(mid))
        .append(listOwnedForums.className(mid))
        .append(listPermittedForums.className(mid));
};

const h2B = (title: string) => (b: Builder) => b.tag("h2").append(title);

const forumButton = (forum: Forum, p: Page) => (b: Builder) =>
    b
        .tag("button")
        .append(forum.name)
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
        .append(h2B(title));
    for (const forum of forums) {
        nav.append(forumButton(forum, p))
    }
    return nav;
};

// Main content ==========
export const createAccContentBlt = (p: Page) => (b: Builder) => {
    const cacheKey = "createAccContent";
    const cached = b.cached(cacheKey);
    if (cached) return cached;
    const labelledbyId = "createAccSection";
    const h1 = b.tag("h1").append("Create Account").id(labelledbyId);
    const form = createAccForm(b, p);
    return b
        .cache(cacheKey)
        .tag("section")
        .attribute("aria-labelledby", labelledbyId)
        .className("flex flex-col space-y-3 justify-center items-center")
        .append(h1.className("text-2xl"))
        .append(form);
};

export const signInContentBlt = (p: Page) => (b: Builder) => {
    const cacheKey = "signedOutContent";
    const cached = b.cached(cacheKey);
    if (cached) return cached;
    const labelledbyId = "signInSection";
    const h1 = b.tag("h1").append("Sign In").id(labelledbyId);
    const form = signInForm(b, p);
    return b
        .cache(cacheKey)
        .tag("section")
        .attribute("aria-labelledby", labelledbyId)
        .className("flex flex-col space-y-3 justify-center items-center")
        .append(h1.className("text-2xl"))
        .append(form);
};

export const createForumContentBlt = (p: Page) => (b: Builder) => {
    const cacheKey = "createForumContent";
    const cached = b.cached(cacheKey);
    if (cached) return cached;
    const labelledbyId = "createForumSec";
    const h1 = b.tag("h1").append("Create New Forum").id(labelledbyId);
    const form = createForumForm(b, p);
    return b
        .cache(cacheKey)
        .tag("section")
        .attribute("aria-labelledby", labelledbyId)
        .className("flex flex-col space-y-3 justify-center items-center")
        .append(h1.className("text-2xl"))
        .append(form);
};

export const forumListeningBlt = (forum: Forum, p: Page) => (b: Builder) => {
    const h1 = b.tag("h1").append(forum.name);
    const permittedList = b
        .tag("section")
        .append((b) =>
            b
                .tag("h2")
                ._append("PERMITTED USERS")
                .className("text-neutral-500 text-lg")
        )
        .append((b) => {
            const ul = b.tag("ul");
            for (const u of forum.permitted_users) {
                ul._append((b) => b.tag("li").childNode(u));
            }
            return ul;
        });
    const messages = b.tag("ul");
    const display = b.tag("section").append(messages);
    subscribe(p.bfetch._baseUrl + "/forum/listen?f=" + forum._id.$oid, messages);
    const form = sendMessageForm(forum._id.$oid, p, b);
    return b
        .tag("section")
        .className("flex flex-col h-full space-y-3")
        .append(h1.className("text-2xl"))
        .append(permittedList)
        .append(display.className("h-full space-y-3 overflow-auto"))
        .append(form);
};

const subscribe = (uri: string, display: Built<Tag>) => {
    var retryTime = 1;

    function connect(uri: string) {
        const events = new EventSource(uri, { withCredentials: true });

        events.addEventListener("message", (ev) => {
            const data = JSON.parse(ev.data);
            // console.log("data", data);
            const message = (b: Builder) => {
                const user = b.tag("div").append(data.user);
                const value = b.tag("div").append(data.value);
                return b
                    .tag("li")
                    .className("flex")
                    .append(user.className("p-3").className(dark))
                    .append(value.className("p-3"));
            };
            display.append(message);
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
