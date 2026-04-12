import type { StoreApi } from "zustand";

/** Alias type for the internal get state function when creating a Zustand store */
export type GetZustandState<T> = StoreApi<T>["getState"];
