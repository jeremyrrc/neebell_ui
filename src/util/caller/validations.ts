import { nothing, just } from "true-myth/maybe";
type Maybe<T> = import("true-myth/maybe").Maybe<T>;
const regex = {
  int: /^[0-9]+$/,
  letters: /^[A-Za-záéíóúüñ]+$/,
  email:
    /^[A-Za-z0-9._%+-]{1,64}@(?:[A-Za-z0-9-]{1,63}\.){1,125}[A-Za-z]{2,63}$/,
  jwt: /^[a-zA-Z0-9\-_]+?\.[a-zA-Z0-9\-_]+?\.([a-zA-Z0-9\-_]+)?$/,
  username: /^[A-Za-z0-9áéíóúüñ_\- ]+$/,
  hex: /^[0-9a-f]+$/,
  has_number: /\d/,
  has_upper: /[A-Z]/,
};

const largeString = 5000;
const mediumString = 1000;
const smallString = 100;

const largeFile = 10000000; // 10MB
const mediumFile = 4000000; // 4MB
const smallFile = 1000000; // 1MB

export const stringValidate = {
  letters: (s: string): Maybe<string> =>
    regex.letters.test(s) ? nothing<string>() : just("Letters only"),
  username: (s: string): Maybe<string> =>
    regex.username.test(s) ? nothing<string>() : just("Invalid name"),
  hasNumber: (s: string): Maybe<string> =>
    regex.has_number.test(s) ? nothing<string>() : just("Needs a number"),
  hasUpper: (s: string): Maybe<string> =>
    regex.has_upper.test(s)
      ? nothing<string>()
      : just("Needs an uppercase letter"),
  email: (s: string): Maybe<string> =>
    regex.email.test(s) ? nothing() : just("Invalid email"),
  int: (s: string): Maybe<string> =>
    regex.int.test(s) ? nothing<string>() : just("Numbers only"),
  jwt: (s: string): Maybe<string> =>
    regex.jwt.test(s) ? nothing<string>() : just("Invalid token"),
  hex: (s: string): Maybe<string> =>
    regex.hex.test(s) ? nothing<string>() : just("Invalid hex"),
  charsMin8: (s: string): Maybe<string> =>
    s.length >= 8 ? nothing<string>() : just("Needs at least 8 characters"),
  charsMaxLarge: (s: string): Maybe<string> =>
    s.length <= largeString ? nothing<string>() : just("Too many characters"),
  charsMaxMedium: (s: string): Maybe<string> =>
    s.length <= mediumString ? nothing<string>() : just("Too many characters"),
  charsMaxSmall: (s: string): Maybe<string> =>
    s.length <= smallString ? nothing<string>() : just("Too many characters"),
};

export const blobValidate = {
  image: (b: Blob): Maybe<string> =>
    b.type === "image/jpeg" ||
    b.type === "image/png" ||
    b.type === "application/pdf"
      ? nothing<string>()
      : just("File needs to be a jpeg, png or pdf"),
  maxLarge: (b: Blob): Maybe<string> =>
    b.size < largeFile ? nothing<string>() : just("File is too large"),
  maxMedium: (b: Blob): Maybe<string> =>
    b.size < mediumFile ? nothing<string>() : just("File is too large"),
  maxSmall: (b: Blob): Maybe<string> =>
    b.size < smallFile ? nothing<string>() : just("File is too large"),
};
