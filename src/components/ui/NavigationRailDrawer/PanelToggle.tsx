import { type HTMLAttributes, cloneElement, JSX } from "react";

import { useUiStoreShallow } from "@/store";

import type { SideDrawerPanel } from "@/domain/enums/SideDrawerPanel";

type Props = {
  targetPanel : SideDrawerPanel;
  title       : string;
  icon        : JSX.Element;
}

export const PanelToggle = ({
  targetPanel,
  title,
  icon
}: Props) => {
  const baseClass = "size-4";
  const existingClasses = (icon.props.classes ?? icon.props.className ?? "") as string;
  const mergedClass = `${baseClass} ${existingClasses}`.trim();

  const iconEl = cloneElement(
    icon, 
    { className: mergedClass, classes: mergedClass } as HTMLAttributes<HTMLElement>
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
