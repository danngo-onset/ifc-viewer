import { useEffect, useRef, useState } from "react";

import type * as OBCF from "@thatopen/components-front";

import { ChevronUpIcon } from "@radix-ui/react-icons";

import { useClickOutside } from "@/hooks";
import { useBimComponent } from "@/hooks/BIM";

import { BimComponent } from "@/domain/enums/BIM/BimComponent";

import { WithTooltip } from "@/components/UI";
import { IconPaintRoller } from "@/components/UI/icons";
import { Highlighter } from "@/components/BIM";

export const HighlighterButton = () => {
  const [highlighterEnabled, setHighlighterEnabled] = useState(false);
  const [showHighlighter, setShowHighlighter] = useState(false);

  const highlighterContainerRef = useRef<HTMLDivElement>(null);

  const highlighter = useBimComponent<OBCF.Highlighter>(BimComponent.Highlighter);

  useEffect(() => {
    if (highlighter) {
      setHighlighterEnabled(highlighter.enabled);
    }
  }, [highlighter]);

  useClickOutside(highlighterContainerRef, showHighlighter, setShowHighlighter);

  return (
    <div ref={highlighterContainerRef} className="relative flex flex-col items-center">
      {showHighlighter && <Highlighter />}

      <ChevronUpIcon 
        onClick={() => setShowHighlighter(!showHighlighter)}
        className="bottom-toolbar-chevron-up"
        data-active={showHighlighter}
      />

      <WithTooltip message="Highlighter">
        <button 
          onClick={() => {
            if (!highlighter) return;

            highlighter.enabled = !highlighterEnabled;
            setHighlighterEnabled(highlighter.enabled);
          }} 
          className="button-toolbar-button"
          data-active={highlighterEnabled}
        >
          <IconPaintRoller classes="bottom-toolbar-icon" />
        </button>
      </WithTooltip>
    </div>
  );
};
