import { Build } from "../util/Bhtml/builder.js";
import { accent, light, dark, mid } from "../page.js";
import {
  create_user,
  sign_in,
  create_forum,
  updatePermittedUsers,
  sendMessage,
  user,
  currentForum,
} from "../page.js";
import { h2Build, inputBuild, submitButtonBuild } from "./base.js";
export const namePattern = "^[A-Za-z0-9\-]+$";

const reportValidity = (e: Event) =>
  (e.target as HTMLInputElement).reportValidity();

const nameAttributes = {
  type: "text",
  title: "Enter a user name with no spaces. Only letters, dashes and numbers",
  autocomplete: "off",
  placeholder: "john-doe45",
  name: "name",
  pattern: namePattern,
  minLength: "1",
  maxLength: "20",
  required: "true",
};

const passwordAttributes = {
  type: "password",
  title: "Enter a password at least 8 charaters long.",
  name: "password",
  minLength: "8",
  maxLength: "20",
  required: "true",
};

const confirmPasswordAttributes = {
  type: "password",
  title: "Rewrite password to confirm your password.",
  name: "confirmPassword",
  minLength: "8",
  required: "true",
}

const forumNameAttributes = {
  type: "text",
  title: "Enter a forum name with no spaces. Only dashes and numbers.",
  placeholder: "cool-topic23",
  name: "name",
  pattern: namePattern,
  minlength: "1",
  required: "true",
}

const lableInputNamePassword = (b: Build) => {
  const nameInput = inputBuild(nameAttributes)(b)
    .className("mt-1")
    .on("input", reportValidity)

  const nameLable = b
    .tag("label")
    .nodeArgs(
      "Name:",
      nameInput
    )
    .build()
    .className("flex flex-col")

  const passInput = inputBuild(passwordAttributes)(b)
    .className("mt-1")
    .on("input", reportValidity)

  const passLable = b
    .tag("label")
    .nodeArgs(
      "Password",
      <["input", typeof passInput]>["input", passInput]
    )
    .build()
    .className("flex flex-col");

  return [nameLable, passLable] as const;
};

export const createAccForm = (b: Build) => {
  const [nameLable, passwordLable] = lableInputNamePassword(b);

  const confirmPassInput = inputBuild(confirmPasswordAttributes)(b)
    .className("mt-1")
    .on("input", () => {
      const passInput = passwordLable.getItem("input");
      confirmPassInput.elem.value !== passInput.elem.value
        ? confirmPassInput.elem.setCustomValidity("Passwords don't match.")
        : confirmPassInput.elem.setCustomValidity("");
      confirmPassInput.elem.reportValidity();
    });

  const confirmPassLable = b
    .tag("label")
    .nodeArgs(
      "Confirm password:",
      confirmPassInput,
    )
    .build()
    .className("flex flex-col")

  const submitInput = submitButtonBuild("Create Account")(b)
    .className(accent)
    .on("click", create_user);

  return b
    .tag("form")
    .nodeArgs(
      nameLable,
      passwordLable,
      confirmPassLable,
      submitInput
    )
    .build()
    .className("flex flex-col space-y-3 max-w-lg")
};

export const signInForm = (b: Build) => {
  const [nameLableInput, passwordLableInput] = lableInputNamePassword(b);
  const submitButton = submitButtonBuild("Sign in")(b)
    .className(accent)
    .on("click", sign_in);

  return b
    .tag("form")
    .nodeArgs(
      nameLableInput,
      passwordLableInput,
      submitButton,
    )
    .build()
    .className("flex flex-col space-y-3 max-w-lg")
};

export const createForumForm = (b: Build) => {
  const nameInput = inputBuild(forumNameAttributes)(b)
    .className("mt-1")
    .on("input", reportValidity);

  const nameLable = b
    .tag("label")
    .nodeArgs(
      "Forum name:",
      nameInput,
    )
    .build()
    .className("flex flex-col")

  const submitInput = submitButtonBuild("Create Forum")(b)
    .className(accent)
    .on("click", create_forum);

  return b
    .tag("form")
    .nodeArgs(
      nameLable,
      submitInput,
    )
    .build()
    .className("flex flex-col space-y-3 max-w-lg")
};

export const updatePermittedUsersForm = (b: Build) => {
  const forumIdHiddenInput = b
    .tag("input")
    .build()
    .attributes({
      type: "hidden",
      name: "forum_hex_id",
      value: currentForum.value!._id.$oid
    })

  const h1 = h2Build("Update permitted users")(b)
    .className("text-center");

  const input = b
    .tag("textarea")
    .build()
    .attribute("name", "permitted_users")
    .attribute("title", "Enter a list of valid usernames, separated by a comma. A valid username has no spaces. Only dashes and numbers")
    .append(
      currentForum.value!.permitted_users.join(", ")
    )
    .className(light)
    .className("mt-1 p-1")

  const lable = b
    .tag("label")
    .nodeArgs(
      "Permitted users:",
      input,
    )
    .build()
    .className("mt-3 flex flex-col")

  const submitButton = submitButtonBuild("Update")(b)
    .className("mt-3")
    .className(accent)
    .on("click", updatePermittedUsers);

  return b
    .tag("form")
    .nodeArgs(
      forumIdHiddenInput,
      h1,
      lable,
      submitButton,
    )
    .build()
    .className("flex flex-col")
}

export const sendMessageForm = (b: Build) => {
  const userInputHidden = b
    .tag("input")
    .build()
    .attributes({
      type: "hidden",
      name: "user",
      value: user.value
    });

  const forumIdHiddenInput = b
    .tag("input")
    .build()
    .attributes({
      type: "hidden",
      name: "forum_hex_id",
      value: currentForum.value!._id.$oid
    });

  const id = "messageInput";
  const messageInput = b
    .tag("textarea")
    .build()
    .id(id)
    .attributes({
      type: "text",
      name: "value",
      placeholder: "Send a message"
    })
    .className("w-full p-2 mx-1")
    .className(dark)
    .on("keypress", (e) => {
      if (e.code === "Enter") {
        e.preventDefault();
        sendMessage(e);
        const target = e.target as HTMLInputElement;
        const form = target.form as HTMLFormElement;
        form.reset();
      }
    });

  const messageLable = b
    .tag("label")
    .nodeArgs(
      user.value,
    )
    .build()
    .attribute("for", id)
    .className("px-3 py-2 flex items-center")
    .className(dark)

  const submitInput = b
    .tag("input")
    .build()
    .attributes({
      type: "submit",
      value: "Send"
    })
    .className("px-3 py-2 rounded-sm cursor-pointer")
    .className(mid)
    .on("click", sendMessage);

  return b
    .tag("form")
    .nodeArgs(
      userInputHidden,
      forumIdHiddenInput,
      messageLable,
      messageInput,
      submitInput,
    )
    .build()
    .className("flex")
};
