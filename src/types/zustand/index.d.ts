import type { StoreApi } from "zustand";

declare module "zustand" {
  /** Alias type for the internal set state function when creating a Zustand store */
  type SetState<T> = StoreApi<T>["setState"];

  /** Alias type for the internal get state function when creating a Zustand store */
  type GetState<T> = StoreApi<T>["getState"];
}
