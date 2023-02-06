import { signal } from "./util/Bhtml/builder.js";
import { changeModals } from "./components/modals.js";
import { Bfetch, Error } from "./util/Bfetch/Bfetch.js";
import { top } from "./components/top.js";
import { changeSideBar } from "./components/sideBar.js";
import { changeMain, closeAllTabs } from "./components/main.js";

export const dark = "bg-neutral-700 text-neutral-200";
export const mid = "bg-neutral-400 text-neutral-900";
export const light = "bg-neutral-300 text-neutral-900";
export const accent = "bg-orange-500 text-neutral-900";

interface ObjectId {
  $oid: string;
}

export interface ForumListItem {
  _id: ObjectId;
  name: string;
  owner: string;
}

export type Forum = ForumListItem & {
  permitted_users: Array<string>
}

export const user = signal<string | undefined>(undefined);
export const currentForum = signal<Forum | undefined>(undefined);
export const forumsMenuHeader = signal<"Owned" | "Permitted">("Owned");
export const forumListSelection = signal<Array<ForumListItem>>([]);
export const errorMessage = signal("Error");

const handleError = (err: Error) => {
  // @ts-ignore
  errorMessage.value = err.message;
  changeModals("error");
}

export const bfetch = new Bfetch("http://127.0.0.1:8000")
  .onError(handleError)
  .keep("onError")

export const eventSources = new Map<string, EventSource>();

type MessageEventHandler<T> = (m: MessageEvent<T>) => void;

export function subscribe<T = any>(
  uri: string,
  handleMessage?: MessageEventHandler<T>,
  handleOtherEvents?: Record<string, MessageEventHandler<T>>
) {
  // let retryTime = 1;
  function connect(uri: string) {
    const eventSource = new EventSource(bfetch._baseUrl + uri, { withCredentials: true });
    eventSources.set(uri, eventSource);
    if (handleMessage) eventSource.addEventListener("message", handleMessage);
    for (const on in handleOtherEvents) {
      eventSource.addEventListener(on, handleOtherEvents[on])
    }
    // eventSource.addEventListener("open", () => {
    //   retryTime = 1;
    // });
    eventSource.addEventListener("error", () => {
      eventSource.close();
      // console.log(uri + " errored");
      // eventSource.close();
      // let timeout = retryTime;
      // retryTime = Math.min(64, retryTime * 2);
      // setTimeout(() => connect(uri), (() => timeout * 1000)());
    });
  }
  connect(uri);
};

export const load = () => {
  top.main.replace("content", "...Loading")
  bfetch
    .method("GET")
    .url("/user/load")
    .catchErrorCode(401, () => {
      changeSideBar("signed out");
      changeMain("sign in");
      return false;
    })
    .onSuccess(async (r, bf) => {
      user.value = await r.text();
      changeSideBar("signed in");
      changeMain("blank");
      bf.clear()
      forumListOwned();
    })
    .send();
};

export const create_user = (e: Event) => {
  e.preventDefault();
  bfetch
    .url("/user/create")
    .method("POST")
    .sendAs("encoded")
    .params(e)
    .onSuccess(() => {
      changeMain("sign in");
    })
    .send();
};

export const sign_in = (e: Event) => {
  e.preventDefault();
  bfetch
    .url("/user/sign-in")
    .method("POST")
    .sendAs("encoded")
    .params(e)
    .onSuccess(async (r, bf) => {
      user.value = await r.text();
      changeSideBar("signed in");
      changeMain("blank");
      bf.clear()
      forumListOwned();
    })
    .send();
};

export const sign_out = () => {
  closeAllTabs();
  bfetch
    .method("GET")
    .url("/user/sign_out")
    .onSuccess(() => {
      user.value = undefined;
      changeSideBar("signed out");
      changeMain("sign in");
    })
    .send();
};

export const create_forum = (e: Event) => {
  e.preventDefault();
  bfetch
    .url("/forum/create")
    .method("POST")
    .sendAs("encoded")
    .params(e)
    .onSuccess((_r, bf) => {
      bf.clear();
      forumListOwned();
    })
    .send();
};

export const forumListOwned = () => {
  bfetch
    .method("GET")
    .url("/forum/list-owned")
    .onSuccess(async (r) => {
      forumsMenuHeader.value = "Owned";
      forumListSelection.value = (await r.json()) as Array<ForumListItem>
    })
    .send();
};

export const forumListPermitted = () => {
  bfetch
    .method("GET")
    .url("/forum/list-permitted")
    .onSuccess(async (r) => {
      forumsMenuHeader.value = "Permitted";
      forumListSelection.value = (await r.json()) as Array<ForumListItem>
    })
    .send();
};

export const updatePermittedUsers = (e: Event) => {
  e.preventDefault();
  bfetch
    .method("POST")
    .url("/forum/update-users")
    .sendAs("encoded")
    .params(e)
    .onSuccess(() => {
      changeModals("close");
    })
    .send()
}

export const sendMessage = (e: Event) => {
  e.preventDefault();
  bfetch
    .method("POST")
    .url("/forum/message")
    .sendAs("encoded")
    .params(e)
    .send();
};

load();

// function sendHeartbeat() {
//   fetch(bfetch._baseUrl + "/user/heartbeat",
//     { method: "GET", credentials: "include" },
//   )
//     .then((e) => {
//       if (e.status < 200 || e.status > 299) {
//         closeAllTabs();
//         user.value = undefined;
//         changeSideBar("signed out");
//         changeMain("sign in");
//         if (currentSrc) currentSrc.close();
//         currentSrc = undefined;
//         clearInterval(currentInt);
//         currentInt = undefined;
//       }
//       console.log(e.status)
//     })
//     .catch((_e) => {
//       closeAllTabs();
//       user.value = undefined;
//       changeSideBar("signed out");
//       changeMain("sign in");
//       if (currentSrc) currentSrc.close();
//       currentSrc = undefined;
//       clearInterval(currentInt);
//       currentInt = undefined;
//     })
// }

// const interval = 5000; // 5 seconds
// let currentSrc: EventSource | undefined;
// let src = () => {
//   const ev = new EventSource(bfetch._baseUrl + "/user/doctor2", { withCredentials: true })
//   ev.addEventListener("message", (m) => console.log(m.data));
//   ev.addEventListener("open", () => console.log("doctor open"));
//   ev.addEventListener("error", () => console.log("doctor error"));
//   return ev
// };

// // Start the heartbeat
// let currentInt: number | undefined;
// let int = () => setInterval(sendHeartbeat, interval);

// top.main.append((b) => b
//   .tag("button")
//   .nodeArgs("connect")
//   .build()
//   .on("click", () => {
//     currentSrc = src();
//   })
// )

// top.main.append((b) => b
//   .tag("button")
//   .nodeArgs("disconnect")
//   .build()
//   .on("click", () => {
//     if (currentSrc) currentSrc.close();
//   })
// )

// top.main.append((b) => b
//   .tag("button")
//   .nodeArgs("start")
//   .build()
//   .on("click", () => {
//     currentInt = int();
//   })
// )

// top.main.append((b) => b
//   .tag("button")
//   .nodeArgs("stop")
//   .build()
//   .on("click", () => {
//     clearInterval(currentInt)
//   })
// )
