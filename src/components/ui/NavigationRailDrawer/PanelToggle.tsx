import { cloneElement } from "react";

import { useUiStoreShallow } from "@/store";

import type { SideDrawerPanel } from "@/domain/enums/SideDrawerPanel";

type Props = {
  targetPanel : SideDrawerPanel;
  title       : string;
  icon        : React.ReactElement;
}

export const PanelToggle = ({
  targetPanel,
  title,
  icon
}: Props) => {
  const className = "w-4 h-4";
  const iconEl = cloneElement(
    icon, 
    { className: className, classes: className } as React.HTMLAttributes<HTMLElement>
  );

  const { activeNavRailPanel, toggleNavRailPanel } = useUiStoreShallow(s => ({
    activeNavRailPanel: s.activeNavRailPanel,
    toggleNavRailPanel: s.toggleNavRailPanel
  }));

  return (
    <button
      onClick={() => toggleNavRailPanel(targetPanel)}
      data-active={activeNavRailPanel === targetPanel}
      className="nav-rail-panel-toggle"
    >
      {iconEl}

      <p className="text-xs">{title}</p>
    </button>
  );
};
