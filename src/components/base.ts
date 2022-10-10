import { Bhtml, TypeListener } from "../util/Bhtml/Bhtml.js";

const buttonClassName = "cursor-pointer py-1 px-3 rounded-sm";

// Layout ----------------------------
export const headerB = () => new Bhtml().tag("header");

export const asideB = () => new Bhtml().tag("aside");

export const mainB = () =>
  new Bhtml().tag("main").hotspot("main").className("h-full ");

export const modalSectionB = (headerId: string) =>
  new Bhtml()
    .tag("section")
    .className("flex flex-col space-y-3 py-3 justify-center items-center")
    .attributes({ "aria-lablledby": headerId });

export const navB = () => new Bhtml().tag("nav");
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

export const lableB = (text: string, inputId?: string) =>
  new Bhtml().tag("lable").childNode(text).attributes({ for: inputId });

export const textInputB = (props: TextInputAttributes) =>
  new Bhtml<HTMLInputElement>()
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

export const lableTextInputB = (
  inputAttributes: TextInputAttributes,
  labelText: string,
  typeListeners?: Record<string, TypeListener>
) => {
  const input = textInputB(inputAttributes).className("mt-2");
  return lableB(labelText)
    .childNodes({ input })
    .events(typeListeners)
    .className("flex flex-col");
};

export const formB = () =>
  new Bhtml().tag("form").className("flex flex-col space-y-3");
// ---------------------------------

// Text ----------------------------
export const h1B = (text: string, attr?: BaseAttributes) =>
  new Bhtml().tag("h1").childNode(text).attributes(attr).className("text-2xl");

export const h2B = (text: string, attr?: BaseAttributes) =>
  new Bhtml().tag("h2").childNode(text).attributes(attr).className("text-xl");

// Interactive ---------------------
export const submitInputB = (text: string) =>
  new Bhtml().tag("input").className(buttonClassName).attributes({
    type: "submit",
    value: text,
  });

export const buttonB = (text: string) =>
  new Bhtml().tag("button").className(buttonClassName).childNode(text);
// ---------------------------------
