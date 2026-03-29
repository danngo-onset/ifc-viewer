import { create } from "zustand";

import { createShallowStore } from "@/lib";

import type { SetZustandState } from "@/domain/types";

type State = {
  modelLoaded: boolean;
  selectedGridLevel: string;
  ghostModeEnabled: boolean;
};

type Action = {
  setModelLoaded: (modelLoaded: boolean) => void;
  setSelectedGridLevel: (selectedGridLevel: string) => void;
  setGhostModeEnabled: (ghostModeEnabled: boolean) => void;
};

type Store = State & Action;

function setModelLoaded(set: SetZustandState<State>, modelLoaded: boolean) {
  set({ modelLoaded });
}

function setSelectedGridLevel(set: SetZustandState<State>, selectedGridLevel: string) {
  set({ selectedGridLevel });
}

function setGhostModeEnabled(set: SetZustandState<State>, ghostModeEnabled: boolean) {
  set({ ghostModeEnabled });
}

export const useBimStore = create<Store>(set => ({
  modelLoaded: false,
  selectedGridLevel: "",
  ghostModeEnabled: false,

  setModelLoaded: modelLoaded => setModelLoaded(set, modelLoaded),
  setSelectedGridLevel: selectedGridLevel => setSelectedGridLevel(set, selectedGridLevel),
  setGhostModeEnabled: ghostModeEnabled => setGhostModeEnabled(set, ghostModeEnabled)
}));

export const useBimStoreShallow = createShallowStore(useBimStore);
