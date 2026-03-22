import { create } from "zustand";

import { createShallowStore } from "@/lib";

import type { SetZustandState } from "@/domain/types";

type State = {
  modelLoaded: boolean;
  selectedGridLevel: string;
};

type Action = {
  setModelLoaded: (modelLoaded: boolean) => void;
  setSelectedGridLevel: (selectedGridLevel: string) => void;
};

type Store = State & Action;

function setModelLoaded(set: SetZustandState<State>, modelLoaded: boolean) {
  set({ modelLoaded });
}

function setSelectedGridLevel(set: SetZustandState<State>, selectedGridLevel: string) {
  set({ selectedGridLevel });
}

export const useBimStore = create<Store>(set => ({
  modelLoaded: false,
  selectedGridLevel: "",

  setModelLoaded: modelLoaded => setModelLoaded(set, modelLoaded),
  setSelectedGridLevel: selectedGridLevel => setSelectedGridLevel(set, selectedGridLevel)
}));

export const useBimStoreShallow = createShallowStore(useBimStore);
