import { just, nothing } from "true-myth/maybe";
type Maybe<T> = import("true-myth/maybe").Maybe<T>;
type Nothing = null | undefined;

type StringPredicate = (value: string) => boolean;
type BlobPredicate = (value: Blob) => boolean;

type StringModification = (value: string) => string;
type BlobModification = (value: Blob) => Blob;

export type Validation = StringPredicate | BlobPredicate;
export type Modification = StringModification | BlobModification;

export interface Stipulations {
  require: boolean;
  validations?: Array<Validation> | Nothing;
  modifications?: Array<Modification> | Nothing;
}

export interface Call {
  url: string;
  method: string;
  stips: Record<string, Stipulations>;
  contentType?: string;
  headers?: Headers;
}

export type Module = Map<string, Call>;

export type Bundle = Map<string, Module>;

export const signIn: Call = {
  url: "http://127.0.0.1:8000/user/sign-in",
  method: "post",
  stips: {
    name: {
      require: true,
      validations: [(_v: string) => true],
    },
  },
};

export class CallGet {
  // #url: Maybe<string>;
  // constructor(url: string) {
  // this.#url = just(url);
  // }

  #appendOrResetString(
    prop: Maybe<string>,
    reset: boolean,
    v: string | Nothing
  ) {
    if (!v) return prop;
    if (reset) {
      return just(v);
    } else {
      return prop.isJust ? just(prop.value + v) : just(v);
    }
  }

  // url(v: string | Nothing, reset = false) {
  //   this.#url = this.#appendOrResetString(this.#url, reset, v);
  //   return this;
  // }
}
