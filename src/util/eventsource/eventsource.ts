import { bfetch } from "../../page.js";


export function ping() {
  // const aborter = new AbortController();
  // const signal = aborter.signal;
  // readBodyAsText(signal, "/events/ping")
}

// const handleEvent = (prefix: string, strChunk: string, eventHandler: EventHandler) => {
//   prefix = prefix;
//   const lines = strChunk.split(/\r?\n/);
//   for (const line of lines) {
//     if (!line) continue;
//     if (line && line.startsWith(prefix)) {
//       const data = line.substring(prefix.length).trim();
//       if (!data) continue
//       eventHandler(data);
//     }
//   }
// }


type EventHandler = (this: EventSource, ev: MessageEvent<any>) => any;

// export type EventFeed = {
//   retry: number
//   ev: EventSource
//   aborter: AbortController
//   signal: AbortSignal

//   uri: string
//   setUri: (uri: string) => EventFeed

//   onEventOpen: (() => void) | undefined
//   onOpen: (handler: () => void) => EventFeed

//   onEventError: (() => void) | undefined
//   onError: (handler: () => void) => EventFeed

//   onEvents: Record<string, EventHandler>,
//   on: (prefix: string, handler: EventHandler) => EventFeed,

//   onMessage: (handler: EventHandler) => EventFeed

//   close: () => void,

//   send: () => void,

//   _readBody: () => void
// }

export type EventFeed = ReturnType<typeof EventFeedBuilder>;

export function EventFeedBuilder(uri: string) {
  return {
    ev: null as null | EventSource,
    uri,
    retry: 1,
    eventHandlers: {},
    onMessage(handler: EventHandler) {
      this.eventHandlers["message"] = handler
      return this;
    },
    _addEventHandlers() {
      if (!this.ev) return;
      for (const key in this.eventHandlers) {
        console.log(key);
        this.ev.addEventListener(key, this.eventHandlers[key]);
      }
    },
    close() {
      this.ev?.close();
    },
    send() {
      if (!this.uri) return;
      try {
        const ev = new EventSource(bfetch._baseUrl + this.uri + "&jwt=" + bfetch._jwt);
        this.ev = ev;
        this._addEventHandlers();
        this.retry = 1;
      } catch (e) {
        let timeout = this.retry;
        this.retry = Math.min(64, this.retry * 2);
        setTimeout(() => this.send(), (() => timeout * 1000)());
      }
    },
  }
}

// export function EventFeedBuilder(uri: string): EventFeed {
//   const aborter = new AbortController();
//   const signal = aborter.signal;

//   return {
//     retry: 1,
//     ev: new EventSource(),
//     aborter,
//     signal,
//     uri,

//     setUri(v: string) {
//       this.uri = v;
//       return this;
//     },

//     onEventOpen: undefined,
//     onOpen(handler: () => void) {
//       this.onEventOpen = handler;
//       return this;
//     },

//     onEventError: undefined,
//     onError(handler: () => void) {
//       this.onEventError = handler;
//       return this;
//     },

//     onEvents: {},
//     on(event: string, handler: EventHandler) {
//       this.onEvents[event + ":"] = handler;
//       return this;
//     },

//     onMessage(handler: EventHandler) {
//       this.onEvents["data:"] = handler;
//       return this;
//     },

//     close() {
//       if (!this.signal.aborted) {
//         try {
//           this.aborter.abort("user closed stream");
//         } catch (e) {
//           console.log(e);
//         }
//       }
//     },

//     send() {
//       if (!this.uri) return;
//       try {
//         this._readBody();
//         this.retry = 1;
//       } catch (e) {
//         if (this.signal.aborted) return;
//         let timeout = this.retry;
//         this.retry = Math.min(64, this.retry * 2);
//         setTimeout(() => this.send(), (() => timeout * 1000)());
//       }
//     },

//     _readBody() {
//       const headers = new Headers();
//       headers.append("Content-Type", "text/event-stream");
//       headers.append("Authorization", "Bearer " + bfetch._jwt)

//       fetch(bfetch._baseUrl + this.uri, {
//         headers,
//         signal: this.signal,
//       })
//         .then(r => r.body)
//         .then(r => r?.getReader())
//         .then(async reader => {
//           if (!reader) return;
//           const decoder = new TextDecoder();

