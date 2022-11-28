// import { Builder} from "./builder.js";
import { Built } from "./built.js";

export type Build =
  | Built<"a">
  | Built<"abbr">
  | Built<"address">
  | Built<"area">
  | Built<"article">
  | Built<"aside">
  | Built<"audio">
  | Built<"b">
  | Built<"base">
  | Built<"bdi">
  | Built<"bdo">
  | Built<"blockquote">
  | Built<"body">
  | Built<"br">
  | Built<"button">
  | Built<"canvas">
  | Built<"caption">
  | Built<"cite">
  | Built<"code">
  | Built<"col">
  | Built<"colgroup">
  | Built<"data">
  | Built<"datalist">
  | Built<"dd">
  | Built<"del">
  | Built<"details">
  | Built<"dfn">
  | Built<"dialog">
  | Built<"div">
  | Built<"dl">
  | Built<"dt">
  | Built<"em">
  | Built<"embed">
  | Built<"fieldset">
  | Built<"figcaption">
  | Built<"figure">
  | Built<"footer">
  | Built<"h1">
  | Built<"h2">
  | Built<"h3">
  | Built<"h4">
  | Built<"h5">
  | Built<"h6">
  | Built<"head">
  | Built<"header">
  | Built<"hgroup">
  | Built<"hr">
  | Built<"html">
  | Built<"i">
  | Built<"iframe">
  | Built<"img">
  | Built<"input">
  | Built<"ins">
  | Built<"kbd">
  | Built<"label">
  | Built<"legend">
  | Built<"li">
  | Built<"link">
  | Built<"main">
  | Built<"map">
  | Built<"mark">
  | Built<"menu">
  | Built<"meta">
  | Built<"meter">
  | Built<"nav">
  | Built<"noscript">
  | Built<"object">
  | Built<"ol">
  | Built<"optgroup">
  | Built<"option">
  | Built<"output">
  | Built<"p">
  | Built<"picture">
  | Built<"pre">
  | Built<"progress">
  | Built<"q">
  | Built<"rp">
  | Built<"rt">
  | Built<"ruby">
  | Built<"s">
  | Built<"samp">
  | Built<"script">
  | Built<"section">
  | Built<"select">
  | Built<"slot">
  | Built<"small">
  | Built<"source">
  | Built<"span">
  | Built<"strong">
  | Built<"style">
  | Built<"sub">
  | Built<"summary">
  | Built<"sup">
  | Built<"table">
  | Built<"tbody">
  | Built<"td">
  | Built<"template">
  | Built<"textarea">
  | Built<"tfoot">
  | Built<"th">
  | Built<"thead">
  | Built<"time">
  | Built<"title">
  | Built<"tr">
  | Built<"track">
  | Built<"u">
  | Built<"ul">
  | Built<"var">
  | Built<"video">
  | Built<"wbr">;

