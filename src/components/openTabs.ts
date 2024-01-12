import { built } from "../util/Bhtml/builder.js";
import { Built } from "../util/Bhtml/built.js";
import { openChats } from "./chatContent.js";

export class Tab {
  id: string
  title: string

  notification: Built<"div", {}>
  body: Built<"div", {}>
  closeButton: Built<"button", {}>
  tabLi: Built<"li", {}>

  constructor(forumId: string, forumName: string) {
    this.id = forumId;
    this.title = forumName;

    // body
    this.notification = this.buildNotification();
    this.body = this.buildBody();
    this.body.addNodes(
      this.notification
    );

    // button
    this.closeButton = this.buildCloseButton();

    // tab
    this.tabLi = this.buildTabLi();
    this.tabLi.addNodes(
      this.body, this.closeButton
    )

  }

  removeNotificationDot() {
    this.notification.removeNodes()
  }

  showNotificationDot() {
    const circle = built("div")
      .className("rounded-full p-1 bg-neutral-300")

    this.notification
      .removeNodes()
      .addNodes(circle)
  }

  styleSelected() {
    this.removeNotificationDot();
    this.tabLi.elem.classList.remove("bg-neutral-500");
    this.tabLi.elem.classList.add("bg-neutral-400");
  }

  styleUnselected() {
    this.tabLi.elem.classList.remove("bg-neutral-400");
    this.tabLi.elem.classList.add("bg-neutral-500");
  }

  buildNotification() {
    return built("div")
      .className("p-2 w-5 flex items-center justify-center")
  }

  buildBody() {
    return built("div",
      built("div",
        this.title
      ),
    )
      .className("flex rounded-sm pl-2 py-1 hover:bg-neutral-400")
      .on("click", () => {
        // openTabs.selectTab(this.id)
        openChats.selectChat(this.id)
      })
  }

  buildCloseButton() {
    return built("button",
      "x"
    )
      .className("rounded-sm px-2 p-1 hover:bg-neutral-400")
      .on("click", async () => {
        openChats.closeChat(this.id)
      })

  }

  buildTabLi() {
    return built("li")
      .className("flex rounded-sm cursor-pointer bg-neutral-400 text-neutral-900")
  }

}
