import { signal } from "./util/Bhtml/builder.js";
import { changeModals } from "./components/modals.js";
import { Bfetch, Error } from "./util/Bfetch/Bfetch.js";
import { main } from "./components/top.js";
import { changeSideBar } from "./components/sideBar.js";
import { changeMain } from "./components/main.js";
import { Chat, Context } from "./components/chatContent.js";
// import { ping } from "./util/eventsource/eventsource.js";

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

export const mainUser = signal<string | undefined>(undefined);
export const currentForum = signal<Forum | undefined>(undefined);
export const forumsMenuHeader = signal<"Owned" | "Permitted">("Owned");
export const forumListSelection = signal<Array<ForumListItem>>([]);
export const errorMessage = signal<string>("Error");

const showErrorMessage = (err: Error) => {
  // @ts-ignore
  errorMessage.value = err.message;
  changeModals("error");
}

export const bfetch = new Bfetch("http://127.0.0.1:8000");
bfetch._jwt = localStorage.getItem("jwt");
// ping();

type LoadResponse = {
  name: string
}

export const load = () => {
  main.replace("content", "...Loading")
  bfetch
    .method("GET")
    .url("/user/load")
    .onError((e) => {
      console.error(e)
      changeSideBar("signed out");
      changeMain("sign in");
    })
    .onSuccess(async (r, bf) => {
      const lr = await r.json() as LoadResponse;
      mainUser.value = lr.name;
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
    .onError(showErrorMessage)
    .onSuccess(() => {
      changeMain("sign in");
    })
    .send();
};

type SignInResponse = {
  name: string,
  token: string,
}

export const sign_in = (e: Event) => {
  e.preventDefault();
  bfetch
    .url("/user/sign-in")
    .method("POST")
    .sendAs("encoded")
    .params(e)
    .onError(showErrorMessage)
    .onSuccess(async (r, bf) => {
      const sir = await r.json() as SignInResponse;
      mainUser.value = sir.name;
      bf._jwt = sir.token
      localStorage.setItem("jwt", sir.token);
      changeSideBar("signed in");
      changeMain("blank");
      bf.clear()
      forumListOwned();
    })
    .send();
};

export const sign_out = () => {
  // openTabs.closeAllTabs();
  mainUser.value = undefined;
  localStorage.removeItem("jwt");
  changeSideBar("signed out");
  changeMain("sign in");
  bfetch
    .method("GET")
    .url("/user/sign_out")
    .onError(showErrorMessage)
    .onSuccess((_, bf) => {
      mainUser.value = undefined;
      bf._jwt = null;
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
    .onError(showErrorMessage)
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
    .onError(showErrorMessage)
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
    .onError(showErrorMessage)
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
    .onError(showErrorMessage)
    .onSuccess(() => {
      changeModals("close");
    })
    .send()
}

export const sendMessage = (chat: Chat) => async (e: Event) => {
  e.preventDefault();
  const params = bfetch.inputToParams(e);
  if (!params) {
    return;
  }
  const message = params.get("value") as string | null;
  if (!message) {
    return;
  }

  const aiMessage = checkAiMessage(message);

  if (aiMessage) {
    let [model, prompt] = aiMessage;
    if (!prompt) prompt = "Continue the conversation as " + mainUser.value;
    const data = {
      model,
      prompt,
      messages: chat.context,
    };

    console.log(data);

    const aiResponse = await promptAi(data, chat)
    if (aiResponse) {
      params.set("value", aiResponse)
    }
  }
  console.log(params.get("value"));

  bfetch
    .method("POST")
    .url("/forum/message")
    .sendAs("encoded")
    .params(params)
    .onError(showErrorMessage)
    .onSuccess((r) => {
      console.log(r)
    })
    .send();
};

type AiParameters = {
  model: string,
  prompt: string,
  messages: Context[],
  system?: string,
}

async function promptAi(data: AiParameters, chat: Chat) {
  data.system = "You are " + mainUser.value + ".";
  const r = await fetch("http://localhost:11434/api/chat", {
    method: "POST",
    body: JSON.stringify(data),
  }).then((r) => r.body?.getReader());

  if (!r) {
    console.log("no reader")
    return;
  }

  const messageDiv = chat.addAIMessage(data.model);
  await readBodyAsText(r, messageDiv.elem);
  return messageDiv.elem.textContent;
}

async function readBodyAsText(reader: ReadableStreamDefaultReader<Uint8Array>, messageElem: HTMLDivElement) {
  const decoder = new TextDecoder();
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        console.log("no more data: ");
        break
      };
      const str = decoder.decode(value);
      const json = JSON.parse(str);
      console.log(json);
      console.log(json.message);
      messageElem.textContent = messageElem.textContent + json.message.content;
    }
  } finally {
    reader.releaseLock();
  }
}

function checkAiMessage(input: string): [string, string] | null {
  const startArrowIndex = input.indexOf("<");

  if (startArrowIndex === 0) {
    const endArrowIndex = input.indexOf(">");

    if (endArrowIndex !== -1) {
      // @ts-ignore
      const model = input.substring(startArrowIndex + 1, endArrowIndex);
      const prompt = input.substring(endArrowIndex + 1);
      return ["llama2:7b-chat", prompt];
    }
  }

  return null;

}


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
