import { UseBoundStore, StoreApi } from "zustand";
import { useShallow } from "zustand/shallow";

export function createShallowStore<TStore>(useStore: UseBoundStore<StoreApi<TStore>>) {
  return function useShallowSelector<TSelector>(selector: (s: TStore) => TSelector) {
    return useStore(useShallow(selector));
  }
}
