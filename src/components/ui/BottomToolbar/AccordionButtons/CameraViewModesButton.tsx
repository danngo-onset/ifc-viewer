import { useRef, useState } from "react";

import { ChevronUpIcon } from "@radix-ui/react-icons";

import { useClickOutside } from "@/hooks";

import { CameraViewModes } from "@/components/bim";

import { WithTooltip } from "@/components/ui";
import { IconCamera } from "@/components/ui/icons";

export const CameraViewModesButton = () => {
  const [showComponent, setShowComponent] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  useClickOutside(containerRef, showComponent, setShowComponent);

  return (
    <div ref={containerRef} className="relative flex flex-col items-center">
      {showComponent && <CameraViewModes />}

      <ChevronUpIcon 
        onClick={() => setShowComponent(!showComponent)} 
        className="bottom-toolbar-chevron-up" 
        data-active={showComponent} 
      />

      <WithTooltip message="Camera View Modes" position="top">
        <button
          onClick={() => setShowComponent(!showComponent)}
          className="button-toolbar-button"
        >
          <IconCamera classes="bottom-toolbar-icon" />
        </button>
      </WithTooltip>
    </div>
  );
};
