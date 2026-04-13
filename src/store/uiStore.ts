import { create, type SetState } from "zustand";

import { createShallowStore } from "@/lib";

import { SideDrawerPanel } from "@/domain/enums/SideDrawerPanel";

interface State {
  isLoading: boolean;
  loadingMessage: string;
  activeNavRailPanel: SideDrawerPanel;
};

interface Action {
  setIsLoading: (isLoading: boolean) => void;
  setLoadingMessage: (loadingMessage: string) => void;
  setActiveNavRailPanel: (activeNavRailPanel: SideDrawerPanel) => void;
  closeNavRailPanel: () => void;
  toggleNavRailPanel: (activeNavRailPanel: SideDrawerPanel) => void;
};

type Store = State & Action;

function setIsLoading(set: SetState<State>, isLoading: boolean) {
  set({ isLoading });
}

function setLoadingMessage(set: SetState<State>, loadingMessage: string) {
  set({ loadingMessage });
}

function setActiveNavRailPanel(set: SetState<State>, activeNavRailPanel: SideDrawerPanel) {
  set({ activeNavRailPanel });
}

function closeNavRailPanel(set: SetState<State>) {
  set({ activeNavRailPanel: SideDrawerPanel.None });
}

function toggleNavRailPanel(set: SetState<State>, targetPanel: SideDrawerPanel) {
  set(s => ({
    activeNavRailPanel: s.activeNavRailPanel === targetPanel ? SideDrawerPanel.None 
                                                             : targetPanel
  }));
}

export const useUiStore = create<Store>(set => ({
  isLoading: false,
  loadingMessage: "",
  activeNavRailPanel: SideDrawerPanel.None,

  setIsLoading: (isLoading) => setIsLoading(set, isLoading),
  setLoadingMessage: (loadingMessage) => setLoadingMessage(set, loadingMessage),
  setActiveNavRailPanel: (activeNavRailPanel) => setActiveNavRailPanel(set, activeNavRailPanel),
  closeNavRailPanel: () => closeNavRailPanel(set),
  toggleNavRailPanel: (targetPanel) => toggleNavRailPanel(set, targetPanel)
}));

export const useUiStoreShallow = createShallowStore(useUiStore);
