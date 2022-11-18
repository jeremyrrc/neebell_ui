import { Builder } from "../util/Bhtml/builder.js";

// Layout ----------------------------

export const modalSectionB = (b: Builder, headerId: string) =>
  b
    .tag("section")
    .className("flex flex-col space-y-3 py-3 justify-center items-center")
    .attribute("aria-lablledby", headerId);

// -----------------------------------

interface BaseAttributes {
  [key: string]: string | null | undefined;
  title?: string;
  id?: string;
  role?: string;
}

// Form ------------------------------
interface TextInputAttributes extends BaseAttributes {
  type: "text" | "password" | "search" | "url" | "tel" | "email" | "number";
  required?: "true" | "false";
  placeholder?: string;
  name?: string;
  pattern?: string;
  minLength?: string;
  min?: string;
  max?: string;
}

interface LableAttributes extends BaseAttributes {
  for?: string;
}

export const labelB = (b: Builder, text: string, attr: LableAttributes) =>
  b.tag("label").childNode(text).attributes(attr);

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
  const input = textInputB(b, attr).className("mt-2").build();
  return labelB(b, labelText, { for: attr.for })
    .childNode(input, "input")
    .className("flex flex-col");
};

export const formB = (b: Builder) =>
  b.tag("form").className("flex flex-col space-y-3");
// ---------------------------------

// Text ----------------------------
export const h1B = (b: Builder, text: string, attr?: BaseAttributes) =>
  b.tag("h1").childNode(text).attributes(attr).className("text-2xl");

export const h2B = (b: Builder, text: string, attr?: BaseAttributes) =>
  b.tag("h2").childNode(text).attributes(attr).className("text-xl");

// Interactive ---------------------
const buttonClassName = "cursor-pointer py-1 px-3 rounded-sm";
export const submitInputB = (b: Builder, text: string, attr?: BaseAttributes) =>
  b
    .tag("input")
    .className(buttonClassName)
    .attributes({
      type: "submit",
      value: text,
      ...attr,
    });

export const buttonB = (b: Builder, text: string, attr?: BaseAttributes) =>
  b
    .tag("button")
    .childNode(text, "text")
    .className(buttonClassName)
    .attributes(attr);
// ---------------------------------
