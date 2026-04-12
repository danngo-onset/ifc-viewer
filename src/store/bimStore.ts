import { create } from "zustand";

import { Color } from "three";

import { createShallowStore, serviceLocator } from "@/lib";
import { BimExtensions } from "@/lib/extensions/bim";

import { Constants } from "@/domain/Constants";
import type { SetZustandState, GetZustandState } from "@/domain/types";
import { BimComponent } from "@/domain/enums/bim/BimComponent";

interface State {
  modelLoaded: boolean;
  selectedGridLevel: string;
  ghostModeEnabled: boolean;
  darkSceneEnabled: boolean;
  angleMeasurerSyncPicking: boolean;
};

interface Action {
  setModelLoaded: (modelLoaded: boolean) => void;
  setSelectedGridLevel: (selectedGridLevel: string) => void;
  setGhostModeEnabled: (ghostModeEnabled: boolean) => void;
  setDarkSceneEnabled: (darkModeEnabled: boolean) => void;
  setAngleMeasurerSyncPicking: (angleMeasurerSyncPicking: boolean) => void;
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

function setDarkSceneEnabled(set: SetZustandState<State>, get: GetZustandState<State>, darkModeEnabled: boolean) {
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

function setAngleMeasurerSyncPicking(set: SetZustandState<State>, angleMeasurerSyncPicking: boolean) {
  set({ angleMeasurerSyncPicking });
}

export const useBimStore = create<Store>((set, get) => ({
  modelLoaded: false,
  selectedGridLevel: "",
  ghostModeEnabled: false,
  darkSceneEnabled: false,
  angleMeasurerSyncPicking: false,

  setModelLoaded: modelLoaded => setModelLoaded(set, modelLoaded),
  setSelectedGridLevel: selectedGridLevel => setSelectedGridLevel(set, selectedGridLevel),
  setGhostModeEnabled: ghostModeEnabled => setGhostModeEnabled(set, ghostModeEnabled),
  setDarkSceneEnabled: darkModeEnabled => setDarkSceneEnabled(set, get, darkModeEnabled),
  setAngleMeasurerSyncPicking: angleMeasurerSyncPicking => setAngleMeasurerSyncPicking(set, angleMeasurerSyncPicking)
}));

export const useBimStoreShallow = createShallowStore(useBimStore);
