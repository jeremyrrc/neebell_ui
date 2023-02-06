import { Build, Signal } from "../util/Bhtml/builder.js";

export type H1 = ReturnType<typeof h1Build>;

export const h1Build = (text: string | Signal<string | undefined>, attr?: GlobalAttributes) => (b: Build) => b
  .tag("h1")
  .nodeArgs(
    text
  )
  .build()
  .className("text-2xl")
  .attributes(attr);

export type H2 = ReturnType<typeof h2Build>;

export const h2Build = (text: string | Signal<string | undefined>, attr?: GlobalAttributes) => (b: Build) => b
  .tag("h2")
  .nodeArgs(
    text
  )
  .build()
  .className("text-lg")
  .attributes(attr);


const buttonClassName = "cursor-pointer py-1 px-3 rounded-sm";

export type SubmitButton = ReturnType<typeof submitButtonBuild>;

export const submitButtonBuild = (text: string | Signal<string>, attr?: GlobalAttributes) => (b: Build) => b
  .tag("button")
  .nodeArgs(
    text
  )
  .build()
  .attributes({
    type: "submit",
    ...attr,
  })
  .className(buttonClassName)

export type Button = ReturnType<typeof buttonBuild>;

export const buttonBuild = (text: string | Signal<string>, attr?: GlobalAttributes) => (b: Build) => b
  .tag("button")
  .nodeArgs(
    text
  )
  .build()
  .attributes({
    type: "button",
    ...attr,
  })
  .className(buttonClassName)

const inputClassName =
  "bg-neutral-200 text-neutral-600 rounded-sm p-1 border-2 border-neutral-600 invalid:border-rose-500 invalid:text-rose-500";

export type Input = ReturnType<typeof inputBuild>

export const inputBuild = (attr?: {}) => (b: Build) => b
  .tag("input")
  .build()
  .attributes(attr)
  .className(inputClassName)

export type TextArea = ReturnType<typeof inputBuild>

export const textAreaBuild = (attr?: {}) => (b: Build) => b
  .tag("textarea")
  .build()
  .attributes(attr)
  .className(inputClassName)

// ==========

interface GlobalAttributes {
  [key: string]: string | null | undefined;
  autocapitalize?: "off" | "on" | "words" | "characters";
  autofocus?: "true" | "false";
  contenteditable?: "true" | "false";
  dir?: "ltr" | "rtl" | "auto";
  draggable?: "true" | "false";
  elementtiming?: string;
  enterkeyhint?:
  | "enter"
  | "done"
  | "go"
  | "next"
  | "previous"
  | "search"
  | "send";
  exportparts?: string;
  hidden?: "" | "hidden" | "until-found";
  id?: string;
  inert?: "true" | "false";
  inputmode?:
  | "none"
  | "text"
  | "decimal"
  | "numeric"
  | "tel"
  | "search"
  | "email"
  | "url";
  is?: string;
  itemid?: string;
  itemprop?: string;
  itemref?: string;
  itemscope?: "true" | "false";
  itemtype?: string;
  lang?: string;
  nonce?: string;
  part?: string;
  slot?: string;
  spellcheck?: "true" | "false";
  style?: string;
  tabindex?: string;
  title?: string;
  translate?: "yes" | "no";
  role?: string;
}



// interface InputAutocomplete {
//   autocomplete?:
//   | "off"
//   | "on"
//   | "name"
//   | "honorific-prefix"
//   | "given-name"
//   | "additional-name"
//   | "family-name"
//   | "honorific-suffix"
//   | "nickname"
//   | "email"
//   | "new-password"
//   | "current-password"
//   | "one-time-code"
//   | "organization-title"
//   | "organization"
//   | "street-address"
//   | "address-line1"
//   | "address-line2"
//   | "address-line3"
//   | "address-level4"
//   | "address-level3"
//   | "address-level2"
//   | "address-level1"
//   | "country"
//   | "country-name"
//   | "postal-code"
//   | "cc-name"
//   | "cc-given-name"
//   | "cc-additional-name"
//   | "cc-family-name"
//   | "cc-number"
//   | "cc-exp"
//   | "cc-exp-month"
//   | "cc-exp-year"
//   | "cc-csc"
//   | "cc-type"
//   | "transaction-currency"
//   | "transaction-amount"
//   | "language"
//   | "bday"
//   | "bday-day"
//   | "bday-month"
//   | "bday-year"
//   | "sex"
//   | "tel"
//   | "tel-country-code"
//   | "tel-national"
//   | "tel-local"
//   | "tel-extension"
//   | "impp"
//   | "url"
//   | "photo";
// }

// interface TextInputAttributes extends GlobalAttributes, InputAutocomplete {
//   type?: "text" | "password" | "search" | "url" | "tel" | "email" | "number";
//   disabled?: "true" | "false";
//   readonly?: "true" | "false";
//   required?: "true" | "false";
//   placeholder?: string;
//   name?: string;
//   pattern?: string;
//   size?: string;
//   maxlength?: string;
//   minlength?: string;
//   min?: string;
//   max?: string;
//   multiple?: "true" | "false";
// }

// interface FileInputAttributes extends GlobalAttributes {
//   accept?: string;
//   disabled?: string;
//   capture?: "user" | "environment";
//   multiple?: "true" | "false";
// }

// interface FormAttributes extends GlobalAttributes {
//   autocomplete?: "on" | "off";
//   name?: string;
//   disabled?: string;
//   rel?:
//   | "external"
//   | "help"
//   | "license"
//   | "next"
//   | "nofollow"
//   | "noopener"
//   | "noreferrer"
//   | "opener"
//   | "prev"
//   | "search";
// }

// // img, audio, video, script, link
// interface LinkAttributes extends GlobalAttributes {
//   crossorigin?: "anonymous" | "use-credentials";
// }

// interface LableAttributes extends GlobalAttributes {
//   for?: string;
// }

// // ---------------------------------
