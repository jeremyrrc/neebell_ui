import { bfetch } from "../../page.js";

async function readBodyAsText(uri: string) {
  const headers = new Headers();
  headers.append("Content-Type", "text/event-stream");
  headers.append("Authorization", "Bearer " + localStorage.getItem("jwt"))
  return await fetch(bfetch._baseUrl + uri, {
    headers
  })
    .then(async (res) => {
      return async function*() {
        const reader = res.body?.getReader();
        if (!reader) return;
        const decoder = new TextDecoder();
        let finished = false;
        while (!finished) {
          const { done, value } = await reader.read();
          let str = decoder.decode(value);
          yield str;
          finished = done;
        }
        return;
      }
    });
}

const handleEvent = (prefix: string, strChunk: string, eventHandler: EventHandler) => {
  prefix = prefix;
  const lines = strChunk.split(/\r?\n/);
  for (const line of lines) {
    if (line.startsWith(prefix)) {
      const data = line.substring(prefix.length).trim();
      console.log(data);
      eventHandler(data);
    }
  }
}

type EventHandler = (data: string) => void;

type EventSource = {
  retry: number
  closed: boolean

  uri: string
  setUri: (uri: string) => EventSource

  onEventOpen: (() => void) | undefined
  onOpen: (handler: () => void) => EventSource

  onEventError: (() => void) | undefined
  onError: (handler: () => void) => EventSource

  onEvents: Record<string, EventHandler>,
  on: (prefix: string, handler: EventHandler) => EventSource,

  onMessage: (handler: EventHandler) => EventSource

  close: () => void,

  send: () => void,
}

class OpenEventSources {
  map: Map<string, EventSource>
  constructor() {
    this.map = new Map();
  }

  setItem(key: string, ev: EventSource) {
    this.map.set(key, ev)
  }

  close(key: string) {
    const ev = this.map.get(key)
    if (!ev) return false;
    ev.close();
    this.map.delete(key);
    return true;
  }

  create(uri: string) {
    const ev = EventSourceBuilder(uri);
    this.map.set(uri, ev);
    return ev;
  }

  clear() {
    for (const [_, ev] of this.map) {
      ev.close();
    }
    this.map.clear();
  }
}

export const openEventSources = new OpenEventSources();

function EventSourceBuilder(uri: string): EventSource {
  return {
    retry: 1,
    closed: false,

    uri,
    setUri(v: string) {
      this.uri = v;
      return this;
    },

    onEventOpen: undefined,
    onOpen(handler: () => void) {
      this.onEventOpen = handler;
      return this;
    },

    onEventError: undefined,
    onError(handler: () => void) {
      this.onEventError = handler;
      return this;
    },

    onEvents: {},
    on(event: string, handler: EventHandler) {
      this.onEvents[event + ":"] = handler;
      return this;
    },

    onMessage(handler: EventHandler) {
      this.onEvents["data:"] = handler;
      return this;
    },

    close() {
      this.closed = true;
      openEventSources.map.delete(this.uri!)
    },

    async send() {
      if (!this.uri) return;
      try {
        const feed = await readBodyAsText(this.uri);
        this.retry = 1;
        if (this.onEventOpen) this.onEventOpen();
        for await (const strChunk of feed()) {
          for (const key in this.onEvents) {
            handleEvent(key, strChunk, this.onEvents[key])
          }
          if (this.closed) return;
        }
      } catch (e) {
        console.error(e);
        let timeout = this.retry;
        this.retry = Math.min(64, this.retry * 2);
        setTimeout(() => this.send(), (() => timeout * 1000)());
      }
    },
  };
}

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
