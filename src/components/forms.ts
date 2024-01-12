import { built, createEffect } from "../util/Bhtml/builder.js";
import { accent, light } from "../page.js";
import {
  create_user,
  sign_in,
  create_forum,
  updatePermittedUsers,
  currentForum,
} from "../page.js";

export const namePattern = "^([a-zA-Z0-9]*-*)+$";

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
  name: "confirm_password",
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

const inputClasses = "bg-neutral-200 text-neutral-600 rounded-sm p-1 border-2 border-neutral-600 invalid:border-rose-500 invalid:text-rose-500";

const nameAndPasswordEntries = () => {
  const nameInput = built("input").attributes(nameAttributes)
    .className(inputClasses)
    .className("mt-1")
    .on("input", reportValidity)
  const nameEntry = built("label",
    "Name:",
    nameInput
  )
    .className("flex flex-col")

  const passwordInput = built("input")
    .attributes(passwordAttributes)
    .className(inputClasses)
    .className("mt-1")
    .on("input", reportValidity)
  type PasswordHotSpot = ["input",
    | typeof passwordInput
  ];
  const passwordEntry = built("label",
    "Password",
    <PasswordHotSpot>["input", passwordInput]
  )
    .className("flex flex-col");

  return [nameEntry, passwordEntry] as const;
};

// create account
export const createAccForm = () => {
  const [nameLable, passwordLable] = nameAndPasswordEntries();

  const confirmPassInput = built("input")
    .attributes(confirmPasswordAttributes)
    .className(inputClasses)
    .className("mt-1")
    .on("input", () => {
      const passInput = passwordLable.getItem("input");
      confirmPassInput.elem.value !== passInput.elem.value
        ? confirmPassInput.elem.setCustomValidity("Passwords don't match.")
        : confirmPassInput.elem.setCustomValidity("");
      confirmPassInput.elem.reportValidity();
    });

  const confirmPassLable = built("label",
    "Confirm password:",
    confirmPassInput,
  )
    .className("flex flex-col")

  const submitInput = built("button",
    "Create Account"
  )
    .attribute("type", "submit")
    .className("cursor-pointer py-1 px-3 rounded-sm")
    .className(accent)
    .on("click", create_user);

  return built("form",
    nameLable,
    passwordLable,
    confirmPassLable,
    submitInput
  )
    .className("flex flex-col space-y-3 max-w-lg")
};

// sign in
export const signInForm = () => {
  const [nameLableInput, passwordLableInput] = nameAndPasswordEntries();

  const submitButton = built("button",
    "Sign in"
  )
    .attribute("type", "submit")
    .className("cursor-pointer py-1 px-3 rounded-sm")
    .className(accent)
    .on("click", sign_in);

  return built("form",
    nameLableInput,
    passwordLableInput,
    submitButton,
  )
    .className("flex flex-col space-y-3 max-w-lg")
};

// create forum
export const createForumForm = () => {
  const nameInput = built("input")
    .attributes(forumNameAttributes)
    .className(inputClasses)
    .className("mt-1")
    .on("input", reportValidity);

  const nameEntry = built("label",
    "Forum name:",
    nameInput,
  )
    .className("flex flex-col")

  const submitButton = built("button",
    "Create Forum"
  )
    .attribute("type", "submit")
    .className("cursor-pointer py-1 px-3 rounded-sm")
    .className(accent)
    .on("click", create_forum);

  return built("form",
    nameEntry,
    submitButton,
  )
    .className("flex flex-col space-y-3 max-w-lg")
};

// update permitted users
export const updatePermittedUsersForm = () => {
  const forumIdHiddenInput = built("input")
    .attributes({
      type: "hidden",
      name: "forum_hex_id",
      value: currentForum.value!._id.$oid
    })

  createEffect(() => {
    console.log("changing form")
    let id = currentForum.value?._id.$oid;
    if (!id) return
    forumIdHiddenInput.elem.value = id;
  })

  const h1 = built("h2",
    "Update permitted users"
  )
    .className("text-center");

  const textareaUpdateUsers = built("textarea",
    <["users", string | undefined]>["users", currentForum.value?.permitted_users.join(", ")]
  )
    .attribute("name", "permitted_users")
    .attribute("title", "Enter a list of valid usernames, separated by a comma. A valid username has no spaces. Only dashes and numbers")
    .className(light)
    .className("mt-1 p-1")

  createEffect(() => {
    const newUsers = currentForum.value?.permitted_users.join(", ");
    textareaUpdateUsers.replace("users", newUsers)
  })

  const updateUsersEntry = built("label",
    "Permitted users:",
    textareaUpdateUsers,
  )
    .className("mt-3 flex flex-col")

  const submitButton = built("button",
    "Update"
  )
    .attribute("type", "submit")
    .className("cursor-pointer py-1 px-3 rounded-sm")
    .className(accent)
    .on("click", updatePermittedUsers);

  return built("form",
    forumIdHiddenInput,
    h1,
    updateUsersEntry,
    submitButton,
  )
    .className("flex flex-col")
}

// // send message
// export const sendMessageForm = () => {
//   const userInputHidden = built("input")
//     .attributes({
//       type: "hidden",
//       name: "user",
//       value: mainUser.value
//     });

//   const forumIdHiddenInput = built("input")
//     .attributes({
//       type: "hidden",
//       name: "forum_hex_id",
//       value: currentForum.value!._id.$oid
//     });

//   const id = "messageInput";
//   const textareaMessage = built("textarea")
//     .id(id)
//     .attributes({
//       type: "text",
//       name: "value",
//       placeholder: "Send a message"
//     })
//     .className("w-full p-2 mx-1")
//     .className(dark)
//     .on("keypress", (e) => {
//       if (e.code === "Enter") {
//         e.preventDefault();
//         sendMessage(e);
//         const target = e.target as HTMLInputElement;
//         const form = target.form as HTMLFormElement;
//         form.reset();
//       }
//     });

//   const messageEntry = built("label",
//     mainUser.value,
//   )
//     .attribute("for", id)
//     .className("px-3 py-2 flex items-center")
//     .className(accent)

//   const submitButton = built("button")
//     .attributes({
//       type: "submit",
//       value: "Send"
//     })
//     .className("px-3 py-2 rounded-sm cursor-pointer")
//     .className(mid)
//     .on("click", sendMessage);

//   return built("form",
//     userInputHidden,
//     forumIdHiddenInput,
//     messageEntry,
//     textareaMessage,
//     submitButton,
//   )
//     .className("flex")
// };
