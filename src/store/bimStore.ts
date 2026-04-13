import { create, SetState, GetState } from "zustand";

import { Color } from "three";

import { createShallowStore, serviceLocator } from "@/lib";
import { BimExtensions } from "@/lib/extensions/bim";

import { Constants } from "@/domain/Constants";
import { BimComponent } from "@/domain/enums/bim/BimComponent";

interface State {
  modelLoaded: boolean;
  selectedGridLevel: string;
  ghostModeEnabled: boolean;
  darkSceneEnabled: boolean;
};

interface Action {
  setModelLoaded: (modelLoaded: boolean) => void;
  setSelectedGridLevel: (selectedGridLevel: string) => void;
  setGhostModeEnabled: (ghostModeEnabled: boolean) => void;
  setDarkSceneEnabled: (darkModeEnabled: boolean) => void;
};

type Store = State & Action;

function setModelLoaded(set: SetState<State>, modelLoaded: boolean) {
  set({ modelLoaded });
}

function setSelectedGridLevel(set: SetState<State>, selectedGridLevel: string) {
  set({ selectedGridLevel });
}

function setGhostModeEnabled(set: SetState<State>, ghostModeEnabled: boolean) {
  set({ ghostModeEnabled });
}

function setDarkSceneEnabled(set: SetState<State>, get: GetState<State>, darkModeEnabled: boolean) {
  set({ darkSceneEnabled: darkModeEnabled });

  const world = serviceLocator.resolve(BimComponent.World);
  if (world) {
    world.scene.three.background = darkModeEnabled ? new Color(Constants.Color.DarkScene) 
                                                   : null;
  }

  if (get().ghostModeEnabled) {
    const fragmentsManager = serviceLocator.resolve(BimComponent.FragmentsManager);
    if (fragmentsManager) {
      const materials = [...fragmentsManager.core.models.materials.list.values()];
      BimExtensions.applyGhostTintToMaterials(materials, darkModeEnabled);
    }
  }
}

export const useBimStore = create<Store>((set, get) => ({
  modelLoaded: false,
  selectedGridLevel: "",
  ghostModeEnabled: false,
  darkSceneEnabled: false,
  
  setModelLoaded: modelLoaded => setModelLoaded(set, modelLoaded),
  setSelectedGridLevel: selectedGridLevel => setSelectedGridLevel(set, selectedGridLevel),
  setGhostModeEnabled: ghostModeEnabled => setGhostModeEnabled(set, ghostModeEnabled),
  setDarkSceneEnabled: darkModeEnabled => setDarkSceneEnabled(set, get, darkModeEnabled),
}));

export const useBimStoreShallow = createShallowStore(useBimStore);
