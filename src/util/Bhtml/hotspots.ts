export class Hotspots {
  #hs: Map<string, Element>;

  constructor() {
    this.#hs = new Map();
  }

  get(key: string) {
    return this.#hs.get(key) || null;
  }

  _set(key: string, elem: Element, override: boolean) {
    if (this.#hs.has(key) && override === false) return false;
    this.#hs.set(key, elem);
    return true;
  }

  #removeHsFromElem(elem: Element) {
    const key = elem.getAttribute("bhtml-hs");
    if (key) this.#hs.delete(key);
  }

  #removeHsFromChildren(elem: Element) {
    const childHsElems = Array.from(elem.querySelectorAll("[bhtml-hs]"));
    childHsElems.forEach(this.#removeHsFromElem);
  }

  removeByKey(key: string) {
    let elem = this.get(key);
    if (!elem) return false;
    this.#removeHsFromChildren(elem);
    elem.remove();
    this.#hs.delete(key);
    return true;
  }

  removeChildrenByKey(key: string) {
    let elem = this.get(key);
    if (!elem) return null;
    this.#removeHsFromChildren(elem);
    while (elem.hasChildNodes()) {
      const node = elem.firstChild;
      if (!node) continue;
      elem.removeChild(node);
    }
    return elem;
  }

  remove(elem: Element) {
    this.#removeHsFromElem(elem);
    this.#removeHsFromChildren(elem);
    elem.remove();
  }

  removeChildren(elem: Element) {
    this.#removeHsFromChildren(elem);
    while (elem.firstChild) {
      elem.removeChild(elem.firstChild);
    }
  }
}