//           try {
//             while (true) {
//               const { done, value } = await reader.read();
//               if (signal.aborted) {
//                 break
//               };
//               if (done) {
//                 break
//               };
//               const str = decoder.decode(value);
//               for (const key in this.onEvents) {
//                 handleEvent(key, str, this.onEvents[key])
//               }
//             }
//           } catch (e) {
//             console.error(e);
//           } finally {
//             reader.releaseLock();
//           }
//         })
//     }
//   };
// }

// export async function subscribe<O>(
//   uri: string,
//   handleMessage?: (m: MessageEvent) => void,
//   handleOtherEvents?: OtherEventHandlers<O>
// ) {
//   console.log(uri);

  // const feed = await readBodyAsText(uri);
  // for await (const strChunk of feed()) {
  //   const data = handleEvent()

  // }

  // let retryTime = 1;
  // function connect(uri: string) {
  //   const eventSource = new EventSource(bfetch._baseUrl + uri, { withCredentials: true });
  //   eventSources.set(uri, eventSource);
  //   if (handleMessage) eventSource.addEventListener("message", handleMessage);
  //   for (const on in handleOtherEvents) {
  //     eventSource.addEventListener(on, handleOtherEvents[on])
  //   }
  //   eventSource.addEventListener("open", () => {
  //     retryTime = 1;
  //   });
  //   eventSource.addEventListener("error", () => {
  //     console.error("event source errored: " + uri);
  //     eventSource.close();
  //     let timeout = retryTime;
  //     retryTime = Math.min(64, retryTime * 2);
  //     setTimeout(() => connect(uri), (() => timeout * 1000)());
  //   });
  // }
  // connect(uri);
// };

// class OpenEventFeeds {
//   map: Map<string, EventFeed>
//   constructor() {
//     this.map = new Map();
//   }

//   setItem(key: string, ev: EventFeed) {
//     this.map.set(key, ev)
//   }

//   close(key: string) {
//     const ev = this.map.get(key)
//     if (!ev) return false;
//     ev.close();
//     this.map.delete(key);
//     return true;
//   }

//   create(uri: string) {
//     const ev = EventFeedBuilder(uri);
//     this.map.set(uri, ev);
//     return ev;
//   }

//   clear() {
//     for (const [_, ev] of this.map) {
//       ev.close();
//     }
//     this.map.clear();
//   }
// }


// async function readBodyAsText(uri: string) {
//   const headers = new Headers();
//   headers.append("Content-Type", "text/event-stream");
//   headers.append("Authorization", "Bearer " + bfetch._jwt)
//   return await fetch(bfetch._baseUrl + uri, {
//     headers
//   })
//     .then(async (res) => {
//       return async function*() {
//         const reader = res.body?.getReader();
//         if (!reader) return;
//         const decoder = new TextDecoder();
//         let finished = false;
//         while (!finished) {
//           const { done, value } = await reader.read();
//           let str = decoder.decode(value);
//           yield str;
//           finished = done;
//         }
//         return;
//       }
//     });
// }

// async function readBodyAsText(id: Symbol, signal: AbortSignal, uri: string) {

//   const headers = new Headers();
//   headers.append("Content-Type", "text/event-stream");
//   headers.append("Authorization", "Bearer " + bfetch._jwt)

//   console.log("started: " + uri)
//   const body = await fetch(bfetch._baseUrl + uri, {
//     headers,
//     signal,
//   }).then(r => r.body);
//   console.log("got body");

//   if (!body) return;
//   const reader = body.getReader();
//   const decoder = new TextDecoder();

//   // return async function*() {
//   try {
//     while (true) {
//       const { done, value } = await reader.read();
//       if (signal.aborted) {
//         console.log("aborted: " + uri);
//         break
//       };
//       if (done) {
//         console.log("no more data: " + uri);
//         break
//       };
//       const str = decoder.decode(value);
//       // yield str;
//     }
//   } finally {
//     console.log("cleaning up: " + uri)
//     reader.releaseLock();
//     // yield id;
//   }
//   // }
// }

