import { useEffect, useRef, useState } from "react";

import type * as OBCF from "@thatopen/components-front";

import { ChevronUpIcon, RulerHorizontalIcon } from "@radix-ui/react-icons";

import { useClickOutside } from "@/hooks";
import { useBimComponent } from "@/hooks/BIM";

import { BimComponent } from "@/domain/enums/BIM/BimComponent";

import { WithTooltip } from "@/components/UI";
import { LengthMeasurer } from "@/components/BIM";

export const LengthMeasurerButton = () => {
  const [lengthMeasurerEnabled, setLengthMeasurerEnabled] = useState(false);
  const [showLengthMeasurer, setShowLengthMeasurer] = useState(false);

  const lengthContainerRef = useRef<HTMLDivElement>(null);

  const lengthMeasurer = useBimComponent<OBCF.LengthMeasurement>(BimComponent.LengthMeasurer);

  useEffect(() => {
    if (lengthMeasurer) {
      setLengthMeasurerEnabled(lengthMeasurer.enabled);
    }
  }, [lengthMeasurer]);

  useClickOutside(lengthContainerRef, showLengthMeasurer, setShowLengthMeasurer);

  return (
    <div ref={lengthContainerRef} className="relative flex flex-col items-center">
      {showLengthMeasurer && <LengthMeasurer />}

      <ChevronUpIcon 
        onClick={() => setShowLengthMeasurer(!showLengthMeasurer)}
        className="bottom-toolbar-chevron-up"
        data-active={showLengthMeasurer}
      />

      <WithTooltip message="Length Measurer">
        <button
          onClick={() => {
            if (!lengthMeasurer) return;

            lengthMeasurer.enabled = !lengthMeasurerEnabled;
            setLengthMeasurerEnabled(lengthMeasurer.enabled);
          }}
          data-active={lengthMeasurerEnabled}
          className="button-toolbar-button"
        >
          <RulerHorizontalIcon className="bottom-toolbar-icon" />
        </button>
      </WithTooltip>
    </div>
  );
};
