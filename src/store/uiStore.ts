import { create } from "zustand";

import type { SetZustandState } from "@/domain/types";

type State = {
  isLoading: boolean;
  loadingMessage: string;
};

type Action = {
  setIsLoading: (isLoading: boolean) => void;
  setLoadingMessage: (loadingMessage: string) => void;
};

type Store = State & Action;

export const useUiStore = create<Store>((set) => ({
  isLoading: false,
  loadingMessage: "",
  
  setIsLoading: (isLoading) => setIsLoading(set, isLoading),
  setLoadingMessage: (loadingMessage) => setLoadingMessage(set, loadingMessage)
}));

function setIsLoading(set: SetZustandState<State>, isLoading: boolean) {
  set({ isLoading });
}

function setLoadingMessage(set: SetZustandState<State>, loadingMessage: string) {
  set({ loadingMessage });
}
