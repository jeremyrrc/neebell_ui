import { nothing } from "true-myth/maybe";
import { ParentReady } from "./Bhtml.js";
const printText = (elem: HTMLElement, text: string) => {
  elem.appendChild(document.createTextNode(text));
};

const printInline = (
  elem: HTMLElement,
  parentReadyArray: Array<ParentReady>
) => {
  for (const pr of parentReadyArray) {
    elem.appendChild(pr(nothing()));
  }
};

function* range(from: number, to: number, step = 1) {
  let value = from;
  while (value <= to) {
    yield value;
    value += step;
  }
}

export const appendTextAndInline = (
  elem: HTMLElement,
  text: string,
  inline: Map<string, ParentReady>
) => {
  const regex = /\#\{\w+\}/g;
  const matches = text.match(regex);
  if (!matches) {
    printText(elem, text);
    return;
  }
  const inlineKeys = matches.map((m) => m.slice(2, m.length - 1));
  const parentReadyArray = inlineKeys
    .map((key) => inline.get(key))
    .filter((v) => v) as Array<ParentReady>;
  if (parentReadyArray.length === 0) {
    printText(elem, text);
    return;
  }
  const textSplit = text.split(regex);
  if (textSplit.length === 0) {
    printInline(elem, parentReadyArray);
    return;
  }
  const inlineElems = parentReadyArray.map((pr) => pr(nothing()));
  const max = Math.max(textSplit.length, inlineElems.length);
  for (const i of range(0, max)) {
    const textNode =
      textSplit.length > i ? document.createTextNode(textSplit[i]) : null;
    const inline = inlineElems.length > i ? inlineElems[i] : null;
    if (textNode) elem.appendChild(textNode);
    if (inline) elem.appendChild(inline);
  }
};
