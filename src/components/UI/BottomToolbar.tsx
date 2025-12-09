import { useState, useEffect, useRef } from "react";

import type * as OBCF from "@thatopen/components-front";

import { ChevronUpIcon } from "@radix-ui/react-icons";

import Constants from "@/domain/Constants";
import type { OrbitLockToggle } from "@/domain/types/OrbitLockToggle";

import useBimComponent from "@/hooks/useBimComponent";

import { WithTooltip } from "./WithTooltip";

import { IconRulerCombined, IconRuler, IconCamera, IconPaintRoller } from "./icons";

import { AreaMeasurer, LengthMeasurer, Highlighter } from "../BIM";

export const BottomToolbar = () => {
  const [areaMeasurerEnabled, setAreaMeasurerEnabled] = useState(false);
  const [showAreaMeasurer, setShowAreaMeasurer] = useState(false);

  const [lengthMeasurerEnabled, setLengthMeasurerEnabled] = useState(false);
  const [showLengthMeasurer, setShowLengthMeasurer] = useState(false);

  const [orbitLockEnabled, setOrbitLockEnabled] = useState(false);

  const [highlighterEnabled, setHighlighterEnabled] = useState(false);
  const [showHighlighter, setShowHighlighter] = useState(false);
  
  const areaContainerRef = useRef<HTMLDivElement>(null);
  const lengthContainerRef = useRef<HTMLDivElement>(null);
  const highlighterContainerRef = useRef<HTMLDivElement>(null);

  const measurer = useBimComponent<OBCF.AreaMeasurement>(Constants.AreaMeasurementKey);
  const lengthMeasurer = useBimComponent<OBCF.LengthMeasurement>(Constants.LengthMeasurementKey);
  const orbitToggle = useBimComponent<OrbitLockToggle>(Constants.OrbitLockKey);
  const highlighter = useBimComponent<OBCF.Highlighter>(Constants.HighlighterKey);

  useEffect(() => {
    if (measurer) {
      setAreaMeasurerEnabled(measurer.enabled);
    }
  }, [measurer]);

  useEffect(() => {
    if (lengthMeasurer) {
      setLengthMeasurerEnabled(lengthMeasurer.enabled);
    }
  }, [lengthMeasurer]);

  useEffect(() => {
    if (orbitToggle) {
      setOrbitLockEnabled(orbitToggle.enabled);
    }
  }, [orbitToggle]);

  useEffect(() => {
    if (highlighter) {
      setHighlighterEnabled(highlighter.enabled);
    }
  }, [highlighter]);

  // Handle click outside to close options
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      
      if (showAreaMeasurer && areaContainerRef.current && !areaContainerRef.current.contains(target)) {
        setShowAreaMeasurer(false);
      }
      
      if (showLengthMeasurer && lengthContainerRef.current && !lengthContainerRef.current.contains(target)) {
        setShowLengthMeasurer(false);
      }

      if (showHighlighter && highlighterContainerRef.current && !highlighterContainerRef.current.contains(target)) {
        setShowHighlighter(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showAreaMeasurer, showLengthMeasurer, showHighlighter]);

  const handleAreaMeasurerEnabled = () => {
    if (!measurer) return;

    measurer.enabled = !areaMeasurerEnabled;
    setAreaMeasurerEnabled(measurer.enabled);
  };

  const handleLengthMeasurerEnabled = () => {
    if (!lengthMeasurer) return;

    lengthMeasurer.enabled = !lengthMeasurerEnabled;
    setLengthMeasurerEnabled(lengthMeasurer.enabled);
  };

  const handleOrbitLockEnabled = () => {
    if (!orbitToggle) return;
    
    const newEnabled = !orbitLockEnabled;
    setOrbitLockEnabled(newEnabled);
    orbitToggle.setEnabled(newEnabled);
  };

  const handleHighlighterEnabled = () => {
    if (!highlighter) return;

    highlighter.enabled = !highlighterEnabled;
    setHighlighterEnabled(highlighter.enabled);
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2">
      <div className="bg-white border border-gray-300 rounded-lg shadow-xl p-2 flex items-end gap-2">
        <div ref={areaContainerRef} className="relative flex flex-col items-center">
          {showAreaMeasurer && <AreaMeasurer />}

          <ChevronUpIcon 
            onClick={() => setShowAreaMeasurer(!showAreaMeasurer)}
            className={`mb-1 p-1 hover:bg-gray-100 rounded transition-all w-8 h-8 cursor-pointer ${showAreaMeasurer ? 'rotate-180' : ''}`}
          />

          <WithTooltip message="Area Measurer">
            <button
              onClick={handleAreaMeasurerEnabled}
              className={`p-3 rounded-lg transition-all ${
                areaMeasurerEnabled 
                  ? 'bg-blue-500 text-white shadow-md' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <IconRulerCombined classes={`w-6 h-6 ${areaMeasurerEnabled ? "text-gray-100" : ""}`} />
            </button>
          </WithTooltip>
        </div>

        <div ref={lengthContainerRef} className="relative flex flex-col items-center">
          {showLengthMeasurer && <LengthMeasurer />}

          <ChevronUpIcon 
            onClick={() => setShowLengthMeasurer(!showLengthMeasurer)}
            className={`mb-1 p-1 hover:bg-gray-100 rounded transition-all w-8 h-8 cursor-pointer ${showLengthMeasurer ? 'rotate-180' : ''}`}
          />

          <WithTooltip message="Length Measurer">
            <button
              onClick={handleLengthMeasurerEnabled}
              className={`p-3 rounded-lg transition-all ${
                lengthMeasurerEnabled 
                  ? 'bg-blue-500 text-white shadow-md' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <IconRuler classes={`w-6 h-6 ${lengthMeasurerEnabled ? "text-gray-100" : ""}`} />
            </button>
          </WithTooltip>
        </div>

        <WithTooltip message="Lock Camera Distance">
          <button
            onClick={handleOrbitLockEnabled}
            className={`p-3 rounded-lg transition-all ${
              orbitLockEnabled 
                ? 'bg-blue-500 text-white shadow-md' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <IconCamera classes={`w-6 h-6 ${orbitLockEnabled ? "text-gray-100" : ""}`} />
          </button>
        </WithTooltip>

        <div ref={highlighterContainerRef} className="relative flex flex-col items-center">
          {showHighlighter && <Highlighter />}

          <ChevronUpIcon 
            onClick={() => setShowHighlighter(!showHighlighter)}
            className={`mb-1 p-1 hover:bg-gray-100 rounded transition-all w-8 h-8 cursor-pointer ${showHighlighter ? 'rotate-180' : ''}`}
          />

          <WithTooltip message="Highlighter">
            <button 
              onClick={handleHighlighterEnabled} 
              className={`p-3 rounded-lg transition-all ${
                highlighterEnabled 
                  ? 'bg-blue-500 text-white shadow-md' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <IconPaintRoller classes={`w-6 h-6 ${highlighterEnabled ? "text-gray-100" : ""}`} />
            </button>
          </WithTooltip>
        </div>
      </div>
    </div>
  );
};
