import { Build, startAt } from "../util/Bhtml/builder.js";
import type {
  signedInSideBarMenu,
  signedOutSideBarMenu,
  sideBarForumsMenu,
} from "./sideBar.js";
import type {
  signInContent,
  createAccContent,
  createForumContent,
  chatContent,
} from "./main.js";
import type {
  errorModal,
  editPermittedUsersModal
} from "./modals.js"
import type { H2, } from "./base.js";

const sideBar = (b: Build) => b
  .tag("div")
  .nodeArgs(
    <["h2", undefined | H2]>["h2", undefined],
    <[
      "sidemenu",
      | undefined
      | typeof signedOutSideBarMenu
      | typeof signedInSideBarMenu
    ]>["sidemenu", undefined],
    <[
      "forums",
      | undefined
      | typeof sideBarForumsMenu
    ]>["forums", undefined],
  )
  .build()
  .className("flex flex-col space-y-3 p-3 h-full bg-neutral-800 overflow-auto")

const tabList = (b: Build) => b
  .tag("ul")
  .build()
  .className("flex space-x-2 mb-3")

const main = (b: Build) => b
  .tag("main")
  .nodeArgs(
    <["tabs", typeof tabList]>["tabs", tabList],
    <[
      "content",
      | undefined
      | "...Loading"
      | typeof signInContent
      | typeof createAccContent
      | typeof createForumContent
      | typeof chatContent
    ]>["content", undefined]
  )
  .build()
  .className("flex flex-col flex-1 p-3")

export const sideBarAndMain = (b: Build) => b
  .tag("div")
  .nodeArgs(
    <["sideBar", typeof sideBar]>["sideBar", sideBar],
    <["main", typeof main]>["main", main],
  )
  .build()
  .className("flex h-full")

export const modals = (b: Build) => b
  .tag("div")
  .nodeArgs(
    <[
      "modal",
      | undefined
      | typeof errorModal
      | typeof editPermittedUsersModal
    ]>["modal", undefined]
  )
  .build()
  .className("fixed top-0 w-full h-full flex items-center justify-center bg-neutral-900/50 hidden")

export const top = startAt(document.body, [
  <["sideBarAndMain", typeof sideBarAndMain]>["sideBarAndMain", sideBarAndMain],
  <["modals", typeof modals]>["modals", modals],
] as const)
  .export(function() {
    const container = this.getItem("sideBarAndMain");
    const main = container.getItem("main");
    const sideBar = container.getItem("sideBar");
    const modals = this.getItem("modals");
    return { sideBar, main, modals };
  })

// ===========

// import { Build, startAt } from "./util/Bhtml/builder.js"

// function inc(d: ReturnType<typeof display>) {
//   return function(this: { count: number }) {
//     let count = ++this.count;
//     d.modify("count", function() {
//       this.value = count;
//     })
//   }
// }

// function reset(d: ReturnType<typeof display>) {
//   return function(this: { count: number }) {
//     this.count = 0;
//     d.modify("count", function() {
//       this.value = undefined;
//     });
//   }
// }

// const display = (b: Build) => b
//   .tag("div")
//   .nodeArgs(
//     "Clicked: ",
//     <["count", number | undefined]>["count", 0],
//     " times."
//   )
//   .build();


// const button = (
//   name: string, 
//   handler: () => void
// ) => (b: Build) => b
//   .tag("button")
//   .nodeArgs(name)
//   .build()
//   .on("click", handler)

// startAt(document.body, (b) => {
//   const d = display(b);
//   const countObj = { count: 0 };
//   const clickCounter = inc(d).bind(countObj);
//   const resetCount = reset(d).bind(countObj);
//   return [
//     d,
//     button("Track", clickCounter),
//     (b) => b.tag("br"),
//     button("Reset", resetCount),
//   ] as const;
// })

// ===========

// import { Build, startAt, signal, Signal } from "./util/Bhtml/builder.js"

// const display = (count: Signal<number | undefined>) => (b: Build) => b
//   .tag("div")
//   .nodeArgs(
//     "Clicked: ",
//     <["count", typeof count]>["count", count],
//     " times."
//   )
//   .build();

// const button = (
//   text: string,
//   handler: () => void
// ) => (b: Build) => b
//   .tag("button")
//   .nodeArgs(
//     text
//   )
//   .build()
//   .on("click", handler)

// startAt(document.body, () => {
//   const count = signal<number | undefined>(undefined);
//   const clickCounter = () => count.value = (count.value || 0) + 1;
//   const resetCount = () => count.value = undefined;
//   return [
//     display(count),
//     button("Track", clickCounter),
//     (b) => b.tag("br"),
//     button("Reset", resetCount),
//   ] as const;
// })
