import { cloneElement } from "react";

import { BimExtensions } from "@/lib/extensions/BIM";

import type { SideDrawerPanel } from "@/domain/enums/SideDrawerPanel";

import type { Props } from "./panels";

interface ToggleProps extends Props {
  targetPanel : SideDrawerPanel;
  title       : string;
  icon        : React.ReactElement;
}

export const PanelToggle = ({
  activePanel,  // TODO: set up global state for this
  targetPanel,
  callback,
  title,
  icon
}: ToggleProps) => {
  const className = "w-4 h-4";
  const iconEl = cloneElement(
    icon, 
    { className: className, classes: className } as React.HTMLAttributes<HTMLElement>
  );

  return (
    <button
      onClick={callback}
      data-active={BimExtensions.isPanelActive(activePanel, targetPanel)}
      className="w-full p-2 rounded-lg transition-colors flex items-center gap-2 cursor-pointer nav-rail-panel-toggle"
    >
      {iconEl}

      <p className="text-xs">{title}</p>
    </button>
  );
};
