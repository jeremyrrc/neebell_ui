import { Builder } from "../util/Bhtml/index.js";
import { Page } from "../main.js";
import { namePattern, accent } from "../main.js";
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
    .event("click", (e) => {
      e.preventDefault();
      p.bfetch
        .url("/user/create")
        .method("POST")
        .sendAs("encoded")
        .params(e)
        .onSuccess(() => {
          p.content(b, "sign in");
        })
        .send();
    })
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
    .event("click", (e) => {
      e.preventDefault();
      p.bfetch
        .url("/user/sign-in")
        .method("POST")
        .sendAs("encoded")
        .params(e)
        .onSuccess(async (r) => {
          const user = await r.text();
          p.sideMenu(b, "signed in", user);
          p.content(b, "blank");
          console.log(user);
        })
        .send();
    })
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
      id: idPrefix + "Name",
      for: idPrefix + "Name",
    },
    "Name:"
  ).build();

  const submitInput = submitInputB(b, "Create Forum")
    .event("click", (e) => {
      e.preventDefault();
      p.bfetch
        .url("/forum/create")
        .method("POST")
        .sendAs("encoded")
        .params(e)
        .onSuccess(async (r) => {
          const user = await r.text();
          p.sideMenu(b, "signed in", user);
          p.content(b, "blank");
        })
        .send();
    })
    .build();

  return formB(b)
    .className("max-w-lg")
    .childNode(nameLableInput)
    .childNode(submitInput.className(accent));
};
