import { useEffect, useState } from "react";

import type * as OBF from "@thatopen/components-front";

import useBimComponent from "@/hooks/useBimComponent";

import Constants from "@/domain/Constants";

type HighlighterProps = {
  readonly isLoading: boolean;
}

export const Highlighter = ({ 
  isLoading 
}: HighlighterProps) => {
  const [highlighterEnabled, setHighlighterEnabled] = useState(false);
  
  const highlighter = useBimComponent<OBF.Highlighter>(Constants.HighlighterKey);

  useEffect(() => {
    if (highlighter) setHighlighterEnabled(highlighter.enabled);
  }, [highlighter]);
  
  return (
    <span className="flex items-center space-x-2 text-sm">
      <input
        id="highlighter-enabled"
        type="checkbox"
        checked={highlighterEnabled}
        disabled={isLoading || !highlighter}
        onChange={(e) => {
          if (!highlighter) return;

          setHighlighterEnabled(e.target.checked);
          highlighter.enabled = e.target.checked;
        }}
      />

      <label htmlFor="highlighter-enabled">Enable Highlighter</label>
    </span>
  );
};