// export type Build =
//   | ({ kind: "a" } & Built<HTMLAnchorElement>)
//   | ({ kind: "abbr" } & Built<HTMLElement>)
//   | ({ kind: "address" } & Built<HTMLElement>)
//   | ({ kind: "area" } & Built<HTMLAreaElement>)
//   | ({ kind: "article" } & Built<HTMLElement>)
//   | ({ kind: "aside" } & Built<HTMLElement>)
//   | ({ kind: "audio" } & Built<HTMLAudioElement>)
//   | ({ kind: "b" } & Built<HTMLElement>)
//   | ({ kind: "base" } & Built<HTMLBaseElement>)
//   | ({ kind: "bdi" } & Built<HTMLElement>)
//   | ({ kind: "bdo" } & Built<HTMLElement>)
//   | ({ kind: "blockquote" } & Built<HTMLQuoteElement>)
//   | ({ kind: "body" } & Built<HTMLBodyElement>)
//   | ({ kind: "br" } & Built<HTMLBRElement>)
//   | ({ kind: "button" } & Built<HTMLButtonElement>)
//   | ({ kind: "canvas" } & Built<HTMLCanvasElement>)
//   | ({ kind: "caption" } & Built<HTMLTableCaptionElement>)
//   | ({ kind: "cite" } & Built<HTMLElement>)
//   | ({ kind: "code" } & Built<HTMLElement>)
//   | ({ kind: "col" } & Built<HTMLTableColElement>)
//   | ({ kind: "colgroup" } & Built<HTMLTableColElement>)
//   | ({ kind: "data" } & Built<HTMLDataElement>)
//   | ({ kind: "datalist" } & Built<HTMLDataListElement>)
//   | ({ kind: "dd" } & Built<HTMLElement>)
//   | ({ kind: "del" } & Built<HTMLDataListElement>)
//   | ({ kind: "details" } & Built<HTMLDetailsElement>)
//   | ({ kind: "dfn" } & Built<HTMLElement>)
//   | ({ kind: "dialog" } & Built<HTMLDialogElement>)
//   | ({ kind: "div" } & Built<HTMLDivElement>)
//   | ({ kind: "dl" } & Built<HTMLDListElement>)
//   | ({ kind: "dt" } & Built<HTMLElement>)
//   | ({ kind: "em" } & Built<HTMLElement>)
//   | ({ kind: "embed" } & Built<HTMLEmbedElement>)
//   | ({ kind: "fieldset" } & Built<HTMLFieldSetElement>)
//   | ({ kind: "figcaption" } & Built<HTMLElement>)
//   | ({ kind: "figure" } & Built<HTMLElement>)
//   | ({ kind: "footer" } & Built<HTMLElement>)
//   | ({ kind: "h1" } & Built<HTMLHeadingElement>)
//   | ({ kind: "h2" } & Built<HTMLHeadingElement>)
//   | ({ kind: "h3" } & Built<HTMLHeadingElement>)
//   | ({ kind: "h4" } & Built<HTMLHeadingElement>)
//   | ({ kind: "h5" } & Built<HTMLHeadingElement>)
//   | ({ kind: "h6" } & Built<HTMLHeadingElement>)
//   | ({ kind: "head" } & Built<HTMLHeadElement>)
//   | ({ kind: "header" } & Built<HTMLElement>)
//   | ({ kind: "hgroup" } & Built<HTMLElement>)
//   | ({ kind: "hr" } & Built<HTMLHRElement>)
//   | ({ kind: "html" } & Built<HTMLHtmlElement>)
//   | ({ kind: "i" } & Built<HTMLElement>)
//   | ({ kind: "iframe" } & Built<HTMLIFrameElement>)
//   | ({ kind: "img" } & Built<HTMLImageElement>)
//   | ({ kind: "input" } & Built<HTMLInputElement>)
//   | ({ kind: "ins" } & Built<HTMLModElement>)
//   | ({ kind: "kbd" } & Built<HTMLElement>)
//   | ({ kind: "label" } & Built<HTMLLabelElement>)
//   | ({ kind: "legend" } & Built<HTMLLegendElement>)
//   | ({ kind: "li" } & Built<HTMLLIElement>)
//   | ({ kind: "link" } & Built<HTMLLinkElement>)
//   | ({ kind: "main" } & Built<HTMLElement>)
//   | ({ kind: "map" } & Built<HTMLMapElement>)
//   | ({ kind: "mark" } & Built<HTMLElement>)
//   | ({ kind: "menu" } & Built<HTMLMenuElement>)
//   | ({ kind: "meta" } & Built<HTMLMetaElement>)
//   | ({ kind: "meter" } & Built<HTMLMeterElement>)
//   | ({ kind: "nav" } & Built<HTMLElement>)
//   | ({ kind: "noscript" } & Built<HTMLElement>)
//   | ({ kind: "object" } & Built<HTMLObjectElement>)
//   | ({ kind: "ol" } & Built<HTMLOListElement>)
//   | ({ kind: "optgroup" } & Built<HTMLOptGroupElement>)
//   | ({ kind: "option" } & Built<HTMLOptionElement>)
//   | ({ kind: "output" } & Built<HTMLOutputElement>)
//   | ({ kind: "p" } & Built<HTMLParagraphElement>)
//   | ({ kind: "picture" } & Built<HTMLPictureElement>)
//   | ({ kind: "pre" } & Built<HTMLPreElement>)
//   | ({ kind: "progress" } & Built<HTMLProgressElement>)
//   | ({ kind: "q" } & Built<HTMLQuoteElement>)
//   | ({ kind: "rq" } & Built<HTMLElement>)
//   | ({ kind: "rt" } & Built<HTMLElement>)
//   | ({ kind: "ruby" } & Built<HTMLElement>)
//   | ({ kind: "s" } & Built<HTMLElement>)
//   | ({ kind: "samp" } & Built<HTMLElement>)
//   | ({ kind: "script" } & Built<HTMLScriptElement>)
//   | ({ kind: "section" } & Built<HTMLElement>)
//   | ({ kind: "select" } & Built<HTMLSelectElement>)
//   | ({ kind: "slot" } & Built<HTMLSlotElement>)
//   | ({ kind: "small" } & Built<HTMLElement>)
//   | ({ kind: "source" } & Built<HTMLSourceElement>)
//   | ({ kind: "span" } & Built<HTMLSpanElement>)
//   | ({ kind: "strong" } & Built<HTMLElement>)
//   | ({ kind: "style" } & Built<HTMLStyleElement>)
//   | ({ kind: "sub" } & Built<HTMLElement>)
//   | ({ kind: "summary" } & Built<HTMLElement>)
//   | ({ kind: "sup" } & Built<HTMLElement>)
//   | ({ kind: "table" } & Built<HTMLTableElement>)
//   | ({ kind: "tbody" } & Built<HTMLTableSectionElement>)
//   | ({ kind: "td" } & Built<HTMLTableCellElement>)
//   | ({ kind: "template" } & Built<HTMLTemplateElement>)
//   | ({ kind: "textarea" } & Built<HTMLTextAreaElement>)
//   | ({ kind: "tfoot" } & Built<HTMLTableSectionElement>)
//   | ({ kind: "th" } & Built<HTMLTableSectionElement>)
//   | ({ kind: "thead" } & Built<HTMLTableSectionElement>)
//   | ({ kind: "time" } & Built<HTMLTimeElement>)
//   | ({ kind: "title" } & Built<HTMLTitleElement>)
//   | ({ kind: "tr" } & Built<HTMLTableRowElement>)
//   | ({ kind: "track" } & Built<HTMLTrackElement>)
//   | ({ kind: "u" } & Built<HTMLElement>)
//   | ({ kind: "ul" } & Built<HTMLUListElement>)
//   | ({ kind: "var" } & Built<HTMLElement>)
//   | ({ kind: "video" } & Built<HTMLVideoElement>)
//   | ({ kind: "wbr" } & Built<HTMLElement>);

