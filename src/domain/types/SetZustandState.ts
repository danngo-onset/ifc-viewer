import type { StoreApi } from "zustand";

export type SetZustandState<T> = StoreApi<T>["setState"];
