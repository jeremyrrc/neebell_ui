import { Hotspots } from "../util/Bhtml/Bhtml.js";
import { namePattern, dark } from "../main.js";
import { lableTextInputB, submitInputB, formB } from "./base.js";

const lableInputNamePassword = () => {
  const name = lableTextInputB(
    {
      type: "text",
      title: "Enter a user name with no spaces. Only dashes and numbers.",
      placeholder: "john-doe45",
      name: "name",
      pattern: namePattern,
      minLength: "1",
    },
    "Name:"
  );

  const pass = lableTextInputB(
    {
      type: "password",
      title: "Enter a password at least 8 charaters long.",
      name: "password",
      minLength: "8",
    },
    "Password:"
  );
  return [name, pass];
};

export const createUserForm = () => {
  const [nameLableInput, passwordLableInput] = lableInputNamePassword();

  const confirmPassLableInput = lableTextInputB(
    {
      type: "password",
      title: "Rewrite password to confirm your password.",
      name: "confirmPassword",
      minLength: "8",
    },
    "Confirm password:",
    {
      confirmPass: [
        "input",
        (_hs: Hotspots, e: Event) => {
          const confirmPassInput = e.target as HTMLInputElement;
          const form = confirmPassInput.form;
          if (!form || !confirmPassInput) return;
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

  const submitListener = (_hs: Hotspots, e: Event) => {
    e.preventDefault();
    console.log(e.target);
  };

  const submitInput = submitInputB("submit")
    .className(dark)
    .events({ signIn: ["click", submitListener] })
    .parentReady();

  return formB().className("max-w-lg").childNodes({
    nameLableInput,
    passwordLableInput,
    confirmPassLableInput,
    submitInput,
  });
};

export const signInForm = () => {
  const [nameLableInput, passwordLableInput] = lableInputNamePassword();

  const submitListener = (_hs: Hotspots, e: Event) => {
    e.preventDefault();
    console.log(e.target);
  };

  const submitInput = submitInputB("submit")
    .className(dark)
    .events({ signIn: ["click", submitListener] })
    .parentReady();

  return formB()
    .className("max-w-lg")
    .childNodes({
      nameLableInput,
      passwordLableInput,
      submitInput,
    })
    .childNode("Hello world");
};
