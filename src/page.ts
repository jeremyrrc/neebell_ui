import { Built } from "./util/Bhtml/built.js";
import { Tag } from "./util/Bhtml/index.js";
import { Bfetch, Error } from "./util/Bfetch/Bfetch.js";

import {
    signInContentBlt,
    createAccContentBlt,
    createForumContentBlt,
    signedOutSideMenuBlt,
    signedInSideMenuBlt,
    sideBarForumsMenuBlt,
    forumListeningBlt,
} from "./components/index.js";

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
                    b.tag("h2").childNode(this._sideBar.elem.dataset.user)
                );
                this._sideBar.replace("sideMenu", signedInSideMenuBlt(this));
                this.forumListOwned();
                break;
        }
    }

    sideBarForums(title: "Owned" | "Permitted", forums: Array<Forum>) {
        this._sideBar.replace("forums", sideBarForumsMenuBlt(this, { title, forums }));
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
                    this._main.replace("content", forumListeningBlt(data.forum, this));
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
            .onSuccess((_r, bfetch) => {
                bfetch.clear();
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
