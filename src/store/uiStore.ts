import { JSX } from "react";

import { create, type SetState } from "zustand";

import { createShallowStore } from "@/lib";

import { SideDrawerPanel } from "@/domain/enums/SideDrawerPanel";

interface State {
  isLoading: boolean;
  loadingMessage: string;
  activeNavRailPanel: SideDrawerPanel;
  isRightDrawerOpen: boolean;
  //rightDrawerContent: JSX.Element;
};

interface Action {
  setIsLoading: (isLoading: boolean) => void;
  setLoadingMessage: (loadingMessage: string) => void;
  setActiveNavRailPanel: (activeNavRailPanel: SideDrawerPanel) => void;
  closeNavRailPanel: () => void;
  toggleNavRailPanel: (activeNavRailPanel: SideDrawerPanel) => void;
  toggleIsRightDrawerOpen: (isRightDrawerOpen: boolean) => void;
  setRightDrawerContent: (node: JSX.Element) => void;
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

function toggleRightDrawerOpen(set: SetState<State>) {
  set(s => ({ isRightDrawerOpen: !s.isRightDrawerOpen }));
}

function setRightDrawerContent(set: SetState<State>, node: JSX.Element) {
  //set({ rightDrawerContent: node });
}

export const useUiStore = create<Store>(set => ({
  isLoading: false,
  loadingMessage: "",
  activeNavRailPanel: SideDrawerPanel.None,
  isRightDrawerOpen: false,
  //rightDrawerContent: <>hello</>,

  setIsLoading: (isLoading) => setIsLoading(set, isLoading),
  setLoadingMessage: (loadingMessage) => setLoadingMessage(set, loadingMessage),
  setActiveNavRailPanel: (activeNavRailPanel) => setActiveNavRailPanel(set, activeNavRailPanel),
  closeNavRailPanel: () => closeNavRailPanel(set),
  toggleNavRailPanel: (targetPanel) => toggleNavRailPanel(set, targetPanel),
  toggleIsRightDrawerOpen: () => toggleRightDrawerOpen(set),
  setRightDrawerContent: (node) => setRightDrawerContent(set, node)
}));

export const useUiStoreShallow = createShallowStore(useUiStore);
