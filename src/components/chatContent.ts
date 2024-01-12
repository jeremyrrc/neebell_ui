import { mainUser, currentForum, accent, dark, Forum, mid, sendMessage } from "../page.js";
import { changeModals } from "./modals.js";
import { built } from "../util/Bhtml/builder.js";
import { Tab } from "./openTabs.js";
import { Built } from "../util/Bhtml/built.js";
import { EventFeedBuilder, EventFeed } from "../util/eventsource/eventsource.js";
import { main } from "./top.js";
import { changeMain } from "./main.js";

type UserLi = {
  isMainUser: boolean;
  li: Built<"li", {}>
}

type MessageData = {
  user: string,
  value: string,
}

type MessageLi = {
  isMainUser: boolean;
  data: MessageData,
  li: Built<"li", {}>,
}

export type Context = {
  role: string,
  content: string,
}

export class Chat {
  forum: Forum
  id: string
  name: string
  owner: string
  users: Map<string, UserLi>
  messages: MessageLi[]
  context: Context[];

  chatPanelHeader: Built<"h1", {}>
  usersHeader: Built<"header", {}>
  usersUl: Built<"ul", {}>
  usersSection: Built<"section", {}>
  messagesUl: Built<"ul", {}>;
  panel: Built<"section", {}>;

  eventFeeds: EventFeed[]

  tab!: Tab;
  constructor(forum: Forum) {
    this.forum = forum;
    this.id = forum._id.$oid;
    this.name = forum.name;
    this.owner = forum.owner;
    this.users = new Map();
    this.messages = [];
    this.context = [];

    // chat panel header
    this.chatPanelHeader = this.buildChatPanelHeader(forum.name);

    // users
    this.usersHeader = this.buildUsersHeader();
    this.addEditUsersButton(this.owner === mainUser.value)
    this.usersUl = this.buildUsersUl();
    this.addUser(...forum.permitted_users);
    this.usersSection = built("section",
      this.usersHeader,
      this.usersUl,
    );

    // messages
    this.messagesUl = this.buildMessagesUl();

    //panel
    this.panel = this.buildPanel();
    this.panel.addNodes(
      this.chatPanelHeader,
      this.usersSection,
      this.messagesUl,
      sendMessageForm(this)
    )

    this.eventFeeds = eventFeeds(this);
    console.log(this.eventFeeds.length);
  }

  openTab() {
    this.tab = new Tab(this.id, this.name)
    main.getItem("tabs").addNodes(this.tab.tabLi);
    return this;
  }

  startFeed() {
    for (const feed of this.eventFeeds) {
      feed.send();
    }
  }

  closeFeed() {
    for (const feed of this.eventFeeds) {
      feed.close();
    }
  }

  closeChat() {
    this.closeFeed();
    this.tab.tabLi.elem.remove();
    openChats.map.delete(this.id);
    if (openChats.map.size === 0) changeMain("blank");
  }


  private addEditUsersButton(add: boolean) {
    if (!add) return;
    this.usersHeader.addNodes(
      this.buildEditUsersButton()
    )
  }

  addUser(...userNames: string[]) {
    const permittedUsers = new Set(this.forum.permitted_users);
    for (const userName of userNames) {
      const li = this.buildUserLi(userName);
      this.users.set(userName, {
        isMainUser: userName === mainUser.value,
        li,
      })
      this.usersUl.addNodes(li);
      permittedUsers.add(userName);
    }
    this.forum.permitted_users = Array.from(permittedUsers)
  }

  removeUser(...userNames: string[]) {
    for (const userName of userNames) {
      if (userName === mainUser.value) {
        openChats.closeChat(this.id)
        return;
      }
      const user = this.users.get(userName);
      user?.li.elem.remove()
      this.users.delete(userName)
      this.forum.permitted_users = this.forum.permitted_users.filter(item => item !== userName);
    }
  }

  addAIMessage(aiName: string) {
    const data: MessageData = { user: aiName, value: "" };
    const li = this.buildMessageLi(data);
    this.messages.push({
      isMainUser: false,
      data,
      li
    })
    this.messagesUl.addNodes(li);

    return li.getItem("message")
  }

  addMessages(...messages: MessageData[]) {
    for (const data of messages) {
      const li = this.buildMessageLi(data);
      this.messages.push({
        isMainUser: data.user === mainUser.value,
        data,
        li
      })
      const role = data.user === mainUser.value ? "assistant" : "user";
      this.context.push({ role, content: data.value })
      this.messagesUl.addNodes(li);
    }
  }

  buildChatPanelHeader(forumName: string) {
    return built("h1",
      forumName
    )
      .className("text-xl")
  }

  buildUsersHeader() {
    return built("header",
      built("h2",
        "PERMITTED USERS"
      ),
    ).className("flex flex-row text-neutral-500")

  }

  private buildEditUsersButton() {
    return built("button",
      "edit"
    )
      .className("px-2 text-neutral-300")
      .on("click", () => changeModals("updatePermittedUsers"))
  }

  buildUsersUl() {
    return built("ul")
      .className("flex flex-row space-x-2")
  }

  buildUserLi(userName: string) {
    const backgroundColor = userName === mainUser.value ? "bg-neutral-400" : "bg-neutral-500";
    return built("li",
      userName
    )
      .className("px-2 py-1 rounded-sm text-neutral-900")
      .className(backgroundColor)
  }

  buildMessagesUl() {
    return built("ul")
      .className("grow overflow-auto space-y-3")
  }

