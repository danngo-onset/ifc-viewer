import type { StoreApi } from "zustand";

/** Alias type for the internal set state function when creating a Zustand store */
export type SetZustandState<T> = StoreApi<T>["setState"];
