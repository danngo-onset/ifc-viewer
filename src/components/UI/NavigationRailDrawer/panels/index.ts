import type { SideDrawerPanel } from "@/domain/enums/SideDrawerPanel";

export type Props = {
  activePanel : SideDrawerPanel;
  callback    : () => void;
};

export * from "./PanelToggle";
export * from "./ModelInspectorPanel";
export * from "./ClassifierPanel"
export * from "./ViewsPanel";
