import { Builder } from "../util/Bhtml2/index.js";
import { Bfetch } from "../util/Bfetch/Bfetch.js";
import { Page } from "../main.js";
import { namePattern, dark, accent } from "../main.js";
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

export const createUserForm = (b: Builder, f: Bfetch) => {
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
    "Confirm password:",
    {
      confirmPass: [
        "input",
        (e: Event) => {
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
        },
      ],
    }
  );

  const submitListener = (e: Event) => {
    e.preventDefault();
    const submitInput = e.target as HTMLInputElement | null;
    if (!submitInput) return;
    const form = submitInput.form;
    if (!form) return;
    f.clear("url")
      .clear("params")
      .clear("onSuccess")
      .url("/user/create")
      .method("POST")
      .sendAs("encoded")
      .params(form)
      .onSuccess(async (r: Response) => {
        const text = await r.text();
        console.log(text);
      })
      .send();
  };

  const submitInput = submitInputB(b, "submit")
    .className(dark)
    .event("click", submitListener);

  return formB(b)
    .className("max-w-lg")
    .childNode(nameLableInput)
    .childNode(passwordLableInput)
    .childNode(confirmPassLableInput.build())
    .childNode(submitInput.build());
};

export const signInForm = (b: Builder, page: Page) => {
  const [nameLableInput, passwordLableInput] = lableInputNamePassword(
    b,
    "signInForm"
  );

  const submitListener = (e: Event) => {
    e.preventDefault();
    console.log(e.target);
  };

  const submitInput = submitInputB(b, "Sign In")
    .className(accent)
    .event("click", submitListener)
    .build();

  return formB(b)
    .className("max-w-lg")
    .childNode(nameLableInput)
    .childNode(passwordLableInput)
    .childNode(submitInput);
};
