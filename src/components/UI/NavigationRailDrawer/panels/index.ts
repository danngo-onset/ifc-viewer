import type { SideDrawerPanel } from "@/domain/enums/SideDrawerPanel";

export type Props = {
  readonly activePanel : SideDrawerPanel;
  readonly callback    : () => void;
};

export * from "./ModelInspectorPanel";
