import { useEffect, useRef, useState } from "react";

import type * as OBCF from "@thatopen/components-front";

import { ChevronUpIcon, RulerSquareIcon } from "@radix-ui/react-icons";

import { useClickOutside } from "@/hooks";
import { useBimComponent } from "@/hooks/BIM";

import { BimComponent } from "@/domain/enums/BIM/BimComponent";

import { WithTooltip } from "@/components/UI";
import { AreaMeasurer } from "@/components/BIM";

export const AreaMeasurerButton = () => {
  const [areaMeasurerEnabled, setAreaMeasurerEnabled] = useState(false);
  const [showAreaMeasurer, setShowAreaMeasurer] = useState(false);

  const areaContainerRef = useRef<HTMLDivElement>(null);

  const measurer = useBimComponent<OBCF.AreaMeasurement>(BimComponent.AreaMeasurer);

  useEffect(() => {
    if (measurer) {
      setAreaMeasurerEnabled(measurer.enabled);
    }
  }, [measurer]);

  useClickOutside(areaContainerRef, showAreaMeasurer, setShowAreaMeasurer);

  return (
    <div ref={areaContainerRef} className="relative flex flex-col items-center">
      {showAreaMeasurer && <AreaMeasurer />}

      <ChevronUpIcon 
        onClick={() => setShowAreaMeasurer(!showAreaMeasurer)}
        className="bottom-toolbar-chevron-up"
        data-active={showAreaMeasurer}
      />

      <WithTooltip message="Area Measurer">
        <button
          onClick={() => {
            if (!measurer) return;
        
            measurer.enabled = !areaMeasurerEnabled;
            setAreaMeasurerEnabled(measurer.enabled);
          }}
          data-active={areaMeasurerEnabled}
          className="button-toolbar-button"
        >
          <RulerSquareIcon className="bottom-toolbar-icon" />
        </button>
      </WithTooltip>
    </div>
  );
};
