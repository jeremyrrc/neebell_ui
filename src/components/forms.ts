import { Builder } from "../util/Bhtml/builder.js";
import { Page } from "../page.js";
import { namePattern, accent, dark, mid } from "../main.js";

const inputClassName =
  "mt-1 bg-neutral-200 text-neutral-600 rounded-sm p-1 border-2 border-neutral-600 invalid:border-rose-500 invalid:text-rose-500";
const submitClassName = "cursor-pointer p-1";

const reportValidity = (e: Event) =>
  (e.target as HTMLInputElement).reportValidity();

const lableInputNamePassword = (b: Builder) => {
  const nameLable = b.tag("label").childNode("Name:");
  const nameInput = b
    .tag("input")
    .attributes({
      type: "text",
      title:
        "Enter a user name with no spaces. Only letters, dashes and numbers",
      autocomplete: "off",
      placeholder: "john-doe45",
      name: "name",
      pattern: namePattern,
      minLength: "1",
      maxLength: "20",
      required: "true",
    })
    .on("input", reportValidity);
  nameLable
    .className("flex flex-col")
    .childNode(nameInput.className(inputClassName));
  const passLable = b.tag("label").childNode("Password:");
  const passInput = b
    .tag("input")
    .attributes({
      type: "password",
      title: "Enter a password at least 8 charaters long.",
      name: "password",
      minLength: "8",
      maxLength: "20",
      required: "true",
    })
    .on("input", reportValidity);
  passLable
    .className("flex flex-col")
    .childNode(passInput.className(inputClassName), "input");

  return [nameLable, passLable];
};

export const createAccForm = (b: Builder, p: Page) => {
  const [nameLable, passwordLable] = lableInputNamePassword(b);
  const confirmPassLable = b.tag("label").childNode("Confirm password:");
  const confirmPassInput = b.tag("input").attributes({
    type: "password",
    title: "Rewrite password to confirm your password.",
    name: "confirmPassword",
    minLength: "8",
    required: "true",
  });
  confirmPassInput.on("input", () => {
    const passInput = passwordLable.getNode(1) as HTMLInputElement;
    confirmPassInput.elem.value !== passInput.value
      ? confirmPassInput.elem.setCustomValidity("Passwords don't match.")
      : confirmPassInput.elem.setCustomValidity("");
    confirmPassInput.elem.reportValidity();
  });
  confirmPassLable
    .className("flex flex-col")
    .childNode(confirmPassInput.className(inputClassName));

  const submitInput = b
    .tag("input")
    .attributes({ type: "submit", value: "Create Account" })
    .on("click", p.create_user);
  return b
    .tag("form")
    .className("flex flex-col space-y-3 max-w-lg")
    .childNode(nameLable)
    .childNode(passwordLable)
    .childNode(confirmPassLable)
    .childNode(submitInput.className(submitClassName).className(accent));
};

export const signInForm = (b: Builder, p: Page) => {
  const [nameLableInput, passwordLableInput] = lableInputNamePassword(b);
  const submitInput = b
    .tag("input")
    .attributes({ type: "submit", value: "Sign In" })
    .on("click", p.sign_in);
  return b
    .tag("form")
    .className("flex flex-col space-y-3 max-w-lg")
    .childNode(nameLableInput)
    .childNode(passwordLableInput)
    .childNode(submitInput.className(submitClassName).className(accent));
};

export const createForumForm = (b: Builder, p: Page) => {
  const nameLable = b.tag("label").childNode("Name:");
  const nameInput = b
    .tag("input")
    .attributes({
      type: "text",
      title: "Enter a forum name with no spaces. Only dashes and numbers.",
      placeholder: "cool-topic23",
      name: "name",
      pattern: namePattern,
      minlength: "1",
      required: "true",
    })
    .className(inputClassName)
    .on("input", reportValidity);
  nameLable
    .className("flex flex-col")
    .childNode(nameInput.className(inputClassName));

  const submitInput = b
    .tag("input")
    .attributes({ type: "submit", value: "Create Forum" })
    .on("click", p.create_forum);
  return b
    .tag("form")
    .className("flex flex-col space-y-3 max-w-lg")
    .childNode(nameLable)
    .childNode(submitInput.className(submitClassName).className(accent));
};

export const sendMessageForm = (forum_id: string, p: Page, b: Builder) => {
  const user = p._main.elem.dataset.user;
  const userInputHidden = b
    .tag("input")
    .attributes({ type: "hidden", name: "user", value: user });
  const forumIdHiddenInput = b
    .tag("input")
    .attributes({ type: "hidden", name: "forum_hex_id", value: forum_id });
  const id = "sendMessageInput";
  const messageLable = b.tag("label").attribute("for", id).childNode(user);
  const messageInput = b
    .tag("textarea")
    .id(id)
    .attributes({ type: "text", name: "value", placeholder: "Send a message" })
    .on("keypress", (e) => {
      if (e.code === "Enter") {
        e.preventDefault();
        p.sendMessage(e);
        const target = e.target as HTMLInputElement;
        const form = target.form as HTMLFormElement;
        form.reset();
      }
    });
  const submitInput = b
    .tag("input")
    .attributes({ type: "submit", value: "Send" })
    .on("click", p.sendMessage);
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
    );
};
