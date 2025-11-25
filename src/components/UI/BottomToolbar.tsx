"use client";

import { useState, useEffect } from "react";

import type * as OBF from "@thatopen/components-front";

import { ChevronUpIcon } from "@radix-ui/react-icons";

import Constants from "@/domain/Constants";

import useBimComponent from "@/hooks/useBimComponent";

import { WithTooltip } from "./WithTooltip";
import { IconRulerCombined } from "./icons";
import { AreaMeasurer } from "../BIM";

export const BottomToolbar = () => {
  const [enabled, setEnabled] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  const measurer = useBimComponent<OBF.AreaMeasurement>(Constants.AreaMeasurementKey);

  useEffect(() => {
    if (measurer) {
      setEnabled(measurer.enabled);
    }
  }, [measurer]);

  const handleToggleEnabled = () => {
    const newEnabled = !enabled;
    setEnabled(newEnabled);
    if (measurer) measurer.enabled = newEnabled;
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2">
      <div className="bg-white border border-gray-300 rounded-lg shadow-xl p-2 flex items-center gap-2">
        <div className="relative flex flex-col items-center">
          {showOptions && <AreaMeasurer onClose={() => setShowOptions(false)} />}

          <ChevronUpIcon 
            onClick={() => setShowOptions(!showOptions)}
            className={`mb-1 p-1 hover:bg-gray-100 rounded transition-all w-8 h-8 cursor-pointer ${showOptions ? 'rotate-180' : ''}`}
          />

          <WithTooltip message="Area Measurer">
            <button
              onClick={handleToggleEnabled}
              className={`p-3 rounded-lg transition-all ${
                enabled 
                  ? 'bg-blue-500 text-white shadow-md' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              aria-label="Area Measurer"
            >
              <IconRulerCombined classes={`w-6 h-6 ${enabled ? "text-gray-100" : ""}`} />
            </button>
          </WithTooltip>
        </div>
      </div>
    </div>
  );
};
