import { Builder } from "../util/Bhtml/builder.js";
// import { Built } from "../util/Bhtml/built.js";

// Layout ----------------------------

export const modalSectionB = (b: Builder, headerId: string) =>
  b
    .tag("section")
    .className("flex flex-col space-y-3 py-3 justify-center items-center")
    .attribute("aria-lablledby", headerId);

// -----------------------------------

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

// Form ------------------------------
interface InputAutocomplete {
  autocomplete?:
    | "off"
    | "on"
    | "name"
    | "honorific-prefix"
    | "given-name"
    | "additional-name"
    | "family-name"
    | "honorific-suffix"
    | "nickname"
    | "email"
    | "new-password"
    | "current-password"
    | "one-time-code"
    | "organization-title"
    | "organization"
    | "street-address"
    | "address-line1"
    | "address-line2"
    | "address-line3"
    | "address-level4"
    | "address-level3"
    | "address-level2"
    | "address-level1"
    | "country"
    | "country-name"
    | "postal-code"
    | "cc-name"
    | "cc-given-name"
    | "cc-additional-name"
    | "cc-family-name"
    | "cc-number"
    | "cc-exp"
    | "cc-exp-month"
    | "cc-exp-year"
    | "cc-csc"
    | "cc-type"
    | "transaction-currency"
    | "transaction-amount"
    | "language"
    | "bday"
    | "bday-day"
    | "bday-month"
    | "bday-year"
    | "sex"
    | "tel"
    | "tel-country-code"
    | "tel-national"
    | "tel-local"
    | "tel-extension"
    | "impp"
    | "url"
    | "photo";
}

interface TextInputAttributes extends GlobalAttributes, InputAutocomplete {
  type?: "text" | "password" | "search" | "url" | "tel" | "email" | "number";
  disabled?: "true" | "false";
  readonly?: "true" | "false";
  required?: "true" | "false";
  placeholder?: string;
  name?: string;
  pattern?: string;
  size?: string;
  maxlength?: string;
  minlength?: string;
  min?: string;
  max?: string;
  multiple?: "true" | "false";
}

interface FileInputAttributes extends GlobalAttributes {
  accept?: string;
  disabled?: string;
  capture?: "user" | "environment";
  multiple?: "true" | "false";
}

interface FormAttributes extends GlobalAttributes {
  autocomplete?: "on" | "off";
  name?: string;
  disabled?: string;
  rel?:
    | "external"
    | "help"
    | "license"
    | "next"
    | "nofollow"
    | "noopener"
    | "noreferrer"
    | "opener"
    | "prev"
    | "search";
}

// img, audio, video, script, link
interface LinkAttributes extends GlobalAttributes {
  crossorigin?: "anonymous" | "use-credentials";
}

interface LableAttributes extends GlobalAttributes {
  for?: string;
}

export const labelB = (b: Builder, text: string, attr: LableAttributes) =>
  b.tag("label").append(text).attributes(attr);

export const textInputB = (b: Builder, props: TextInputAttributes) =>
  b
    .tag("input")
    .className(
      [
        "bg-neutral-200",
        "text-neutral-600",
        "rounded-sm",
        "p-1",
        "border-2",
        "border-neutral-600",
        "invalid:border-rose-500",
        "invalid:text-rose-500",
      ].join(" ")
    )
    .attributes(props);

type LableInputAttributes = TextInputAttributes & LableAttributes;

export const lableTextInputB = (
  b: Builder,
  attr: LableInputAttributes,
  labelText: string
) => {
  const input = textInputB(b, attr).className("mt-2");
  return labelB(b, labelText, attr)
    .append(input, "input")
    .className("flex flex-col");
};

export const formB = (b: Builder) =>
  b.tag("form").className("flex flex-col space-y-3");
// ---------------------------------

// Text ----------------------------
export const h1B = (b: Builder, text: string, attr?: GlobalAttributes) =>
  b.tag("h1").append(text).attributes(attr).className("text-2xl");

export const h2B = (b: Builder, text: string, attr?: GlobalAttributes) =>
  b.tag("h2").append(text).attributes(attr).className("text-xl");

// Interactive ---------------------
const buttonClassName = "cursor-pointer py-1 px-3 rounded-sm";
export const submitInputB = (
  b: Builder,
  text: string,
  attr?: GlobalAttributes
) =>
  b
    .tag("input")
    .className(buttonClassName)
    .attributes({
      type: "submit",
      value: text,
      ...attr,
    });

export const buttonB = (b: Builder, text: string, attr?: GlobalAttributes) =>
  b
    .tag("button")
    .append(text, "text")
    .className(buttonClassName)
    .attributes(attr);
// ---------------------------------
