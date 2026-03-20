import { create } from "zustand";

import type { SetZustandState } from "@/domain/types";
import { SideDrawerPanel } from "@/domain/enums/SideDrawerPanel";

type State = {
  isLoading: boolean;
  loadingMessage: string;
  activeNavRailPanel: SideDrawerPanel;
};

type Action = {
  setIsLoading: (isLoading: boolean) => void;
  setLoadingMessage: (loadingMessage: string) => void;
  setActiveNavRailPanel: (activeNavRailPanel: SideDrawerPanel) => void;
  closeNavRailPanel: () => void;
  toggleNavRailPanel: (activeNavRailPanel: SideDrawerPanel) => void;
};

type Store = State & Action;

export const useUiStore = create<Store>((set, get) => ({
  isLoading: false,
  loadingMessage: "",
  activeNavRailPanel: SideDrawerPanel.None,

  setIsLoading: (isLoading) => setIsLoading(set, isLoading),
  setLoadingMessage: (loadingMessage) => setLoadingMessage(set, loadingMessage),
  setActiveNavRailPanel: (activeNavRailPanel) => setActiveNavRailPanel(set, activeNavRailPanel),
  closeNavRailPanel: () => closeNavRailPanel(set),
  toggleNavRailPanel: (targetPanel) => toggleNavRailPanel(set, targetPanel)
}));

function setIsLoading(set: SetZustandState<State>, isLoading: boolean) {
  set({ isLoading });
}

function setLoadingMessage(set: SetZustandState<State>, loadingMessage: string) {
  set({ loadingMessage });
}

function setActiveNavRailPanel(set: SetZustandState<State>, activeNavRailPanel: SideDrawerPanel) {
  set({ activeNavRailPanel });
}

function closeNavRailPanel(set: SetZustandState<State>) {
  set({ activeNavRailPanel: SideDrawerPanel.None });
}

function toggleNavRailPanel(set: SetZustandState<State>, targetPanel: SideDrawerPanel) {
  set(s => ({
    activeNavRailPanel: s.activeNavRailPanel === targetPanel ? SideDrawerPanel.None 
                                                             : targetPanel
  }));
}