  buildMessageLi(data: MessageData) {
    const userBackgroundColor = data.user === mainUser.value ? accent : dark;
    const divUserName = built("div",
      data.user
    )
      .className("flex justify-center items-center rounded-sm p-3 w-20 m-w-full")
      .className(userBackgroundColor)

    const divMessage = built("div",
      data.value
    )
      .className("p-3")

    return built("li",
      divUserName,
      <["message", typeof divMessage]>["message", divMessage]
    )
      .className("flex")
  }

  buildPanel() {
    return built("section")
      .className("flex grow min-h-[calc(100%_-_32px)] max-h-[calc(100%_-_32px)] flex-col space-y-3 pb-3")
  }
}

function sendMessageForm(chat: Chat) {
  const userInputHidden = built("input")
    .attributes({
      type: "hidden",
      name: "user",
      value: mainUser.value
    });

  const forumIdHiddenInput = built("input")
    .attributes({
      type: "hidden",
      name: "forum_hex_id",
      value: currentForum.value!._id.$oid
    });

  const id = "messageInput";
  const textareaMessage = built("textarea")
    .id(id)
    .attributes({
      type: "text",
      name: "value",
      placeholder: "Send a message"
    })
    .className("w-full p-2 mx-1")
    .className(dark)
    .on("keypress", (e) => {
      if (e.code === "Enter") {
        e.preventDefault();
        sendMessage(chat)(e);
        const target = e.target as HTMLInputElement;
        const form = target.form as HTMLFormElement;
        form.reset();
      }
    });

  const messageEntry = built("label",
    mainUser.value,
  )
    .attribute("for", id)
    .className("px-3 py-2 flex items-center")
    .className(accent)

  const submitButton = built("button",
    "Send"
  )
    .attributes({
      type: "submit",
      value: "Send"
    })
    .className("px-3 py-2 rounded-sm cursor-pointer")
    .className(mid)
    .on("click", sendMessage(chat));
  return built("form",
    userInputHidden,
    forumIdHiddenInput,
    messageEntry,
    textareaMessage,
    submitButton,
  )
    .className("flex")
};

function eventFeeds(chat: Chat) {
  const updateUsers = EventFeedBuilder("/forum/listen-updated-permitted-users?f=" + chat.id)
    .onMessage((data) => {
      const action = JSON.parse(data.data);
      if (action.hasOwnProperty("Remove")) {
        console.log(action)
        chat.removeUser(...action.Remove.removed);
        return;
      }

      if (action.hasOwnProperty("Add")) {
        console.log(action)
        chat.addUser(...action.Add.added);
        return;
      }
    });
  // .on("added", (data) => {
  //   const addUsers = JSON.parse(data) as string[]
  //   chat.addUser(...addUsers);
  // })
  // .on("removed", (data) => {
  //   const removeUsers = JSON.parse(data) as string[];
  //   chat.removeUser(...removeUsers);
  // })

  // listening users
  const scheduleRemoveListening = new Map<string, number>();

  const styleAsNotListening = (e: Element) => {
    e.classList.add("bg-neutral-500");
    e.classList.remove("bg-neutral-400");
  }

  const styleAsListening = (e: Element) => {
    e.classList.remove("bg-neutral-500");
    e.classList.add("bg-neutral-400");
  };

  const listeningUsers = EventFeedBuilder("/forum/listen-listening-users?f=" + chat.id)
    .onMessage((data) => {
      const user = data.data;
      const li = chat.users.get(user)?.li.elem;
      if (!li) return;

      // show user is listening (this will counteract the futureTimeout below if message is received often enough)
      styleAsListening(li);

      // clear outdated timeout
      const outdated = scheduleRemoveListening.get(user);
      if (outdated) clearTimeout(outdated);

      // show as not listening in the future
      const futureTimeout = setTimeout(function() {
        styleAsNotListening(li);
        scheduleRemoveListening.delete(user);
      }, 3050);
      scheduleRemoveListening.set(user, futureTimeout)
    })

  // messages
  const messages = EventFeedBuilder("/forum/listen-messages?f=" + chat.id)
    .onMessage((data) => {
      const message = JSON.parse(data.data) as MessageData;
      chat.addMessages(message)

      if (currentForum.value?._id.$oid !== chat.id) {
        chat.tab.showNotificationDot();
      }
    })
  // .on("closed", (_) => {
  //   openTabs.closeTab(chat.id)
  // })

  return [
    updateUsers,
    listeningUsers,
    messages,
  ]
}

class OpenChats {
  map: Map<string, Chat>
  current: Chat | null

  constructor() {
    this.map = new Map();
    this.current = null;
  }

  selectChat(id: string) {
    if (id === this.current?.id) return;
    const chat = this.map.get(id);
    if (!chat) return;
    if (this.current) {
      this.current.tab.styleUnselected();
    }
    this.current = chat;
    this.current.tab.styleSelected();
    currentForum.value = this.current!.forum
    changeMain("forum")
  }

  closeChat(id: string) {
    const chat = this.map.get(id);
    if (!chat) return;
    chat.closeChat();
    this.current = null;
    if (this.map.size === 0) return;
    const newId = Array.from(this.map)[0][0];
    this.selectChat(newId)
  }
}

export const openChats = new OpenChats();

export const chatContent = () => {
  if (!currentForum.value) return;

  const forumId = currentForum.value._id.$oid

  const openChat = openChats.map.get(forumId);
  openChats.selectChat(forumId)

  if (openChat) return openChat.panel;

  const newChat = new Chat(currentForum.value).openTab()

  newChat.startFeed();

  openChats.map.set(forumId, newChat);
  openChats.selectChat(forumId);

  return newChat.panel;

  // openTabs.selectTab(currentForum.value!._id.$oid, false)
  // return b.cache(currentForum.value!._id.$oid, make);
};

