import React from "react";

import BimExtensions from "@/lib/extensions/bim-extensions";

import type { SideDrawerPanel } from "@/domain/enums/SideDrawerPanel";

import type { Props } from ".";

interface ToggleProps extends Props {
  readonly targetPanel : SideDrawerPanel;
  readonly title       : string;
  readonly icon        : React.ReactElement;
}

export const PanelToggle = ({
  activePanel,  // TODO: set up global state for this
  targetPanel,
  callback,
  title,
  icon
}: ToggleProps) => {
  const className = "w-4 h-4";
  const iconEl = React.cloneElement(
    icon, 
    { className: className, classes: className } as React.HTMLAttributes<HTMLElement>
  );

  return (
    <button
      onClick={callback}
      className={`w-full p-2 rounded-lg transition-colors flex items-center gap-2 
        ${BimExtensions.isPanelActive(activePanel, targetPanel) 
          ? "bg-blue-600 text-white" 
          : "text-gray-400 hover:bg-gray-800 hover:text-white"}
      `}
    >
      {iconEl}

      <p className="text-xs">{title}</p>
    </button>
  );
};
