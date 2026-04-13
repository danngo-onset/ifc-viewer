import type { Dispatch, SetStateAction } from "react";

declare module "react" {
  /** Alias type for the setState function from useState hook */
  type SetState<T> = Dispatch<SetStateAction<T>>;
}
