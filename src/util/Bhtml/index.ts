import { Built } from "./built.js";
import { Builder } from "./builder.js";

export type Nothing = null | undefined;
type MakeBuilt = (b: Builder) => Built<Tag>;
export type Tag = keyof HTMLElementTagNameMap;
export type PotentialFutureChildNode =
  | MakeBuilt
  | string
  | number
  | Built<Tag>
  | Nothing;
export type FutureChildNode = string | Built<Tag>;

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

// type KeyedReturns<T extends string | number> = T extends string
//   ? Text | Built<HTMLElement> | undefined
//   : ChildNode | undefined;
