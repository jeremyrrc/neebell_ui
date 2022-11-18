import { Built } from "./built.js";
import { Builder } from "./builder.js";

export type Nothing = null | undefined;
type MakeBuilt = (b: Builder) => Built;
export type PotentialFutureChildNode =
  | MakeBuilt
  | string
  | number
  | Built
  | Nothing;
export type FutureChildNode = string | Built;

export interface InputValues {
  id: string | Nothing;
  className: string | Nothing;
  attribute: string | Nothing;
  attributes: Record<string, string | Nothing> | Nothing;
  event: EventListener | Nothing;
  events: Record<string, [string, EventListener] | Nothing> | Nothing;
  childNode: PotentialFutureChildNode;
}

export interface ChildrenProps {
  className?: Array<string>;
}

export interface BuilderProps {
  cache: string | null;
  id: string | null;
  tag: string | null;
  className: Array<string> | null;
  attributes: Map<string, string> | null;
  data: Map<string, string> | null;
  events: Map<
    string | symbol,
    [
      keyof HTMLElementEventMap,
      EventListener,
      boolean | AddEventListenerOptions
    ]
  > | null;
  abortControllers: Map<string, AbortController> | null;
  childrenProps: ChildrenProps | null;
}

// type KeyedReturns<T extends string | number> = T extends string
//   ? Text | Built<HTMLElement> | undefined
//   : ChildNode | undefined;
