import { useRef, useState } from "react";

import { ChevronUpIcon } from "@radix-ui/react-icons";

import { useClickOutside } from "@/hooks";

import { Orientation } from "@/components/BIM";

import { WithTooltip } from "@/components/UI";
import { IconCompass } from "@/components/UI/icons";

export const OrientationButton = () => {
  const [showComponent, setShowComponent] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  useClickOutside(containerRef, showComponent, setShowComponent);

  return (
    <div ref={containerRef} className="relative flex flex-col items-center">
      {showComponent && <Orientation />}

      <ChevronUpIcon 
        onClick={() => setShowComponent(!showComponent)} 
        className="bottom-toolbar-chevron-up" 
        data-active={showComponent} 
      />

      <WithTooltip message="Orientation">
        <button
          onClick={() => setShowComponent(!showComponent)}
          className="button-toolbar-button"
        >
          <IconCompass classes="bottom-toolbar-icon" />
        </button>
      </WithTooltip>
    </div>
  );
};
