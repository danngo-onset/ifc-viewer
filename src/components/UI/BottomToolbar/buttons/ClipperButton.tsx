import { useEffect, useRef, useState } from "react";

import type * as OBC from "@thatopen/components";

import { ChevronUpIcon, ScissorsIcon } from "@radix-ui/react-icons";

import { useClickOutside } from "@/hooks";
import { useBimComponent } from "@/hooks/BIM";

import { BimComponent } from "@/domain/enums/BIM/BimComponent";

import { WithTooltip } from "@/components/UI";
import { Clipper } from "@/components/BIM";

export const ClipperButton = () => {
  const [clipperEnabled, setClipperEnabled] = useState(false);
  const [showClipper, setShowClipper] = useState(false);
  
  const clipperContainerRef = useRef<HTMLDivElement>(null);

  const clipper = useBimComponent<OBC.Clipper>(BimComponent.Clipper);

  useEffect(() => {
    if (clipper) {
      setClipperEnabled(clipper.enabled);
    }
  }, [clipper]);

  useClickOutside(clipperContainerRef, showClipper, setShowClipper);

  return (
    <div ref={clipperContainerRef} className="relative flex flex-col items-center">
      {showClipper && <Clipper />}

      <ChevronUpIcon 
        onClick={() => setShowClipper(!showClipper)}
        className="bottom-toolbar-chevron-up"
        data-active={showClipper}
      />

      <WithTooltip message="Clipper">
        <button
          onClick={() => {
            if (!clipper) return;
        
            clipper.enabled = !clipperEnabled;
            setClipperEnabled(clipper.enabled);
          }}
          className="button-toolbar-button"
          data-active={clipperEnabled}
        >
          <ScissorsIcon className="bottom-toolbar-icon" />
        </button>
      </WithTooltip>
    </div>
  );
};
