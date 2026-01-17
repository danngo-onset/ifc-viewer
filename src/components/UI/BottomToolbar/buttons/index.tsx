import { ReactElement, useEffect, useRef, useState } from "react";

import { ChevronUpIcon } from "@radix-ui/react-icons";

import { useClickOutside } from "@/hooks";
import { useBimComponent } from "@/hooks/BIM";

import { BimComponent } from "@/domain/enums/BIM/BimComponent";
import { IBimComponentNode } from "@/domain/interfaces/BIM";

import { WithTooltip } from "@/components/UI";

type Props = {
  componentKey   : BimComponent;
  componentNode  : ReactElement<IBimComponentNode>; // TODO: fix type assertion of this
  tooltipMessage : string;
  icon           : React.ReactNode;
}

export const BottomToolbarButton = ({
  componentKey,
  componentNode,
  tooltipMessage,
  icon,
}: Props) => {
  const [enabled, setEnabled] = useState(false);
  const [showComponent, setShowComponent] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  const component = useBimComponent(componentKey);

  useEffect(() => {
    if (component) {
      setEnabled(component.enabled);
    }
  }, [component]);

  useClickOutside(containerRef, showComponent, setShowComponent);

  return (
    <div ref={containerRef} className="relative flex flex-col items-center">
      {showComponent && componentNode}

      <ChevronUpIcon 
        onClick={() => setShowComponent(!showComponent)}
        className="bottom-toolbar-chevron-up"
        data-active={showComponent}
      />

      <WithTooltip message={tooltipMessage}>
        <button
          onClick={() => {
            if (!component) return;
        
            component.enabled = !enabled;
            setEnabled(component.enabled);
          }}
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
export * from "./CameraDistanceLockerButton";
export * from "./HighlighterButton";
export * from "./ClipperButton";
