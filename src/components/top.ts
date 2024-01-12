import { built, startAt } from "../util/Bhtml/builder.js";
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

type SideBarHotSpots = {
  "h2": ["h2",
    | undefined
    | H2
  ],
  "sidemenu": ["sidemenu",
    | undefined
    | typeof signedOutSideBarMenu
    | typeof signedInSideBarMenu
  ],
  "forums": ["forums",
    | undefined
    | typeof sideBarForumsMenu
  ]

}
export const sideBar = built("div",
  <SideBarHotSpots["h2"]>["h2",
    undefined
  ],
  <SideBarHotSpots["sidemenu"]>["sidemenu",
    undefined
  ],
  <SideBarHotSpots["forums"]>["forums",
    undefined
  ],
)
  .className("flex flex-none flex-col space-y-3 p-3 bg-neutral-800 overflow-auto")

const tabList = built("ul")
  .className("flex space-x-2 mb-3")

type MainHotSpots = {
  "tabs": ["tabs",
    | typeof tabList
  ],
  "content": ["content",
    | undefined
    | "...Loading"
    | typeof signInContent
    | typeof createAccContent
    | typeof createForumContent
    | typeof chatContent
  ]
}

export const main = built("main",
  <MainHotSpots["tabs"]>["tabs",
    tabList
  ],
  <MainHotSpots["content"]>["content",
    undefined
  ]
)
  .className("flex grow flex-col p-3")


export const sideBarAndMain = built("div",
  sideBar,
  main,
)
  .className("flex grow")

type ModalsHotSpots = {
  "modal": ["modal",
    | undefined
    | typeof errorModal
    | typeof editPermittedUsersModal
  ]
}

export const modals = built("div",
  <ModalsHotSpots["modal"]>["modal",
    undefined
  ]
)
  .className("fixed top-0 w-full h-full flex items-center justify-center bg-neutral-900/50 hidden")

startAt(document.body, sideBarAndMain, modals)
  .className("flex")
  // .export(function() {
  //   const container = this.getItem("sideBarAndMain");
  //   const main = container.getItem("main");
  //   const sideBar = container.getItem("sideBar");
  //   const modals = this.getItem("modals");
  //   return { sideBar, main, modals };
  // })

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

// import { Build, startAt, signal, Signal } from "../util/Bhtml/builder.js"

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
