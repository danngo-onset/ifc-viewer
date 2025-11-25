"use client";

import { useState, useEffect, useRef } from "react";

import type * as OBF from "@thatopen/components-front";

import { ChevronUpIcon } from "@radix-ui/react-icons";

import Constants from "@/domain/Constants";

import useBimComponent from "@/hooks/useBimComponent";

import { WithTooltip } from "./WithTooltip";
import { IconRulerCombined, IconRuler } from "./icons";
import { AreaMeasurer, LengthMeasurer } from "../BIM";

export const BottomToolbar = () => {
  const [enabled, setEnabled] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [enabledLength, setEnabledLength] = useState(false);
  const [showOptionsLength, setShowOptionsLength] = useState(false);

  const areaContainerRef = useRef<HTMLDivElement>(null);
  const lengthContainerRef = useRef<HTMLDivElement>(null);

  const measurer = useBimComponent<OBF.AreaMeasurement>(Constants.AreaMeasurementKey);
  const lengthMeasurer = useBimComponent<OBF.LengthMeasurement>(Constants.LengthMeasurementKey);

  useEffect(() => {
    if (measurer) {
      setEnabled(measurer.enabled);
    }
  }, [measurer]);

  useEffect(() => {
    if (lengthMeasurer) {
      setEnabledLength(lengthMeasurer.enabled);
    }
  }, [lengthMeasurer]);

  // Handle click outside to close options
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      
      // Check if click is outside area container (includes panel since panel is absolutely positioned inside)
      if (showOptions && areaContainerRef.current && !areaContainerRef.current.contains(target)) {
        setShowOptions(false);
      }
      
      // Check if click is outside length container
      if (showOptionsLength && lengthContainerRef.current && !lengthContainerRef.current.contains(target)) {
        setShowOptionsLength(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showOptions, showOptionsLength]);

  const handleToggleEnabled = () => {
    const newEnabled = !enabled;
    setEnabled(newEnabled);
    if (measurer) measurer.enabled = newEnabled;
  };

  const handleToggleEnabledLength = () => {
    const newEnabled = !enabledLength;
    setEnabledLength(newEnabled);
    if (lengthMeasurer) lengthMeasurer.enabled = newEnabled;
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2">
      <div className="bg-white border border-gray-300 rounded-lg shadow-xl p-2 flex items-center gap-2">
        <div ref={areaContainerRef} className="relative flex flex-col items-center">
          {showOptions && <AreaMeasurer />}

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

        <div ref={lengthContainerRef} className="relative flex flex-col items-center">
          {showOptionsLength && <LengthMeasurer />}

          <ChevronUpIcon 
            onClick={() => setShowOptionsLength(!showOptionsLength)}
            className={`mb-1 p-1 hover:bg-gray-100 rounded transition-all w-8 h-8 cursor-pointer ${showOptionsLength ? 'rotate-180' : ''}`}
          />

          <WithTooltip message="Length Measurer">
            <button
              onClick={handleToggleEnabledLength}
              className={`p-3 rounded-lg transition-all ${
                enabledLength 
                  ? 'bg-blue-500 text-white shadow-md' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              aria-label="Length Measurer"
            >
              <IconRuler classes={`w-6 h-6 ${enabledLength ? "text-gray-100" : ""}`} />
            </button>
          </WithTooltip>
        </div>
      </div>
    </div>
  );
};
