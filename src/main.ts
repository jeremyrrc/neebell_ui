import { Built } from "./util/Bhtml/built.js";
import { Builder } from "./util/Bhtml/builder.js";
import { buttonB } from "./components/base.js";

export const dark = "bg-neutral-700 text-neutral-200";
export const mid = "bg-neutral-400 text-neutral-900";
export const light = "bg-neutral-300 text-neutral-900";
export const accent = "bg-orange-500 text-neutral-900";

export const namePattern = "[A-Za-z0-9_-]+";

const header = (b: Builder) => b
  .tag("header")
  .append("Chat")
  .className("p-3")
  .className(dark);

const h2B = (b: Builder) => b.tag("h2");

const sideBar = (b: Builder) => b
  .tag("div")
  .className("flex flex-col space-y-3 p-3 h-full bg-neutral-800 overflow-auto")
  ._append<"h2", undefined | typeof h2B>("h2", undefined)
  ._append<"sideMenu", undefined>("sideMenu", undefined)
  ._append<"forums", undefined>("forums", undefined)

const main = (b: Builder) => b
  .tag("main")
  .className("flex-1 p-3 h-full")
  ._append<"content", undefined | string>("content", undefined)

const sideBarAndMain = (b: Builder) => b
  .tag("div")
  .className("flex h-full")
  ._append("sideBar", sideBar)
  ._append("main", main)

const closeButton = (b: Builder) => buttonB(b, "Close")
  .className("mt-3")
  .className(light)
  .on("click", function() {
    this.elem.parentElement?.classList.remove("hidden");
  })

export const topErrorModal = (b: Builder) => b
  .tag("dialog")
  .className("flex flex-col items-center space-y-3 rounded-sm hidden")
  .className(mid)
  ._append<"errorMessage", string>("errorMessage", "Error")
  .append(closeButton)

export const top = new Built(document.body as HTMLBodyElement)
  ._append("header", header)
  ._append("sideBarAndMain", sideBarAndMain)
  ._append("topErrorModal", topErrorModal)
  // .run(function() {
  //   this.modify("sideBarAndMain", function() {
  //     this.value.modify("main", function() {
  //       this.value.modify("content", function() {
  //         this.value = "hello";
  //       })
  //     })
  //   })
  // })


// import { Builder } from "./util/Bhtml/builder.js"
// import { Built } from "./util/Bhtml/built.js"

// const display = (b: Builder) =>
//   b
//     .tag("div")
//     .append("Clicked ")
//     ._append("count", 0)
//     .append(" times.")

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
//       this.value = 0; 
//     });
//   }
// }

// const button = (name: string, handler: () => void) => {
//   return (b: Builder) =>
//     b
//       .tag("button")
//       .append(name)
//       .on("click", handler)
// };

// new Built(document.body)
//   .append((b) => {
//     const d = display(b);
//     const countObj = { count: 0 };
//     const clickTracker = inc(d).bind(countObj);
//     const resetCount = reset(d).bind(countObj);
//     return b
//       .tag("main")
//       ._append("display", d)
//       .append(button("Track", clickTracker))
//       .append((b) => b.tag("br"))
//       .append(button("Reset", resetCount))
//   })

