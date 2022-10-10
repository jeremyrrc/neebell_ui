import { pages } from "./pages.js";
import { Bfetch } from "./util/Bfetch/Bfetch.js";

export const dark = "bg-neutral-600 text-neutral-200";
export const light = "bg-neutral-200 text-neutral-600";
export const accent = "bg-amber-400 text-neutral-600";

export const namePattern = "[A-Za-z0-9_-]+";

const body = document.body as HTMLBodyElement;

const pathname = location.pathname.slice(1);
const pathKey = pathname ? pathname : "home";

const pageB = pages[pathKey];
if (!pageB) {
  body.textContent = "Page not found";
  throw "Page not found";
}
pageB(body);

new Bfetch("http://127.0.0.1:8000/user/load")
  .send()
  .then(console.log)
  .catch(console.error);
