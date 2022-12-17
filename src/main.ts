import { Built } from "./util/Bhtml/built.js";
import { Page } from "./page.js";
// import { inputB } from "./util/Bhtml/bhtml.js";

import { mainErrorBlt, notiBubble } from "./components/index.js";

export const dark = "bg-neutral-700 text-neutral-200";
export const mid = "bg-neutral-400 text-neutral-900";
export const light = "bg-neutral-300 text-neutral-900";
export const accent = "bg-orange-500 text-neutral-900";

export const namePattern = "[A-Za-z0-9_-]+";

new Built(document.body).modifySelf((body, b) => {
    const header = b.tag("header").childNode("Chat");
    const sideBar = b
        .tag("aside")
        .childNode("", "h2")
        .childNode("", "sideMenu")
        .childNode("", "forums");
    const main = b.tag("main").childNode("", "content");

    const mainError = mainErrorBlt(b);
    const mainNoti = notiBubble(b);

    const page = new Page({ header, sideBar, main, mainError });

    const container = b
        .tag("div")
        .childNode(
            sideBar.className(
                "flex flex-col space-y-3 p-3 h-full bg-neutral-800 overflow-auto"
            )
        )
        .childNode(main.className("flex-1 p-3  h-full"));

    body
        .className("flex flex-col h-full")
        .childNode(header.className("p-3").className(dark))
        .childNode(container.className("flex flex-row h-full"))
        .childNode(mainError.className("fixed top-5 left-0 right-0"))
        .childNode(mainNoti);

    mainNoti.show("I'm going to hide in 3 seconds", 3);

    page.load();
});

// const display = (b: Builder) =>
//   b
//     .tag("div")
//     .childNode("Clicked: ")
//     .childNode(0, "count")
//     .childNode(" times.");

// const display = (b: Builder) =>
//   b
//     .tag("div")
//     .childNode("Clicked: ")
//     .childNode((b) => inputB(b).build().startValue("0"), "count")
//     .childNode(" times.");

// const incCountListenerFactory = (hasTextNode: Built<HTMLElement>, countTextKey: string) => {
//   return (_e: Event) => {
//     hasTextNode.modify(countTextKey, (item) => {
//       if ("kind" in item && item.kind === "input") {
//         const curr = parseInt(item.elem.value);
//         item.elem.value = (curr + 1).toString();
//       }
//     });
//   };
// };

// const clicker = (displayBlt: Built<HTMLElement>) => {
//   return (b: Builder) =>
//     b
//       .tag("button")
//       .childNode("Clicker")
//       .on("click", incCountListenerFactory(displayBlt, "count"))
//       .build();
// };

// new Built(document.body).childNode((b) => {
//   const displayBlt = display(b).build();
//   return b
//     .tag("div")
//     .childNode(displayBlt)
//     .childNode(clicker(displayBlt))
//     .build();
// });
