import { UseBoundStore, StoreApi } from "zustand";
import { useShallow } from "zustand/shallow";

/** 
 * Utility function to create a shallow store
 * 
 * Allowing components to shallowly subscribe to the store without importing useShallow() from zustand
 */
export function createShallowStore<TStore>(useStore: UseBoundStore<StoreApi<TStore>>) {
  return function useShallowSelector<TSelector>(selector: (s: TStore) => TSelector) {
    return useStore(useShallow(selector));
  }
}