// type Buil = Builder | Built<HTMLElement>;

// interface KindProp<Kind extends keyof HTMLElementTagNameMap> {
//   kind: Kind
// }

// export type Build<Tag extends keyof HTMLElementTagNameMap> = Built<HTMLElementTagNameMap[Tag]>

// export interface BuildMap {
//   "button" : Button
// }

// export type Build =
//   | Built<HTMLElement>
//   | Button<Built<HTMLButtonElement>>
//   | Input<Built<HTMLInputElement>>;

// // UTIL ==========

export const descriptor = (value: any): PropertyDescriptor => {
  return {
    enumerable: false,
    writable: false,
    configurable: false,
    value,
  };
};

// // BUILDER/BUILT METHODS ==========

// function as<B extends Buil, AsTypes extends string>(
//   this: B,
//   type: AsTypes
// ) {
//   this.attribute("type", type);
//   return this as B;
// }

// const disabled = {
//   get(this: Buil): Buil {
//     this.attribute("disabled", "");
//     return this;
//   },
// };

// function name<B extends Buil>(this: B, name: string) {
//   this.attribute("name", name);
//   return this as B;
// }

// function placeholder<B extends Buil>(this: B, value: string) {
//   this.attribute("placeholder", value);
//   return this as B;
// }

// function startValue<B extends Buil>(this: B, value: string) {
//   this.attribute("value", value);
//   return this as B;
// }

// // BUILDER METHODS ==========

// const buildFactory = (buildKey: string) => {
//   return function (this: Builder) {
//     const built = builder.build.call(this);
//     const build = buildMap[buildKey];
//     return build(built);
//   };
// };

// // BUTTON ==========

// type ButtonAsTypes = "button" | "submit" | "reset";

// interface ButtonMethods<B extends Buil> {
//   kind: "button";
//   as: typeof as<Button<B>, ButtonAsTypes>;
//   disabled: Button<B>;
// }

// interface ButtonBuilderMethods {
//   build: () => Button<Built<HTMLButtonElement>>;
// }

// interface ButtonBuiltMethods {}

// type Button<B extends Buil> = B extends Builder
//   ? ButtonMethods<B> & ButtonBuilderMethods & B
//   : ButtonMethods<B> & ButtonBuiltMethods & B;

// export const buttonB = <B extends Buil>(b: B) => {
//   const button = Object.create(b);
//   button.kind = "button";
//   if (button instanceof Builder) {
//     button.props.tag = "button";
//     Object.defineProperty(button, "build", descriptor(buildFactory("button")));
//   }
//   Object.defineProperty(button, "as", descriptor(as));
//   Object.defineProperty(button, "disabled", disabled);
//   return button as Button<B>;
// };

// // INPUT ==========

// type InputAsTypes =
//   | "button"
//   | "checkbox"
//   | "color"
//   | "date"
//   | "datetime-local"
//   | "email"
//   | "file"
//   | "hidden"
//   | "image"
//   | "month"
//   | "number"
//   | "paswword"
//   | "radio"
//   | "range"
//   | "reset"
//   | "search"
//   | "submit"
//   | "tel"
//   | "text"
//   | "time"
//   | "url"
//   | "week";

// interface InputMethods<B extends Buil> {
//   kind: "input";
//   as: typeof as<Input<B>, InputAsTypes>;
//   disabled: Input<B>;
//   placeholder: typeof placeholder<Input<B>>;
//   name: typeof name<Input<B>>;
//   startValue: typeof startValue<Input<B>>;
// }

// interface InputBuilderMethods {
//   build: () => Input<Built<HTMLInputElement>>;
// }

// interface InputBuiltMethods {}

// type Input<B extends Buil> = B extends Builder
//   ? InputMethods<B> & InputBuilderMethods & B
//   : InputMethods<B> & InputBuiltMethods & B;

// export const inputB = <B extends Buil>(b: B) => {
//   const input = Object.create(b);
//   input.kind = "input";
//   if (input instanceof Builder) {
//     input.props.tag = "input";
//     Object.defineProperty(input, "build", descriptor(buildFactory("input")));
//   }
//   Object.defineProperty(input, "as", descriptor(as));
//   Object.defineProperty(input, "disabled", disabled);
//   Object.defineProperty(input, "placeholder", descriptor(placeholder));
//   Object.defineProperty(input, "name", descriptor(name));
//   Object.defineProperty(input, "startValue", descriptor(startValue));
//   return input as Input<B>;
// };

// // BUILDMAP ==========

// export const buildMap = {
//   button: buttonB,
//   input: inputB,
// };
