import { Builder } from "../util/Bhtml/builder.js";
import { Page } from "../main.js";
import { namePattern, accent, dark, mid } from "../main.js";
import { lableTextInputB, submitInputB, formB } from "./base.js";

const lableInputNamePassword = (b: Builder, idPrefix: string) => {
  const name = lableTextInputB(
    b,
    {
      type: "text",
      title: "Enter a user name with no spaces. Only dashes and numbers.",
      placeholder: "john-doe45",
      name: "name",
      pattern: namePattern,
      minLength: "1",
      required: "true",
      id: idPrefix + "Name",
      for: idPrefix + "Name",
    },
    "Name:"
  ).build();

  const pass = lableTextInputB(
    b,
    {
      type: "password",
      title: "Enter a password at least 8 charaters long.",
      name: "password",
      minLength: "8",
      required: "true",
      id: idPrefix + "Password",
      for: idPrefix + "Password",
    },
    "Password:"
  ).build();
  return [name, pass];
};

export const createAccForm = (b: Builder, p: Page) => {
  const idPrefix = "createForm";
  const [nameLableInput, passwordLableInput] = lableInputNamePassword(
    b,
    idPrefix
  );

  const confirmPassLableInput = lableTextInputB(
    b,
    {
      type: "password",
      title: "Rewrite password to confirm your password.",
      name: "confirmPassword",
      minLength: "8",
      required: "true",
      id: idPrefix + "ConfirmPassword",
      for: idPrefix + "ConfirmPassword",
    },
    "Confirm password:"
  )
    .event("input", (e) => {
      const confirmPassInput = e.target as HTMLInputElement | null;
      if (!confirmPassInput) return;
      const form = confirmPassInput.form;
      if (!form) return;
      const passInput = form.elements.namedItem(
        "password"
      ) as HTMLInputElement | null;
      if (!passInput) return;

      confirmPassInput.value !== passInput.value
        ? confirmPassInput.setCustomValidity("Passwords don't match.")
        : confirmPassInput.setCustomValidity("");
    })
    .build();

  const submitInput = submitInputB(b, "Create Account")
    .event("click", p.create_user)
    .build();

  return formB(b)
    .className("max-w-lg")
    .childNode(nameLableInput)
    .childNode(passwordLableInput)
    .childNode(confirmPassLableInput)
    .childNode(submitInput.className(accent));
};

export const signInForm = (b: Builder, p: Page) => {
  const [nameLableInput, passwordLableInput] = lableInputNamePassword(
    b,
    "signInForm"
  );
  const submitInput = submitInputB(b, "Sign In")
    .event("click", p.sign_in)
    .build();

  return formB(b)
    .className("max-w-lg")
    .childNode(nameLableInput)
    .childNode(passwordLableInput)
    .childNode(submitInput.className(accent));
};

export const createForumForm = (b: Builder, p: Page) => {
  const idPrefix = "createForumForm";
  const nameLableInput = lableTextInputB(
    b,
    {
      type: "text",
      title: "Enter a forum name with no spaces. Only dashes and numbers.",
      placeholder: "cool-topic23",
      name: "name",
      pattern: namePattern,
      minLength: "1",
      required: "true",
      id: idPrefix + "Name",
      for: idPrefix + "Name",
    },
    "Name:"
  ).build();

  const submitInput = submitInputB(b, "Create Forum")
    .event("click", p.create_forum)
    .build();

  return formB(b)
    .className("max-w-lg")
    .childNode(nameLableInput)
    .childNode(submitInput.className(accent));
};

export const sendMessageForm = (forum_id: string, p: Page, b: Builder) => {
  const user = p._main.elem.dataset.user;
  const userInputHidden = b
    .tag("input")
    .attributes({ type: "hidden", name: "user", value: user })
    .build();
  const forumIdHiddenInput = b
    .tag("input")
    .attributes({ type: "hidden", name: "forum_hex_id", value: forum_id })
    .build();

  const id = "sendMessageInput";
  const messageLable = b
    .tag("label")
    .attribute("for", id)
    .childNode(user)
    .build();
  const messageInput = b
    .tag("textarea")
    .id(id)
    .attributes({ type: "text", name: "value", placeholder: "Send a message" })
    .event("keypress", (e) => {
      if (e.code === "Enter") {
        e.preventDefault();
        p.sendMessage(e);
        const target = e.target as HTMLInputElement;
        const form = target.form as HTMLFormElement;
        form.reset();
      }
    })
    .build();
  const submitInput = b
    .tag("input")
    .attributes({ type: "submit", value: "Send" })
    .event("click", p.sendMessage)
    .build();
  return b
    .tag("form")
    .className("flex")
    .childNode(
      messageLable.className("px-3 py-2 flex items-center").className(dark)
    )
    .childNode(userInputHidden)
    .childNode(forumIdHiddenInput)
    .childNode(messageInput.className("w-full p-2 mx-1").className(dark))
    .childNode(
      submitInput
        .className("px-3 py-2 rounded-sm cursor-pointer")
        .className(mid)
    )
    .build();
};
