import { type ReactElement, type ReactNode, useEffect, useRef, useState } from "react";

import { ChevronUpIcon } from "@radix-ui/react-icons";

import { useClickOutside } from "@/hooks";
import { useBimComponent } from "@/hooks/bim";

import { BimComponent } from "@/domain/enums/bim/BimComponent";
import { IBimComponentNode } from "@/domain/interfaces/bim";

import { WithTooltip } from "@/components/ui";

type Props = {
  componentKey   : BimComponent;
  componentNode  : ReactElement<IBimComponentNode>; // TODO: fix type assertion of this
  tooltipMessage : string;
  icon           : ReactNode;
}

export const BottomToolbarButton = ({
  componentKey,
  componentNode,
  tooltipMessage,
  icon,
}: Props) => {
  const [component, updateComponent] = useBimComponent(componentKey);

  const [showComponent, setShowComponent] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  
  const enabled = component?.enabled ?? false;

  useClickOutside(containerRef, showComponent, setShowComponent);

  return (
    <div ref={containerRef} className="relative flex flex-col items-center">
      {showComponent && componentNode}

      <ChevronUpIcon 
        onClick={() => setShowComponent(!showComponent)}
        className="bottom-toolbar-chevron-up"
        data-active={showComponent}
      />

      <WithTooltip message={tooltipMessage} position="top">
        <button
          onClick={() => updateComponent(x => x.enabled = !enabled)}
          data-active={enabled}
          className="button-toolbar-button"
        >
          {icon}
        </button>
      </WithTooltip>
    </div>
  );
};

export * from "./LengthMeasurerButton";
export * from "./AreaMeasurerButton";
export * from "./VolumeMeasurerButton";
export * from "./AngleMeasurerButton";
export * from "./CameraDistanceLockerButton";
export * from "./HighlighterButton";
export * from "./ClipperButton";
